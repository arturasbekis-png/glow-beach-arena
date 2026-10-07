import { site, heroImage, heroVideo, has } from '../config';
import { arrow, esc, lines } from '../util';
import type { SectionDef } from './def';

export const hero: SectionDef = {
  id: 'hero',
  cls: 'hero',
  html: (c) => `
    <div class="hero__bg" aria-hidden="true">
      ${has(heroVideo) ? `<video class="hero__media" autoplay muted loop playsinline preload="metadata"><source src="./${heroVideo}" type="video/mp4" /></video>` : ''}
      ${has(heroImage) ? `<img class="hero__media" src="./${heroImage}" alt="" />` : ''}
      <div class="hero__veil"></div>
      <canvas class="hero__beams" data-beams></canvas>
      <canvas class="hero__canvas" data-particles></canvas>
      <div class="hero__sand"></div>
    </div>
    <div class="hero__content" data-parallax="-0.12">
      <p class="meta hero__meta" data-reveal="fade">${esc(site.address)}</p>
      <h1 class="hero__title" data-reveal="lines" aria-label="${esc(site.name)}">${lines('GLOW', 'BEACH', 'ARENA')}</h1>
      <div class="netline" data-reveal="net" aria-hidden="true"></div>
      <div class="hero__foot" data-reveal="fade">
        <p class="hero__tag">${esc(c.hero.tagline)}</p>
        <div class="hero__cta">
          <a class="btn btn--lime" href="#rezervacija">${esc(c.ui.reserve)} ${arrow}</a>
          <a class="textlink" href="#zaidimas"><span>${esc(c.ui.game)}</span> ${arrow}</a>
        </div>
      </div>
    </div>
    <div class="hero__scroll" aria-hidden="true"><i></i></div>
  `,
};
