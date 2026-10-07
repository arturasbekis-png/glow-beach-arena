/**
 * Hero arena light: a handful of slow, soft light beams drifting through haze, drawn on one low-resolution canvas
 * (the browser's upscaling gives the beams their soft, atmospheric edge). Pure sine motion — no resets, no flicker.
 * Pauses when the hero is off-screen or the tab is hidden; renders a single still frame under reduced motion.
 */

type Rgb = readonly [number, number, number];

const LIME: Rgb = [184, 255, 44];
const CYAN: Rgb = [18, 240, 255];
const WHITE: Rgb = [244, 244, 240];

interface Beam {
  /** source point as a fraction of canvas width / height (outside the frame = light rig off-screen) */
  sx: number;
  sy: number;
  /** 0° = straight down, positive = towards the right */
  base: number;
  amp: number;
  /** sweep period in seconds */
  period: number;
  phase: number;
  /** beam length as a fraction of canvas height */
  len: number;
  /** half-angle of the cone in degrees */
  spread: number;
  color: Rgb;
  alpha: number;
  /** intensity pulse period in seconds */
  pulse: number;
  pulsePhase: number;
}

const BEAMS: Beam[] = [
  { sx: -0.04, sy: -0.06, base: 24, amp: 15, period: 17, phase: 0.2, len: 1.55, spread: 2.3, color: LIME, alpha: 0.17, pulse: 11, pulsePhase: 0.4 },
  { sx: 1.04, sy: -0.06, base: -25, amp: 14, period: 19.5, phase: 2.1, len: 1.55, spread: 2.5, color: CYAN, alpha: 0.15, pulse: 13.5, pulsePhase: 2.6 },
  { sx: 0.3, sy: -0.12, base: 7, amp: 13, period: 14.5, phase: 4.0, len: 1.45, spread: 1.9, color: LIME, alpha: 0.115, pulse: 9.5, pulsePhase: 5.0 },
  { sx: 0.72, sy: -0.12, base: -9, amp: 12, period: 16, phase: 1.1, len: 1.45, spread: 1.9, color: CYAN, alpha: 0.115, pulse: 12, pulsePhase: 3.3 },
  { sx: 0.5, sy: -0.18, base: 0, amp: 17, period: 20, phase: 3.2, len: 1.55, spread: 5, color: WHITE, alpha: 0.065, pulse: 15, pulsePhase: 1.2 },
  { sx: 1.05, sy: 0.34, base: -62, amp: 10, period: 18, phase: 5.2, len: 1.0, spread: 2.1, color: LIME, alpha: 0.1, pulse: 10.5, pulsePhase: 4.4 },
  { sx: -0.05, sy: 0.3, base: 61, amp: 10, period: 15.5, phase: 0.9, len: 1.0, spread: 2.1, color: CYAN, alpha: 0.09, pulse: 14, pulsePhase: 0.1 },
];
/** phones: fewer, quieter beams */
const MOBILE_BEAMS = [0, 1, 2, 4];

/** soft cross-section: wide faint haze → core */
const LAYERS: readonly (readonly [width: number, alpha: number])[] = [
  [4.6, 0.1],
  [3.5, 0.14],
  [2.6, 0.2],
  [1.8, 0.3],
  [1.1, 0.48],
  [0.55, 0.75],
];

const TAU = Math.PI * 2;
const rgba = (c: Rgb, a: number): string => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export const startBeams = (canvas: HTMLCanvasElement, isVisible: () => boolean, reduced: boolean): (() => void) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;

  let w = 0;
  let h = 0;
  let mobile = false;
  let list: Beam[] = BEAMS;
  let gain = 1;

  const size = (): void => {
    const r = canvas.getBoundingClientRect();
    mobile = window.innerWidth < 700;
    // low-res on purpose: cheaper to paint and softer once the browser scales it up
    const scale = mobile ? 0.5 : 0.4;
    w = Math.max(2, Math.round(r.width * scale));
    h = Math.max(2, Math.round(r.height * scale));
    canvas.width = w;
    canvas.height = h;
    list = mobile ? MOBILE_BEAMS.map((i) => BEAMS[i] as Beam) : BEAMS;
    gain = mobile ? 0.5 : 0.72;
  };

  const haze = (t: number): void => {
    const blobs: readonly [Rgb, number, number, number, number, number][] = [
      [LIME, 0.22, 0.58, 0.55, 0.045, 23],
      [CYAN, 0.78, 0.5, 0.5, 0.04, 29],
      [WHITE, 0.5, 0.78, 0.6, 0.025, 19],
    ];
    blobs.forEach(([c, fx, fy, fr, a, per], i) => {
      const x = (fx + Math.sin((t / per) * TAU + i * 2.1) * 0.06) * w;
      const y = (fy + Math.cos((t / per) * TAU + i) * 0.04) * h;
      const rad = fr * Math.max(w, h);
      const k = 0.7 + 0.3 * Math.sin((t / (per * 0.6)) * TAU + i * 1.7);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, rgba(c, a * k * gain));
      g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  };

  const draw = (t: number): void => {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    haze(t);
    for (const b of list) {
      const ang = ((b.base + Math.sin((t / b.period) * TAU + b.phase) * b.amp) * Math.PI) / 180;
      const dx = Math.sin(ang);
      const dy = Math.cos(ang);
      const sx = b.sx * w;
      const sy = b.sy * h;
      const L = b.len * h;
      const ex = sx + dx * L;
      const ey = sy + dy * L;
      // slow breathing, never below ~half strength (no flicker)
      const inten = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin((t / b.pulse) * TAU + b.pulsePhase));
      const g = ctx.createLinearGradient(sx, sy, ex, ey);
      g.addColorStop(0, rgba(b.color, 0));
      g.addColorStop(0.18, rgba(b.color, 0.55));
      g.addColorStop(0.5, rgba(b.color, 1)); // strongest where the headline sits
      g.addColorStop(0.82, rgba(b.color, 0.45));
      g.addColorStop(1, rgba(b.color, 0));
      ctx.fillStyle = g;
      const half = Math.tan((b.spread * Math.PI) / 180) * L;
      const nx = dy; // unit normal
      const ny = -dx;
      for (const [wm, am] of LAYERS) {
        const e = half * wm;
        const s = 0.6 * wm;
        ctx.globalAlpha = Math.min(1, b.alpha * inten * am * gain);
        ctx.beginPath();
        ctx.moveTo(sx + nx * s, sy + ny * s);
        ctx.lineTo(ex + nx * e, ey + ny * e);
        ctx.lineTo(ex - nx * e, ey - ny * e);
        ctx.lineTo(sx - nx * s, sy - ny * s);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  let id = 0;
  let last = 0;
  const t0 = performance.now();
  const loop = (now: number): void => {
    id = requestAnimationFrame(loop);
    if (document.hidden || !isVisible()) return;
    if (now - last < 33) return; // ~30 fps is plenty for slow light
    last = now;
    draw((now - t0) / 1000 + 6);
  };

  size();
  draw(reduced ? 8 : 6);
  if (!reduced) id = requestAnimationFrame(loop);
  const onResize = (): void => {
    size();
    draw(reduced ? 8 : (performance.now() - t0) / 1000 + 6);
  };
  window.addEventListener('resize', onResize);
  return () => {
    cancelAnimationFrame(id);
    window.removeEventListener('resize', onResize);
  };
};
