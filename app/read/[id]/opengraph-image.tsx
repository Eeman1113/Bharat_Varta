import { ImageResponse } from "next/og";
import { getArticleById } from "@/lib/rss";
import { sectionLabel } from "@/lib/feeds";

// Route segment config
export const runtime = "nodejs";
export const alt = "Bharat Varta — story preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

const PAPER = "#eeece7";
const INK = "#1a1a1a";

function fitHeadlineFontSize(title: string): number {
  const len = title.length;
  if (len <= 40) return 96;
  if (len <= 70) return 78;
  if (len <= 110) return 64;
  if (len <= 150) return 54;
  return 46;
}

export default async function ReaderOGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id).catch(() => undefined);

  const headline = article?.title ?? "Bharat Varta";
  const source = article?.source.name ?? "India's daily wire";
  const section = article ? sectionLabel(article.source.section) : "";

  const fontSize = fitHeadlineFontSize(headline);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          color: INK,
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: "56px 72px",
          position: "relative",
        }}
      >
        {/* top rule */}
        <div
          style={{
            display: "flex",
            width: "100%",
            borderTop: `2px solid ${INK}`,
            borderBottom: `1px solid ${INK}`,
            height: 6,
            marginBottom: 24,
          }}
        />

        {/* kicker */}
        <div
          style={{
            display: "flex",
            fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            fontSize: 20,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: 0.75,
            marginBottom: 24,
          }}
        >
          {section ? `${section} · Bharat Varta` : "Bharat Varta"}
        </div>

        {/* headline */}
        <div
          style={{
            display: "flex",
            fontSize,
            lineHeight: 1.08,
            fontWeight: 700,
            letterSpacing: -1,
            color: INK,
            flexGrow: 1,
            maxWidth: 1056,
          }}
        >
          {headline}
        </div>

        {/* bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Menlo, Monaco, 'Courier New', monospace",
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            src. {source}
          </div>
          <div
            style={{
              display: "flex",
              fontStyle: "italic",
              fontSize: 34,
              fontWeight: 700,
              opacity: 0.85,
            }}
          >
            Bharat Varta
          </div>
        </div>

        {/* bottom rule */}
        <div
          style={{
            display: "flex",
            width: "100%",
            borderTop: `1px solid ${INK}`,
            borderBottom: `2px solid ${INK}`,
            height: 6,
            marginTop: 20,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
