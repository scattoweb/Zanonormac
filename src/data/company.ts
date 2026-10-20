import type { Tri } from '../i18n/ui';

export const COMPANY = {
  name: 'Zanon & Ormac S.r.l.',
  vat: '03054090984',
  street: 'Via Moie 52/d',
  zip: '25050',
  city: 'Rodengo Saiano',
  province: 'BS',
  phone: '030 61 11 38',
  phoneIntl: '+39030611138',
  whatsapp: '+39 348 745 4575',
  whatsappIntl: '393487454575',
  email: 'info@zanormac.it',
  instagram: 'https://www.instagram.com/zanonormac',
  facebook: 'https://www.facebook.com/zanormac',
  founded: 1964,
};

export type BranchId = 'rodengo' | 'torbole' | 'roveri' | 'fornace' | 'bolzano';

export interface Branch {
  id: BranchId;
  name: Tri;
  short: Tri;
  note: Tri;
  phone: string;
  /** Branch in a German-speaking or bilingual area: choosing it switches the site to German. */
  de: boolean;
}

const same = (s: string): Tri => ({ it: s, de: s, en: s });

export const BRANCHES: Branch[] = [
  { id: 'rodengo', name: same('Rodengo Saiano (BS)'), short: same('Rodengo Saiano'), note: { it: 'Sede · Via Moie 52/d', de: 'Hauptsitz · Via Moie 52/d', en: 'Head office · Via Moie 52/d' }, phone: '030 68 10 957', de: false },
  { id: 'torbole', name: same('Torbole Casaglia (BS)'), short: same('Torbole Casaglia'), note: { it: 'Officina storica, dal 1964', de: 'Stammwerkstatt seit 1964', en: 'Original workshop, since 1964' }, phone: '030 26 50 155', de: false },
  { id: 'roveri', name: same('Torre de Roveri (BG)'), short: same('Torre de Roveri'), note: same('Zanon & Tractor · Volvo CE'), phone: '035 78 48 37', de: false },
  { id: 'fornace', name: { it: 'Fornace (Trento)', de: 'Fornace (Trient)', en: 'Fornace (Trento)' }, short: same('Fornace'), note: { it: 'Zanon & Marchi · Volvo CE e Bobcat', de: 'Zanon & Marchi · Volvo CE und Bobcat', en: 'Zanon & Marchi · Volvo CE and Bobcat' }, phone: '0461 68 92 08', de: true },
  { id: 'bolzano', name: { it: 'Bolzano', de: 'Bozen', en: 'Bolzano' }, short: { it: 'Bolzano', de: 'Bozen', en: 'Bolzano' }, note: { it: 'Assistenza Alto Adige', de: 'Service Südtirol', en: 'South Tyrol service' }, phone: '0471 17 27 489', de: true },
];

export const branchById = (id: string) => BRANCHES.find((b) => b.id === id) ?? BRANCHES[0];

export const telHref = (phone: string) => 'tel:+39' + phone.replace(/\s/g, '');
