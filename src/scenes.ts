// Abstract brand scenes drawn in SVG. They are graphic atmosphere, NOT photographs of the arena.
export type SceneKind =
  | 'sand'
  | 'light'
  | 'energy'
  | 'events'
  | 'corporate'
  | 'tournament'
  | 'court'
  | 'net'
  | 'training';

const L = 'var(--lime)';
const C = 'var(--cyan)';
const O = 'var(--off)';

const wrap = (inner: string, defs = ''): string =>
  `<svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><defs>${defs}</defs>${inner}</svg>`;

const dunes = (y: number, op: number): string =>
  `<path d="M0 ${y} C 160 ${y - 70}, 300 ${y + 40}, 460 ${y - 20} S 700 ${y - 60}, 800 ${y} V1000 H0 Z" fill="${O}" opacity="${op}"/>`;

const svgs: Record<SceneKind, string> = {
  sand: wrap(
    `<rect width="800" height="1000" fill="url(#sg)"/>
     ${dunes(520, 0.05)}${dunes(620, 0.08)}${dunes(720, 0.12)}${dunes(830, 0.17)}${dunes(920, 0.24)}
     <line x1="0" y1="440" x2="800" y2="440" stroke="${L}" stroke-width="1.5" opacity=".7"/>
     <circle cx="590" cy="260" r="64" fill="none" stroke="${O}" stroke-width="1" opacity=".35"/>
     <circle cx="590" cy="260" r="3" fill="${L}"/>`,
    `<linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050505"/><stop offset=".55" stop-color="#071018"/><stop offset="1" stop-color="#0d1a1d"/></linearGradient>`,
  ),
  light: wrap(
    `<rect width="800" height="1000" fill="#050505"/>
     <polygon points="150,-40 330,-40 640,1000 -20,1000" fill="url(#lc)" opacity=".9"/>
     <polygon points="470,-40 640,-40 1020,1000 560,1000" fill="url(#lm)" opacity=".8"/>
     <ellipse cx="380" cy="930" rx="420" ry="70" fill="${C}" opacity=".14"/>
     <ellipse cx="380" cy="930" rx="220" ry="30" fill="${L}" opacity=".22"/>
     <line x1="0" y1="860" x2="800" y2="860" stroke="${O}" stroke-width="1" opacity=".25"/>`,
    `<linearGradient id="lc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8FF2C" stop-opacity=".38"/><stop offset="1" stop-color="#B8FF2C" stop-opacity="0"/></linearGradient>
     <linearGradient id="lm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12F0FF" stop-opacity=".34"/><stop offset="1" stop-color="#12F0FF" stop-opacity="0"/></linearGradient>`,
  ),
  energy: wrap(
    `<rect width="800" height="1000" fill="#071018"/>
     ${Array.from({ length: 14 }, (_, i) => `<line x1="${-100 + i * 70}" y1="1000" x2="${300 + i * 70}" y2="-20" stroke="${i % 5 === 0 ? L : O}" stroke-width="${i % 5 === 0 ? 2 : 1}" opacity="${i % 5 === 0 ? 0.8 : 0.12}"/>`).join('')}
     <path d="M80 860 Q 400 120 720 700" fill="none" stroke="${O}" stroke-width="1.5" stroke-dasharray="3 12" opacity=".55"/>
     <circle cx="400" cy="318" r="46" fill="${L}"/>
     <circle cx="400" cy="318" r="92" fill="none" stroke="${L}" stroke-width="1" opacity=".5"/>`,
  ),
  events: wrap(
    `<rect width="800" height="1000" fill="#050505"/>
     ${[90, 170, 260, 360, 470].map((r, i) => `<circle cx="400" cy="520" r="${r}" fill="none" stroke="${O}" stroke-width="1" opacity="${0.28 - i * 0.04}"/>`).join('')}
     ${Array.from({ length: 28 }, (_, i) => {
       const a = (i / 28) * Math.PI * 2;
       return `<line x1="${400 + Math.cos(a) * 110}" y1="${520 + Math.sin(a) * 110}" x2="${400 + Math.cos(a) * (i % 2 ? 300 : 230)}" y2="${520 + Math.sin(a) * (i % 2 ? 300 : 230)}" stroke="${i % 4 === 0 ? L : C}" stroke-width="1" opacity="${i % 4 === 0 ? 0.8 : 0.3}"/>`;
     }).join('')}
     <circle cx="400" cy="520" r="14" fill="${L}"/>
     <rect x="170" y="250" width="14" height="5" fill="${C}" transform="rotate(32 170 250)"/>
     <rect x="640" y="330" width="14" height="5" fill="${L}" transform="rotate(-24 640 330)"/>
     <rect x="560" y="800" width="14" height="5" fill="${C}" transform="rotate(58 560 800)"/>
     <rect x="210" y="760" width="14" height="5" fill="${L}" transform="rotate(-48 210 760)"/>`,
  ),
  corporate: wrap(
    `<rect width="800" height="1000" fill="#071018"/>
     ${[[160, 240], [420, 170], [660, 300], [250, 520], [540, 560], [140, 780], [420, 800], [680, 760]]
       .map(([x, y], i, a) => {
         const n = a[(i + 2) % a.length] as number[];
         return `<line x1="${x}" y1="${y}" x2="${n[0]}" y2="${n[1]}" stroke="${C}" stroke-width="1" opacity=".35"/><circle cx="${x}" cy="${y}" r="${i === 4 ? 14 : 6}" fill="${i === 4 ? L : 'none'}" stroke="${i === 4 ? L : O}" stroke-width="1.5" opacity="${i === 4 ? 1 : 0.7}"/>`;
       })
       .join('')}
     <circle cx="540" cy="560" r="64" fill="none" stroke="${L}" stroke-width="1" opacity=".5"/>`,
  ),
  tournament: wrap(
    `<rect width="800" height="1000" fill="#050505"/>
     <g fill="none" stroke="${O}" stroke-width="1.5" opacity=".4">
       <path d="M80 160 H260 V260 H80 M80 360 H260 V260 M260 260 H420"/>
       <path d="M80 560 H260 V660 H80 M80 760 H260 V660 M260 660 H420"/>
       <path d="M420 260 H560 V460 H420 M420 660 H560 V460 M560 460 H720"/>
     </g>
     <g fill="none" stroke="${L}" stroke-width="2.5">
       <path d="M80 160 H260 V260 H420 H560 V460 H720"/>
     </g>
     <circle cx="720" cy="460" r="10" fill="${L}"/>
     <circle cx="720" cy="460" r="30" fill="none" stroke="${L}" stroke-width="1" opacity=".5"/>`,
  ),
  court: wrap(
    `<rect width="800" height="1000" fill="#071018"/>
     <g fill="none" stroke="${O}" stroke-width="2" opacity=".6">
       <rect x="120" y="230" width="560" height="540"/>
       <line x1="120" y1="500" x2="680" y2="500" stroke="${L}" stroke-width="3" opacity="1"/>
     </g>
     <g stroke="${O}" stroke-width="1" opacity=".2">
       <line x1="120" y1="365" x2="680" y2="365"/><line x1="120" y1="635" x2="680" y2="635"/>
     </g>
     <circle cx="470" cy="380" r="16" fill="${L}"/>
     <path d="M250 640 Q 360 240 470 380" fill="none" stroke="${O}" stroke-width="1.5" stroke-dasharray="3 10" opacity=".6"/>`,
  ),
  net: wrap(
    `<rect width="800" height="1000" fill="#050505"/>
     <g stroke="${O}" stroke-width="1" opacity=".22">
       ${Array.from({ length: 22 }, (_, i) => `<line x1="${-100 + i * 50}" y1="260" x2="${150 + i * 25}" y2="760"/>`).join('')}
       ${Array.from({ length: 22 }, (_, i) => `<line x1="${-100 + i * 50}" y1="760" x2="${150 + i * 25}" y2="260"/>`).join('')}
     </g>
     <line x1="0" y1="250" x2="800" y2="250" stroke="${L}" stroke-width="4"/>
     <line x1="0" y1="770" x2="800" y2="770" stroke="${O}" stroke-width="1" opacity=".5"/>
     <rect x="0" y="820" width="800" height="180" fill="${C}" opacity=".06"/>`,
  ),
  training: wrap(
    `<rect width="800" height="1000" fill="#071018"/>
     ${dunes(700, 0.07)}${dunes(800, 0.12)}${dunes(900, 0.2)}
     <path d="M80 900 C 220 860, 260 700, 380 620 S 600 420, 720 120" fill="none" stroke="${L}" stroke-width="2.5"/>
     ${[[80, 900], [230, 820], [380, 620], [540, 470], [720, 120]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 4 ? 12 : 5}" fill="${i === 4 ? L : '#071018'}" stroke="${L}" stroke-width="1.5"/>`).join('')}
     <g stroke="${O}" stroke-width="1" opacity=".18">${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${120 + i * 90}" x2="800" y2="${120 + i * 90}"/>`).join('')}</g>`,
  ),
};

let uid = 0;

/** Every instance gets unique gradient ids — duplicate ids inside a display:none copy would blank the visible one. */
export const scene = (kind: SceneKind, extra = ''): string => {
  const n = ++uid;
  let svg = svgs[kind].replace(/ id="(\w+)"/g, ` id="$1-${n}"`).replace(/url\(#(\w+)\)/g, `url(#$1-${n})`);
  if (kind === 'court') svg = svg.replace('xMidYMid slice', 'xMidYMid meet');
  return `<div class="scene scene--${kind} ${extra}" aria-hidden="true">${svg}</div>`;
};
