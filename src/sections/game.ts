import { gamePath, has } from '../config';
import { esc, lines } from '../util';
import { scene } from '../scenes';
import type { Content } from '../content/types';

/**
 * The ŽAIDIMAS section has two parts: a re-renderable text head (language switch) and a persistent stage.
 * The stage is created once so a running game is never reloaded when the language changes.
 */
export const gameHeadHtml = (c: Content): string => `
  <p class="meta" data-reveal="fade"><span>03</span> — ${esc(c.game.title)}</p>
  <h2 class="mega" data-reveal="lines">${lines(c.game.title.toUpperCase())}</h2>
  <button class="iconbtn game__fs" type="button" data-fullscreen hidden aria-label="${esc(c.ui.fullscreen)}" title="${esc(c.ui.fullscreen)}">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>
  </button>
`;

export const buildGameShell = (section: HTMLElement): { head: HTMLElement; stage: HTMLElement } => {
  section.innerHTML = `
    <div class="wrap game__wrap">
      <div class="game__head"></div>
      <div class="game__stage" data-reveal="scale">
        <div class="game__slot">
          ${scene('court')}
          <p class="game__word" aria-hidden="true">GLOW<br />GAME</p>
        </div>
      </div>
    </div>`;
  return {
    head: section.querySelector<HTMLElement>('.game__head')!,
    stage: section.querySelector<HTMLElement>('.game__stage')!,
  };
};

/** Embeds the existing game if its build exists at public/game/index.html. Never fakes a game. */
export const mountGame = (stage: HTMLElement): boolean => {
  if (!has(gamePath)) return false;
  stage.classList.add('has-game');
  stage.querySelector('.game__slot')?.remove();
  const frame = document.createElement('iframe');
  frame.src = `./${gamePath}`;
  frame.title = 'GLOW GAME';
  frame.allow = 'fullscreen; autoplay; gamepad';
  frame.loading = 'lazy';
  frame.className = 'game__frame';
  stage.appendChild(frame);
  document.documentElement.dataset.game = 'on';
  return true;
};
