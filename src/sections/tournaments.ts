import { arrow, esc, lines } from '../util';
import { scene } from '../scenes';
import { tournaments } from '../content/tournaments';
import type { SectionDef } from './def';

export const tournamentsSection: SectionDef = {
  id: 'turnyrai',
  cls: 'tournaments',
  html: (c) => {
    const t = c.tournaments;
    const list = tournaments.length
      ? `<ul class="tlist">${tournaments
          .map(
            (x) => `<li class="tlist__row">
              <span class="tlist__date">${esc(x.date)}</span>
              <strong class="tlist__name">${esc(x.name)}</strong>
              ${x.result ? `<span class="tlist__res">${esc(x.result)}</span>` : ''}
              ${x.registrationUrl ? `<a class="textlink textlink--icon" href="${esc(x.registrationUrl)}" rel="noopener" aria-label="${esc(x.name)}">${arrow}</a>` : ''}
            </li>`,
          )
          .join('')}</ul>`
      : '';
    return `
    <div class="tournaments__art" aria-hidden="true" data-parallax="0.08">${scene('tournament')}</div>
    <div class="wrap tournaments__inner">
      <p class="meta" data-reveal="fade"><span>05</span> — ${esc(t.title)}</p>
      <h2 class="mega mega--outline" data-reveal="lines">${lines(t.title.toUpperCase())}</h2>
      <div class="tournaments__row">
        <p class="lead" data-reveal="up">${esc(t.text)}</p>
        <a class="btn btn--lime" href="#rezervacija" data-reserve-type="tournaments" data-reveal="up" style="--d:.1s">${esc(c.reservation.cta)} ${arrow}</a>
      </div>
      ${list}
    </div>`;
  },
};
