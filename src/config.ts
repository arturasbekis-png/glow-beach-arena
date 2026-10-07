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

// Gallery slots. Put real arena photos at public/photos/<file>; until then the slot shows an abstract scene.
export const galleryFiles = ['arena.jpg', 'aikstele.jpg', 'sviesa.jpg', 'tinklas.jpg', 'smelis.jpg'] as const;

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
