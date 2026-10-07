import { arrow, esc, lines } from '../util';
import { scene } from '../scenes';
import type { SectionDef } from './def';

const row = (ws: string[], cls: string, dir: number): string => {
  const set = ws.map((w) => `<span>${esc(w)}</span><i aria-hidden="true"></i>`).join('');
  return `<div class="marquee ${cls}" aria-hidden="true"><div class="marquee__track" data-marquee="${dir}">${set}${set}${set}${set}</div></div>`;
};

export const training: SectionDef = {
  id: 'treniruotes',
  cls: 'training',
  html: (c) => {
    const t = c.training;
    return `
    <div class="wrap training__head">
      <p class="meta" data-reveal="fade"><span>04</span> — ${esc(t.title)}</p>
      <h2 class="mega" data-reveal="lines">${lines(t.title.toUpperCase())}</h2>
    </div>
    <div class="training__bands">
      ${row(t.words, 'marquee--solid', 1)}
      ${row([...t.words].reverse(), 'marquee--outline', -1)}
    </div>
    <div class="wrap training__foot">
      <div class="training__art" data-reveal="scale">${scene('training')}</div>
      <div class="training__cta" data-reveal="up">
        <a class="btn btn--line" href="#rezervacija" data-reserve-type="training">${esc(c.reservation.cta)} ${arrow}</a>
      </div>
    </div>`;
  },
};
