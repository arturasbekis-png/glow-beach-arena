import { galleryFiles, has } from '../config';
import { esc, lines, pad } from '../util';
import { scene, type SceneKind } from '../scenes';
import type { SectionDef } from './def';

// Order matches c.gallery.tags and config.galleryFiles: Arena, Aikštelė, Šviesa, Tinklas, Smėlis
const kinds: SceneKind[] = ['light', 'court', 'light', 'net', 'sand'];

export const gallery: SectionDef = {
  id: 'galerija',
  cls: 'gallery',
  html: (c) => {
    const g = c.gallery;
    return `
    <div class="gallery__pin">
      <div class="gallery__track" data-gallery-track>
        <div class="gallery__intro">
          <p class="meta" data-reveal="fade"><span>07</span> — ${esc(c.nav[5]?.label ?? '')}</p>
          <h2 class="headline" data-reveal="lines">${lines(g.title)}</h2>
          <p class="lead" data-reveal="up">${esc(g.text)}</p>
          <p class="gallery__hint" aria-hidden="true"><i></i></p>
        </div>
        ${g.tags
          .map(
            (tag, i) => `
          <figure class="slide slide--${i % 3}">
            <div class="slide__frame">
              ${scene(kinds[i] ?? 'sand')}
              ${has(`photos/${galleryFiles[i] ?? ''}`) ? `<img src="./photos/${galleryFiles[i]}" alt="${esc(tag)}" loading="lazy" decoding="async" />` : ''}
            </div>
            <figcaption><span>${pad(i + 1)}</span><b>${esc(tag)}</b></figcaption>
          </figure>`,
          )
          .join('')}
      </div>
    </div>`;
  },
};
