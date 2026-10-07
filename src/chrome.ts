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

/* ---------- navigation panels (desktop dropdown + mobile sub-lists) ----------
 * Only Renginiai, Rezervacija and Kontaktai have panels. All panel content is existing copy: the event formats,
 * the reservation types (with their existing form presets) and the contact facts. Nothing is invented here. */
const PANELS = ['renginiai', 'rezervacija', 'kontaktai'] as const;
type PanelId = (typeof PANELS)[number];
const isPanel = (id: string): id is PanelId => (PANELS as readonly string[]).includes(id);
const label = (c: Content, id: string): string => c.nav.find((n) => n.id === id)?.label ?? '';

interface Entry {
  href: string;
  title: string;
  text?: string;
  type?: string; // existing reservation preset (data-reserve-type)
  cta?: { label: string; type: string };
  plain?: boolean; // shown as text, not a link (the address: the map lives in the Kontaktai section)
}
const entries = (c: Content, id: PanelId): Entry[] => {
  if (id === 'renginiai')
    return c.events.formats.map((f) => ({
      href: `#renginiai-${f.key}`,
      title: f.title,
      text: f.text,
      cta: { label: f.key === 'tournaments' ? c.reservation.cta : c.prices.cta, type: f.key },
    }));
  if (id === 'rezervacija')
    return (['kids', 'corporate', 'tournaments', 'training'] as const).map((k) => ({
      href: '#rezervacija',
      title: c.reservation.types[k],
      type: k,
    }));
  return [
    { href: site.phoneHref, title: site.phone },
    { href: site.emailHref, title: site.email },
    { href: '', title: site.address, plain: true },
  ];
};
const entryAttrs = (e: Entry): string => `href="${e.href}"${e.type ? ` data-reserve-type="${e.type}"` : ''}`;

const panelIntro = (c: Content, id: PanelId): string => {
  if (id === 'renginiai') {
    const parts = c.events.title.split('. ').map((s, i, a) => (i < a.length - 1 ? s + '.' : s));
    return `<p class="navpanel__lede">${parts.map(esc).join('<br />')}</p>`;
  }
  if (id === 'rezervacija') return `<p class="navpanel__note">${esc(c.reservation.notice)}</p>`;
  return '';
};

const panelView = (c: Content, id: PanelId): string => `
  <div class="navpanel__view navpanel__view--${id}" id="np-${id}" role="group" aria-label="${esc(label(c, id))}" hidden>
    <div class="navpanel__intro">
      ${panelIntro(c, id)}
      <a class="navpanel__over" href="#${id}">${esc(label(c, id))} ${arrow}</a>
    </div>
    <ul class="navpanel__list">
      ${entries(c, id)
        .map(
          (e, i) => `
      <li class="navpanel__entry">
        ${
          e.plain
            ? `<p class="navpanel__item is-plain"><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(e.title)}</b></p>`
            : `<a class="navpanel__item" ${entryAttrs(e)}><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(e.title)}</b>${e.text ? `<em>${esc(e.text)}</em>` : ''}</a>`
        }
        ${e.cta ? `<a class="navpanel__cta" href="#rezervacija" data-reserve-type="${e.cta.type}">${esc(e.cta.label)} ${arrow}</a>` : ''}
      </li>`,
        )
        .join('')}
    </ul>
  </div>`;

export const headerHtml = (c: Content, lang: Lang): string => `
  <div class="header__bar">
    ${logo(c)}
    <nav class="nav" aria-label="Main">
      ${c.nav
        .map((n) =>
          isPanel(n.id)
            ? `<button class="nav__trigger" type="button" data-nav="${n.id}" data-panel="${n.id}" aria-expanded="false" aria-controls="np-${n.id}">${esc(n.label)}<i class="nav__chev" aria-hidden="true"></i></button>`
            : `<a href="#${n.id}" data-nav="${n.id}">${esc(n.label)}</a>`,
        )
        .join('')}
    </nav>
    <div class="header__right">
      ${langSwitch(lang, c)}
      <a class="btn btn--lime btn--sm header__cta" href="#rezervacija">${esc(c.ui.reserve)}</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
        <span class="burger__label">${esc(c.ui.menu)}</span>
        <span class="burger__icon" aria-hidden="true"><i></i><i></i></span>
      </button>
    </div>
  </div>
  <div class="navpanel" data-navpanel>
    ${PANELS.map((id) => panelView(c, id)).join('')}
  </div>`;

const menuSub = (c: Content, id: PanelId): string => `
  <ul class="menu__sub" id="ms-${id}" hidden>
    ${entries(c, id)
      .map((e) =>
        e.plain ? `<li><p>${esc(e.title)}</p></li>` : `<li><a ${entryAttrs(e)}>${esc(e.title)}</a></li>`,
      )
      .join('')}
  </ul>`;

export const menuHtml = (c: Content, lang: Lang): string => `
  <div class="menu__inner">
    <nav class="menu__nav" aria-label="Main">
      ${c.nav
        .map((n, i) => {
          const link = `<a href="#${n.id}" data-nav="${n.id}" style="--i:${i}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(n.label)}</a>`;
          if (!isPanel(n.id)) return link;
          return `
      <div class="menu__row" style="--i:${i}">
        ${link}
        <button class="menu__toggle" type="button" data-menu-sub="${n.id}" aria-expanded="false" aria-controls="ms-${n.id}" aria-label="${esc(c.ui.more)}: ${esc(n.label)}"><i aria-hidden="true"></i></button>
      </div>
      ${menuSub(c, n.id)}`;
        })
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
