import { reduceMotion } from './util';

/**
 * Apple-style dropdown for the desktop navigation (≥1240px) and +/× sub-lists in the fullscreen mobile menu.
 * Markup comes from chrome.ts (re-rendered on every language switch); the listeners here are bound once and
 * always look the current DOM up, so nothing goes stale.
 */

const EASE = 'cubic-bezier(0.19, 0.8, 0.14, 1)';
const SCROLL_CLOSE = 24; // px of real page scroll that closes an open panel (ignores tiny trackpad/touch noise)
const desktop = window.matchMedia('(min-width: 1240px)');

let active: string | null = null;
let busy: Animation[] = [];
let scrollStart = 0;
let dim: HTMLElement | null = null;

const header = (): HTMLElement | null => document.querySelector<HTMLElement>('.header');
const panel = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-navpanel]');
const view = (id: string): HTMLElement | null => document.getElementById(`np-${id}`);
const trigger = (id: string): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>(`.nav__trigger[data-panel="${id}"]`);

const focusables = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(
    (el) => !el.closest('[hidden]') && el.getClientRects().length > 0,
  );

const stopAll = (): void => {
  busy.forEach((a) => a.cancel());
  busy = [];
};
const anim = (el: Element, kf: Keyframe[], ms: number, opts: KeyframeAnimationOptions = {}): Animation => {
  const a = el.animate(kf, { duration: ms, easing: EASE, ...opts });
  busy.push(a);
  return a;
};
const done = (a: Animation): Promise<void> => a.finished.then(() => undefined, () => undefined);

const ensureDim = (): HTMLElement => {
  if (!dim) {
    dim = document.createElement('div');
    dim.className = 'navdim';
    dim.hidden = true;
    dim.addEventListener('click', () => void close());
    document.body.appendChild(dim);
  }
  return dim;
};

const setTriggers = (): void => {
  document.querySelectorAll<HTMLButtonElement>('.nav__trigger').forEach((b) => {
    b.setAttribute('aria-expanded', String(b.dataset.panel === active));
  });
};

/* ---------- desktop panel ---------- */
const open = async (id: string): Promise<void> => {
  const p = panel();
  const v = view(id);
  if (!p || !v || !desktop.matches) return;
  const rm = reduceMotion();
  const prev = active;
  stopAll();

  // switching: morph directly from the current height to the new view's height
  if (prev && prev !== id) {
    const old = view(prev);
    const from = p.offsetHeight;
    active = id;
    setTriggers();
    if (old) {
      old.style.position = 'absolute';
      old.style.inset = '0 0 auto 0';
    }
    v.hidden = false;
    const to = v.offsetHeight;
    if (rm) {
      if (old) {
        old.hidden = true;
        old.style.position = old.style.inset = '';
      }
      await done(anim(v, [{ opacity: 0 }, { opacity: 1 }], 150, { easing: 'linear' }));
      return;
    }
    const h = anim(p, [{ height: `${from}px` }, { height: `${to}px` }], 320);
    if (old) {
      const fo = anim(old, [{ opacity: 1 }, { opacity: 0 }], 120, { easing: 'linear', fill: 'forwards' });
      void done(fo).then(() => {
        if (active !== prev) {
          old.hidden = true;
          old.style.position = old.style.inset = '';
          fo.cancel();
        }
      });
    }
    anim(v, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], 260, { delay: 90, fill: 'backwards' });
    await done(h);
    return;
  }

  // opening from closed
  active = id;
  setTriggers();
  scrollStart = window.scrollY;
  document.querySelectorAll<HTMLElement>('.navpanel__view').forEach((x) => {
    x.hidden = x !== v;
    x.style.position = x.style.inset = '';
  });
  p.classList.add('is-open');
  header()?.classList.add('is-panel');
  const d = ensureDim();
  d.hidden = false;
  if (rm) {
    anim(p, [{ opacity: 0 }, { opacity: 1 }], 150, { easing: 'linear' });
    anim(d, [{ opacity: 0 }, { opacity: 1 }], 150, { easing: 'linear' });
    return;
  }
  const to = p.offsetHeight;
  anim(p, [{ height: '0px' }, { height: `${to}px` }], 420);
  anim(d, [{ opacity: 0 }, { opacity: 1 }], 320, { easing: 'linear' });
  anim(v, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], 340, { delay: 80, fill: 'backwards' });
};

export const close = async (opts: { focus?: boolean; instant?: boolean } = {}): Promise<void> => {
  const id = active;
  if (!id) return;
  active = null;
  setTriggers();
  const p = panel();
  const v = view(id);
  const finish = (): void => {
    stopAll();
    p?.classList.remove('is-open');
    document.querySelectorAll<HTMLElement>('.navpanel__view').forEach((x) => {
      x.hidden = true;
      x.style.position = x.style.inset = '';
    });
    header()?.classList.remove('is-panel');
    if (dim) dim.hidden = true;
  };
  if (opts.focus) trigger(id)?.focus();
  stopAll();
  if (opts.instant || !p || !v) return finish();
  const rm = reduceMotion();
  const from = p.offsetHeight;
  const anims = rm
    ? [anim(p, [{ opacity: 1 }, { opacity: 0 }], 140, { easing: 'linear', fill: 'forwards' })]
    : [
        anim(v, [{ opacity: 1 }, { opacity: 0 }], 120, { easing: 'linear', fill: 'forwards' }),
        anim(p, [{ height: `${from}px` }, { height: '0px' }], 300, { delay: 60, fill: 'forwards' }),
      ];
  if (dim) anims.push(anim(dim, [{ opacity: 1 }, { opacity: 0 }], rm ? 140 : 300, { easing: 'linear', fill: 'forwards' }));
  await Promise.all(anims.map(done));
  if (!active) finish(); // a new panel may have been opened meanwhile
};

/** Called before every header re-render (language switch): drop any open state without animation. */
export const resetNav = (): void => {
  void close({ instant: true });
};

/* ---------- mobile sub-lists (+ / ×) ---------- */
const setSub = (btn: HTMLButtonElement, expand: boolean, animate: boolean): void => {
  const list = document.getElementById(btn.getAttribute('aria-controls') ?? '');
  if (!list) return;
  btn.setAttribute('aria-expanded', String(expand));
  const rm = reduceMotion();
  if (expand) {
    list.hidden = false;
    if (!animate) return;
    if (rm) list.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
    else {
      const h = list.offsetHeight;
      list.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 360, easing: EASE });
      Array.from(list.children).forEach((li, i) =>
        li.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], {
          duration: 320,
          delay: 60 + i * 45,
          easing: EASE,
          fill: 'backwards',
        }),
      );
    }
  } else {
    if (!animate) {
      list.hidden = true;
      return;
    }
    const h = list.offsetHeight;
    const a = rm
      ? list.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140 })
      : list.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 280, easing: EASE });
    void a.finished.then(
      () => {
        if (btn.getAttribute('aria-expanded') === 'false') list.hidden = true;
      },
      () => undefined,
    );
  }
};

/** Collapse every mobile sub-list (used when the fullscreen menu closes). */
export const collapseMobile = (): void => {
  document.querySelectorAll<HTMLButtonElement>('[data-menu-sub]').forEach((b) => setSub(b, false, false));
};

/* ---------- wiring (once) ---------- */
export const initNav = (): void => {
  document.addEventListener('click', (ev) => {
    const t = ev.target as Element | null;
    if (!t) return;

    const trig = t.closest<HTMLButtonElement>('.nav__trigger');
    if (trig) {
      const id = trig.dataset.panel ?? '';
      if (active === id) void close();
      else void open(id);
      return;
    }

    const sub = t.closest<HTMLButtonElement>('[data-menu-sub]');
    if (sub) {
      const expand = sub.getAttribute('aria-expanded') !== 'true';
      document.querySelectorAll<HTMLButtonElement>('[data-menu-sub]').forEach((b) => {
        if (b !== sub && b.getAttribute('aria-expanded') === 'true') setSub(b, false, true);
      });
      setSub(sub, expand, true);
      return;
    }

    if (!active) return;
    // following a link inside the panel: close it (main.ts then scrolls as for any anchor)
    if (t.closest('[data-navpanel] a')) {
      void close();
      return;
    }
    // anywhere outside the panel closes it
    if (!t.closest('[data-navpanel]')) void close();
  });

  // Escape / Tab while a panel is open (capture: wins over other Escape handlers on the page)
  window.addEventListener(
    'keydown',
    (ev) => {
      if (!active) return;
      if (ev.key === 'Escape') {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        void close({ focus: true });
        return;
      }
      if (ev.key !== 'Tab') return;
      const v = view(active);
      const trig = trigger(active);
      if (!v || !trig) return;
      const inner = focusables(v);
      const cur = document.activeElement as HTMLElement | null;
      if (!inner.length) return;
      if (!ev.shiftKey && cur === trig) {
        // into the open panel first
        ev.preventDefault();
        inner[0]!.focus();
      } else if (ev.shiftKey && cur === inner[0]) {
        ev.preventDefault();
        trig.focus();
      } else if (!ev.shiftKey && cur === inner[inner.length - 1]) {
        // past the end of the panel: close it and continue with the item after the trigger
        ev.preventDefault();
        const h = header();
        const order = h ? focusables(h.querySelector<HTMLElement>('.header__bar') ?? h) : [];
        const next = order[order.indexOf(trig) + 1];
        void close();
        (next ?? trig).focus();
      }
    },
    true,
  );

  // a meaningful page scroll closes the panel
  window.addEventListener(
    'scroll',
    () => {
      if (active && Math.abs(window.scrollY - scrollStart) > SCROLL_CLOSE) void close();
    },
    { passive: true },
  );

  // leaving the desktop layout (resize / rotate) drops the panel
  desktop.addEventListener('change', () => {
    if (!desktop.matches) void close({ instant: true });
  });
};
