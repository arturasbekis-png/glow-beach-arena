import { galleryPhotos, galleryVariants, has } from '../config';
import { esc, lines, pad } from '../util';
import type { SectionDef } from './def';

/**
 * Editorial gallery. DOM order == display order == lightbox order (config.galleryPhotos).
 * 01–10: arena photography in a vertical 12-column composition (single editorial column on mobile).
 * 11–18: the events chapter (quieter; a native horizontal swipe strip on mobile).
 * Placement per photo lives in CSS (`.shot[data-n]`); here only the `sizes` hints depend on it.
 * Photos are never cropped: every frame uses the photo's own aspect ratio.
 */
const MAIN_COUNT = 10;
// approx. rendered width per photo (01–18): desktop in vw (12-col layout) and mobile in vw (editorial column)
const DESKTOP_VW = [90, 44, 29, 75, 29, 51, 51, 29, 29, 29, 29, 29, 51, 29, 29, 29, 29, 29];
const MOBILE_VW = [100, 88, 72, 100, 62, 92, 100, 78, 70, 84, 70, 70, 70, 70, 70, 70, 70, 70];

export const gallery: SectionDef = {
  id: 'galerija',
  cls: 'gallery',
  html: (c) => {
    const g = c.gallery;
    const photos = galleryPhotos.filter((p) => has(`photos/gallery/${p.file}`));
    const total = photos.length;
    const shot = (p: (typeof photos)[number], i: number): string => {
      const tag = p.tag !== undefined ? g.tags[p.tag] : undefined;
      const v = galleryVariants(p);
      const large = `./photos/gallery/${p.file}`;
      const srcset = v.small
        ? ` srcset="./photos/gallery/${p.file.replace(/\.webp$/, `-${v.small}.webp`)} ${v.small}w, ${large} ${v.large}w" sizes="(max-width: 899px) ${MOBILE_VW[i] ?? 70}vw, ${DESKTOP_VW[i] ?? 30}vw"`
        : '';
      const n = i + 1;
      return `
        <figure class="shot" data-n="${n}"${i < MAIN_COUNT ? ' data-reveal="up"' : ''} style="--ar:${p.w} / ${p.h};--ar-n:${(p.w / p.h).toFixed(4)}">
          <button class="shot__btn" type="button" data-shot data-full="${large}" data-w="${p.w}" data-h="${p.h}" aria-label="${esc(g.open)} ${pad(n)}" aria-describedby="gimg-${n}">
            <img id="gimg-${n}" src="${large}"${srcset} width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="lazy" decoding="async" />
          </button>
          <figcaption aria-hidden="true"><span>${pad(n)}</span>${tag ? `<b>${esc(tag)}</b>` : ''}</figcaption>
        </figure>`;
    };
    const main = photos.slice(0, MAIN_COUNT).map((p, i) => shot(p, i)).join('');
    const events = photos.slice(MAIN_COUNT).map((p, i) => shot(p, i + MAIN_COUNT)).join('');
    return `
    <div class="gallery__head">
      <p class="meta" data-reveal="fade"><span>07</span> — ${esc(c.nav[5]?.label ?? '')}</p>
      <h2 class="headline" data-reveal="lines">${lines(g.title)}</h2>
      <p class="lead" data-reveal="up">${esc(g.text)}</p>
    </div>
    <div class="gallery__main">${main}</div>
    ${
      events
        ? `<p class="gallery__pause" aria-hidden="true"><i></i><span>${pad(MAIN_COUNT + 1)} — ${pad(total)}</span></p>
    <div class="gallery__events" role="group" aria-label="${esc(c.nav[4]?.label ?? '')}">${events}</div>`
        : ''
    }`;
  },
};
