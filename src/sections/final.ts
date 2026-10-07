import { site } from '../config';
import { arrow, esc, lines } from '../util';
import type { SectionDef } from './def';

export const finalSection: SectionDef = {
  id: 'final',
  cls: 'final',
  html: (c) => `
    <div class="final__light final__light--lime" aria-hidden="true"></div>
    <div class="final__light final__light--cyan" aria-hidden="true"></div>
    <div class="final__inner">
      <p class="meta" data-reveal="fade"><span>11</span> — ${esc(site.address)}</p>
      <h2 class="final__title" data-reveal="lines">${lines('GLOW', 'BEACH', 'ARENA')}</h2>
      <a class="btn btn--lime btn--xl" href="#rezervacija" data-reveal="up" style="--d:.2s">${esc(c.final.cta)} ${arrow}</a>
    </div>`,
};
