import { has, site } from './config';
import { arrow, esc } from './util';
import { consentAvailable } from './analytics';
import type { Content, Lang } from './content/types';

// The official logo is dropped in at public/brand/logo.svg (preferred) or logo.png. It is never redrawn here;
// until a file exists, the name is shown as plain text.
const logoFile = has('brand/logo.svg') ? 'brand/logo.svg' : has('brand/logo.png') ? 'brand/logo.png' : null;
const logo = (c: Content): string => `
  <a class="logo" href="#hero" aria-label="${esc(c.ui.homeLabel)}" data-home>
    <span class="logo__slot${logoFile ? '' : ' is-text'}">
      ${logoFile ? `<img class="logo__img" src="./${logoFile}" alt="${esc(site.name)}" />` : ''}
      <span class="logo__text" aria-hidden="true">${esc(site.name)}</span>
    </span>
  </a>`;

const langSwitch = (lang: Lang, c: Content): string => `
  <div class="lang" role="group" aria-label="${esc(c.ui.language)}">
    <button type="button" data-lang="lt" aria-pressed="${lang === 'lt'}">LT</button>
    <span aria-hidden="true">/</span>
    <button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button>
  </div>`;

export const headerHtml = (c: Content, lang: Lang): string => `
  <div class="header__bar">
    ${logo(c)}
    <nav class="nav" aria-label="Main">
      ${c.nav.map((n) => `<a href="#${n.id}" data-nav="${n.id}">${esc(n.label)}</a>`).join('')}
    </nav>
    <div class="header__right">
      ${langSwitch(lang, c)}
      <a class="btn btn--lime btn--sm header__cta" href="#rezervacija">${esc(c.ui.reserve)}</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
        <span class="burger__label">${esc(c.ui.menu)}</span>
        <span class="burger__icon" aria-hidden="true"><i></i><i></i></span>
      </button>
    </div>
  </div>`;

export const menuHtml = (c: Content, lang: Lang): string => `
  <div class="menu__inner">
    <nav class="menu__nav" aria-label="Main">
      ${c.nav
        .map(
          (n, i) =>
            `<a href="#${n.id}" data-nav="${n.id}" style="--i:${i}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(n.label)}</a>`,
        )
        .join('')}
    </nav>
    <div class="menu__foot">
      ${langSwitch(lang, c)}
      <a class="btn btn--lime" href="#rezervacija">${esc(c.ui.reserve)} ${arrow}</a>
    </div>
  </div>`;

export const footerHtml = (c: Content, lang: Lang): string => `
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <p class="footer__name">${esc(site.name)}</p>
      <p class="footer__small">${esc(site.company)}</p>
    </div>
    <nav class="footer__nav" aria-label="Footer">
      ${c.nav.map((n) => `<a href="#${n.id}">${esc(n.label)}</a>`).join('')}
    </nav>
    <div class="footer__contact">
      ${langSwitch(lang, c)}
      <a href="${site.phoneHref}">${esc(site.phone)}</a>
      <a href="${site.emailHref}">${esc(site.email)}</a>
    </div>
  </div>
  <div class="wrap footer__legal">
    <span>${esc(c.footer.rights)}</span>
    ${consentAvailable() ? `<button class="footer__settings" type="button" data-consent-open>${esc(c.consent.settings)}</button>` : ''}
  </div>`;
