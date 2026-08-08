# Font settings

All fonts are self-hosted from `public/fonts/`. Nothing is fetched from Google Fonts, Adobe Fonts, or any other CDN at runtime.

## Files

| File | Family | Style | License | Source |
|---|---|---|---|---|
| `Missaali-Regular.otf` | Missaali | Regular | OFL | CTAN `texlive-missaali` (Tommi Syrjänen) |
| `IMFeENrm28P.otf` | IM Fell English | Regular | OFL | CTAN `imfellenglish` (Igino Marini) |
| `IMFeENit28P.otf` | IM Fell English | Italic | OFL | CTAN `imfellenglish` |
| `IMFeENsc28P.otf` | IM Fell English (Small Caps) | SC | OFL | CTAN `imfellenglish` |
| `LibreCaslonText-Regular.otf` | Libre Caslon Text | Regular | OFL | CTAN `librecaslon` (Pablo Impallari) |
| `LibreCaslonText-Italic.otf` | Libre Caslon Text | Italic | OFL | CTAN `librecaslon` |
| `LibreCaslonText-Bold.otf` | Libre Caslon Text | Bold | OFL | CTAN `librecaslon` |
| `LibreCsln-BoldItalic.otf` | Libre Caslon Text | Bold Italic | OFL | CTAN `librecaslon` |
| `Yinit.otf` | Yinit | Regular | Public Domain | CTAN `yinit-otf` (Yannis Haralambous) |

Total on-disk weight: ~1.7 MB.

## Where each font is used

### Wordmark — `.wordmark` (masthead h1)
Renders `ß∆çh †ø G∆μ∫∫` on the homepage.

```css
.wordmark {
  font-family: "Elzevir-Italic", "IM Fell English", "Libre Caslon Text",
               Missaali, Garamond, serif;
  font-style: italic;
  font-weight: 400;
  font-size: 73.8237px;
  font-feature-settings: "hist", "hlig", "onum", "swsh";
  font-variant-ligatures: discretionary-ligatures;
}
```

Actual resolved font: **IM Fell English Italic** (Elzevir-Italic is a proprietary reference-only entry; if you license it and drop the file in `public/fonts/`, it takes over automatically).

### Essay heading — `.page-post header h2` and `.title-caps`
Small-caps essay titles like `RELATIVITY IN RHYTHM — PART ONE`.

```css
font-family: "Caslon-SC", "Libre Caslon Text", "Adobe Caslon Pro", Caslon,
             "EB Garamond", Georgia, serif;
font-weight: 100;
font-size: 1.665rem;             /* = 26.6366px at 16px root */
font-variant-caps: all-small-caps;
font-feature-settings: "hist", "hlig", "onum", "swsh", "smcp", "c2sc";
```

`Caslon-SC` is a local `@font-face` alias that maps to `IMFeENsc28P.otf` — a real small-caps font file, not browser-synthesized capitals.

### Body prose — `body`, `.prose-paper`
```css
font-family: "Libre Caslon Text", "Adobe Caslon Pro", Caslon,
             "EB Garamond", Georgia, serif;
font-size: 18.963px;
font-feature-settings: "hist", "hlig", "onum", "swsh", "liga", "kern";
font-variant-ligatures: discretionary-ligatures;
```

### Drop cap — `.page-post article p:first-of-type::first-letter`
The ornate botanical initial that opens each essay.

```css
font-family: Yinit, "IM Fell English", "Libre Caslon Text", Caslon, serif;
font-size: 5.5em;
line-height: 0.82;
float: left;
```

Yinit is a public-domain OTF containing decorative Old German/Rotunda initial capitals (a Haralambous conversion of the classic `yinit` MetaFont set). One glyph per letter, black-and-white botanical woodcut style.

### Small monospace — `.font-mono`, `.font-mono` utility, and asides
```css
font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
```

Loaded from Google Fonts (the only remote font left). Used for the tagline `A study of Beauty through Music and Math.` and the numeric essay footer `0031220130,0021120230`.

## `@font-face` declarations

All defined at the top of `app/globals.css`. Excerpt:

```css
@font-face {
  font-family: "Missaali";
  src: url("/fonts/Missaali-Regular.otf") format("opentype");
  font-weight: 400; font-style: normal; font-display: swap;
}

@font-face {
  font-family: "Yinit";
  src: url("/fonts/Yinit.otf") format("opentype");
  font-weight: 400; font-style: normal; font-display: swap;
}

@font-face {
  font-family: "IM Fell English";
  src: url("/fonts/IMFeENrm28P.otf") format("opentype");
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: "IM Fell English";
  src: url("/fonts/IMFeENit28P.otf") format("opentype");
  font-weight: 400; font-style: italic; font-display: swap;
}

@font-face {
  font-family: "Libre Caslon Text";
  src: url("/fonts/LibreCaslonText-Regular.otf") format("opentype");
  font-weight: 400; font-style: normal; font-display: swap;
}
/* + Italic, Bold, BoldItalic variants */

@font-face {
  font-family: "Caslon-SC";
  src: url("/fonts/IMFeENsc28P.otf") format("opentype");
  font-weight: 100 900; font-style: normal; font-display: swap;
}
```

## Tailwind config

`tailwind.config.ts`:

```ts
fontFamily: {
  serif: [
    '"Libre Caslon Text"', '"Adobe Caslon Pro"', "Caslon",
    '"EB Garamond"', "Georgia", "serif",
  ],
  display: [
    "Elzevir-Italic", '"IM Fell English"', "Missaali", "Garamond", "serif",
  ],
  mono: [
    '"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace",
  ],
},
```

## Reference values matched from the target site

Values pulled from the reference's DevTools computed styles:

| Element | Property | Value |
|---|---|---|
| Body `<p>` | `font-family` | Caslon |
| Body `<p>` | `font-size` | 18.963px |
| Body `<p>` | `font-feature-settings` | `"hist", "hlig", "onum", "swsh"` |
| Body `<p>` | `font-variant-ligatures` | discretionary-ligatures |
| Heading `.h2` | `font-family` | Caslon-SC |
| Heading `.h2` | `font-size` | 26.6366px |
| Heading `.h2` | `font-weight` | 100 |
| Masthead `.h1` | `font-family` | Elzevir-Italic |
| Masthead `.h1` | `font-size` | 73.8237px |
| Masthead `.h1` | `font-weight` | 400 |

## Fonts we could not get for free

- **Elzevir-Italic** — proprietary (Adobe/URW/DTL sell cuts, ~$40–$200). Referenced first in the stack; IM Fell English Italic is the closest free substitute in feel (both are hand-drawn 17th-century humanist italics, different foundries).
- **Caslon-SC** proper — proprietary (Adobe Caslon Pro Small Caps and equivalents). Aliased to IM Fell English Small Caps, which is a real small-caps font file and renders with hinted glyphs, not synthesized capitals.

To swap either in later: drop the licensed OTF into `public/fonts/`, add one `@font-face` block, done.

## Getting more fonts from CTAN

The pattern that worked repeatedly:

```sh
# 1. Find the package
curl 'https://ctan.org/json/2.0/packages' | jq '.[] | select(.name | test("keyword"; "i"))'

# 2. Download the ZIP
curl -o /tmp/pkg.zip 'https://mirrors.ctan.org/fonts/PACKAGE-NAME.zip'

# 3. Extract the OTF(s)
unzip -j /tmp/pkg.zip 'PACKAGE-NAME/opentype/*.otf' -d public/fonts/

# 4. Register with @font-face in app/globals.css
```

Package names tried in this project (all successful): `librecaslon`, `imfellenglish`, `initials` (contained only .pfb), `yinit-otf`. Gothic package for German initials lives at `/fonts/gothic/yinit-otf.zip` on the mirror.
