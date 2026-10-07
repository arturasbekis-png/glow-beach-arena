import type { Content } from '../content/types';

export interface SectionDef {
  id: string;
  cls: string;
  html: (c: Content) => string;
}
