import Link from "next/link";
import type { Article } from "@/lib/rss";

export type TileVariant =
  | "lead"
  | "wide"
  | "column"
  | "brief"
  | "hero"        // NEW: giant lead with image (dynamic layout)
  | "landscape"   // NEW: image beside headline (image on left, text right)
  | "portrait";   // NEW: image on top, tight column

type Props = {
  article: Article;
  variant?: TileVariant;
  showImage?: boolean;
};

// A vintage-newspaper column tile. The whole tile is a link to our local
// reader page; the "src." line links directly to the originating outlet.
export default function ArticleTile({
  article,
  variant = "column",
  showImage = true,
}: Props) {
  const wantsImage = showImage && Boolean(article.imageUrl);

  // Hero/landscape/portrait REQUIRE an image; caller should downgrade if none.
  const hasImage =
    wantsImage &&
    (variant === "hero" ||
      variant === "landscape" ||
      variant === "portrait" ||
      variant === "lead" ||
      variant === "column");

  // Variant-specific typographic classes. Each carries its own responsive
  // scaling via .np-headline-<variant> in globals.css — no arbitrary Tailwind
  // pixel sizes here so mobile can clamp() everything down together.
  const headlineClass =
    variant === "hero"
      ? "np-headline np-headline-hero"
      : variant === "lead"
        ? "np-headline np-headline-lead"
        : variant === "wide"
          ? "np-headline np-headline-wide"
          : variant === "landscape"
            ? "np-headline np-headline-landscape"
            : variant === "portrait"
              ? "np-headline np-headline-portrait"
              : variant === "brief"
                ? "np-headline np-headline-brief"
                : "np-headline np-headline-column";

  const wrapClass =
    variant === "landscape"
      ? "np-tile np-tile-landscape break-inside-avoid mb-3"
      : "np-tile break-inside-avoid mb-3";

  // Landscape splits the tile with image on the left, text on the right.
  if (variant === "landscape" && hasImage) {
    return (
      <article className={wrapClass}>
        <div className="np-landscape-grid">
          <Link href={`/read/${article.id}`} className="block">
            <span className="np-img-wrap block">
              <img
                src={article.imageUrl}
                alt=""
                loading="lazy"
                className="np-img w-full h-auto"
              />
            </span>
          </Link>
          <div>
            <h2 className={headlineClass}>
              <Link href={`/read/${article.id}`} className="np-headline-link">
                {article.title}
              </Link>
            </h2>
            {article.description ? (
              <p className="np-lede">{article.description}</p>
            ) : (
              <p className="np-lede-empty">
                Cont. on the wire from {article.source.name}.
              </p>
            )}
            <p className="np-src mt-1.5">
              src.&nbsp;
              <a
                href={article.source.homepage}
                target="_blank"
                rel="noopener noreferrer"
              >
                {article.source.name}
              </a>
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={wrapClass}>
      {hasImage && (
        <Link href={`/read/${article.id}`} className="block mb-2">
          <span className="np-img-wrap block">
            <img
              src={article.imageUrl}
              alt=""
              loading="lazy"
              className="np-img w-full h-auto"
            />
          </span>
        </Link>
      )}
      <h2 className={headlineClass}>
        <Link href={`/read/${article.id}`} className="np-headline-link">
          {article.title}
        </Link>
      </h2>
      {variant !== "brief" &&
        (article.description ? (
          <p className="np-lede">{article.description}</p>
        ) : (
          <p className="np-lede-empty">
            Cont. on the wire from {article.source.name}.
          </p>
        ))}
      <p className="np-src mt-1.5">
        src.&nbsp;
        <a
          href={article.source.homepage}
          target="_blank"
          rel="noopener noreferrer"
        >
          {article.source.name}
        </a>
      </p>
    </article>
  );
}
