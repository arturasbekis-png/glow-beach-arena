/**
 * Analytics (GA4) — one small, central module. No dependencies, no custom tracking scripts, no advertising features.
 *
 * Safe by default:
 *  - Nothing is loaded or sent until `gaMeasurementId` (src/config.ts) holds a real Measurement ID.
 *  - While `analyticsNeedsConsent` is true, nothing is loaded or sent until the visitor agrees in the consent notice
 *    (src/consent.ts → `grantAnalyticsConsent()`), or agreed on an earlier visit. A refusal keeps everything off.
 *  - Events can only carry the whitelisted, non-personal parameters below. Names, phone numbers, e-mail
 *    addresses and any free text can never reach Google Analytics: unknown keys and values that are not short
 *    snake_case labels are dropped before sending.
 *
 * Debugging: open the site with `?ga_debug=1`. Every event is printed to the console (also while no ID is set,
 * as a dry run), and with a real ID it is flagged for GA4 DebugView. Without the flag nothing is logged.
 */
import { analyticsNeedsConsent, gaMeasurementId } from './config';

/** The only events this site sends. */
export type AnalyticsEvent =
  | 'reservation_cta_click'
  | 'offer_cta_click'
  | 'reservation_form_start'
  | 'reservation_form_submit'
  | 'reservation_form_error'
  | 'contact_phone_click'
  | 'contact_email_click';

/** The only parameters this site sends (all short labels, never user input). */
interface Params {
  cta_location?: string;
  event_type?: string;
  source?: string;
  form_field?: string;
  error_type?: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const debug = new URLSearchParams(location.search).has('ga_debug');
const validId = /^G-[A-Z0-9]{8,12}$/.test(gaMeasurementId) && !/^G-X+$/.test(gaMeasurementId);
let consent = !analyticsNeedsConsent;
let loaded = false;

const ALLOWED = ['cta_location', 'event_type', 'source', 'form_field', 'error_type'];
const clean = (p: Params): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(p)) {
    if (ALLOWED.includes(k) && typeof v === 'string' && /^[a-z][a-z0-9_]{0,39}$/.test(v)) out[k] = v;
  }
  return out;
};

const load = (): void => {
  if (loaded || !validId || !consent) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(): void {
    // GA4 expects the `arguments` object itself, not an array.
    (window.dataLayer as unknown[]).push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaMeasurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    ...(debug ? { debug_mode: true } : {}),
  });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
  document.head.appendChild(s);
};

const gaFlag = (): string => `ga-disable-${gaMeasurementId}`; // Google's documented per-property opt-out switch

/** Called when the visitor agrees to analytics (the consent notice, src/consent.ts). Only now may GA4 load. */
export const grantAnalyticsConsent = (): void => {
  consent = true;
  if (validId) (window as unknown as Record<string, unknown>)[gaFlag()] = false;
  load();
};

/** Called when the visitor refuses (or withdraws): stop sending at once and remove any GA cookies from this site. */
export const revokeAnalyticsConsent = (): void => {
  consent = false;
  if (validId) (window as unknown as Record<string, unknown>)[gaFlag()] = true;
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim() ?? '';
    if (!name.startsWith('_ga')) continue;
    const host = location.hostname;
    for (const domain of [host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
};

/* ---------- the visitor's stored choice (a single word in localStorage — no personal data) ---------- */

const KEY = 'analytics_consent';
export type ConsentChoice = 'granted' | 'denied';

export const readConsentChoice = (): ConsentChoice | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null; // storage blocked: behave as "no choice yet" — analytics stays off
  }
};

export const saveConsentChoice = (v: ConsentChoice): void => {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* storage blocked: the choice only lasts for this page view */
  }
};

/**
 * Show the consent notice only when analytics could actually run (a real ID is configured) and the visitor has not
 * chosen yet (the footer link reopens it later). `?ga_debug=1` also shows it while the placeholder ID is still in place, so it can be previewed.
 */
/** Analytics could actually run, so the consent notice and the footer "settings" link make sense. */
export const consentAvailable = (): boolean => analyticsNeedsConsent && (validId || debug);

export const consentNoticeNeeded = (): boolean => consentAvailable() && readConsentChoice() === null;

export const track = (name: AnalyticsEvent, params: Params = {}): void => {
  const p = clean(params);
  const active = validId && consent;
  if (debug) console.info(`[analytics] ${name}`, p, active ? '(sent)' : '(not sent — no valid ID or no consent)');
  if (active) {
    load(); // no-op once loaded; makes sure early clicks are queued rather than lost
    window.gtag?.('event', name, p);
  }
};

/* ---------- classification of clicks (no markup changes needed) ---------- */

const TYPE: Record<string, string> = {
  kids: 'kids_birthday',
  corporate: 'corporate_event',
  training: 'training',
  tournaments: 'tournament',
};
/** Maps the select value / data-reserve-type to a GA label. */
export const eventTypeLabel = (key: string | undefined | null): string | undefined => (key ? TYPE[key] : undefined);

const SECTION: Record<string, string> = {
  hero: 'hero',
  treniruotes: 'training',
  turnyrai: 'tournaments',
  renginiai: 'events',
  kainos: 'prices',
  rezervacija: 'reservation',
  kontaktai: 'contacts',
  final: 'final',
};

const locationOf = (el: Element): string => {
  if (el.closest('#menu')) return 'menu';
  if (el.closest('header')) return 'header';
  if (el.closest('footer')) return 'footer';
  const id = el.closest('section')?.id;
  return (id && SECTION[id]) || 'other';
};

const onClick = (ev: MouseEvent): void => {
  const t = ev.target as Element | null;
  const a = t?.closest<HTMLAnchorElement>('a[href]');
  if (!a) return;
  const href = a.getAttribute('href') ?? '';

  if (href.startsWith('tel:')) return track('contact_phone_click', { cta_location: locationOf(a) });
  if (href.startsWith('mailto:')) return track('contact_email_click', { cta_location: locationOf(a) });

  // Only buttons that lead straight to the reservation section (not the plain navigation links).
  if (href !== '#rezervacija' || !a.classList.contains('btn')) return;
  const type = eventTypeLabel(a.dataset.reserveType);
  const where = locationOf(a);
  const offer = a.closest('.format--kids, .format--corporate') ?? (where === 'prices' ? a : null);
  if (offer) {
    const source = where === 'prices' ? 'prices' : a.closest('.format--kids') ? 'events_kids' : 'events_corporate';
    track('offer_cta_click', { cta_location: where, source, event_type: type });
  } else {
    track('reservation_cta_click', { cta_location: where, event_type: type });
  }
};

let formStarted = false;
const onFocusIn = (ev: FocusEvent): void => {
  if (formStarted || !(ev.target as Element | null)?.closest('#res-form')) return;
  formStarted = true;
  track('reservation_form_start');
};

export const initAnalytics = (): void => {
  document.addEventListener('click', onClick);
  document.addEventListener('focusin', onFocusIn);
  // A previous "Sutinku" is honoured; a previous "Nesutinku" (or no choice yet) keeps GA4 completely off.
  if (analyticsNeedsConsent && readConsentChoice() === 'granted') consent = true;
  if (validId && consent) {
    // Load after the page has finished, never in the rendering path.
    const go = (): void => load();
    if (document.readyState === 'complete') setTimeout(go, 1500);
    else addEventListener('load', () => setTimeout(go, 1500), { once: true });
  }
};
