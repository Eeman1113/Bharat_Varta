import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bharat Varta — India's daily wire",
    short_name: "Bharat Varta",
    description:
      "A vintage broadsheet aggregating live headlines from The Hindu, Times of India, NDTV and 300+ Indian news sources.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#eeece7",
    theme_color: "#eeece7",
    lang: "en-IN",
    dir: "ltr",
    categories: ["news", "magazines", "books"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
