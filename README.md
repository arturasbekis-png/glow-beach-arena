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
| `public/photos/gallery/*.webp` | Optimized gallery photos (listed in `galleryPhotos`, `src/config.ts`); masters in `photo-originals/gallery/`, rebuilt with `python3 tools/optimize-gallery.py`. |
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

## Analytics (GA4)

Analytics code lives in `src/analytics.ts` and is **off** until a real Measurement ID is set: `gaMeasurementId` in
`src/config.ts` is the placeholder `G-XXXXXXXXXX`, and while it is a placeholder (or while `analyticsNeedsConsent` is
`true` and no consent has been granted) nothing is loaded and nothing is sent.

Events (only these): `reservation_cta_click`, `offer_cta_click` (Gauti pasiūlymą), `reservation_form_start`,
`reservation_form_submit` (an inquiry was prepared — **not** a confirmed booking), `reservation_form_error`,
`contact_phone_click`, `contact_email_click`. Parameters are limited to short labels (`cta_location`, `event_type`,
`source`, `form_field`, `error_type`); names, phone numbers, e-mail addresses and free text are never sent.

Debugging: open the site with `?ga_debug=1` to print every event to the console (also as a dry run without an ID).

Consent: `src/consent.ts` shows a small bottom notice (Sutinku / Nesutinku) only when analytics could actually run (a real
ID is set) and the visitor has not chosen yet. The choice is stored in `localStorage` as `analytics_consent = granted | denied`
(no personal data). "Sutinku" calls `grantAnalyticsConsent()`; "Nesutinku" keeps GA4 completely off. Until a visitor agrees —
and for everyone who refuses — no Google request, `gtag`, `dataLayer` or analytics cookie exists. `?ga_debug=1` also shows
the notice and the footer link while the placeholder ID is in place, so they can be previewed.

Changing the decision later: the footer link "Analitikos nustatymai" (shown under the same condition as the notice) reopens
the same panel. "Sutinku" stores `granted` and calls `grantAnalyticsConsent()`; "Nesutinku" stores `denied`, stops sending
immediately (Google's `ga-disable-<ID>` switch) and removes any `_ga*` cookies. Esc closes a reopened panel without a change.

To activate: (1) replace the placeholder in `src/config.ts` with the real `G-…` ID; (2) in GA4 Enhanced measurement, turn off
"Form interactions" so it does not duplicate the form events; (3) commit and deploy. (Before launch, also consider a privacy notice page — none exists yet.)

## Fonts

Archivo (variable) loads from Google Fonts in `index.html`, with a Helvetica/Arial fallback. To self-host, download the
font files into `public/` and replace that `<link>` with an `@font-face`.
