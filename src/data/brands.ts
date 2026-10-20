import type { ImageMetadata } from 'astro';
import type { Tri } from '../i18n/ui';
import quarry from '../assets/img/quarry.jpg';
import bobcat from '../assets/img/brand-bobcat.jpg';
import mecalac from '../assets/img/brand-mecalac.jpg';
import fuchs from '../assets/img/brand-fuchs.jpg';
import keestrack from '../assets/img/brand-keestrack.jpg';

export interface Brand {
  id: string;
  name: string;
  /** Matches Machine.brand, used to pre-filter the catalog. */
  filter: string;
  cats: Tri;
  area: Tri;
  text: Tri;
  img: ImageMetadata;
}

export const BRANDS: Brand[] = [
  {
    id: 'volvo', name: 'Volvo CE', filter: 'Volvo CE', img: quarry,
    cats: { it: 'Escavatori · pale gommate · dumper articolati', de: 'Bagger · Radlader · knickgelenkte Dumper', en: 'Excavators · wheel loaders · articulated haulers' },
    area: { it: 'Bergamo, Cremona, Trentino-Alto Adige', de: 'Bergamo, Cremona, Trentino-Südtirol', en: 'Bergamo, Cremona, Trentino-South Tyrol' },
    text: { it: 'Gamma completa Volvo Construction Equipment, dalla compatta alla cava, con assistenza e ricambi originali.', de: 'Das komplette Volvo-Programm, von der Kompaktmaschine bis zum Steinbruch, mit Service und Originalteilen.', en: 'The full Volvo Construction Equipment range, from compact to quarry, with service and genuine parts.' },
  },
  {
    id: 'bobcat', name: 'Bobcat', filter: 'Bobcat', img: bobcat,
    cats: { it: 'Mini escavatori · pale compatte · telescopici · trattori · carrelli', de: 'Minibagger · Kompaktlader · Teleskoplader · Traktoren · Stapler', en: 'Mini excavators · compact loaders · telehandlers · tractors · forklifts' },
    area: { it: 'Trentino-Alto Adige, in esclusiva dal 2023', de: 'Trentino-Südtirol, exklusiv seit 2023', en: 'Trentino-South Tyrol, exclusive since 2023' },
    text: { it: 'Macchine compatte per edilizia, verde e agricoltura, anche a noleggio.', de: 'Kompaktmaschinen für Bau, Garten- und Landschaftsbau und Landwirtschaft, auch zur Miete.', en: 'Compact machines for construction, landscaping and farming, also for rent.' },
  },
  {
    id: 'mecalac', name: 'Mecalac', filter: 'Mecalac', img: mecalac,
    cats: { it: 'Escavatori gommati e compatti', de: 'Mobil- und Kompaktbagger', en: 'Wheeled and compact excavators' },
    area: { it: 'Lombardia', de: 'Lombardei', en: 'Lombardy' },
    text: { it: 'Escavatori pensati per il cantiere urbano: compatti e veloci tra un lavoro e l’altro.', de: 'Bagger für die Stadtbaustelle: kompakt und schnell zwischen den Einsätzen.', en: 'Excavators built for urban sites: compact and quick between jobs.' },
  },
  {
    id: 'fuchs', name: 'Terex Fuchs', filter: 'Terex Fuchs', img: fuchs,
    cats: { it: 'Material handler', de: 'Umschlagmaschinen', en: 'Material handlers' },
    area: { it: 'Lombardia', de: 'Lombardei', en: 'Lombardy' },
    text: { it: 'Movimentazione per rottame, legname e porti, su gomma, cingoli o fissa.', de: 'Umschlag für Schrott, Holz und Häfen, auf Rädern, Ketten oder stationär.', en: 'Handling for scrap, timber and ports, on wheels, tracks or stationary.' },
  },
  {
    id: 'keestrack', name: 'Keestrack', filter: 'Keestrack', img: keestrack,
    cats: { it: 'Frantoi e vagli mobili', de: 'Mobile Brecher und Siebanlagen', en: 'Mobile crushers and screens' },
    area: { it: 'Lombardia', de: 'Lombardei', en: 'Lombardy' },
    text: { it: 'Impianti mobili di frantumazione e vagliatura per inerti e riciclaggio.', de: 'Mobile Brech- und Siebanlagen für Zuschlagstoffe und Recycling.', en: 'Mobile crushing and screening for aggregates and recycling.' },
  },
];
