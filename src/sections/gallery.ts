import { galleryPhotos, has } from '../config';
import { esc, lines, pad } from '../util';
import type { SectionDef } from './def';

export const gallery: SectionDef = {
  id: 'galerija',
  cls: 'gallery',
  html: (c) => {
    const g = c.gallery;
    const photos = galleryPhotos.filter((p) => has(`photos/gallery/${p.file}`));
    return `
    <div class="gallery__pin">
      <div class="gallery__track" data-gallery-track>
        <div class="gallery__intro">
          <p class="meta" data-reveal="fade"><span>07</span> — ${esc(c.nav[5]?.label ?? '')}</p>
          <h2 class="headline" data-reveal="lines">${lines(g.title)}</h2>
          <p class="lead" data-reveal="up">${esc(g.text)}</p>
          <p class="gallery__hint" aria-hidden="true"><i></i></p>
        </div>
        ${photos
          .map((p, i) => {
            const tag = p.tag !== undefined ? g.tags[p.tag] : undefined;
            return `
          <figure class="slide slide--${i % 3}" style="--ar:${p.w} / ${p.h};--ar-n:${(p.w / p.h).toFixed(4)}">
            <div class="slide__frame">
              <img src="./photos/gallery/${p.file}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="lazy" decoding="async" />
            </div>
            <figcaption><span>${pad(i + 1)}</span>${tag ? `<b>${esc(tag)}</b>` : ''}</figcaption>
          </figure>`;
          })
          .join('')}
      </div>
    </div>`;
  },
};
