import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { getArticleById } from "@/lib/rss";
import { sectionLabel } from "@/lib/feeds";

export const revalidate = 600;

const SITE_URL = "https://bharatvarta.vercel.app";
const SITE_NAME = "Bharat Varta";
const FALLBACK_DESCRIPTION =
  "Read the full story on Bharat Varta — India's daily wire, aggregating live headlines from The Hindu, Times of India, NDTV, Hindustan Times and 300+ Indian sources.";

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

function truncate(text: string, max: number): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const stop = lastSpace > Math.floor(max * 0.55) ? lastSpace : max;
  return cut.slice(0, stop).replace(/[,;:.\-–—\s]+$/, "") + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) {
    return {
      title: "Story not found",
      description: FALLBACK_DESCRIPTION,
      robots: { index: false, follow: true },
    };
  }

  const canonical = `${SITE_URL}/read/${article.id}`;
  const description = truncate(
    article.description || `${article.title} — via ${article.source.name} on Bharat Varta.`,
    155,
  );
  const section = sectionLabel(article.source.section);
  const publishedISO = new Date(article.pubDate).toISOString();

  return {
    title: article.title,
    description,
    authors: [{ name: article.source.name, url: article.source.homepage }],
    keywords: [
      article.source.name,
      section,
      "India news",
      "Bharat Varta",
      "Indian news aggregator",
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description,
      siteName: SITE_NAME,
      locale: "en_IN",
      publishedTime: publishedISO,
      modifiedTime: publishedISO,
      authors: [article.source.name],
      section,
      tags: [article.source.name, section, "India"],
      images: [
        {
          url: `/read/${article.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: article.title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [`/read/${article.id}/opengraph-image`],
      creator: "@Eeman1113",
      site: "@Eeman1113",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
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

  const canonical = `${SITE_URL}/read/${article.id}`;
  const publishedISO = new Date(article.pubDate).toISOString();
  const section = sectionLabel(article.source.section);
  const description = truncate(
    article.description || `${article.title} — via ${article.source.name}.`,
    250,
  );

  // NewsArticle JSON-LD — invisible, purely for search engines.
  const newsArticleJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description,
    datePublished: publishedISO,
    dateModified: publishedISO,
    inLanguage: "en-IN",
    articleSection: section,
    isBasedOn: article.link,
    url: canonical,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    author: {
      "@type": "Organization",
      name: article.source.name,
      url: article.source.homepage,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
        width: 512,
        height: 512,
      },
    },
    image: article.imageUrl
      ? [article.imageUrl, `${SITE_URL}/read/${article.id}/opengraph-image`]
      : [`${SITE_URL}/read/${article.id}/opengraph-image`],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Front Page",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: section,
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: canonical,
      },
    ],
  };

  return (
    <>
      <Masthead compact />
      <main className="np-reader">
        <p className="np-reader-kicker">
          {section} &nbsp;·&nbsp;{" "}
          <time dateTime={publishedISO}>{formatDate(article.pubDate)}</time>
        </p>

        <h1>{article.title}</h1>

        <address className="np-reader-src not-italic">
          src.{" "}
          <a
            href={article.source.homepage}
            target="_blank"
            rel="noopener noreferrer author"
          >
            {article.source.name}
          </a>
        </address>

        {article.imageUrl && (
          <div className="np-reader-lead-img np-img-wrap">
            <img
              src={article.imageUrl}
              alt=""
              className="np-img w-full h-auto"
            />
          </div>
        )}

        <article
          className="np-reader-body"
          itemScope
          itemType="https://schema.org/NewsArticle"
        >
          <meta itemProp="headline" content={article.title} />
          <meta itemProp="datePublished" content={publishedISO} />
          <meta itemProp="dateModified" content={publishedISO} />
          <meta itemProp="url" content={canonical} />
          <meta itemProp="inLanguage" content="en-IN" />
          <meta itemProp="isBasedOn" content={article.link} />
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
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
