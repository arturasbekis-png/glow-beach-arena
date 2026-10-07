export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Wrap each line of a heading in a masked span so it can slide up on reveal. */
export const lines = (...parts: string[]): string =>
  // A trailing space on every line but the last keeps the heading's text readable ("GLOW BEACH ARENA") for crawlers
  // and screen readers; it collapses at the end of each line box, so the layout is unchanged.
  parts
    .map((p, i) => `<span class="line"><span class="line__in" style="--i:${i}">${esc(p)}${i < parts.length - 1 ? ' ' : ''}</span></span>`)
    .join('');

/** Split text into word spans; used for scroll-driven text fill. */
export const words = (text: string): string =>
  text
    .split(' ')
    .map((w) => `<span class="w">${esc(w)}</span>`)
    .join(' ');

export const pad = (n: number): string => String(n).padStart(2, '0');

export const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));

export const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const arrow = `<svg class="arrow" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 12h15M13 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>`;
