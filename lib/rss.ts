import { XMLParser } from "fast-xml-parser";
import { FEEDS, feedByKey, type Feed, type Section } from "./feeds";

export type Article = {
  id: string;              // stable slug used in URLs
  title: string;
  link: string;            // original source URL
  description: string;     // plain text, trimmed
  contentHtml?: string;    // full HTML if the feed provides content:encoded
  pubDate: number;         // epoch ms
  imageUrl?: string;
  source: {
    key: string;
    name: string;
    homepage: string;
    section: Section;
  };
};

// ---------------------------------------------------------------------------
// XML → normalized articles
// ---------------------------------------------------------------------------

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  processEntities: true,
  htmlEntities: true,
  isArray: (name) => ["item", "entry"].includes(name),
});

function toArray<T>(v: T | T[] | undefined): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/\s+/g, " ")
    .trim();
}

function firstImgFromHtml(html: string): string | undefined {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : undefined;
}

function pickImage(item: Record<string, unknown>): string | undefined {
  const media = item["media:content"];
  const mediaArr = toArray(media) as Array<Record<string, string>>;
  for (const m of mediaArr) {
    const url = m["@_url"];
    if (url && /\.(jpe?g|png|gif|webp)/i.test(url)) return url;
  }
  const thumb = toArray(item["media:thumbnail"]) as Array<
    Record<string, string>
  >;
  for (const m of thumb) {
    const url = m["@_url"];
    if (url) return url;
  }
  const enc = toArray(item.enclosure) as Array<Record<string, string>>;
  for (const e of enc) {
    if (e["@_type"]?.startsWith("image/") && e["@_url"]) return e["@_url"];
  }
  const contentHtml =
    (item["content:encoded"] as string) ||
    (item.content as string) ||
    (item.description as string) ||
    (item.summary as string) ||
    "";
  const img = typeof contentHtml === "string" ? firstImgFromHtml(contentHtml) : undefined;
  return img;
}

function parseDate(v: unknown): number {
  if (!v) return Date.now();
  const s = typeof v === "string" ? v : String(v);
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : Date.now();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function makeId(feedKey: string, title: string, link: string): string {
  const t = slugify(title) || "story";
  // append short hash of link so identical titles across feeds don't collide
  let h = 0;
  for (let i = 0; i < link.length; i++) {
    h = (h * 31 + link.charCodeAt(i)) | 0;
  }
  const short = Math.abs(h).toString(36).slice(0, 6);
  return `${feedKey}-${t}-${short}`;
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

// Some upstream RSS endpoints (Business Standard, Moneycontrol, News18,
// Firstpost, Zee, etc.) 403 anything that doesn't look like a real browser.
// A generic Chrome UA gets us through those without changing behavior for
// the well-behaved feeds.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchFeed(feed: Feed): Promise<Article[]> {
  try {
    const r = await fetch(feed.url, {
      // Next.js ISR — refresh every 10 minutes
      next: { revalidate: 600 },
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return [];
    const xml = await r.text();
    const doc = parser.parse(xml) as Record<string, unknown>;

    // RSS 2.0 → rss.channel.item[]  |  Atom → feed.entry[]
    const rss = doc.rss as Record<string, unknown> | undefined;
    const channel = rss?.channel as Record<string, unknown> | undefined;
    const atomFeed = doc.feed as Record<string, unknown> | undefined;

    const items = toArray(
      (channel?.item as unknown) ?? (atomFeed?.entry as unknown),
    ) as Array<Record<string, unknown>>;

    return items
      .map((it) => {
        const title = stripHtml(String(it.title ?? "")).slice(0, 220);
        // Atom uses <link href="..." /> attribute; RSS uses text content
        const linkRaw = it.link;
        let link = "";
        if (typeof linkRaw === "string") link = linkRaw;
        else if (Array.isArray(linkRaw)) {
          const first = linkRaw[0] as { "@_href"?: string } | string;
          link = typeof first === "string" ? first : first?.["@_href"] ?? "";
        } else if (linkRaw && typeof linkRaw === "object") {
          const l = linkRaw as { "@_href"?: string; "#text"?: string };
          link = l["@_href"] ?? l["#text"] ?? "";
        }

        // Try every reasonable field for a summary before giving up.
        // Some feeds (e.g. The Hindu regional wires) ship an empty
        // <description> and put the body in <content:encoded>.
        const descRaw =
          (it.description as string) ||
          (it.summary as string) ||
          (typeof it["content:encoded"] === "string"
            ? (it["content:encoded"] as string)
            : "") ||
          (typeof it.content === "string" ? (it.content as string) : "") ||
          (it["dc:description"] as string) ||
          "";
        let description = stripHtml(String(descRaw)).slice(0, 300);
        if (description.toLowerCase() === "undefined") description = "";
        const contentHtml =
          (it["content:encoded"] as string) ||
          (typeof it.content === "string" ? (it.content as string) : "") ||
          undefined;
        const imageUrl = pickImage(it);
        const pubDate = parseDate(it.pubDate ?? it.published ?? it.updated);

        if (!title || !link) return null;
        // Skip garbage items where the feed literally ships the string "undefined".
        if (title.toLowerCase() === "undefined") return null;
        const article: Article = {
          id: makeId(feed.key, title, link),
          title,
          link,
          description,
          contentHtml,
          pubDate,
          imageUrl,
          source: {
            key: feed.key,
            name: feed.name,
            homepage: feed.homepage,
            section: feed.section,
          },
        };
        return article;
      })
      .filter((x): x is Article => x !== null);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// With ~300 feeds we can't fire all of them at once — Node's default
// undici pool would exhaust sockets and many upstreams rate-limit heavy
// bursts. Fan out ~20 at a time; each fetch still has its own 8 s abort
// and Next.js ISR (revalidate: 600) means the whole batch only actually
// runs once every 10 minutes.
const FETCH_CONCURRENCY = 20;

async function fetchAllFeeds(feeds: Feed[]): Promise<Article[]> {
  const flat: Article[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < feeds.length) {
      const idx = cursor++;
      try {
        const items = await fetchFeed(feeds[idx]);
        flat.push(...items);
      } catch {
        // fetchFeed already swallows errors, but belt-and-braces
      }
    }
  }
  const workers = Array.from(
    { length: Math.min(FETCH_CONCURRENCY, feeds.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return flat;
}

export async function getAllArticles(): Promise<Article[]> {
  const flat = await fetchAllFeeds(FEEDS);
  // de-dupe by link
  const seen = new Set<string>();
  const out: Article[] = [];
  for (const a of flat) {
    if (seen.has(a.link)) continue;
    seen.add(a.link);
    out.push(a);
  }
  out.sort((a, b) => b.pubDate - a.pubDate);
  return out;
}

export async function getArticlesBySection(): Promise<
  Record<Section, Article[]>
> {
  const all = await getAllArticles();
  const grouped: Record<string, Article[]> = {};
  for (const s of ["front", "india", "world", "business", "sports", "tech", "opinion"]) {
    grouped[s] = [];
  }
  for (const a of all) grouped[a.source.section]?.push(a);
  return grouped as Record<Section, Article[]>;
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const all = await getAllArticles();
  return all.find((a) => a.id === id);
}

export { feedByKey };
