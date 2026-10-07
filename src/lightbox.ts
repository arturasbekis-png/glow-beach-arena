import type { Content } from './content/types';
import { pad, reduceMotion } from './util';

/**
 * Gallery lightbox: FLIP-style expansion from the real thumbnail, dark backdrop, contained image in its own ratio.
 * Items are read from the DOM (`[data-shot]` buttons, in display order), so the lightbox needs no knowledge of the gallery.
 * Everything is animated with WAAPI; under reduced motion only opacity changes (no movement).
 */

interface Item {
  btn: HTMLButtonElement;
  img: HTMLImageElement;
  src: string;
  ratio: number;
  alt: string;
}

const EASE = 'cubic-bezier(0.19, 0.8, 0.14, 1)';
const X_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>`;
const ARROW_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h15M13 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>`;

let labels = { dialog: '', prev: '', next: '', close: '' };

let root: HTMLElement | null = null;
let bg: HTMLElement;
let stage: HTMLElement;
let img: HTMLImageElement;
let count: HTMLElement;
let btnPrev: HTMLButtonElement;
let btnNext: HTMLButtonElement;
let btnClose: HTMLButtonElement;

let items: Item[] = [];
let idx = 0;
let phase: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
let seq = 0;
let running: Animation[] = [];
let lastMoved = 0;

const ui = (): HTMLElement[] => [count, btnPrev, btnNext, btnClose];
const inertTargets = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('#app, #consent, .skip'));

const play = (el: Element, keyframes: Keyframe[], ms: number, opts: KeyframeAnimationOptions = {}): Promise<void> => {
  const a = el.animate(keyframes, { duration: ms, easing: EASE, ...opts });
  running.push(a);
  return a.finished.then(
    () => undefined,
    () => undefined,
  );
};
const cancelAll = (): void => {
  running.forEach((a) => a.cancel());
  running = [];
};

const applyLabels = (): void => {
  if (!root) return;
  root.setAttribute('aria-label', labels.dialog);
  btnPrev.setAttribute('aria-label', labels.prev);
  btnNext.setAttribute('aria-label', labels.next);
  btnClose.setAttribute('aria-label', labels.close);
};

const ensure = (): void => {
  if (root) return;
  root = document.createElement('div');
  root.className = 'lb';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.innerHTML = `
    <div class="lb__bg"></div>
    <div class="lb__stage"><img class="lb__img" alt="" draggable="false" decoding="async" /></div>
    <p class="lb__count" aria-live="polite"></p>
    <button class="lb__btn lb__close" type="button">${X_ICON}</button>
    <button class="lb__btn lb__prev" type="button">${ARROW_ICON}</button>
    <button class="lb__btn lb__next" type="button">${ARROW_ICON}</button>`;
  document.body.appendChild(root);
  bg = root.querySelector<HTMLElement>('.lb__bg')!;
  stage = root.querySelector<HTMLElement>('.lb__stage')!;
  img = root.querySelector<HTMLImageElement>('.lb__img')!;
  count = root.querySelector<HTMLElement>('.lb__count')!;
  btnClose = root.querySelector<HTMLButtonElement>('.lb__close')!;
  btnPrev = root.querySelector<HTMLButtonElement>('.lb__prev')!;
  btnNext = root.querySelector<HTMLButtonElement>('.lb__next')!;
  applyLabels();

  btnClose.addEventListener('click', () => void close());
  btnPrev.addEventListener('click', () => void go(-1));
  btnNext.addEventListener('click', () => void go(1));
  // a tap on the empty backdrop closes (but not the tail of a swipe)
  stage.addEventListener('click', (ev) => {
    if (ev.target === stage && Date.now() - lastMoved > 350) void close();
  });
  bindSwipe();
};

/* ---------- helpers ---------- */
const collect = (): Item[] =>
  Array.from(document.querySelectorAll<HTMLButtonElement>('[data-shot]'))
    .map((btn) => {
      const im = btn.querySelector<HTMLImageElement>('img');
      if (!im) return null;
      const w = Number(btn.dataset.w) || 4;
      const h = Number(btn.dataset.h) || 3;
      return { btn, img: im, src: btn.dataset.full ?? im.currentSrc, ratio: w / h, alt: im.alt };
    })
    .filter((x): x is Item => !!x);

/** The thumbnail's on-screen box, or null if (mostly) not visible — then the lightbox crossfades instead of flying. */
const visibleRect = (it: Item): DOMRect | null => {
  const r = it.img.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  let l = Math.max(r.left, 0);
  let t = Math.max(r.top, 0);
  let rr = Math.min(r.right, window.innerWidth);
  let b = Math.min(r.bottom, window.innerHeight);
  const strip = it.btn.closest<HTMLElement>('.gallery__events');
  if (strip && strip.scrollWidth > strip.clientWidth) {
    const c = strip.getBoundingClientRect();
    l = Math.max(l, c.left);
    rr = Math.min(rr, c.right);
  }
  const vis = (Math.max(0, rr - l) * Math.max(0, b - t)) / (r.width * r.height);
  return vis >= 0.5 ? r : null;
};

const invert = (target: DOMRect, base: DOMRect): string =>
  `translate(${(target.left - base.left).toFixed(2)}px, ${(target.top - base.top).toFixed(2)}px) scale(${(target.width / base.width).toFixed(4)}, ${(target.height / base.height).toFixed(4)})`;

const decoded = async (el: HTMLImageElement): Promise<void> => {
  await Promise.race([el.decode().catch(() => undefined), new Promise((r) => setTimeout(r, 700))]);
};

const setPhoto = (it: Item): void => {
  img.style.setProperty('--ar-n', it.ratio.toFixed(4));
  img.alt = it.alt;
  img.src = it.src;
};

const updateCount = (): void => {
  count.innerHTML = `<span><b>${pad(idx + 1)}</b> / ${pad(items.length)}</span>`;
};

const preload = (): void => {
  for (const d of [1, -1]) {
    const it = items[(idx + d + items.length) % items.length];
    if (it) new Image().src = it.src;
  }
};

const setInert = (on: boolean): void => {
  for (const el of inertTargets()) {
    if (on) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  }
};

/* ---------- open / close ---------- */
const open = async (btn: HTMLButtonElement): Promise<void> => {
  if (phase !== 'closed') return;
  items = collect();
  const i = items.findIndex((x) => x.btn === btn);
  if (i < 0) return;
  ensure();
  applyLabels();
  idx = i;
  phase = 'opening';
  const it = items[idx]!;
  const from = visibleRect(it);
  const rm = reduceMotion();

  const sbw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--sbw', `${Math.max(0, sbw)}px`);
  document.documentElement.classList.add('lb-open');
  setInert(true);
  root!.hidden = false;
  setPhoto(it);
  updateCount();
  img.style.visibility = 'hidden';
  bg.style.opacity = '0';
  ui().forEach((e) => (e.style.opacity = '0'));
  btnClose.focus({ preventScroll: true });

  await decoded(img);
  if (phase !== 'opening') return;
  it.img.style.visibility = 'hidden';
  img.style.visibility = '';
  bg.style.opacity = '';
  ui().forEach((e) => (e.style.opacity = ''));

  if (rm || !from) {
    await play(root!, [{ opacity: 0 }, { opacity: 1 }], rm ? 180 : 260, { easing: 'linear', fill: 'backwards' });
  } else {
    const fin = img.getBoundingClientRect();
    await Promise.all([
      play(bg, [{ opacity: 0 }, { opacity: 1 }], 380, { easing: 'linear', fill: 'backwards' }),
      play(img, [{ transform: invert(from, fin) }, { transform: 'none' }], 580, { fill: 'backwards' }),
      ...ui().map((e) => play(e, [{ opacity: 0 }, { opacity: 1 }], 320, { delay: 240, easing: 'linear', fill: 'backwards' })),
    ]);
  }
  if (phase === 'opening') phase = 'open';
  preload();
};

const finalize = (restoreFocus: HTMLElement | null): void => {
  cancelAll();
  root!.hidden = true;
  root!.style.opacity = '';
  img.style.transform = '';
  img.style.opacity = '';
  bg.style.opacity = '';
  ui().forEach((e) => (e.style.opacity = ''));
  items.forEach((x) => (x.img.style.visibility = ''));
  document.documentElement.classList.remove('lb-open');
  document.documentElement.style.removeProperty('--sbw');
  setInert(false);
  phase = 'closed';
  seq++;
  restoreFocus?.focus({ preventScroll: true });
};

const close = async (): Promise<void> => {
  if (phase === 'closed' || phase === 'closing') return;
  if (phase === 'opening') {
    running.forEach((a) => {
      try {
        a.finish();
      } catch {
        /* already done */
      }
    });
  }
  phase = 'closing';
  seq++;
  const it = items[idx]!;
  const rm = reduceMotion();
  const to = visibleRect(it);
  const cur = img.getBoundingClientRect(); // includes a swipe-drag offset, if any
  img.style.transform = '';
  img.style.opacity = '';
  const fin = img.getBoundingClientRect();
  cancelAll();

  if (rm || !to) {
    await play(root!, [{ opacity: 1 }, { opacity: 0 }], rm ? 160 : 240, { easing: 'linear', fill: 'forwards' });
  } else {
    await Promise.all([
      play(img, [{ transform: invert(cur, fin) }, { transform: invert(to, fin) }], 500, { fill: 'forwards' }),
      play(bg, [{ opacity: Number(bg.style.opacity || 1) }, { opacity: 0 }], 420, { delay: 80, easing: 'linear', fill: 'forwards' }),
      ...ui().map((e) => play(e, [{ opacity: 1 }, { opacity: 0 }], 160, { easing: 'linear', fill: 'forwards' })),
    ]);
  }
  finalize(it.btn);
};

/* ---------- navigation ---------- */
const go = async (dir: 1 | -1): Promise<void> => {
  if (phase !== 'open' || items.length < 2) return;
  const my = ++seq;
  running.forEach((a) => a.cancel());
  running = [];
  items[idx]!.img.style.visibility = '';
  idx = (idx + dir + items.length) % items.length;
  const it = items[idx]!;
  it.img.style.visibility = 'hidden';
  updateCount();
  const rm = reduceMotion();
  const shift = rm ? 0 : 28;

  const outAnim = img.animate([{ opacity: 0, transform: `translateX(${-dir * shift}px)` }], { duration: rm ? 120 : 150, easing: 'ease-in', fill: 'forwards' });
  running.push(outAnim);
  await outAnim.finished.then(() => undefined, () => undefined);
  if (my !== seq) return;
  img.style.transform = '';
  img.style.opacity = '';
  setPhoto(it);
  await decoded(img);
  if (my !== seq) return;
  outAnim.cancel();
  await play(img, [{ opacity: 0, transform: `translateX(${dir * shift}px)` }, { opacity: 1, transform: 'none' }], rm ? 160 : 280, { fill: 'backwards' });
  if (my === seq) preload();
};

/* ---------- swipe: horizontal = prev/next, downward = close ---------- */
const bindSwipe = (): void => {
  let id = -1;
  let x0 = 0;
  let y0 = 0;
  let t0 = 0;
  let axis: 'x' | 'y' | null = null;
  let dx = 0;
  let dy = 0;

  const reset = (animate: boolean): void => {
    const has = img.style.transform || img.style.opacity;
    if (animate && has && !reduceMotion()) {
      const a = img.animate([{ transform: img.style.transform || 'none', opacity: img.style.opacity || '1' }, { transform: 'none', opacity: '1' }], { duration: 240, easing: EASE });
      running.push(a);
    }
    img.style.transform = '';
    img.style.opacity = '';
    bg.style.opacity = '';
    ui().forEach((e) => (e.style.opacity = ''));
  };

  stage.addEventListener('pointerdown', (ev) => {
    if (phase !== 'open' || id !== -1 || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
    id = ev.pointerId;
    x0 = ev.clientX;
    y0 = ev.clientY;
    t0 = performance.now();
    axis = null;
    dx = 0;
    dy = 0;
  });
  stage.addEventListener('pointermove', (ev) => {
    if (ev.pointerId !== id || phase !== 'open') return;
    dx = ev.clientX - x0;
    dy = ev.clientY - y0;
    if (!axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
      axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      try {
        stage.setPointerCapture(id);
      } catch {
        /* not capturable */
      }
    }
    if (axis === 'x') {
      img.style.transform = `translateX(${dx.toFixed(1)}px)`;
      img.style.opacity = String(1 - Math.min(0.55, Math.abs(dx) / window.innerWidth));
    } else if (axis === 'y' && dy > 0) {
      img.style.transform = `translateY(${dy.toFixed(1)}px)`;
      bg.style.opacity = String(1 - Math.min(0.8, dy / 360));
      ui().forEach((e) => (e.style.opacity = String(Math.max(0, 1 - dy / 120))));
    }
  });
  const end = (ev: PointerEvent): void => {
    if (ev.pointerId !== id) return;
    id = -1;
    const wasAxis = axis;
    axis = null;
    if (!wasAxis) return;
    lastMoved = Date.now();
    const dt = Math.max(1, performance.now() - t0);
    if (phase !== 'open') return;
    if (wasAxis === 'x' && (Math.abs(dx) > 56 || (Math.abs(dx) > 24 && Math.abs(dx) / dt > 0.5))) {
      img.style.transform = '';
      img.style.opacity = '';
      void go(dx < 0 ? 1 : -1);
    } else if (wasAxis === 'y' && (dy > 100 || (dy > 40 && dy / dt > 0.6))) {
      void close();
    } else {
      reset(true);
    }
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', (ev) => {
    if (ev.pointerId !== id) return;
    id = -1;
    axis = null;
    reset(false);
  });
};

/* ---------- public ---------- */
export const refreshLightbox = (c: Content): void => {
  labels = { dialog: c.nav[5]?.label ?? '', prev: c.gallery.prev, next: c.gallery.next, close: c.ui.close };
  applyLabels();
};

export const initLightbox = (content: () => Content): void => {
  refreshLightbox(content());

  document.addEventListener('click', (ev) => {
    const btn = (ev.target as Element | null)?.closest<HTMLButtonElement>('[data-shot]');
    if (btn) void open(btn);
  });

  // capture phase: while the lightbox is open its keys win over every other Escape/arrow handler on the page
  window.addEventListener(
    'keydown',
    (ev) => {
      if (phase === 'closed' || !root) return;
      if (ev.key === 'Escape') {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        void close();
      } else if (ev.key === 'ArrowRight') {
        ev.preventDefault();
        void go(1);
      } else if (ev.key === 'ArrowLeft') {
        ev.preventDefault();
        void go(-1);
      } else if (ev.key === 'Tab') {
        const f = [btnClose, btnPrev, btnNext];
        const first = f[0]!;
        const last = f[f.length - 1]!;
        const active = document.activeElement;
        if (!f.includes(active as HTMLButtonElement)) {
          ev.preventDefault();
          (ev.shiftKey ? last : first).focus();
        } else if (ev.shiftKey && active === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && active === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    },
    true,
  );
};
