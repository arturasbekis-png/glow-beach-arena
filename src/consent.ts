/**
 * Analytics consent notice — a small bottom panel. It is shown on a first visit (no stored choice) and can be reopened
 * from the footer link "Analitikos nustatymai" to change the decision. One panel, one storage key, no cookies.
 * "Sutinku" stores `analytics_consent = granted` and calls grantAnalyticsConsent() (GA4 may then load);
 * "Nesutinku" stores `analytics_consent = denied`, stops any sending at once and nothing is loaded or sent afterwards.
 * Both buttons look the same on purpose. The panel never traps focus; it only takes focus when the visitor reopens it.
 */
import {
  consentNoticeNeeded,
  grantAnalyticsConsent,
  revokeAnalyticsConsent,
  saveConsentChoice,
  type ConsentChoice,
} from './analytics';
import type { Content } from './content/types';
import { esc } from './util';

let getContent: () => Content = () => {
  throw new Error('consent not initialised');
};
let el: HTMLElement | null = null;
let ro: ResizeObserver | null = null;
let reopened = false;

const fill = (c: Content): void => {
  if (!el) return;
  el.setAttribute('aria-label', c.consent.label);
  el.innerHTML = `
    <p class="consent__text">${esc(c.consent.text)}</p>
    <div class="consent__actions">
      <button class="btn btn--line" type="button" data-consent="denied">${esc(c.consent.decline)}</button>
      <button class="btn btn--line" type="button" data-consent="granted">${esc(c.consent.accept)}</button>
    </div>`;
};

/** Keeps content (the first-visit hero CTA, the page end) clear of the panel while it is visible. */
const syncHeight = (): void => {
  if (el) document.documentElement.style.setProperty('--consent-h', `${el.offsetHeight}px`);
};

const close = (choice: ConsentChoice | null): void => {
  if (choice) {
    saveConsentChoice(choice);
    if (choice === 'granted') grantAnalyticsConsent();
    else revokeAnalyticsConsent();
  }
  ro?.disconnect();
  ro = null;
  el?.remove();
  el = null;
  const root = document.documentElement;
  root.classList.remove('has-consent', 'has-consent-first');
  root.style.removeProperty('--consent-h');
  if (reopened) document.querySelector<HTMLElement>('[data-consent-open]')?.focus(); // back where the visitor came from
  reopened = false;
};

const show = (isReopen: boolean): void => {
  if (el) return;
  reopened = isReopen;
  el = document.createElement('div');
  el.className = 'consent';
  el.id = 'consent';
  el.setAttribute('role', 'region');
  el.addEventListener('click', (ev) => {
    const b = (ev.target as Element).closest<HTMLButtonElement>('[data-consent]');
    if (b) close(b.dataset.consent === 'granted' ? 'granted' : 'denied');
  });
  fill(getContent());
  // Right after the skip link: reachable early by keyboard and screen readers, drawn at the bottom of the screen.
  const app = document.getElementById('app');
  app?.parentNode?.insertBefore(el, app);
  document.documentElement.classList.add('has-consent');
  if (!isReopen) document.documentElement.classList.add('has-consent-first'); // only a first visit lifts the hero CTA
  syncHeight();
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(syncHeight);
    ro.observe(el);
  }
  if (isReopen) el.querySelector<HTMLButtonElement>('[data-consent]')?.focus();
};

export const mountConsent = (content: () => Content): void => {
  getContent = content;
  // Footer link "Analitikos nustatymai": reopen the same panel to change the decision.
  document.addEventListener('click', (ev) => {
    if ((ev.target as Element | null)?.closest('[data-consent-open]')) show(true);
  });
  // Escape closes a panel the visitor reopened themselves, without changing their stored choice.
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && el && reopened) close(null);
  });
  if (consentNoticeNeeded()) show(false);
};

/** Language switch: update the notice text if it is showing. */
export const refreshConsent = (c: Content): void => {
  if (el) {
    fill(c);
    syncHeight();
  }
};
