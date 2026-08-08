import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your Paper — A study of beauty through ideas",
  description:
    "A small quiet journal at the intersection of mathematics, music, and the humanities.",
  openGraph: {
    title: "Your Paper",
    description: "A study of beauty through ideas.",
    type: "website",
  },
};

// Explicit viewport metadata — Next.js 15+ requires this to render at the
// device width on mobile. Without it, Mobile Safari falls back to a 980px
// desktop viewport and shrinks the page to fit, making everything unreadable.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eeece7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical self-hosted fonts so the paper never FOUTs.
            All fonts are shipped from /public/fonts and served by Next.js
            static file handler — zero external CDN dependency. */}
        <link
          rel="preload"
          href="/fonts/LibreCaslonText-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/IMFeENsc28P.otf"
          as="font"
          type="font/otf"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/IMFeENit28P.otf"
          as="font"
          type="font/otf"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/Yinit.otf"
          as="font"
          type="font/otf"
          crossOrigin=""
        />
      </head>
      <body className="relative" suppressHydrationWarning>
        {/* SVG filter defs — halftone posterize used by the image treatment. */}
        <svg
          width="0"
          height="0"
          aria-hidden="true"
          style={{ position: "absolute", pointerEvents: "none" }}
        >
          <defs>
            <filter
              id="halftone-bw"
              colorInterpolationFilters="sRGB"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
            >
              <feGaussianBlur stdDeviation="0.45" />
              <feColorMatrix
                type="matrix"
                values="0.299 0.587 0.114 0 0
                        0.299 0.587 0.114 0 0
                        0.299 0.587 0.114 0 0
                        0     0     0     1 0"
              />
              <feComponentTransfer>
                <feFuncR type="discrete" tableValues="0 0.28 0.55 0.8 1" />
                <feFuncG type="discrete" tableValues="0 0.28 0.55 0.8 1" />
                <feFuncB type="discrete" tableValues="0 0.28 0.55 0.8 1" />
              </feComponentTransfer>
            </filter>
          </defs>
        </svg>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
