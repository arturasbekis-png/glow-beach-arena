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

// Optional assets present in public/ at build time (injected by build.mjs). Missing files are never requested.
declare const __PUBLIC_FILES__: string;
const publicFiles: string[] = typeof __PUBLIC_FILES__ === 'string' ? (JSON.parse(__PUBLIC_FILES__) as string[]) : [];
export const has = (path: string): boolean => publicFiles.includes(path);

// Drop an existing playable game build here (public/game/index.html) and it is embedded automatically.
export const gamePath = 'game/index.html';

// Gallery photographs (public/photos/gallery/, files used exactly as supplied — never edited or re-encoded).
// w/h = the file's real pixel size, so every frame keeps its photo's own proportions. `tag` indexes content.gallery.tags
// (only where that word truly describes the photo); `alt` describes only what is visible.
export interface GalleryPhoto {
  file: string;
  w: number;
  h: number;
  alt: string;
  tag?: number;
}
export const galleryPhotos: GalleryPhoto[] = [
  { file: 'glow_gallery_01.jpg', w: 896, h: 1200, tag: 0, alt: 'Smėlio aikštelė su švytinčiu tinklu ir kamuoliais mėlyname apšvietime, žiūrint į patalpą nuo aikštelės galo.' },
  { file: 'glow_gallery_05.jpg', w: 1536, h: 1152, alt: 'Žaidėjos neoninėmis liemenėmis stovi eilėje prie tinklo smėlio aikštelėje; rankose laiko oranžinius žaislus, ant smėlio matyti švytintys kamuoliai.' },
  { file: 'glow_gallery_02.jpg', w: 1147, h: 1536, tag: 4, alt: 'Smėlis mėlynoje šviesoje; priekyje kamuolys su užrašu „MIKASA“, fone žmonės neoninėmis liemenėmis.' },
  { file: 'glow_gallery_08.jpg', w: 1536, h: 1152, tag: 1, alt: 'Žmonių eilė neoninėmis geltonomis ir oranžinėmis liemenėmis prie tinklo smėlio aikštelėje po mėlynu apšvietimu.' },
  { file: 'glow_gallery_03.jpg', w: 1536, h: 1152, tag: 2, alt: 'Poilsio zona rausvame apšvietime: žmonės sėdi ant sofų aplink staliuką su tortu, kuriame dega žvakė, ir taurėmis; ant grindų smėlis.' },
  { file: 'glow_gallery_10.jpg', w: 1536, h: 1152, tag: 3, alt: 'Dvi žaidėjos neoninėmis žaliomis liemenėmis stovi smėlio aikštelėje prieš švytintį tinklą; dešinėje – žmogus oranžine liemene.' },
  { file: 'glow_gallery_04.jpg', w: 4032, h: 3024, alt: 'Arti oranžinis ir žalias švytintis kamuolys mėlynoje šviesoje, fone matomos švytinčios linijos ir tinklo konstrukcija.' },
  { file: 'glow_gallery_09.jpg', w: 1536, h: 1152, alt: 'Plati smėlio aikštelė su švytinčiomis ribų linijomis ir tinklu; toliau matomi keli žmonės.' },
  { file: 'glow_gallery_06.jpg', w: 1152, h: 1536, alt: 'Žmonės neoninėmis liemenėmis ant smėlio rausvai apšviestoje patalpoje prie durų; viena žaidėja laiko oranžinį žaislą.' },
  { file: 'glow_gallery_07.jpg', w: 1152, h: 1536, alt: 'Smėlio aikštelė su švytinčiu tinklu ir kamuoliais; viršuje matomi šviestuvai, langai ir patalpos konstrukcijos.' },
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
