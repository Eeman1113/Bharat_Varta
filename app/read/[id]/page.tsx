import Link from "next/link";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { getArticleById } from "@/lib/rss";
import { sectionLabel } from "@/lib/feeds";

export const revalidate = 600;

// Sanitize the RSS-supplied HTML enough to render safely-ish in our page.
// We strip scripts/styles and dangerous attributes. This isn't a full XSS
// sanitizer; upstream feeds are trusted-ish news sources, but do NOT enable
// arbitrary HTML from unknown feeds without a proper sanitizer.
function safeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const hasFullContent =
    article.contentHtml && article.contentHtml.length > 400;

  return (
    <>
      <Masthead compact />
      <main className="np-reader">
        <p className="np-reader-kicker">
          {sectionLabel(article.source.section)} &nbsp;·&nbsp;{" "}
          {formatDate(article.pubDate)}
        </p>

        <h1>{article.title}</h1>

        <p className="np-reader-src">
          src.{" "}
          <a
            href={article.source.homepage}
            target="_blank"
            rel="noopener noreferrer"
          >
            {article.source.name}
          </a>
        </p>

        {article.imageUrl && (
          <div className="np-reader-lead-img np-img-wrap">
            <img
              src={article.imageUrl}
              alt=""
              className="np-img w-full h-auto"
            />
          </div>
        )}

        <article className="np-reader-body">
          {hasFullContent ? (
            <div
              dangerouslySetInnerHTML={{ __html: safeHtml(article.contentHtml!) }}
            />
          ) : (
            <p>{article.description}</p>
          )}
        </article>

        <div className="np-reader-outbound">
          <a href={article.link} target="_blank" rel="noopener noreferrer">
            {hasFullContent ? "Read at source" : "Read the full story at source"}{" "}
            →
          </a>
        </div>

        <p className="text-center mt-8">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted hover:text-ink"
          >
            ← Return to the front page
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
