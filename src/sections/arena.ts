import { esc, lines, pad, words } from '../util';
import { scene, type SceneKind } from '../scenes';
import type { SectionDef } from './def';

const kinds: Record<string, SceneKind> = { sand: 'sand', light: 'light', energy: 'energy', events: 'events' };

export const arena: SectionDef = {
  id: 'arena',
  cls: 'arena',
  html: (c) => {
    const a = c.arena;
    return `
    <div class="wrap">
      <p class="meta" data-reveal="fade"><span>02</span> — ${esc(c.nav[0]?.label ?? '')}</p>
      <p class="arena__kicker" data-reveal="fade">${esc(a.title)} · ${esc(a.main)}</p>
      <h2 class="statement" data-fill aria-label="${esc(a.secondary)}">${words(a.secondary)}</h2>
      <div class="arena__copy">
        <p class="lead" data-reveal="up">${esc(a.body)}</p>
        <p class="body" data-reveal="up" style="--d:.12s">${esc(a.additional)}</p>
      </div>
    </div>

    <div class="concepts">
      <div class="concepts__stage" aria-hidden="true">
        ${a.concepts.map((k, i) => scene(kinds[k.key] ?? 'sand', `stage__scene${i === 0 ? ' is-active' : ''}`)).join('')}
        <span class="concepts__count"><b data-concept-n>01</b> / ${pad(a.concepts.length)}</span>
      </div>
      <ol class="concepts__list">
        ${a.concepts
          .map(
            (k, i) => `
          <li class="concept${i === 0 ? ' is-active' : ''}" data-concept="${i}">
            <div class="concept__mini">${scene(kinds[k.key] ?? 'sand')}</div>
            <span class="concept__n">${pad(i + 1)}</span>
            <h3 class="concept__t" data-reveal="lines">${lines(k.title)}</h3>
            <p class="concept__p" data-reveal="up">${esc(k.text)}</p>
          </li>`,
          )
          .join('')}
      </ol>
    </div>`;
  },
};
