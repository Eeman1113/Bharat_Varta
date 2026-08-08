# Bharat Varta

A dynamic vintage newspaper for the Indian subcontinent — set in Caslon,
composed fresh every refresh, drawn from the wires of 300+ Indian outlets.

**Live at [bharatvarta.vercel.app](https://bharatvarta.vercel.app/)**

![Bharat Varta](public/screenshots/hero.jpg)

---

## What it is

A daily front page that reads like a broadsheet from 1918:

- **Live RSS aggregation** from 300+ Indian sources — The Hindu, Times of
  India, NDTV, Hindustan Times, Indian Express, Business Standard, Livemint,
  The Wire, The Print, Scroll, News18, India Today, Deccan Chronicle,
  Firstpost, Rediff, Sportstar, Inshorts, and every regional desk and
  vertical each of those outlets publishes.
- **Dynamic composition** — the front-page layout is re-rolled on every
  request through a seeded rule-based band engine. Same rules, different
  arrangement every refresh. Consistent like a real newspaper, unique like
  a Minecraft seed.
- **True broadsheet density** — articles pour through CSS multi-column flow
  with column rules and hairline separators. No card gaps, no dead space.
- **Vintage typography** — Libre Caslon Text for body, IM Fell English
  Italic for the wordmark, IM Fell SC for headlines, Yinit for the reader
  page's illuminated drop cap. All self-hosted from CTAN — no external
  font CDN, no tracking.
- **Halftone photography** — every wire photo goes through an SVG posterize
  filter + 45° dot screen at multiply blend, so images print like ink on
  newsprint.

![Front page](public/screenshots/front-page.jpg)

---

## The band engine

Every section is composed as a sequence of canonical broadsheet **bands**,
each with a fixed internal layout:

| Band | Description |
|---|---|
| `lead` | Dominant hero photo + attached headline + 2-column mini-digest of 12 briefs beside it |
| `feature` | Bordered emphasis story with image + dense side flow |
| `denseColumns` | 5-6 CSS columns flowing 20-40 short items packed continuously |
| `briefs` | Aligned row of 3-5 identical brief cells |
| `briefsDigest` | 3-4 col × 2-3 row deep digest grid |
| `columnTriple` / `columnPair` | 2-3 text columns side by side |
| `photoStrip` | 2-3 matched-height image tiles |
| `twoColumnSplit` | Two chapter groups of 2 stories each |

The **article classifier** grades every article on four suitability axes
(`leadScore`, `featureScore`, `columnScore`, `briefScore`) from image
presence, description length, and title length — so image-rich long stories
land in leads, long-text no-image stories land in columns, and bare
headlines land in briefs. No wire brief ever ends up in a hero slot.

**Section pairs**: after the full-width Front Page, the other six sections
(India, World, Business, Sport, Tech, Opinion) render as three side-by-side
**chapter spreads** with a thin vertical column rule between — the authentic
newspaper broadsheet arrangement. Which pair leads rotates by seed.

**Per-refresh variety within rules**: seed is fresh `Math.random()` per
request. Recipe pick, article routing, and band-tail composition all vary,
but every render obeys the same broadsheet grammar. Feed content is cached
10 min at the fetch layer so only the composition re-rolls per request.

## Stack

- **Next.js 16** App Router with React 19
- **Tailwind CSS** for utility layer + custom `.np-*` design tokens
- **fast-xml-parser** for RSS/Atom feed parsing
- **SVG filter** halftone + CSS radial-gradient dot screen for image treatment
- **Self-hosted OTF fonts** from CTAN (Libre Caslon, IM Fell English, Yinit)
- **Deployed on Vercel** with Fluid Compute + edge caching

## SEO

Every page ships full metadata even though nothing is user-visible:

- Dynamic `NewsArticle` JSON-LD on every `/read/[id]` reader page —
  eligible for Google News and Discover
- Dynamic sitemap.xml with 5,000 live article URLs, refreshed every 10 min
- Per-article dynamic OG images (1200×630) rendered via `next/og`
- `NewsMediaOrganization` + `WebSite` root schema for publisher entity
- Ranking-tuned root metadata + 33 keywords covering major outlets
- `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `apple-icon` — all live

## Local development

```bash
npm install
npm run dev
# open http://localhost:3000
```

The dev server fetches all 300+ RSS feeds on first request (batched 20 at
a time via a worker pool, 8s timeout each) and caches for 10 minutes. First
load is ~2s cold; subsequent renders are instant.

## Repo layout

```
app/
  page.tsx                — front page, band renderers, section pair layout
  layout.tsx              — root metadata, halftone SVG filter, JSON-LD
  read/[id]/page.tsx      — article reader with drop cap
  sitemap.ts              — dynamic sitemap generator
  opengraph-image.tsx     — 1200×630 OG image (site brand)
  read/[id]/opengraph-image.tsx  — per-article OG image
components/
  Masthead.tsx            — wordmark + date + section rail
  ArticleTile.tsx         — tile with 7 variants (lead/hero/feature/…)
  Footer.tsx
lib/
  feeds.ts                — 300+ RSS source config
  rss.ts                  — fetcher, XML parser, article normalizer
  layout.ts               — band vocabulary, recipes, composer, PRNG
public/
  fonts/                  — 9 self-hosted OTF font files
  robots.txt              — allow-all + sitemap URL
fontsettings.md           — full font documentation with sources + licenses
```

## Fonts + credits

All fonts are freely licensed and shipped from `/public/fonts`. See
[`fontsettings.md`](fontsettings.md) for the full recipe.

- **Libre Caslon Text** — Pablo Impallari, [SIL OFL](https://scripts.sil.org/OFL)
- **IM Fell English / Italic / Small Caps** — Igino Marini, SIL OFL
- **Yinit** — Yannis Haralambous, Public Domain
- **Missaali** — Tommi Syrjänen, SIL OFL

## License

Code: MIT.
Content: syndicated per each source outlet's terms — all articles link back
to the originating publisher and every tile carries a `src.` credit line.

## Author

By **Eeman Majumder** — [@Eeman1113](https://github.com/Eeman1113)
