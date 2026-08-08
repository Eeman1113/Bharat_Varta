/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // HTML pages — cache at the edge for 10 minutes, serve stale for
        // 30 minutes while revalidating. Compatible with force-dynamic
        // pages: the browser gets max-age=0 (always revalidate) while
        // Vercel's edge / any downstream CDN can hold and serve.
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=600, stale-while-revalidate=1800",
          },
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large, max-snippet:-1",
          },
        ],
      },
      {
        source: "/read/:id",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=600, stale-while-revalidate=1800",
          },
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large, max-snippet:-1",
          },
        ],
      },
      {
        // sitemap.xml — small and cheap; tell crawlers it's fresh but
        // let edges cache briefly.
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=600, stale-while-revalidate=1800",
          },
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
        ],
      },
      {
        // Everywhere else — allow indexing. Explicit is better than
        // implicit for the crawler tag.
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large, max-snippet:-1",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
