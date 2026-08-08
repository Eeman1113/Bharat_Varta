import type { Article } from "./rss";
import type { Section } from "./feeds";

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32) — deterministic per-render.
// Fresh entropy per request means the composition reshuffles every refresh,
// but within a single render the layout is stable (no hydration mismatch).
// ---------------------------------------------------------------------------

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fresh entropy per server render.
export function currentSeed(): number {
  return (Math.random() * 0x7fffffff) >>> 0;
}

// Mix a section name into the base seed so every section reshuffles
// independently but stays deterministic within one render.
export function seedFor(base: number, section: string): number {
  let h = base >>> 0;
  for (let i = 0; i < section.length; i++) {
    h = Math.imul(h ^ section.charCodeAt(i), 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function weightedPick<T>(pairs: [T, number][], rand: () => number): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [item, w] of pairs) {
    r -= w;
    if (r <= 0) return item;
  }
  return pairs[pairs.length - 1][0];
}

// ---------------------------------------------------------------------------
// Article classification — the router that decides which articles are
// suitable for which band role. This is the single most important step
// for a coherent broadsheet: a headline-only wire brief must never end
// up in a lead-image slot, and vice versa.
// ---------------------------------------------------------------------------

type ArticleGrade = {
  article: Article;
  hasImage: boolean;
  descLen: number;
  titleLen: number;
  // Suitability scores — higher = better fit for that role.
  leadScore: number;    // giant image + long deck
  featureScore: number; // medium image + medium body
  columnScore: number;  // long text, no image
  briefScore: number;   // short headline, no body
};

function classify(articles: Article[]): ArticleGrade[] {
  return articles.map((a) => {
    const hasImage = Boolean(a.imageUrl);
    const descLen = a.description?.length ?? 0;
    const titleLen = a.title?.length ?? 0;
    // Weighted heuristics — tuned so a "good lead" is an article with an
    // image AND a substantive description; a "brief" is short body, no image.
    const leadScore =
      (hasImage ? 4 : 0) +
      (descLen > 140 ? 2 : 0) +
      (descLen > 220 ? 1 : 0) +
      (titleLen > 40 ? 1 : 0);
    const featureScore =
      (hasImage ? 3 : 0) +
      (descLen > 80 ? 1.5 : 0) +
      (descLen > 160 ? 1 : 0);
    const columnScore =
      (hasImage ? 0.5 : 0) +
      (descLen > 120 ? 3 : 0) +
      (descLen > 200 ? 1.5 : 0) +
      (!hasImage ? 1 : 0);
    const briefScore =
      (hasImage ? 0 : 2) +
      (descLen < 80 ? 2 : 0) +
      (titleLen < 100 ? 1 : 0);
    return { article: a, hasImage, descLen, titleLen, leadScore, featureScore, columnScore, briefScore };
  });
}

// A small pool with take-by-role that removes an article once claimed so
// the same story never appears in two bands.
class Pool {
  private items: ArticleGrade[];
  constructor(items: ArticleGrade[]) {
    this.items = items;
  }
  size() { return this.items.length; }
  remaining() { return this.items.slice(); }
  // Take the single best match for a role. Falls back to any article when
  // no perfect match exists (rather than leaving a slot empty).
  take(scoreKey: keyof Pick<ArticleGrade, "leadScore" | "featureScore" | "columnScore" | "briefScore">, opts?: { requireImage?: boolean; forbidImage?: boolean }): ArticleGrade | undefined {
    if (!this.items.length) return undefined;
    let bestIdx = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i];
      if (opts?.requireImage && !it.hasImage) continue;
      if (opts?.forbidImage && it.hasImage) continue;
      const s = it[scoreKey];
      if (s > bestScore) { bestScore = s; bestIdx = i; }
    }
    // If requireImage/forbidImage found nothing, DO NOT relax — the caller
    // wanted an image (or none) for a reason. Return undefined so the band
    // is skipped, not built with a mismatched article.
    if (bestIdx === -1) return undefined;
    return this.items.splice(bestIdx, 1)[0];
  }
  // Take N items by a score key, in one call.
  takeN(n: number, scoreKey: keyof Pick<ArticleGrade, "leadScore" | "featureScore" | "columnScore" | "briefScore">, opts?: { requireImage?: boolean; forbidImage?: boolean }): ArticleGrade[] {
    const out: ArticleGrade[] = [];
    for (let i = 0; i < n; i++) {
      const it = this.take(scoreKey, opts);
      if (!it) break;
      out.push(it);
    }
    return out;
  }
  countImages(): number {
    return this.items.filter((x) => x.hasImage).length;
  }
}

// ---------------------------------------------------------------------------
// Band vocabulary — a `Band` is a canonical newspaper unit. Every render
// composes a section as a sequence of bands; within a band the internal
// layout is fixed (identical brief shapes, aligned columns, sensible image
// proportion), so the *rules* stay consistent while the *sequence* varies.
// ---------------------------------------------------------------------------

export type Band =
  // Above-the-fold lead: dominant image + attached headline + deck + lede,
  // optionally paired with a text-heavy secondary column so the top of the
  // section reads as a two-column composition of comparable weight.
  | { kind: "lead"; lead: Article; digest: Article[]; layout: "image-top" | "image-left"; leadSpan: 6 | 7 | 8 }
  // Row of 3–5 identical briefs (all headline-only or all headline+1-line).
  | { kind: "briefs"; items: Article[]; withLede: boolean; columns: number }
  // 3 equal-width text columns of similar length side-by-side.
  | { kind: "columnTriple"; items: [Article, Article, Article] }
  // 2 equal-width text columns; optionally a small portrait image atop
  // one of them (to break the monotony without wrecking uniformity).
  | { kind: "columnPair"; items: [Article, Article]; imageOn?: 0 | 1 }
  // Bordered/emphasized story with image; paired with 2 briefs or a
  // secondary column to fill the row.
  | { kind: "feature"; feature: Article; side: Article[]; sideKind: "briefs" | "column"; featureSpan: 5 | 6 }
  // Row of 2–3 image tiles of matched height ("In Pictures" strip).
  | { kind: "photoStrip"; items: Article[] }
  // Row split into two column groups of 2 stories each (6+6).
  | { kind: "twoColumnSplit"; left: [Article, Article]; right: [Article, Article] };

// ---------------------------------------------------------------------------
// Band builders — each attempts to consume from the pool and returns
// `undefined` if the pool can't supply an appropriate cast.
// ---------------------------------------------------------------------------

function buildLead(pool: Pool, rand: () => number, _opts: { withSecondary: boolean }): Band | undefined {
  const lead = pool.take("leadScore", { requireImage: true });
  if (!lead) return undefined;
  const layout: "image-top" | "image-left" = "image-top";
  // Secondary column = a dense 2-col mini-digest of 4–6 short items, each
  // with headline + 1-line lede + src. Packs tightly to fill the height of
  // the lead's hero image + headline without dead whitespace.
  const digest: ArticleGrade[] = [];
  for (let i = 0; i < 6; i++) {
    const g = pool.take("briefScore", { forbidImage: true }) ?? pool.take("briefScore");
    if (!g) break;
    digest.push(g);
  }
  if (digest.length < 4) return undefined; // need ≥4 to fill a 2x2 grid
  const leadSpan: 6 | 7 | 8 = weightedPick<6 | 7 | 8>([[7, 2], [8, 1], [6, 1]], rand);
  return {
    kind: "lead",
    lead: lead.article,
    digest: digest.map((g) => g.article),
    layout,
    leadSpan,
  };
}

function buildBriefs(pool: Pool, rand: () => number, count: 3 | 4 | 5): Band | undefined {
  const items = pool.takeN(count, "briefScore");
  if (items.length < count) return undefined;
  const withLede = rand() < 0.45; // ~half the time briefs get a one-line deck
  return { kind: "briefs", items: items.map((x) => x.article), withLede, columns: count };
}

// News-digest band — a deep block of many briefs arranged in N columns
// with multiple rows. This is the newspaper "In Brief" / "The Roundup"
// pattern: each column runs vertically with short items stacked, ledes
// included, so the whole band reads as one dense chapter of small news.
function buildBriefsDigest(pool: Pool, rand: () => number, columns: 3 | 4, rows: 2 | 3): Band | undefined {
  const total = columns * rows;
  const items = pool.takeN(total, "briefScore");
  // Accept partial fill down to (columns * (rows-1)) — enough to still fill
  // at least one complete row of every column, otherwise skip.
  const minAcceptable = columns * (rows - 1) + columns;
  if (items.length < minAcceptable) return undefined;
  return {
    kind: "briefs",
    items: items.map((x) => x.article),
    withLede: true,
    columns,
  };
}

function buildColumnTriple(pool: Pool): Band | undefined {
  const items = pool.takeN(3, "columnScore", { forbidImage: true });
  if (items.length < 3) {
    // Relax: allow images but prefer no-image
    const relaxed = pool.takeN(3 - items.length, "columnScore");
    if (items.length + relaxed.length < 3) return undefined;
    items.push(...relaxed);
  }
  return { kind: "columnTriple", items: [items[0].article, items[1].article, items[2].article] };
}

function buildColumnPair(pool: Pool, rand: () => number): Band | undefined {
  const items = pool.takeN(2, "columnScore");
  if (items.length < 2) return undefined;
  const imageOn = items.some((x) => x.hasImage)
    ? (items[0].hasImage ? 0 : 1) as 0 | 1
    : undefined;
  return { kind: "columnPair", items: [items[0].article, items[1].article], imageOn };
}

function buildFeature(pool: Pool, rand: () => number): Band | undefined {
  const feature = pool.take("featureScore", { requireImage: true });
  if (!feature) return undefined;
  const featureSpan: 5 | 6 = weightedPick<5 | 6>([[6, 2], [5, 1]], rand);
  const sideCols = 12 - featureSpan;
  // Side is either a 2-brief stack or a single column
  const sideKind: "briefs" | "column" = weightedPick<"briefs" | "column">([["briefs", 2], ["column", 1]], rand);
  let side: ArticleGrade[];
  if (sideKind === "briefs") {
    // 3–4 stacked briefs (was 2) so the side fills the feature's height
    // instead of leaving hundreds of pixels of dead whitespace beneath.
    side = pool.takeN(4, "briefScore");
    if (side.length < 2) return undefined;
  } else {
    const c = pool.take("columnScore", { forbidImage: true }) ?? pool.take("columnScore");
    if (!c) return undefined;
    // Add 2 additional briefs beneath the column story to fill vertical space.
    const extras = pool.takeN(2, "briefScore");
    side = [c, ...extras];
  }
  return {
    kind: "feature",
    feature: feature.article,
    side: side.map((x) => x.article),
    sideKind,
    featureSpan,
  };
}

function buildPhotoStrip(pool: Pool, rand: () => number): Band | undefined {
  const n: 2 | 3 = pool.countImages() >= 3 && rand() < 0.5 ? 3 : 2;
  const items = pool.takeN(n, "featureScore", { requireImage: true });
  if (items.length < n) return undefined;
  return { kind: "photoStrip", items: items.map((x) => x.article) };
}

function buildTwoColumnSplit(pool: Pool): Band | undefined {
  const items = pool.takeN(4, "columnScore");
  if (items.length < 4) return undefined;
  return {
    kind: "twoColumnSplit",
    left: [items[0].article, items[1].article],
    right: [items[2].article, items[3].article],
  };
}

// ---------------------------------------------------------------------------
// Section recipes — a *bank* of band-sequences appropriate for each section.
// The composer picks one recipe at random and attempts to build each band.
// If a band can't be built (pool exhausted / wrong article shape), it's
// gracefully skipped and the composer moves on.
// ---------------------------------------------------------------------------

type BandStep =
  | { t: "lead"; withSecondary: boolean }
  | { t: "briefsDigest"; columns: 3 | 4; rows: 2 | 3 }
  | { t: "briefs"; count: 3 | 4 | 5 }
  | { t: "columnTriple" }
  | { t: "columnPair" }
  | { t: "feature" }
  | { t: "photoStrip" }
  | { t: "twoColumnSplit" };

type Recipe = BandStep[];

// Every FRONT recipe opens with either `lead` (hero image + digest) or
// `feature` (bordered image story) so the top of the page always leads
// with a photograph. Variety comes from which of the two opens, which
// article gets promoted, and what fills the tail.
const FRONT_RECIPES: Recipe[] = [
  // Lead + digest + feature + columns
  [
    { t: "lead", withSecondary: true },
    { t: "briefsDigest", columns: 4, rows: 2 },
    { t: "feature" },
    { t: "columnTriple" },
  ],
  // Lead + feature + digest + columns
  [
    { t: "lead", withSecondary: true },
    { t: "feature" },
    { t: "briefsDigest", columns: 4, rows: 2 },
    { t: "columnTriple" },
  ],
  // Lead + two-split + digest + pair
  [
    { t: "lead", withSecondary: true },
    { t: "twoColumnSplit" },
    { t: "briefsDigest", columns: 4, rows: 2 },
    { t: "columnPair" },
  ],
  // Lead + column-triple + feature + digest
  [
    { t: "lead", withSecondary: true },
    { t: "columnTriple" },
    { t: "feature" },
    { t: "briefsDigest", columns: 4, rows: 2 },
  ],
  // Feature-led: bordered feature story leads, deep digest after.
  [
    { t: "feature" },
    { t: "briefsDigest", columns: 4, rows: 2 },
    { t: "twoColumnSplit" },
    { t: "columnTriple" },
  ],
  // Feature + column-triple + digest + pair
  [
    { t: "feature" },
    { t: "columnTriple" },
    { t: "briefsDigest", columns: 3, rows: 3 },
    { t: "columnPair" },
  ],
];

const STANDARD_RECIPES: Recipe[] = [
  [
    { t: "lead", withSecondary: true },
    { t: "columnTriple" },
    { t: "briefs", count: 4 },
    { t: "feature" },
  ],
  [
    { t: "lead", withSecondary: true },
    { t: "feature" },
    { t: "briefs", count: 3 },
    { t: "columnPair" },
  ],
  // Column-first opener
  [
    { t: "columnTriple" },
    { t: "feature" },
    { t: "briefs", count: 4 },
    { t: "columnPair" },
  ],
  // Briefs-first opener
  [
    { t: "briefs", count: 4 },
    { t: "feature" },
    { t: "columnTriple" },
    { t: "briefs", count: 3 },
  ],
  // Feature-first opener
  [
    { t: "feature" },
    { t: "twoColumnSplit" },
    { t: "columnTriple" },
    { t: "briefs", count: 3 },
  ],
  // Two-split opener
  [
    { t: "twoColumnSplit" },
    { t: "columnTriple" },
    { t: "briefs", count: 4 },
  ],
];

// Compact recipes — used for sections that render inside a narrow
// paired-column (~640px wide). No lead/feature/twoColumnSplit since
// those need horizontal room; stick to briefs / column-pair / column-triple.
const COMPACT_RECIPES: Recipe[] = [
  [
    { t: "briefs", count: 3 },
    { t: "columnPair" },
    { t: "briefs", count: 3 },
    { t: "columnPair" },
  ],
  [
    { t: "columnPair" },
    { t: "briefs", count: 3 },
    { t: "columnPair" },
    { t: "briefs", count: 3 },
  ],
  [
    { t: "columnTriple" },
    { t: "briefs", count: 3 },
    { t: "columnPair" },
    { t: "briefs", count: 3 },
  ],
  [
    { t: "briefs", count: 4 },
    { t: "columnPair" },
    { t: "briefs", count: 3 },
    { t: "columnPair" },
  ],
];

function recipesFor(section: Section, compact: boolean): Recipe[] {
  if (section === "front") return FRONT_RECIPES;
  if (compact) return COMPACT_RECIPES;
  return STANDARD_RECIPES;
}

// ---------------------------------------------------------------------------
// composeSection — build the sequence of bands for a section.
// ---------------------------------------------------------------------------

export function composeSection(
  section: Section,
  articles: Article[],
  seed: number,
  opts: { compact?: boolean; maxArticles?: number } = {},
): Band[] {
  const rand = mulberry32(seed);
  const compact = opts.compact ?? false;
  const maxArticles = opts.maxArticles ?? (compact ? 12 : 18);

  if (!articles.length) return [];

  // Cap by recency (articles already come sorted by date), then classify.
  const capped = articles.slice(0, maxArticles);
  const graded = shuffle(classify(capped), rand);
  const pool = new Pool(graded);

  const recipes = recipesFor(section, compact);
  const recipe = pick(recipes, rand);

  const bands: Band[] = [];

  // FRONT invariant: the very first band on the front page MUST have a
  // hero image. If the recipe wants lead but no image-article exists,
  // fall back to feature; if that also fails, prepend a feature/lead
  // attempt so the top of the paper always leads with a photograph.
  if (section === "front") {
    const openerLead = buildLead(pool, rand, { withSecondary: true });
    if (openerLead) {
      bands.push(openerLead);
    } else {
      const openerFeature = buildFeature(pool, rand);
      if (openerFeature) bands.push(openerFeature);
    }
  }

  for (const step of recipe) {
    if (pool.size() === 0) break;
    // Skip the recipe's own lead/feature step if we already placed an
    // image opener above — otherwise the front would double up.
    if (section === "front" && bands.length === 1 && (step.t === "lead" || step.t === "feature")) {
      continue;
    }
    let band: Band | undefined;
    switch (step.t) {
      case "lead":
        band = buildLead(pool, rand, { withSecondary: step.withSecondary });
        break;
      case "briefs":
        // Downshift count if the pool is thin.
        band = buildBriefs(pool, rand, step.count) ??
               buildBriefs(pool, rand, Math.max(3, (step.count - 1) as 3 | 4) as 3 | 4);
        break;
      case "briefsDigest":
        band = buildBriefsDigest(pool, rand, step.columns, step.rows) ??
               buildBriefsDigest(pool, rand, step.columns, 2) ??
               buildBriefs(pool, rand, step.columns as 3 | 4);
        break;
      case "columnTriple":
        band = buildColumnTriple(pool);
        break;
      case "columnPair":
        band = buildColumnPair(pool, rand);
        break;
      case "feature":
        band = buildFeature(pool, rand);
        break;
      case "photoStrip":
        band = buildPhotoStrip(pool, rand);
        break;
      case "twoColumnSplit":
        band = buildTwoColumnSplit(pool);
        break;
    }
    if (band) bands.push(band);
  }

  // Tail: if the pool still has leftover articles, drain them into
  // additional rule-following bands rather than a random slurry.
  while (pool.size() >= 3) {
    // Prefer briefs to close out a section — that's what real papers do.
    const b =
      buildBriefs(pool, rand, pool.size() >= 5 ? 5 : (pool.size() >= 4 ? 4 : 3)) ??
      buildColumnTriple(pool) ??
      buildColumnPair(pool, rand);
    if (!b) break;
    bands.push(b);
  }
  // If exactly 2 remain, add a pair.
  if (pool.size() === 2) {
    const b = buildColumnPair(pool, rand);
    if (b) bands.push(b);
  }

  return bands;
}
