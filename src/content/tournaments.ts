// Real tournament data goes here — and only real data (names, dates, registration links, results).
// While this list is empty, the Tournaments section shows the brief's copy and a contact CTA, nothing else.
export interface Tournament {
  name: string;
  date: string; // display string, e.g. as published by the club
  registrationUrl?: string;
  result?: string;
}

export const tournaments: Tournament[] = [];
