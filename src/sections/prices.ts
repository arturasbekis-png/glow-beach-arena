import { arrow, esc, lines, pad } from '../util';
import type { SectionDef } from './def';

export const prices: SectionDef = {
  id: 'kainos',
  cls: 'prices',
  html: (c) => {
    const p = c.prices;
    return `
    <div class="wrap">
      <p class="meta" data-reveal="fade"><span>08</span> — ${esc(c.nav[6]?.label ?? '')}</p>
      <h2 class="mega" data-reveal="lines">${lines(p.title.toUpperCase())}</h2>
      <div class="prices__intro">
        <p class="lead" data-reveal="up">${esc(p.text)}</p>
        <ul class="spec" data-reveal="up" style="--d:.1s">
          ${p.fields.map((f, i) => `<li><span>${pad(i + 1)}</span>${esc(f)}</li>`).join('')}
        </ul>
      </div>
      <ul class="plist">
        ${p.categories
          .map(
            (k) => `
          <li class="prow" data-reveal="up">
            <div class="prow__main">
              <h3 class="prow__t">${esc(k.title.toUpperCase())}</h3>
              <p class="prow__p">${esc(k.text)}</p>
            </div>
            <div class="prow__price"><span>${esc(p.priceLabel)}</span><b>${esc(p.priceValue)}</b></div>
            <a class="btn btn--line" href="#rezervacija" data-reserve-type="${k.key}">${esc(p.cta)} ${arrow}</a>
          </li>`,
          )
          .join('')}
      </ul>
    </div>`;
  },
};
