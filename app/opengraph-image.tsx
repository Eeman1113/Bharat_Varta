import { ImageResponse } from "next/og";

// Route segment config — Next 15+ App Router.
export const runtime = "nodejs";
export const alt = "Bharat Varta — India's daily wire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#eeece7";
const INK = "#1a1a1a";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: PAPER,
          color: INK,
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: "64px",
          position: "relative",
        }}
      >
        {/* thin double rule top */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 64,
            right: 64,
            borderTop: `2px solid ${INK}`,
            borderBottom: `1px solid ${INK}`,
            height: 6,
          }}
        />
        {/* thin double rule bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 64,
            right: 64,
            borderTop: `1px solid ${INK}`,
            borderBottom: `2px solid ${INK}`,
            height: 6,
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            marginBottom: 40,
            color: INK,
            opacity: 0.75,
          }}
        >
          India Edition · Established mmxxvi
        </div>

        <div
          style={{
            display: "flex",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 180,
            lineHeight: 1,
            color: INK,
            letterSpacing: -4,
          }}
        >
          Bharat Varta
        </div>

        <div
          style={{
            display: "flex",
            fontStyle: "italic",
            fontSize: 42,
            marginTop: 28,
            color: INK,
            opacity: 0.8,
          }}
        >
          India&apos;s daily wire, set in Caslon
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 18,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            marginTop: 60,
            color: INK,
            opacity: 0.6,
          }}
        >
          By Eeman Majumder
        </div>
      </div>
    ),
    { ...size },
  );
}
