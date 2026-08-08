import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const PAPER = "#eeece7";
const INK = "#1a1a1a";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: PAPER,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            right: 10,
            bottom: 10,
            border: `4px solid ${INK}`,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 138,
            fontStyle: "italic",
            fontWeight: 700,
            color: INK,
            lineHeight: 1,
            marginTop: -6,
          }}
        >
          B
        </div>
      </div>
    ),
    { ...size },
  );
}
