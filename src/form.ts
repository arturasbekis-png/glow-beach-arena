import { site } from './config';
import type { Content } from './content/types';

/**
 * Reservation form. There is no booking backend, so submitting only PREPARES an email to the club.
 * The UI says plainly that this is not a confirmed reservation.
 */
const FIELDS = ['date', 'duration', 'people', 'type', 'name', 'phone', 'email'] as const;
type Field = (typeof FIELDS)[number];

const state: Partial<Record<Field, string>> = {};

export const captureForm = (form: HTMLFormElement | null): void => {
  if (!form) return;
  for (const f of FIELDS) {
    const el = form.elements.namedItem(f) as HTMLInputElement | HTMLSelectElement | null;
    if (el) state[f] = el.value;
  }
};

export const restoreForm = (form: HTMLFormElement | null): void => {
  if (!form) return;
  for (const f of FIELDS) {
    const el = form.elements.namedItem(f) as HTMLInputElement | HTMLSelectElement | null;
    if (el && state[f] !== undefined) el.value = state[f] ?? '';
  }
  const date = form.elements.namedItem('date') as HTMLInputElement | null;
  if (date) date.min = new Date().toISOString().slice(0, 10);
};

export const presetType = (type: string): void => {
  state.type = type;
  const sel = document.querySelector<HTMLSelectElement>('#res-form select[name="type"]');
  if (sel) sel.value = type;
};

export const bindForm = (form: HTMLFormElement | null, getContent: () => Content): void => {
  if (!form) return;
  restoreForm(form);
  form.addEventListener('input', () => captureForm(form));
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const c = getContent();
    const status = form.querySelector<HTMLElement>('[data-status]');
    const set = (html: string, ok: boolean): void => {
      if (!status) return;
      status.className = `form__status ${ok ? 'is-ok' : 'is-bad'}`;
      status.innerHTML = html;
    };
    let firstBad: HTMLElement | null = null;
    for (const f of FIELDS) {
      const el = form.elements.namedItem(f) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) continue;
      const bad = !el.value.trim() || !el.checkValidity();
      el.closest('.field')?.classList.toggle('is-bad', bad);
      if (bad && !firstBad) firstBad = el;
    }
    if (firstBad) {
      set(c.reservation.invalid, false);
      (firstBad as HTMLElement).focus();
      return;
    }
    const r = c.reservation;
    const data = new FormData(form);
    const typeKey = String(data.get('type')) as keyof typeof r.types;
    const body = [
      `${r.labels.date}: ${data.get('date')}`,
      `${r.labels.duration}: ${data.get('duration')}`,
      `${r.labels.people}: ${data.get('people')}`,
      `${r.labels.type}: ${r.types[typeKey] ?? data.get('type')}`,
      `${r.labels.name}: ${data.get('name')}`,
      `${r.labels.phone}: ${data.get('phone')}`,
      `${r.labels.email}: ${data.get('email')}`,
    ].join('\n');
    const href = `${site.emailHref}?subject=${encodeURIComponent(r.mailSubject)}&body=${encodeURIComponent(body)}`;
    set(
      `<strong>${r.prepared}</strong> ${r.notConfirmed}<br /><span>${r.fallback}</span>`,
      true,
    );
    window.location.href = href;
  });
};
