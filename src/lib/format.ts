import { pick, useT, type Lang } from '../i18n/ui';
import { branchById } from '../data/company';
import { TYPES, type Machine } from '../data/inventory';

export const num = (n: number) => Number(n).toLocaleString('it-IT');
export const eur = (n: number) => '€ ' + num(Math.round(n));

export const STATUS_KEY = { ready: 'sReady', incoming: 'sIncoming', reserved: 'sReserved' } as const;

/** Text shown on a machine card, shared by home, catalog and similar-machines rows. */
export function machineView(m: Machine, lang: Lang) {
  const t = useT(lang);
  const place = pick(branchById(m.branch).short, lang);
  return {
    category: `${pick(TYPES[m.type], lang)} · ${m.cond === 'nuovo' ? t('condNew') : t('condUsed')}`,
    specs: m.cond === 'nuovo' ? `${m.year} · ${t('isNew')} · ${place}` : `${m.year} · ${num(m.hours)} h · ${place}`,
    price: m.price ? eur(m.price) : t('onRequest'),
    vat: m.price ? t('vat') : '',
    status: t(STATUS_KEY[m.status]),
  };
}

export const waLink = (phoneIntl: string, text: string) => `https://wa.me/${phoneIntl}?text=${encodeURIComponent(text)}`;
