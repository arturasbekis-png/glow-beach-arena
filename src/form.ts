import { site } from './config';
import type { Content } from './content/types';

/**
 * Reservation form. There is no booking backend, so submitting only PREPARES an email to the club.
 * The UI says plainly that this is not a confirmed reservation.
 */
const FIELDS = ['date', 'duration', 'people', 'type', 'name', 'phone', 'email'] as const;
type Field = (typeof FIELDS)[number];

const state: Partial<Record<Field, string>> = {};

// Today's date in the visitor's own time zone (YYYY-MM-DD) — toISOString() would give the UTC day.
const localToday = (): string => {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

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
  if (date) date.min = localToday();
};

export const presetType = (type: string): void => {
  state.type = type;
  const sel = document.querySelector<HTMLSelectElement>('#res-form select[name="type"]');
  if (sel) sel.value = type;
};

export const bindForm = (form: HTMLFormElement | null, getContent: () => Content): void => {
  if (!form) return;
  restoreForm(form);
  form.addEventListener('input', (ev) => {
    captureForm(form);
    // A field stops being flagged as soon as the visitor edits it.
    const el = ev.target as HTMLElement | null;
    el?.closest('.field')?.classList.remove('is-bad');
    el?.removeAttribute('aria-invalid');
    const status = form.querySelector<HTMLElement>('[data-status]');
    if (status?.classList.contains('is-bad') && !form.querySelector('.field.is-bad')) {
      status.className = 'form__status';
      status.textContent = '';
    }
  });
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const c = getContent();
    const status = form.querySelector<HTMLElement>('[data-status]');
    const set = (html: string, ok: boolean): void => {
      if (!status) return;
      status.className = `form__status ${ok ? 'is-ok' : 'is-bad'}`;
      status.innerHTML = html;
    };
    const r0 = c.reservation;
    const today = localToday();
    // Returns a short message for the field's problem, or '' when the value is fine.
    const problem = (f: Field, v: string): string => {
      if (!v) return r0.invalid;
      if (f === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : r0.errors.email;
      if (f === 'phone') {
        const digits = v.replace(/\D/g, '').length;
        return /^[+\d\s().-]+$/.test(v) && digits >= 7 && digits <= 15 ? '' : r0.errors.phone;
      }
      if (f === 'date') return v >= today ? '' : r0.errors.date;
      if (f === 'people') return Number(v) >= 1 && Number.isInteger(Number(v)) ? '' : r0.errors.people;
      return '';
    };
    let firstBad: HTMLElement | null = null;
    let message = '';
    for (const f of FIELDS) {
      const el = form.elements.namedItem(f) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) continue;
      const msg = problem(f, el.value.trim());
      el.closest('.field')?.classList.toggle('is-bad', !!msg);
      if (msg) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
      if (msg && !firstBad) {
        firstBad = el;
        message = msg;
      }
    }
    if (firstBad) {
      set(message, false);
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
