import { ORDER } from './config';
import { clamp, pad, reduceMotion } from './util';

/**
 * Controlled motion: reveals, scroll-fill text, light parallax, marquee drift, stacked panels and a pinned
 * horizontal gallery. One rAF loop, driven by scroll/resize; everything degrades to static under reduced motion.
 */

interface State {
  reveals: HTMLElement[];
  fills: { el: HTMLElement; spans: HTMLElement[] }[];
  parallax: { el: HTMLElement; host: HTMLElement; speed: number }[];
  marquees: { track: HTMLElement; dir: number; x: number; half: number }[];
  panels: HTMLElement[];
  gallery: { run: HTMLElement; track: HTMLElement } | null;
  sections: { id: string; el: HTMLElement }[];
  marqueeVisible: boolean;
  heroVisible: boolean;
}

const st: State = {
  reveals: [],
  fills: [],
  parallax: [],
  marquees: [],
  panels: [],
  gallery: null,
  sections: [],
  marqueeVisible: false,
  heroVisible: true,
};

let io: IntersectionObserver | null = null;
let conceptIo: IntersectionObserver | null = null;
let marqueeIo: IntersectionObserver | null = null;
let heroIo: IntersectionObserver | null = null;
let raf = 0;
let lastY = 0;
let particlesStop: (() => void) | null = null;
const desktopGallery = window.matchMedia('(min-width: 861px)');

const header = (): HTMLElement | null => document.querySelector('.header');

/* ---------- frame ---------- */
const request = (): void => {
  if (!raf) raf = requestAnimationFrame(frame);
};

const frame = (): void => {
  raf = 0;
  const vh = window.innerHeight;
  const y = window.scrollY;
  const dy = y - lastY;
  lastY = y;
  const rm = reduceMotion();

  // header state + progress
  header()?.classList.toggle('is-scrolled', y > 40);
  const max = document.documentElement.scrollHeight - vh;
  document.documentElement.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : '0');

  // active section + counter
  let active = 0;
  st.sections.forEach((s, i) => {
    if (s.el.getBoundingClientRect().top <= vh * 0.4) active = i;
  });
  const activeId = st.sections[active]?.id ?? 'hero';
  document.documentElement.dataset.section = activeId;
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach((a) => {
    if (a.dataset.nav === activeId) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  const counter = document.querySelector<HTMLElement>('[data-counter]');
  if (counter) counter.textContent = `${pad(active + 1)} / ${pad(ORDER.length)}`;

  // scroll-fill text
  for (const f of st.fills) {
    const r = f.el.getBoundingClientRect();
    const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.35), 0, 1);
    const lit = rm ? f.spans.length : Math.round(p * f.spans.length * 1.12);
    f.spans.forEach((s, i) => s.classList.toggle('on', i < lit));
  }

  if (!rm) {
    // parallax
    for (const p of st.parallax) {
      const r = p.host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const off = (r.top + r.height / 2 - vh / 2) * p.speed;
      p.el.style.transform = `translate3d(0, ${(-off).toFixed(1)}px, 0)`;
    }

    // stacked event panels
    st.panels.forEach((panel, i) => {
      const next = st.panels[i + 1];
      const inner = panel.firstElementChild as HTMLElement | null;
      if (!inner) return;
      if (!next) return;
      const p = clamp(1 - next.getBoundingClientRect().top / vh, 0, 1);
      inner.style.transform = `scale(${(1 - p * 0.06).toFixed(4)})`;
      inner.style.setProperty('--cover', (p * 0.65).toFixed(3));
    });

    // marquee: slow drift + scroll push
    if (st.marqueeVisible) {
      for (const m of st.marquees) {
        m.x += m.dir * (0.55 + Math.abs(dy) * 0.55);
        if (m.half > 0) {
          if (m.x <= -m.half) m.x += m.half;
          if (m.x >= 0) m.x -= m.half;
        }
        m.track.style.transform = `translate3d(${m.x.toFixed(1)}px,0,0)`;
      }
    }
  }

  // pinned horizontal gallery (desktop)
  if (st.gallery && desktopGallery.matches) {
    const { run, track } = st.gallery;
    const travel = track.scrollWidth - window.innerWidth;
    const rr = run.getBoundingClientRect();
    const span = run.offsetHeight - vh;
    const p = span > 0 ? clamp(-rr.top / span, 0, 1) : 0;
    track.style.transform = `translate3d(${(-p * travel).toFixed(1)}px,0,0)`;
  }

  // keep running while something is continuously animating
  if (!rm && (st.marqueeVisible || Math.abs(dy) > 0.5)) request();
};

const measureGallery = (): void => {
  const g = st.gallery;
  if (!g) return;
  if (desktopGallery.matches) {
    const travel = Math.max(0, g.track.scrollWidth - window.innerWidth);
    g.run.style.height = `${Math.round(travel + window.innerHeight)}px`;
  } else {
    g.run.style.height = '';
    g.track.style.transform = '';
  }
};

const measureMarquees = (): void => {
  for (const m of st.marquees) {
    m.half = m.track.scrollWidth / 4;
    if (m.dir < 0 && m.x === 0) m.x = -m.half;
  }
};

/* ---------- hero particles ---------- */
const startParticles = (canvas: HTMLCanvasElement): (() => void) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;
  const rm = reduceMotion();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0;
  let h = 0;
  const colors = ['rgba(184,255,44,', 'rgba(18,240,255,', 'rgba(244,244,240,'];
  type P = { x: number; y: number; r: number; v: number; d: number; a: number; c: number };
  let ps: P[] = [];
  const seed = (): void => {
    const n = window.innerWidth < 700 ? 34 : 70;
    ps = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      v: Math.random() * 0.25 + 0.05,
      d: (Math.random() - 0.5) * 0.18,
      a: Math.random() * 0.5 + 0.12,
      c: Math.random() < 0.55 ? 2 : Math.random() < 0.6 ? 0 : 1,
    }));
  };
  const size = (): void => {
    const r = canvas.getBoundingClientRect();
    w = r.width;
    h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  };
  let id = 0;
  const draw = (): void => {
    ctx.clearRect(0, 0, w, h);
    for (const p of ps) {
      p.y -= p.v;
      p.x += p.d;
      if (p.y < -4) {
        p.y = h + 4;
        p.x = Math.random() * w;
      }
      if (p.x < -4) p.x = w + 4;
      if (p.x > w + 4) p.x = -4;
      ctx.fillStyle = `${colors[p.c]}${p.a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const loop = (): void => {
    if (st.heroVisible && !document.hidden) draw();
    id = requestAnimationFrame(loop);
  };
  size();
  draw();
  if (!rm) id = requestAnimationFrame(loop);
  const onResize = (): void => size();
  window.addEventListener('resize', onResize);
  return () => {
    cancelAnimationFrame(id);
    window.removeEventListener('resize', onResize);
  };
};

/* ---------- bind (call after every render) ---------- */
export const bindMotion = (root: HTMLElement, instant: boolean): void => {
  io?.disconnect();
  conceptIo?.disconnect();
  marqueeIo?.disconnect();
  heroIo?.disconnect();
  particlesStop?.();

  const rm = reduceMotion();
  st.reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  st.sections = ORDER.map((id) => ({ id, el: root.querySelector<HTMLElement>(`#${id}`) })).filter(
    (s): s is { id: (typeof ORDER)[number]; el: HTMLElement } => !!s.el,
  );

  // reveals
  if (instant || rm) {
    st.reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io?.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    st.reveals.forEach((el) => io?.observe(el));
  }

  // scroll-fill
  st.fills = Array.from(root.querySelectorAll<HTMLElement>('[data-fill]')).map((el) => ({
    el,
    spans: Array.from(el.querySelectorAll<HTMLElement>('.w')),
  }));

  // parallax
  st.parallax = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]')).map((el) => ({
    el,
    host: (el.parentElement ?? el) as HTMLElement,
    speed: Number(el.dataset.parallax) || 0,
  }));

  // marquees
  st.marquees = Array.from(root.querySelectorAll<HTMLElement>('[data-marquee]')).map((track) => ({
    track,
    dir: Number(track.dataset.marquee) || 1,
    x: 0,
    half: 0,
  }));
  const bands = root.querySelector('.training__bands');
  if (bands) {
    marqueeIo = new IntersectionObserver(
      (es) => {
        st.marqueeVisible = !!es[0]?.isIntersecting;
        if (st.marqueeVisible) request();
      },
      { rootMargin: '10% 0px' },
    );
    marqueeIo.observe(bands);
  }

  // stacked panels
  st.panels = Array.from(root.querySelectorAll<HTMLElement>('.format'));

  // gallery
  const run = root.querySelector<HTMLElement>('.gallery');
  const track = root.querySelector<HTMLElement>('[data-gallery-track]');
  st.gallery = run && track ? { run, track } : null;

  // concepts stage
  const concepts = Array.from(root.querySelectorAll<HTMLElement>('[data-concept]'));
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('.concepts__stage .scene'));
  const countEl = root.querySelector<HTMLElement>('[data-concept-n]');
  if (concepts.length) {
    conceptIo = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.concept);
          concepts.forEach((c, k) => c.classList.toggle('is-active', k === i));
          scenes.forEach((s, k) => s.classList.toggle('is-active', k === i));
          if (countEl) countEl.textContent = pad(i + 1);
        }
      },
      { rootMargin: '-42% 0px -42% 0px' },
    );
    concepts.forEach((c) => conceptIo?.observe(c));
  }

  // hero
  const heroEl = root.querySelector<HTMLElement>('#hero');
  if (heroEl) {
    heroIo = new IntersectionObserver((es) => {
      st.heroVisible = !!es[0]?.isIntersecting;
    });
    heroIo.observe(heroEl);
    const canvas = heroEl.querySelector<HTMLCanvasElement>('[data-particles]');
    if (canvas) particlesStop = startParticles(canvas);
    if (!rm) {
      heroEl.addEventListener('pointermove', (ev) => {
        const r = heroEl.getBoundingClientRect();
        heroEl.style.setProperty('--mx', ((ev.clientX - r.left) / r.width - 0.5).toFixed(3));
        heroEl.style.setProperty('--my', ((ev.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
    }
    // opening: lines rise once the page is ready
    if (!instant) requestAnimationFrame(() => setTimeout(() => heroEl.classList.add('is-ready'), 120));
    else heroEl.classList.add('is-ready');
  }

  measureGallery();
  measureMarquees();
  lastY = window.scrollY;
  request();
};

/* ---------- global listeners (once) ---------- */
export const initGlobalMotion = (): void => {
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', () => {
    measureGallery();
    measureMarquees();
    request();
  });
  desktopGallery.addEventListener('change', () => {
    measureGallery();
    request();
  });
  void document.fonts?.ready.then(() => {
    measureGallery();
    measureMarquees();
    request();
  });
  window.addEventListener('load', () => {
    measureGallery();
    measureMarquees();
    request();
  });
};

export const refreshLayout = (): void => {
  measureGallery();
  measureMarquees();
  request();
};
