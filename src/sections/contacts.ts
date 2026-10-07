import { site, mapUrl } from '../config';
import { arrow, esc, lines } from '../util';
import type { SectionDef } from './def';

export const contacts: SectionDef = {
  id: 'kontaktai',
  cls: 'contacts',
  html: (c) => {
    const k = c.contacts;
    return `
    <div class="wrap">
      <p class="meta" data-reveal="fade"><span>10</span> — ${esc(k.title)}</p>
      <h2 class="mega" data-reveal="lines">${lines(k.title.toUpperCase())}</h2>
      <div class="contacts__grid">
        <div class="contacts__main">
          <a class="bigphone" href="${site.phoneHref}" data-reveal="up">${esc(site.phone)}</a>
          <a class="bigmail" href="${site.emailHref}" data-reveal="up" style="--d:.08s">${esc(site.email)}</a>
          <div class="contacts__cta" data-reveal="up" style="--d:.16s">
            <a class="btn btn--lime" href="${site.phoneHref}">${esc(k.call)} ${arrow}</a>
            <a class="btn btn--line" href="#rezervacija">${esc(k.reserve)} ${arrow}</a>
          </div>
        </div>
        <a class="map" href="${mapUrl}" target="_blank" rel="noopener" data-reveal="scale" aria-label="${esc(site.address)}">
          <svg class="map__grid" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
            <g stroke="var(--off)" stroke-width=".6" opacity=".16">
              ${Array.from({ length: 17 }, (_, i) => `<line x1="${i * 25}" y1="0" x2="${i * 25}" y2="300"/>`).join('')}
              ${Array.from({ length: 13 }, (_, i) => `<line x1="0" y1="${i * 25}" x2="400" y2="${i * 25}"/>`).join('')}
            </g>
            <path d="M-10 210 L120 170 L230 190 L410 90" fill="none" stroke="var(--cyan)" stroke-width="1.4" opacity=".6"/>
            <path d="M150 -10 L170 120 L250 190 L300 310" fill="none" stroke="var(--off)" stroke-width="1" opacity=".3"/>
          </svg>
          <span class="map__pin" aria-hidden="true"><i></i></span>
          <span class="map__label"><b>${esc(site.address)}</b>${arrow}</span>
        </a>
        <dl class="facts" data-reveal="up">
          <div><dt>${esc(k.address)}</dt><dd>${esc(site.address)}</dd></div>
          <div><dt>${esc(k.phone)}</dt><dd><a href="${site.phoneHref}">${esc(site.phone)}</a></dd></div>
          <div><dt>${esc(k.email)}</dt><dd><a href="${site.emailHref}">${esc(site.email)}</a></dd></div>
          <div><dt>${esc(k.company)}</dt><dd>${esc(site.company)}</dd></div>
          <div><dt>${esc(k.companyCode)}</dt><dd>${esc(site.companyCode)}</dd></div>
          <div><dt>${esc(k.bank)}</dt><dd>${esc(site.bank)}</dd></div>
          <div><dt>${esc(k.account)}</dt><dd>${esc(site.account)}</dd></div>
        </dl>
      </div>
    </div>`;
  },
};
