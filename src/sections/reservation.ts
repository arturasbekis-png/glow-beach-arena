import { arrow, esc, lines } from '../util';
import type { SectionDef } from './def';

export const reservation: SectionDef = {
  id: 'rezervacija',
  cls: 'reservation',
  html: (c) => {
    const r = c.reservation;
    const l = r.labels;
    return `
    <div class="reservation__glow" aria-hidden="true"></div>
    <div class="wrap reservation__grid">
      <div class="reservation__head">
        <p class="meta" data-reveal="fade"><span>09</span> — ${esc(r.title)}</p>
        <h2 class="mega" data-reveal="lines">${lines(r.cta.toUpperCase())}</h2>
      </div>
      <form class="form" id="res-form" novalidate data-reveal="up">
        <div class="form__row form__row--3">
          <label class="field"><span>${esc(l.date)}</span><input type="date" name="date" required autocomplete="off" /></label>
          <label class="field"><span>${esc(l.duration)}</span><input type="text" name="duration" required autocomplete="off" /></label>
          <label class="field"><span>${esc(l.people)}</span><input type="number" name="people" min="1" inputmode="numeric" required autocomplete="off" /></label>
        </div>
        <label class="field"><span>${esc(l.type)}</span>
          <select name="type" required>
            <option value="">${esc(r.choose)}</option>
            <option value="kids">${esc(r.types.kids)}</option>
            <option value="corporate">${esc(r.types.corporate)}</option>
            <option value="tournaments">${esc(r.types.tournaments)}</option>
            <option value="training">${esc(r.types.training)}</option>
          </select>
        </label>
        <div class="form__row form__row--3">
          <label class="field"><span>${esc(l.name)}</span><input type="text" name="name" required autocomplete="name" /></label>
          <label class="field"><span>${esc(l.phone)}</span><input type="tel" name="phone" required autocomplete="tel" inputmode="tel" /></label>
          <label class="field"><span>${esc(l.email)}</span><input type="email" name="email" required autocomplete="email" inputmode="email" /></label>
        </div>
        <div class="form__foot">
          <button class="btn btn--lime" type="submit">${esc(r.submit)} ${arrow}</button>
          <div class="form__status" role="status" aria-live="polite" data-status></div>
        </div>
      </form>
    </div>`;
  },
};
