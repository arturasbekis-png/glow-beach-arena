// Business facts. These are authoritative and must not be altered or extended.
export const site = {
  name: 'GLOW BEACH ARENA',
  address: 'Vilnius, Kareivių g. 15A',
  phone: '+370 620 71992',
  phoneHref: 'tel:+37062071992',
  email: 'rezervacija@auksma.lt',
  emailHref: 'mailto:rezervacija@auksma.lt',
  company: 'Tinklinio ir pliažinio tinklinio sporto klubas „Auksma“',
  companyCode: '193526134',
  bank: 'AB SEB bankas',
  account: 'LT03 7044 0600 0136 1051',
  year: 2026,
} as const;

export const mapUrl =
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Kareivių g. 15A, Vilnius');

// Google Analytics 4. Placeholder = analytics is OFF (nothing is loaded or sent). To switch it on, replace the value
// with the real Measurement ID (G-…) from GA4 > Admin > Data streams. See README "Analytics" (consent!) first.
export const gaMeasurementId = 'G-XXXXXXXXXX';
// While true, nothing is loaded or sent until the visitor clicks "Sutinku" in the consent notice (src/consent.ts).
// Set it to false only after deciding consent is not required (the notice is then never shown).
export const analyticsNeedsConsent = true;

// Optional assets present in public/ at build time (injected by build.mjs). Missing files are never requested.
declare const __PUBLIC_FILES__: string;
const publicFiles: string[] = typeof __PUBLIC_FILES__ === 'string' ? (JSON.parse(__PUBLIC_FILES__) as string[]) : [];
export const has = (path: string): boolean => publicFiles.includes(path);

// Drop an existing playable game build here (public/game/index.html) and it is embedded automatically.
export const gamePath = 'game/index.html';

// Gallery photographs (public/photos/gallery/: glow_gallery_* = arena, gallery-* = people). The published files are optimized WebP
// copies of the supplied photos (same framing, no crop; masters in photo-originals/gallery/, built by tools/optimize-gallery.py).
// w/h = the master's real pixel size, so every frame keeps its photo's own proportions. `tag` indexes content.gallery.tags
// (only where that word truly describes the photo); `alt` describes only what is visible.
// The ARRAY ORDER IS THE DISPLAY ORDER (and the lightbox order): 01–10 arena photography, 11–18 the events chapter.
export interface GalleryPhoto {
  file: string;
  w: number;
  h: number;
  alt: string;
  tag?: number;
}
export const galleryPhotos: GalleryPhoto[] = [
  { file: 'glow_gallery_08.webp', w: 1536, h: 1152, tag: 1, alt: 'Žmonių eilė neoninėmis geltonomis ir oranžinėmis liemenėmis prie tinklo smėlio aikštelėje po mėlynu apšvietimu.' },
  { file: 'glow_gallery_07.webp', w: 1152, h: 1536, alt: 'Smėlio aikštelė su švytinčiu tinklu ir kamuoliais; viršuje matomi šviestuvai, langai ir patalpos konstrukcijos.' },
  { file: 'glow_gallery_10.webp', w: 1536, h: 1152, tag: 3, alt: 'Dvi žaidėjos neoninėmis žaliomis liemenėmis stovi smėlio aikštelėje prieš švytintį tinklą; dešinėje – žmogus oranžine liemene.' },
  { file: 'glow_gallery_09.webp', w: 1536, h: 1152, alt: 'Plati smėlio aikštelė su švytinčiomis ribų linijomis ir tinklu; toliau matomi keli žmonės.' },
  { file: 'glow_gallery_04.webp', w: 4032, h: 3024, alt: 'Arti oranžinis ir žalias švytintis kamuolys mėlynoje šviesoje, fone matomos švytinčios linijos ir tinklo konstrukcija.' },
  { file: 'glow_gallery_05.webp', w: 1536, h: 1152, alt: 'Žaidėjos neoninėmis liemenėmis stovi eilėje prie tinklo smėlio aikštelėje; rankose laiko oranžinius žaislus, ant smėlio matyti švytintys kamuoliai.' },
  { file: 'glow_gallery_03.webp', w: 1536, h: 1152, tag: 2, alt: 'Poilsio zona rausvame apšvietime: žmonės sėdi ant sofų aplink staliuką su tortu, kuriame dega žvakė, ir taurėmis; ant grindų smėlis.' },
  { file: 'glow_gallery_02.webp', w: 1147, h: 1536, tag: 4, alt: 'Smėlis mėlynoje šviesoje; priekyje kamuolys su užrašu „MIKASA“, fone žmonės neoninėmis liemenėmis.' },
  { file: 'glow_gallery_01.webp', w: 896, h: 1200, tag: 0, alt: 'Smėlio aikštelė su švytinčiu tinklu ir kamuoliais mėlyname apšvietime, žiūrint į patalpą nuo aikštelės galo.' },
  { file: 'glow_gallery_06.webp', w: 1152, h: 1536, alt: 'Žmonės neoninėmis liemenėmis ant smėlio rausvai apšviestoje patalpoje prie durų; viena žaidėja laiko oranžinį žaislą.' },
  { file: 'gallery-04.webp', w: 1932, h: 2576, alt: 'Mergina tamsiai mėlynais marškinėliais sėdi ant juodos sofos po sidabrinių ir turkio spalvos balionų kekė; kaktą puošia spalvotas veido piešinys, už lango matoma smėlio patalpa su sofomis.' },
  { file: 'gallery-01.webp', w: 1932, h: 2576, alt: 'Mergina rožiniais marškinėliais daro grimasą į kamerą, rankoje laiko žalią teptuką; ant dilbio nupiešti juodas voras ir rožinė gėlė, aplink akį – veido piešinys.' },
  { file: 'gallery-06.webp', w: 2576, h: 1932, alt: 'Mergina rožiniais marškinėliais žiūri į kamerą, rodo ranka tris pirštus; kaktoje matomas mėlynas veido piešinys, dešinėje – kito žmogaus mėlyni marškinėliai.' },
  { file: 'gallery-02.webp', w: 1932, h: 2576, alt: 'Besišypsanti mergina bordiniais marškinėliais su auksiniu auskaru; už jos kitos merginos rožiniais marškinėliais.' },
  { file: 'gallery-03.webp', w: 1932, h: 2576, alt: 'Mergina juodais sportiniais marškinėliais sėdi kėdėje, ant dilbio nupiešta geltona saulė; fone neryškiai matomi kiti žmonės ir televizorius.' },
  { file: 'gallery-05.webp', w: 1932, h: 2576, alt: 'Mergina tamsiai mėlynais marškinėliais su geltonu veido piešiniu ant kaktos; šalia jos veido ranka su teptuku tapo antakį.' },
  { file: 'gallery-08.webp', w: 1932, h: 2576, alt: 'Mergina rožiniais marškinėliais iš arti žiūri į kamerą ir rodo ranka tris pirštus; kaktoje matomas mėlynas veido piešinys.' },
  { file: 'gallery-07.webp', w: 1932, h: 2576, alt: 'Mergina profilyje tamsiai mėlynais marškinėliais, kaktoje geltonas veido piešinys; ranka su sidabriniais nagais teptuku piešia jai ant kaktos.' },
];

// Optional hero media (real photography / video). Absent files are skipped silently.
export const heroImage = 'photos/hero.jpg';
export const heroVideo = 'media/hero.mp4';

export const ORDER = [
  'hero',
  'arena',
  'zaidimas',
  'treniruotes',
  'turnyrai',
  'renginiai',
  'galerija',
  'kainos',
  'rezervacija',
  'kontaktai',
  'final',
] as const;

// Widths of the generated files for one photo (keep in sync with tools/optimize-gallery.py):
// large = master capped to a 1600 px long edge (never upscaled), small = 720 px wide (only if the master is wider).
export const galleryVariants = (p: GalleryPhoto): { large: number; small: number | null } => {
  const scale = Math.min(1, 1600 / Math.max(p.w, p.h));
  return { large: Math.round(p.w * scale), small: p.w > 720 ? 720 : null };
};
