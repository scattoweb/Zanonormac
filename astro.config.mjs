import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zanormac.net',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('zanormac.net/'),
      i18n: { defaultLocale: 'it', locales: { it: 'it-IT', de: 'de-DE', en: 'en-GB' } },
    }),
  ],
});
