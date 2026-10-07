export type Lang = 'lt' | 'en';

export interface NavItem {
  id: string;
  label: string;
}

export interface Concept {
  key: 'sand' | 'light' | 'energy' | 'events';
  title: string;
  text: string;
}

export interface FormatItem {
  key: 'kids' | 'corporate' | 'tournaments';
  title: string;
  text: string;
}

export interface PriceCategory {
  key: 'kids' | 'corporate';
  title: string;
  text: string;
}

export interface Content {
  meta: { title: string; description: string };
  ui: {
    menu: string;
    close: string;
    reserve: string;
    game: string;
    skip: string;
    fullscreen: string;
    language: string;
    homeLabel: string;
  };
  nav: NavItem[];
  hero: { tagline: string };
  arena: {
    title: string;
    main: string;
    secondary: string;
    body: string;
    additional: string;
    concepts: Concept[];
  };
  game: { title: string };
  training: { title: string; words: string[] };
  tournaments: { title: string; text: string };
  events: { title: string; text: string; formats: FormatItem[] };
  gallery: { title: string; text: string; tags: string[] };
  prices: {
    title: string;
    text: string;
    fields: string[];
    categories: PriceCategory[];
    priceLabel: string;
    priceValue: string;
    cta: string;
  };
  reservation: {
    title: string;
    cta: string;
    labels: {
      date: string;
      duration: string;
      people: string;
      type: string;
      name: string;
      phone: string;
      email: string;
    };
    types: { kids: string; corporate: string; tournaments: string; training: string };
    choose: string;
    submit: string;
    invalid: string;
    prepared: string;
    notConfirmed: string;
    fallback: string;
    mailSubject: string;
    lead: string;
    notice: string;
    errors: { email: string; phone: string; date: string; people: string };
  };
  contacts: {
    title: string;
    address: string;
    phone: string;
    email: string;
    company: string;
    companyCode: string;
    bank: string;
    account: string;
    call: string;
    reserve: string;
  };
  final: { cta: string };
  consent: { label: string; text: string; accept: string; decline: string; settings: string };
  footer: { rights: string };
}
