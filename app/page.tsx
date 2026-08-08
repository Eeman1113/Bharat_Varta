import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import ArticleTile from "@/components/ArticleTile";
import { getArticlesBySection } from "@/lib/rss";
import { sectionLabel, type Section } from "@/lib/feeds";
import {
  composeSection,
  currentSeed,
  seedFor,
  type Band,
} from "@/lib/layout";
import type { Article } from "@/lib/rss";
import Link from "next/link";

// Fresh entropy per request — layout reshuffles on every refresh.
// (RSS fetches keep their own 10-min cache in lib/rss.ts, so feeds
// aren't re-fetched every time — only the composition is re-rolled.)
export const dynamic = "force-dynamic";

function SectionHead({ section }: { section: Section }) {
  return (
    <div className="np-section-head">
      <h2>{sectionLabel(section)}</h2>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Band renderers — each band produces its own fixed internal layout.
// Bands are separated by hairline rules to make the newspaper "band"
// composition readable at a glance.
// ---------------------------------------------------------------------------

function LeadBand({ band }: { band: Extract<Band, { kind: "lead" }> }) {
  const { lead, digest, leadSpan } = band;
  const secondarySpan = 12 - leadSpan;
  return (
    <div
      className="np-band np-band-lead"
      style={{ ["--lead-span" as string]: `${leadSpan}fr`, ["--sec-span" as string]: `${secondarySpan}fr` }}
    >
      <div className="np-band-lead-main">
        <ArticleTile article={lead} variant="hero" showImage={true} />
      </div>
      {/* Secondary column = a CSS-columns flow of many small items, packed
          continuously with hr separators — the true broadsheet "briefs
          column" feel, not a spaced-out grid of 4-6 cards. */}
      <div className="np-band-lead-secondary np-dense-flow">
        {digest.map((a, i) => (
          <article key={a.id} className="np-dense-item">
            <h3 className="np-headline np-brief-headline">
              <Link href={`/read/${a.id}`} className="np-headline-link">
                {a.title}
              </Link>
            </h3>
            {a.description && (
              <p className="np-lede np-brief-lede">{truncateAtWord(a.description, 130)}</p>
            )}
            <p className="np-src mt-1">
              src.&nbsp;
              <a href={a.source.homepage} target="_blank" rel="noopener noreferrer">
                {a.source.name}
              </a>
            </p>
            {i < digest.length - 1 && <hr className="np-dense-hr" />}
          </article>
        ))}
      </div>
    </div>
  );
}

// Dense multi-column flow — many items pouring through N CSS columns with
// hairline column-rules and tight hr separators between items. This is the
// core "1918 broadsheet" density unit.
function DenseColumnsBand({ band }: { band: Extract<Band, { kind: "denseColumns" }> }) {
  const { items, columns } = band;
  return (
    <div
      className="np-band np-band-dense np-dense-flow"
      style={{ ["--dense-cols" as string]: columns }}
    >
      {items.map((a, i) => (
        <article key={a.id} className="np-dense-item">
          <h3 className="np-headline np-brief-headline">
            <Link href={`/read/${a.id}`} className="np-headline-link">
              {a.title}
            </Link>
          </h3>
          {a.description && (
            <p className="np-lede np-brief-lede">{truncateAtWord(a.description, 140)}</p>
          )}
          <p className="np-src mt-1">
            src.&nbsp;
            <a href={a.source.homepage} target="_blank" rel="noopener noreferrer">
              {a.source.name}
            </a>
          </p>
          {i < items.length - 1 && <hr className="np-dense-hr" />}
        </article>
      ))}
    </div>
  );
}

// Cut a lede at the last word boundary before `max` chars, avoiding
// mid-word slices like "the automated, algorithmic extrac…" that read
// as truncation garbage. Falls back to a hard cut if the string has no
// good breakpoint. Trailing punctuation is trimmed off before "…".
function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  // Only respect the space if it's not too close to the start —
  // otherwise we'd truncate to just the first 2-3 words.
  const stop = lastSpace > Math.floor(max * 0.55) ? lastSpace : max;
  return cut.slice(0, stop).replace(/[,;:.\-–—\s]+$/, "") + "…";
}

function BriefsBand({ band }: { band: Extract<Band, { kind: "briefs" }> }) {
  const { items, withLede, columns } = band;
  return (
    <div
      className={`np-band np-band-briefs np-band-briefs-c${columns}`}
      style={{ ["--brief-count" as string]: columns }}
    >
      {items.map((a) => (
        <article key={a.id} className="np-brief-cell">
          <h3 className="np-headline np-brief-headline">
            <Link href={`/read/${a.id}`} className="np-headline-link">
              {a.title}
            </Link>
          </h3>
          {withLede && a.description && (
            <p className="np-lede np-brief-lede">{truncateAtWord(a.description, 110)}</p>
          )}
          <p className="np-src mt-1.5">
            src.&nbsp;
            <a href={a.source.homepage} target="_blank" rel="noopener noreferrer">
              {a.source.name}
            </a>
          </p>
        </article>
      ))}
    </div>
  );
}

function ColumnTripleBand({ band }: { band: Extract<Band, { kind: "columnTriple" }> }) {
  return (
    <div className="np-band np-band-column-triple">
      {band.items.map((a) => (
        <div key={a.id} className="np-column-cell">
          <ArticleTile article={a} variant="column" showImage={false} />
        </div>
      ))}
    </div>
  );
}

function ColumnPairBand({ band }: { band: Extract<Band, { kind: "columnPair" }> }) {
  return (
    <div className="np-band np-band-column-pair">
      {band.items.map((a, i) => (
        <div key={a.id} className="np-column-cell">
          <ArticleTile
            article={a}
            variant={band.imageOn === i ? "portrait" : "column"}
            showImage={band.imageOn === i}
          />
        </div>
      ))}
    </div>
  );
}

function FeatureBand({ band }: { band: Extract<Band, { kind: "feature" }> }) {
  const { feature, side, featureSpan } = band;
  const sideSpan = 12 - featureSpan;
  return (
    <div
      className="np-band np-band-feature"
      style={{ ["--feat-span" as string]: `${featureSpan}fr`, ["--side-span" as string]: `${sideSpan}fr` }}
    >
      <div className="np-feature-main">
        <ArticleTile article={feature} variant="hero" showImage={true} />
      </div>
      {/* Side column = dense CSS-columns flow of briefs pouring beside the
          feature photo. Packs tight, no dead whitespace. */}
      <div className="np-feature-side np-dense-flow">
        {side.map((a, i) => (
          <article key={a.id} className="np-dense-item">
            <h3 className="np-headline np-brief-headline">
              <Link href={`/read/${a.id}`} className="np-headline-link">
                {a.title}
              </Link>
            </h3>
            {a.description && (
              <p className="np-lede np-brief-lede">{truncateAtWord(a.description, 110)}</p>
            )}
            <p className="np-src mt-1">
              src.&nbsp;
              <a href={a.source.homepage} target="_blank" rel="noopener noreferrer">
                {a.source.name}
              </a>
            </p>
            {i < side.length - 1 && <hr className="np-dense-hr" />}
          </article>
        ))}
      </div>
    </div>
  );
}

function PhotoStripBand({ band }: { band: Extract<Band, { kind: "photoStrip" }> }) {
  return (
    <div className="np-band np-band-photo-strip" style={{ ["--photo-count" as string]: band.items.length }}>
      {band.items.map((a) => (
        <div key={a.id} className="np-photo-cell">
          <ArticleTile article={a} variant="portrait" showImage={true} />
        </div>
      ))}
    </div>
  );
}

function TwoColumnSplitBand({ band }: { band: Extract<Band, { kind: "twoColumnSplit" }> }) {
  const groups: Article[][] = [band.left, band.right];
  return (
    <div className="np-band np-band-two-split">
      {groups.map((group, gi) => (
        <div key={gi} className="np-split-group">
          {group.map((a) => (
            <div key={a.id} className="np-split-cell">
              <ArticleTile article={a} variant="column" showImage={false} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function BandRenderer({ band }: { band: Band }) {
  switch (band.kind) {
    case "lead": return <LeadBand band={band} />;
    case "briefs": return <BriefsBand band={band} />;
    case "columnTriple": return <ColumnTripleBand band={band} />;
    case "columnPair": return <ColumnPairBand band={band} />;
    case "feature": return <FeatureBand band={band} />;
    case "photoStrip": return <PhotoStripBand band={band} />;
    case "twoColumnSplit": return <TwoColumnSplitBand band={band} />;
    case "denseColumns": return <DenseColumnsBand band={band} />;
  }
}

function DynamicSection({
  section,
  bands,
}: {
  section: Section;
  bands: Band[];
}) {
  if (!bands.length) return null;
  return (
    <section className="mt-4">
      <SectionHead section={section} />
      <div className="np-band-stack">
        {bands.map((band, i) => (
          <div key={i} className="np-band-wrap">
            <BandRenderer band={band} />
            {i < bands.length - 1 && <hr className="np-band-sep" />}
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const bySection = await getArticlesBySection();
  const base = currentSeed();

  // Broadsheet layout:
  //   FRONT PAGE runs full width across the top (dominant lead section).
  //   The other 6 sections are grouped into 3 side-by-side pairs — the
  //   authentic "two columns of chapters" arrangement newspapers use.
  //   Which pair leads (after Front) rotates with the seed for variety.
  const pairs: [Section, Section][] = [
    ["india", "world"],
    ["business", "sports"],
    ["tech", "opinion"],
  ];
  const rotation = base % pairs.length;
  const orderedPairs: [Section, Section][] = [
    ...pairs.slice(rotation),
    ...pairs.slice(0, rotation),
  ];

  const empty = Object.values(bySection).every((v) => !v?.length);

  const buildBands = (sec: Section, isCompact: boolean) => {
    const articles = bySection[sec] ?? [];
    if (!articles.length) return [];
    return composeSection(sec, articles, seedFor(base, sec), {
      compact: isCompact,
      // Feed a much larger pool so the dense-column bands can pack the
      // page with real broadsheet mass. Cap high; the composer will only
      // consume what its recipes call for and drain the rest into the
      // tail dense-column band.
      maxArticles: isCompact ? 28 : sec === "front" ? 60 : 42,
    });
  };

  return (
    <>
      <Masthead />

      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10">
        {empty ? (
          <div className="text-center py-24">
            <p className="font-mono text-sm text-muted">
              THE WIRES ARE QUIET · Feeds are unreachable at the moment. Try
              again in a few minutes.
            </p>
          </div>
        ) : (
          <>
            {/* Full-width dominant section */}
            <DynamicSection
              key="front"
              section="front"
              bands={buildBands("front", false)}
            />

            {/* Paired sections — each pair is two side-by-side chapters
                separated by a thin vertical rule, like a real paper spread. */}
            {orderedPairs.map(([left, right], i) => {
              const leftBands = buildBands(left, true);
              const rightBands = buildBands(right, true);
              if (!leftBands.length && !rightBands.length) return null;
              return (
                <div key={`pair-${i}`} className="np-section-pair">
                  <div className="np-section-pair-col">
                    <DynamicSection section={left} bands={leftBands} />
                  </div>
                  <div className="np-section-pair-col">
                    <DynamicSection section={right} bands={rightBands} />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
