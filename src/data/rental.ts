/*
 * Flotta a noleggio. Le tariffe giornaliere sono ESEMPI da sostituire con il listino reale.
 * Settimana e mese si calcolano da `day` con gli sconti in WEEK_FACTOR e MONTH_FACTOR.
 */
import type { ImageMetadata } from 'astro';
import type { Tri, UiKey } from '../i18n/ui';
import e27 from '../assets/img/m-bobcat-mini.jpg';
import mwr from '../assets/img/brand-mecalac.jpg';
import ec250 from '../assets/img/brand-volvo.jpg';
import t76 from '../assets/img/brand-bobcat.jpg';
import t870 from '../assets/img/bc-t870.jpg';
import l85 from '../assets/img/bc-l85.jpg';
import l120 from '../assets/img/m-pala.jpg';
import tl from '../assets/img/bc-tele.jpg';
import a30 from '../assets/img/m-dumper.jpg';
import ct from '../assets/img/bc-tractor.jpg';

export type RentCat = 'esc' | 'pale' | 'lift' | 'trans' | 'green';
/** Type used by the quick rental form on the home page. */
export type RentType = 'mini' | 'esc' | 'compact' | 'wheel' | 'tele' | 'dumper';

export interface RentMachine {
  id: string;
  name: string;
  cls: Tri;
  cat: RentCat;
  type: RentType;
  day: number;
  img: ImageMetadata;
}

export const WEEK_FACTOR = 5 * 0.85;
export const MONTH_FACTOR = 20 * 0.7;

export const RENT_CATS: { id: 'all' | RentCat; key: UiKey }[] = [
  { id: 'all', key: 'rcAll' },
  { id: 'esc', key: 'rcEsc' },
  { id: 'pale', key: 'rcPale' },
  { id: 'lift', key: 'rcLift' },
  { id: 'trans', key: 'rcTrans' },
  { id: 'green', key: 'rcGreen' },
];

export const RENT_TYPES: { id: RentType; key: UiKey }[] = [
  { id: 'mini', key: 'rtMini' },
  { id: 'esc', key: 'rtEsc' },
  { id: 'compact', key: 'rtCompact' },
  { id: 'wheel', key: 'rtWheel' },
  { id: 'tele', key: 'rtTele' },
  { id: 'dumper', key: 'rtDump' },
];

export const FLEET: RentMachine[] = [
  { id: 'e27', name: 'Bobcat E27z', cls: { it: 'Mini escavatore 2,7 t', de: 'Minibagger 2,7 t', en: 'Mini excavator 2.7 t' }, cat: 'esc', type: 'mini', day: 95, img: e27 },
  { id: 'mwr', name: 'Mecalac MWR', cls: { it: 'Escavatore gommato', de: 'Mobilbagger', en: 'Wheeled excavator' }, cat: 'esc', type: 'esc', day: 240, img: mwr },
  { id: 'ec250', name: 'Volvo EC250E', cls: { it: 'Escavatore cingolato 25 t', de: 'Kettenbagger 25 t', en: 'Crawler excavator 25 t' }, cat: 'esc', type: 'esc', day: 390, img: ec250 },
  { id: 't76', name: 'Bobcat T76', cls: { it: 'Pala compatta cingolata', de: 'Kompakt-Raupenlader', en: 'Compact track loader' }, cat: 'pale', type: 'compact', day: 180, img: t76 },
  { id: 't870', name: 'Bobcat T870', cls: { it: 'Pala compatta cingolata', de: 'Kompakt-Raupenlader', en: 'Compact track loader' }, cat: 'pale', type: 'compact', day: 230, img: t870 },
  { id: 'l85', name: 'Bobcat L85', cls: { it: 'Pala gommata compatta', de: 'Kompaktradlader', en: 'Compact wheel loader' }, cat: 'pale', type: 'wheel', day: 160, img: l85 },
  { id: 'l120', name: 'Volvo L120H', cls: { it: 'Pala gommata', de: 'Radlader', en: 'Wheel loader' }, cat: 'pale', type: 'wheel', day: 420, img: l120 },
  { id: 'tl', name: 'Bobcat TL38.70', cls: { it: 'Telescopico 3,8 t', de: 'Teleskoplader 3,8 t', en: 'Telehandler 3.8 t' }, cat: 'lift', type: 'tele', day: 190, img: tl },
  { id: 'a30', name: 'Volvo A30G', cls: { it: 'Dumper articolato', de: 'Knickgelenkter Dumper', en: 'Articulated hauler' }, cat: 'trans', type: 'dumper', day: 520, img: a30 },
  { id: 'ct', name: 'Bobcat CT', cls: { it: 'Trattore compatto', de: 'Kompakttraktor', en: 'Compact tractor' }, cat: 'green', type: 'compact', day: 110, img: ct },
];

export const EXTRAS: { id: string; key: UiKey; day: number }[] = [
  { id: 'bucket', key: 'xBucket', day: 15 },
  { id: 'hammer', key: 'xHammer', day: 45 },
  { id: 'cover', key: 'xCover', day: 12 },
];

export const STEPS: { h: Tri; p: Tri }[] = [
  { h: { it: 'Scegli macchina e date', de: 'Maschine und Zeitraum wählen', en: 'Pick machine and dates' }, p: { it: 'Vedi subito una stima del costo, accessori inclusi.', de: 'Sie sehen sofort eine Kostenschätzung mit Zubehör.', en: 'You see a cost estimate right away, extras included.' } },
  { h: { it: 'Confermiamo per telefono', de: 'Wir bestätigen telefonisch', en: 'We confirm by phone' }, p: { it: 'Verifichiamo la disponibilità nella sede più vicina e ti diamo il prezzo definitivo.', de: 'Wir prüfen die Verfügbarkeit am nächsten Standort und nennen den Endpreis.', en: 'We check availability at the nearest branch and give you the final price.' } },
  { h: { it: 'Consegna o ritiro', de: 'Lieferung oder Abholung', en: 'Delivery or pick-up' }, p: { it: 'Portiamo la macchina in cantiere o la ritiri in sede, pronta e controllata.', de: 'Wir liefern auf die Baustelle oder Sie holen die geprüfte Maschine ab.', en: 'We deliver to site or you pick up the checked machine at the branch.' } },
];

export const FAQ: { q: Tri; a: Tri }[] = [
  { q: { it: 'Come funziona la consegna?', de: 'Wie funktioniert die Lieferung?', en: 'How does delivery work?' }, a: { it: 'Portiamo la macchina in cantiere con i nostri mezzi oppure la ritiri in una delle cinque sedi. Il costo del trasporto dipende dalla distanza.', de: 'Wir bringen die Maschine mit eigenen Fahrzeugen auf die Baustelle, oder Sie holen sie an einem der fünf Standorte ab. Die Transportkosten hängen von der Entfernung ab.', en: 'We bring the machine to site with our own trucks, or you pick it up at one of the five branches. Transport cost depends on distance.' } },
  { q: { it: 'Cosa succede se la macchina si ferma?', de: 'Was passiert bei einem Ausfall?', en: 'What if the machine breaks down?' }, a: { it: 'Chiami la sede da cui hai noleggiato: interviene l’officina Zanon & Ormac più vicina.', de: 'Rufen Sie den Mietstandort an: Die nächste Zanon & Ormac-Werkstatt kommt.', en: 'Call the branch you rented from: the nearest Zanon & Ormac workshop steps in.' } },
  { q: { it: 'Posso noleggiare per un solo giorno?', de: 'Kann ich für einen Tag mieten?', en: 'Can I rent for a single day?' }, a: { it: 'Sì. Per noleggi a settimana o a mese la tariffa giornaliera scende.', de: 'Ja. Bei Wochen- oder Monatsmiete sinkt der Tagespreis.', en: 'Yes. Weekly and monthly rentals lower the daily rate.' } },
  { q: { it: 'Serve un’abilitazione per usare le macchine?', de: 'Braucht man einen Befähigungsnachweis?', en: 'Do operators need a licence?' }, a: { it: 'Per molte macchine movimento terra serve l’abilitazione dell’operatore prevista dall’Accordo Stato-Regioni. Ti diciamo cosa serve per la macchina che scegli.', de: 'Für viele Erdbaumaschinen ist in Italien ein Befähigungsnachweis nach dem Accordo Stato-Regioni nötig. Wir sagen Ihnen, was für Ihre Maschine gilt.', en: 'Many earthmoving machines require the operator qualification set by Italy’s State-Regions Agreement. We tell you what your machine needs.' } },
];
