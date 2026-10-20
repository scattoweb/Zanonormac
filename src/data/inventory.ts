/*
 * Parco macchine (vendita).
 *
 * I dati qui sotto sono ESEMPI per la presentazione del nuovo sito: anni, ore, prezzi e
 * pesi vanno sostituiti con quelli reali del magazzino. Le foto sono quelle del sito attuale.
 * Per aggiungere una macchina: copiare un blocco, cambiare `slug` (unico, solo minuscole e
 * trattini) e i campi, aggiungere le foto in src/assets/img/ e importarle qui sopra.
 */
import type { ImageMetadata } from 'astro';
import type { Tri } from '../i18n/ui';
import type { BranchId } from './company';

import mxt1 from '../assets/img/mxt-1.jpg';
import mxt2 from '../assets/img/mxt-2.jpg';
import mxt3 from '../assets/img/mxt-3.jpg';
import mxt4 from '../assets/img/mxt-4.jpg';
import mxt5 from '../assets/img/mxt-5.jpg';
import mxt6 from '../assets/img/mxt-6.jpg';
import ec250 from '../assets/img/brand-volvo.jpg';
import e27 from '../assets/img/m-bobcat-mini.jpg';
import l120 from '../assets/img/m-pala.jpg';
import liebherr from '../assets/img/liebherr.jpg';
import a30 from '../assets/img/m-dumper.jpg';
import ecr38 from '../assets/img/ecr38.jpg';
import t76 from '../assets/img/brand-bobcat.jpg';
import l150 from '../assets/img/l150.jpg';
import r3 from '../assets/img/brand-keestrack.jpg';
import l85 from '../assets/img/bc-l85.jpg';
import atlas from '../assets/img/m-atlas.jpg';
import colmar from '../assets/img/colmar.jpg';
import mhl from '../assets/img/brand-fuchs.jpg';

export type Group = 'esc' | 'mini' | 'pale' | 'dump' | 'fran' | 'mov';
export type TypeKey = 'wex' | 'cex' | 'mini' | 'wl' | 'cwl' | 'ctl' | 'hauler' | 'crusher' | 'handler';
export type Status = 'ready' | 'incoming' | 'reserved';
export type BrandId = 'Volvo CE' | 'Bobcat' | 'Mecalac' | 'Terex Fuchs' | 'Keestrack' | 'Altre';

export interface Machine {
  slug: string;
  ref: string;
  name: string;
  type: TypeKey;
  group: Group;
  brand: BrandId;
  cond: 'nuovo' | 'usato';
  year: number;
  hours: number;
  branch: BranchId;
  /** Euro, IVA esclusa. null = prezzo su richiesta. */
  price: number | null;
  status: Status;
  /** Ordine "più recenti": numero più alto = inserita più di recente. */
  added: number;
  weightKg: number;
  powerKw: number;
  features: Tri[];
  images: ImageMetadata[];
}

export const GROUPS: { id: Group; label: Tri }[] = [
  { id: 'esc', label: { it: 'Escavatori', de: 'Bagger', en: 'Excavators' } },
  { id: 'mini', label: { it: 'Mini escavatori', de: 'Minibagger', en: 'Mini excavators' } },
  { id: 'pale', label: { it: 'Pale', de: 'Lader', en: 'Loaders' } },
  { id: 'dump', label: { it: 'Dumper', de: 'Dumper', en: 'Haulers' } },
  { id: 'fran', label: { it: 'Frantoi e vagli', de: 'Brecher und Siebe', en: 'Crushers and screens' } },
  { id: 'mov', label: { it: 'Movimentazione', de: 'Umschlag', en: 'Material handling' } },
];

export const TYPES: Record<TypeKey, Tri> = {
  wex: { it: 'Escavatore gommato', de: 'Mobilbagger', en: 'Wheeled excavator' },
  cex: { it: 'Escavatore cingolato', de: 'Kettenbagger', en: 'Crawler excavator' },
  mini: { it: 'Mini escavatore', de: 'Minibagger', en: 'Mini excavator' },
  wl: { it: 'Pala gommata', de: 'Radlader', en: 'Wheel loader' },
  cwl: { it: 'Pala gommata compatta', de: 'Kompaktradlader', en: 'Compact wheel loader' },
  ctl: { it: 'Pala compatta cingolata', de: 'Kompakt-Raupenlader', en: 'Compact track loader' },
  hauler: { it: 'Dumper articolato', de: 'Knickgelenkter Dumper', en: 'Articulated hauler' },
  crusher: { it: 'Frantoio a urto', de: 'Prallbrecher', en: 'Impact crusher' },
  handler: { it: 'Material handler', de: 'Umschlagmaschine', en: 'Material handler' },
};

export const BRAND_IDS: BrandId[] = ['Volvo CE', 'Bobcat', 'Mecalac', 'Terex Fuchs', 'Keestrack', 'Altre'];

const f = (it: string, de: string, en: string): Tri => ({ it, de, en });

export const INVENTORY: Machine[] = [
  { slug: 'mecalac-12mxt-2016', ref: 'ZO-U-0412', name: 'Mecalac 12MXT', type: 'wex', group: 'esc', brand: 'Mecalac', cond: 'usato', year: 2016, hours: 7420, branch: 'rodengo', price: 62000, status: 'ready', added: 14, weightKg: 11900, powerKw: 75,
    features: [f('Benna multifunzione 4 in 1', 'Mehrzwecklöffel 4-in-1', '4-in-1 multi-purpose bucket'), f('Attacco rapido idraulico', 'Hydraulischer Schnellwechsler', 'Hydraulic quick coupler'), f('Omologazione stradale', 'Straßenzulassung', 'Road approval')],
    images: [mxt1, mxt2, mxt3, mxt4, mxt5, mxt6] },
  { slug: 'volvo-ec250e-2020', ref: 'ZO-U-0409', name: 'Volvo EC250E', type: 'cex', group: 'esc', brand: 'Volvo CE', cond: 'usato', year: 2020, hours: 4950, branch: 'roveri', price: 118000, status: 'reserved', added: 13, weightKg: 25500, powerKw: 129,
    features: [f('Telematica Volvo CareTrack', 'Volvo CareTrack Telematik', 'Volvo CareTrack telematics'), f('Impianto per martello', 'Hammerhydraulik', 'Breaker piping')],
    images: [ec250] },
  { slug: 'bobcat-e27z', ref: 'ZO-N-0231', name: 'Bobcat E27z', type: 'mini', group: 'mini', brand: 'Bobcat', cond: 'nuovo', year: 2026, hours: 0, branch: 'bolzano', price: 39900, status: 'ready', added: 12, weightKg: 2700, powerKw: 15,
    features: [f('Rotazione zero in sagoma', 'Zero-Heck', 'Zero tail swing'), f('Cabina chiusa', 'Geschlossene Kabine', 'Enclosed cab')],
    images: [e27] },
  { slug: 'volvo-l120h', ref: 'ZO-N-0228', name: 'Volvo L120H', type: 'wl', group: 'pale', brand: 'Volvo CE', cond: 'nuovo', year: 2026, hours: 0, branch: 'roveri', price: null, status: 'ready', added: 11, weightKg: 20300, powerKw: 200,
    features: [f('Sistema di pesatura integrato', 'Integriertes Wiegesystem', 'Integrated weighing system')],
    images: [l120] },
  { slug: 'liebherr-r914-2013', ref: 'ZO-U-0398', name: 'Liebherr R 914', type: 'cex', group: 'esc', brand: 'Altre', cond: 'usato', year: 2013, hours: 9800, branch: 'torbole', price: 54000, status: 'ready', added: 10, weightKg: 15400, powerKw: 90,
    features: [f('Sottocarro revisionato', 'Laufwerk überholt', 'Overhauled undercarriage')],
    images: [liebherr] },
  { slug: 'volvo-a30g', ref: 'ZO-N-0225', name: 'Volvo A30G', type: 'hauler', group: 'dump', brand: 'Volvo CE', cond: 'nuovo', year: 2026, hours: 0, branch: 'fornace', price: null, status: 'incoming', added: 9, weightKg: 23800, powerKw: 265,
    features: [f('Portata 28 t', 'Nutzlast 28 t', '28 t payload')],
    images: [a30] },
  { slug: 'volvo-ecr38-2015', ref: 'ZO-U-0391', name: 'Volvo ECR38', type: 'mini', group: 'mini', brand: 'Volvo CE', cond: 'usato', year: 2015, hours: 5100, branch: 'rodengo', price: 24500, status: 'ready', added: 8, weightKg: 3800, powerKw: 23,
    features: [f('Lama di livellamento', 'Planierschild', 'Dozer blade')],
    images: [ecr38] },
  { slug: 'bobcat-t76', ref: 'ZO-N-0219', name: 'Bobcat T76', type: 'ctl', group: 'pale', brand: 'Bobcat', cond: 'nuovo', year: 2026, hours: 0, branch: 'fornace', price: null, status: 'ready', added: 7, weightKg: 4700, powerKw: 55,
    features: [f('Attacco Bob-Tach', 'Bob-Tach-Aufnahme', 'Bob-Tach mounting')],
    images: [t76] },
  { slug: 'volvo-l150h-2019', ref: 'ZO-U-0386', name: 'Volvo L150H', type: 'wl', group: 'pale', brand: 'Volvo CE', cond: 'usato', year: 2019, hours: 8600, branch: 'roveri', price: 135000, status: 'ready', added: 6, weightKg: 24600, powerKw: 222,
    features: [f('Pneumatici al 60%', 'Reifen 60 %', 'Tyres at 60%')],
    images: [l150] },
  { slug: 'keestrack-r3-2019', ref: 'ZO-U-0377', name: 'Keestrack R3', type: 'crusher', group: 'fran', brand: 'Keestrack', cond: 'usato', year: 2019, hours: 3200, branch: 'rodengo', price: null, status: 'ready', added: 5, weightKg: 31000, powerKw: 210,
    features: [f('Vaglio di riciclo integrato', 'Integriertes Nachsieb', 'Integrated recirculation screen')],
    images: [r3] },
  { slug: 'bobcat-l85', ref: 'ZO-N-0211', name: 'Bobcat L85', type: 'cwl', group: 'pale', brand: 'Bobcat', cond: 'nuovo', year: 2026, hours: 0, branch: 'bolzano', price: null, status: 'incoming', added: 4, weightKg: 4500, powerKw: 45,
    features: [f('Sterzo articolato', 'Knicklenkung', 'Articulated steering')],
    images: [l85] },
  { slug: 'atlas-1304-2008', ref: 'ZO-U-0352', name: 'Atlas 1304', type: 'wex', group: 'mov', brand: 'Altre', cond: 'usato', year: 2008, hours: 11300, branch: 'torbole', price: 28500, status: 'ready', added: 3, weightKg: 14500, powerKw: 81,
    features: [f('Pinza per rottame', 'Schrottgreifer', 'Scrap grab')],
    images: [atlas] },
  { slug: 'colmar-402-2011', ref: 'ZO-U-0347', name: 'Colmar 402', type: 'handler', group: 'mov', brand: 'Altre', cond: 'usato', year: 2011, hours: 10400, branch: 'torbole', price: null, status: 'ready', added: 2, weightKg: 22000, powerKw: 104,
    features: [f('Braccio lungo da movimentazione', 'Langer Umschlagausleger', 'Long handling boom')],
    images: [colmar] },
  { slug: 'terex-fuchs-mhl320', ref: 'ZO-N-0204', name: 'Terex Fuchs MHL320', type: 'handler', group: 'mov', brand: 'Terex Fuchs', cond: 'nuovo', year: 2026, hours: 0, branch: 'rodengo', price: null, status: 'ready', added: 1, weightKg: 21500, powerKw: 129,
    features: [f('Cabina elevabile', 'Hochfahrbare Kabine', 'Elevating cab')],
    images: [mhl] },
];

/** Referente per marca e sede, dalla pagina contatti del sito attuale. */
export function contactFor(m: Machine): { name: string; role: Tri } | null {
  const trentino = m.branch === 'fornace' || m.branch === 'bolzano';
  if (m.branch === 'bolzano') return { name: 'Thomas Mitterhofer', role: { it: 'Sede di Bolzano', de: 'Standort Bozen', en: 'Bolzano branch' } };
  if (m.brand === 'Volvo CE') return trentino ? { name: 'Gianluigi Palmieri', role: { it: 'Volvo CE · Trento', de: 'Volvo CE · Trient', en: 'Volvo CE · Trento' } } : { name: 'Antonio Zanon', role: { it: 'Referente Volvo CE', de: 'Ansprechpartner Volvo CE', en: 'Volvo CE contact' } };
  if (m.brand === 'Bobcat') return trentino ? { name: 'Alex Voyat', role: { it: 'Bobcat · Trento', de: 'Bobcat · Trient', en: 'Bobcat · Trento' } } : { name: 'Attilio Zanon', role: { it: 'Referente Bobcat', de: 'Ansprechpartner Bobcat', en: 'Bobcat contact' } };
  if (m.brand === 'Mecalac' || m.brand === 'Terex Fuchs') return { name: 'Luca Lovera', role: { it: 'Referente Mecalac e Terex Fuchs', de: 'Ansprechpartner Mecalac und Terex Fuchs', en: 'Mecalac and Terex Fuchs contact' } };
  return null;
}
