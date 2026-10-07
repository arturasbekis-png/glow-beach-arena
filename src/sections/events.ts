import { arrow, esc, lines, pad } from '../util';
import { scene, type SceneKind } from '../scenes';
import type { SectionDef } from './def';

const kinds: Record<string, SceneKind> = { kids: 'events', corporate: 'corporate', tournaments: 'tournament' };

export const events: SectionDef = {
  id: 'renginiai',
  cls: 'events',
  html: (c) => {
    const e = c.events;
    return `
    <div class="wrap events__head">
      <p class="meta" data-reveal="fade"><span>06</span> — ${esc(c.nav[4]?.label ?? '')}</p>
      <h2 class="headline" data-reveal="lines">${lines(...e.title.split('. ').map((s, i, a) => (i < a.length - 1 ? s + '.' : s)))}</h2>
      <p class="lead" data-reveal="up">${esc(e.text)}</p>
    </div>
    <div class="formats">
      ${e.formats
        .map(
          (f, i) => `
        <article class="format format--${f.key}" style="--z:${i + 1}">
          <div class="format__inner">
            <div class="format__art" data-parallax="0.06">${scene(kinds[f.key] ?? 'events')}</div>
            <div class="format__shade"></div>
            <div class="wrap format__body">
              <span class="format__n">${pad(i + 1)} / ${pad(e.formats.length)}</span>
              <h3 class="format__t" data-reveal="lines">${lines(f.title.toUpperCase())}</h3>
              <p class="format__p" data-reveal="up">${esc(f.text)}</p>
              <a class="btn btn--lime" href="#rezervacija" data-reserve-type="${f.key}" data-reveal="up" style="--d:.1s">${esc(f.key === 'tournaments' ? c.reservation.cta : c.prices.cta)} ${arrow}</a>
            </div>
          </div>
        </article>`,
        )
        .join('')}
    </div>`;
  },
};
