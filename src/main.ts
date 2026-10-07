import { lt } from './content/lt';
import { en } from './content/en';
import type { Content, Lang } from './content/types';
import { ORDER } from './config';
import { footerHtml, headerHtml, menuHtml } from './chrome';
import { bindMotion, initGlobalMotion, refreshLayout } from './motion';
import { bindForm, captureForm, presetType } from './form';
import { initAnalytics } from './analytics';
import { mountConsent, refreshConsent } from './consent';
import { buildGameShell, gameHeadHtml, mountGame } from './sections/game';
import type { SectionDef } from './sections/def';
import { hero } from './sections/hero';
import { arena } from './sections/arena';
import { training } from './sections/training';
import { tournamentsSection } from './sections/tournaments';
import { events } from './sections/events';
import { gallery } from './sections/gallery';
import { prices } from './sections/prices';
import { reservation } from './sections/reservation';
import { contacts } from './sections/contacts';
import { finalSection } from './sections/final';

const dict: Record<Lang, Content> = { lt, en };

// Lithuanian by default. ?lang=en is honoured for sharing links; nothing is persisted.
const initial = (): Lang => (new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'lt');
let lang: Lang = initial();
const content = (): Content => dict[lang];

const app = document.getElementById('app') as HTMLElement;

/* ---------- static shell (built once, so the game iframe survives language switches) ---------- */
app.innerHTML = `
  <header class="header" id="top"></header>
  <div class="menu" id="menu" aria-hidden="true"></div>
  <div class="hud" aria-hidden="true"><span data-counter>01 / 11</span><i class="hud__bar"></i></div>
  <main id="main"></main>
  <footer class="footer"></footer>`;

const headerEl = app.querySelector<HTMLElement>('.header')!;
const menuEl = app.querySelector<HTMLElement>('.menu')!;
const mainEl = app.querySelector<HTMLElement>('main')!;
const footerEl = app.querySelector<HTMLElement>('.footer')!;

const defs: SectionDef[] = [
  hero,
  arena,
  { id: 'zaidimas', cls: 'game', html: () => '' },
  training,
  tournamentsSection,
  events,
  gallery,
  prices,
  reservation,
  contacts,
  finalSection,
];

const sectionEls = new Map<string, HTMLElement>();
for (const d of defs) {
  const el = document.createElement('section');
  el.id = d.id;
  el.className = `section ${d.cls}`;
  if (d.id !== 'hero' && d.id !== 'final') el.setAttribute('aria-labelledby', `${d.id}-title`);
  mainEl.appendChild(el);
  sectionEls.set(d.id, el);
}
if (ORDER.length !== defs.length) throw new Error('Section order mismatch');

const gameShell = buildGameShell(sectionEls.get('zaidimas')!);
const hasGame = mountGame(gameShell.stage);

/* ---------- render ---------- */
const render = (instant: boolean): void => {
  const c = content();
  document.documentElement.lang = lang;
  document.title = c.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', c.meta.description);
  document.querySelector('.skip')!.textContent = c.ui.skip;

  captureForm(document.getElementById('res-form') as HTMLFormElement | null);

  headerEl.innerHTML = headerHtml(c, lang);
  menuEl.innerHTML = menuHtml(c, lang);
  footerEl.innerHTML = footerHtml(c, lang);
  for (const d of defs) {
    if (d.id === 'zaidimas') continue;
    sectionEls.get(d.id)!.innerHTML = d.html(c);
  }
  gameShell.head.innerHTML = gameHeadHtml(c);
  if (hasGame) gameShell.head.querySelector('[data-fullscreen]')?.removeAttribute('hidden');

  // give each heading an id for aria-labelledby
  for (const d of defs) {
    const h = sectionEls.get(d.id)?.querySelector('h1, h2');
    if (h && !h.id) h.id = `${d.id}-title`;
  }

  bindForm(document.getElementById('res-form') as HTMLFormElement | null, content);
  bindMotion(app, instant);
  refreshLayout();
  refreshConsent(c);
};

/* ---------- menu ---------- */
let menuOpen = false;
const setMenu = (open: boolean): void => {
  menuOpen = open;
  menuEl.classList.toggle('is-open', open);
  menuEl.setAttribute('aria-hidden', String(!open));
  document.documentElement.classList.toggle('is-locked', open);
  headerEl.classList.toggle('is-menu', open);
  const btn = headerEl.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  btn?.setAttribute('aria-expanded', String(open));
  const label = headerEl.querySelector<HTMLElement>('.burger__label');
  if (label) label.textContent = open ? content().ui.close : content().ui.menu;
  if (open) menuEl.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
  else btn?.focus({ preventScroll: true });
};

/* ---------- scrolling ---------- */
const goTo = (hash: string, smooth = true): void => {
  const id = hash.replace('#', '');
  const el = id ? document.getElementById(id) : null;
  if (!el) return;
  el.scrollIntoView({
    behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto',
    block: 'start',
  });
  history.replaceState(null, '', `#${id}`);
};

/* ---------- events (delegated, bound once) ---------- */
document.addEventListener('click', (ev) => {
  const t = ev.target as HTMLElement;

  const langBtn = t.closest<HTMLElement>('[data-lang]');
  if (langBtn) {
    const next = langBtn.dataset.lang as Lang;
    if (next !== lang) {
      lang = next;
      const wasOpen = menuOpen;
      render(true);
      if (wasOpen) setMenu(true);
    }
    return;
  }

  if (t.closest('[data-menu-toggle]')) {
    setMenu(!menuOpen);
    return;
  }

  if (t.closest('[data-fullscreen]')) {
    const stage = document.querySelector<HTMLElement>('.game__stage');
    void stage?.requestFullscreen?.();
    return;
  }

  const link = t.closest<HTMLAnchorElement>('a[href^="#"]');
  if (link) {
    const hash = link.getAttribute('href') ?? '';
    if (hash.length > 1) {
      ev.preventDefault();
      const type = link.dataset.reserveType;
      if (type) presetType(type);
      if (menuOpen) {
        setMenu(false);
        setTimeout(() => goTo(hash), 120);
      } else goTo(hash);
    }
  }
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && menuOpen) setMenu(false);
});

// Safety net: if a present-but-broken logo/photo/video fails to load, fall back gracefully (errors don't bubble → capture).
document.addEventListener(
  'error',
  (ev) => {
    const el = ev.target as HTMLElement;
    if (el instanceof HTMLImageElement && el.classList.contains('logo__img')) {
      el.closest('.logo__slot')?.classList.add('is-text');
      el.remove();
    } else if (el instanceof HTMLImageElement && el.closest('.slide__frame, .hero__bg')) {
      el.remove();
    } else if (el instanceof HTMLSourceElement) {
      el.closest('video')?.remove();
    }
  },
  true,
);

initGlobalMotion();
render(false);
initAnalytics();
mountConsent(content);
if (location.hash.length > 1) requestAnimationFrame(() => goTo(location.hash, false));
