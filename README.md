# GLOW BEACH ARENA — new website

Vanilla TypeScript + esbuild. No runtime dependencies. Lithuanian by default, English via the LT / EN switch
(`?lang=en` also works).

## Commands (Windows PowerShell / CMD, macOS, Linux)

Requires Node.js 18 or newer. No Python needed.

```
npm install         # once: installs esbuild + typescript (declared in package.json)
npm run build       # esbuild → dist/   (minified JS + CSS, public/ copied over)
npm run preview     # serves dist/ at http://localhost:4173 (auto-picks the next free port if busy)
npm run typecheck   # tsc --noEmit (strict)
npm run check       # typecheck + build
```

Stop the preview with Ctrl+C. To start from a different port: `set PORT=5000 && npm run preview` (CMD) or
`$env:PORT=5000; npm run preview` (PowerShell).

## Drop-in assets (nothing is faked while they are missing)

| File | Effect |
| --- | --- |
| `public/brand/logo.svg` (or `logo.png`) | Official logo in the header, used exactly as supplied. Until it exists, the name shows as plain text. |
| `public/game/index.html` (+ its assets) | Existing GLOW GAME embedded unchanged in ŽAIDIMAS (iframe). Survives language switches without reloading. |
| `public/photos/gallery/*.jpg` | Gallery photos (listed in `galleryPhotos`, `src/config.ts`), used exactly as supplied. |
| `public/photos/hero.jpg`, `public/media/hero.mp4` | Optional full-bleed hero media. |

Rebuild after adding files — the build records which optional files exist, so missing ones are never requested.

## Where things live

- `src/content/lt.ts` — Lithuanian copy (source of truth, from the brief). `en.ts` — English translation. `types.ts` keeps both in sync.
- `src/config.ts` — company / contact facts (do not alter).
- `src/content/tournaments.ts` — add REAL tournaments here (name, date, registration link, result). Empty until then.
- `src/sections/*` — one module per chapter. `src/motion.ts` — all scroll motion. `src/styles/main.css` — design tokens + styles.

## Reservation form

There is no booking backend. Submitting validates the form and prepares an email to rezervacija@auksma.lt
in the visitor's mail app, and the page states plainly that it is not a confirmed reservation.
Connect a real endpoint in `src/form.ts` when one exists.

## Fonts

Archivo (variable) loads from Google Fonts in `index.html`, with a Helvetica/Arial fallback. To self-host, download the
font files into `public/` and replace that `<link>` with an `@font-face`.
