import { LANGS, type Lang } from './ui';

/** Language-independent page paths. Every page exists in every language under /{lang}{path}. */
export const PATHS = {
  home: '/',
  stock: '/macchine/',
  rental: '/noleggio/',
  privacy: '/privacy/',
} as const;

export const machinePath = (slug: string) => `/macchine/${slug}/`;

export function localize(lang: Lang, path: string) {
  return `/${lang}${path.startsWith('/') ? path : '/' + path}`;
}

export function alternates(path: string) {
  return LANGS.map((l) => ({ lang: l, href: localize(l, path) }));
}

export function isLang(v: string | undefined): v is Lang {
  return !!v && (LANGS as readonly string[]).includes(v);
}

export const langPaths = () => LANGS.map((lang) => ({ params: { lang } }));
