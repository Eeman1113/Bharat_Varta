import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://bharatvarta.vercel.app";
const SITE_NAME = "Bharat Varta";
const SITE_DESCRIPTION =
  "Bharat Varta is a daily Indian news aggregator set in vintage broadsheet type. It gathers live headlines from 300+ RSS feeds — The Hindu, Times of India, NDTV, Hindustan Times, Business Standard, Livemint, Scroll, The Wire, The Print, News18, India Today, Deccan Chronicle, Firstpost, Rediff, Inshorts and more — and recomposes the front page on every request in a rule-based band engine, delivering a fresh, algorithm-free broadsheet of India news, world news, business, sport, technology and opinion.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bharat Varta — India's daily wire, set in Caslon",
    template: "%s · Bharat Varta",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Bharat Varta",
    "Indian news aggregator",
    "India news",
    "India daily news",
    "India news roundup",
    "Indian newspaper online",
    "vintage newspaper India",
    "English Indian news",
    "India headlines",
    "India RSS aggregator",
    "The Hindu",
    "Times of India",
    "NDTV",
    "Hindustan Times",
    "Business Standard",
    "Livemint",
    "Scroll.in",
    "The Wire",
    "The Print",
    "News18",
    "India Today",
    "Deccan Chronicle",
    "Firstpost",
    "Rediff",
    "Inshorts",
    "Sportstar",
    "India business news",
    "India sports news",
    "India tech news",
    "India opinion",
    "India world news",
    "broadsheet",
    "Caslon",
    "IM Fell English",
  ],
  authors: [{ name: "Eeman Majumder", url: "https://github.com/Eeman1113" }],
  creator: "Eeman Majumder",
  publisher: "Bharat Varta",
  category: "news",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/sitemap.xml", title: "Bharat Varta sitemap" },
      ],
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Bharat Varta — India's daily wire, set in Caslon",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Bharat Varta — India's daily wire",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bharat Varta — India's daily wire, set in Caslon",
    description: SITE_DESCRIPTION,
    creator: "@Eeman1113",
    site: "@Eeman1113",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Fill in when Search Console / Bing Webmaster / Yandex are set up.
    google: undefined,
    yandex: undefined,
    yahoo: undefined,
    other: {},
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
};

// Explicit viewport metadata — Next.js 15+ requires this to render at the
// device width on mobile. Without it, Mobile Safari falls back to a 980px
// desktop viewport and shrinks the page to fit, making everything unreadable.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eeece7",
  colorScheme: "light",
};

// Root JSON-LD: Organization + WebSite. Hidden from users, seen by crawlers.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "Bharat Varta — India's daily wire",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/icon.svg`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/opengraph-image`,
  description: SITE_DESCRIPTION,
  foundingDate: "2026",
  founder: {
    "@type": "Person",
    name: "Eeman Majumder",
    url: "https://github.com/Eeman1113",
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  knowsLanguage: ["en", "en-IN"],
  sameAs: ["https://github.com/Eeman1113/Bharat_Varta"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: "en-IN",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN">
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
        {/* Structured data — NewsMediaOrganization + WebSite */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
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
