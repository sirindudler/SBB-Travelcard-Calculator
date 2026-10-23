// Post-build step: turns dist/index.html into static, crawlable pages.
//
// GitHub Pages serves static files only, so every language would share one English <head>.
// This writes real files for /de/, /fr/, /it/ and the /visitors/ guide (own title, description,
// canonical, static content) plus a 404.html SPA fallback.
//
// Usage: node scripts/prerender.mjs [distDir]   (default: dist)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const distDir = process.argv[2] ?? 'dist';
const SITE = 'https://travelcards.ch';
const template = readFileSync(join(distDir, 'index.html'), 'utf-8');

const pages = {
  de: {
    htmlLang: 'de',
    locale: 'de_CH',
    title: 'GA oder Halbtax? Abo-Rechner Schweiz | Travelcards.ch',
    description:
      'Kostenloser Abo-Rechner: Vergleiche GA, Halbtax und Halbtax Plus mit deinen Strecken und sieh sofort, was sich lohnt. Ohne Anmeldung, ohne Werbung.',
    h1: 'Schweizer Abo-Vergleichsrechner',
    body: 'Vergleiche GA, Halbtax, Halbtax Plus und kein Abo anhand deiner eigenen Fahrten und finde heraus, welches öV-Abo in der Schweiz für dich am günstigsten ist. Kostenlos, ohne Werbung, ohne Anmeldung.',
  },
  fr: {
    htmlLang: 'fr',
    locale: 'fr_CH',
    title: "AG ou demi-tarif ? Calculateur d'abonnements | Travelcards.ch",
    description:
      'Calculateur gratuit : comparez AG, demi-tarif et demi-tarif Plus selon vos trajets et voyez ce qui vous convient. Sans inscription, sans publicité.',
    h1: "Calculateur de comparaison d'abonnements suisses",
    body: "Comparez l'AG, le demi-tarif, le demi-tarif Plus et l'absence d'abonnement selon vos propres trajets et découvrez l'abonnement le plus avantageux pour vous. Gratuit, sans publicité, sans inscription.",
  },
  it: {
    htmlLang: 'it',
    locale: 'it_CH',
    title: 'AG o metà-prezzo? Calcolatore abbonamenti | Travelcards.ch',
    description:
      'Calcolatore gratuito: confronta AG, metà-prezzo e metà-prezzo Plus in base ai tuoi viaggi e scopri cosa conviene. Senza registrazione, senza pubblicità.',
    h1: 'Calcolatore di confronto abbonamenti svizzeri',
    body: "Confronta AG, metà-prezzo, metà-prezzo Plus e nessun abbonamento in base ai tuoi viaggi e scopri quale abbonamento conviene di più. Gratuito, senza pubblicità, senza registrazione.",
  },
};

// Client-side routes that need their own static page
const routePages = {
  visitors: {
    htmlLang: 'en',
    locale: 'en_CH',
    title: 'Switzerland Travel Pass Guide for Visitors: Swiss Travel Pass, Half Fare Card & Interrail | Travelcards.ch',
    description:
      'Visiting Switzerland? Find out which train ticket to buy: Swiss Travel Pass, Swiss Half Fare Card, Saver Day Pass or Interrail. Free pass finder with 2026 prices and tips for tourists.',
    h1: 'Visiting Switzerland? Which train ticket to buy',
    body: 'A simple guide to the Swiss Travel Pass, the Swiss Half Fare Card, Interrail and how public transport works in Switzerland, with a free pass finder that estimates what each option costs for your trip.',
  },
};

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const replaceOnce = (html, pattern, replacement) => {
  if (!pattern.test(html)) {
    throw new Error(`prerender: pattern not found in index.html: ${pattern}`);
  }
  return html.replace(pattern, () => replacement);
};

// Replaces the middle of a `(prefix)value(suffix)` match, e.g. a meta tag's content attribute.
const setValue = (html, pattern, value) => {
  if (!pattern.test(html)) {
    throw new Error(`prerender: pattern not found in index.html: ${pattern}`);
  }
  return html.replace(pattern, (_, prefix, suffix) => `${prefix}${value}${suffix}`);
};

const render = (page, path) => {
  const url = `${SITE}${path}`;
  let html = template;
  html = replaceOnce(html, /<html lang="[^"]*">/, `<html lang="${page.htmlLang}">`);
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeText(page.title)}</title>`);
  html = setValue(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, escapeAttr(page.description));
  html = setValue(html, /(<meta property="og:title" content=")[^"]*(")/, escapeAttr(page.title));
  html = setValue(html, /(<meta property="og:description" content=")[^"]*(")/, escapeAttr(page.description));
  html = setValue(html, /(<meta property="og:url" content=")[^"]*(")/, url);
  html = setValue(html, /(<meta property="og:locale" content=")[^"]*(")/, page.locale);
  html = setValue(html, /(<meta name="twitter:title" content=")[^"]*(")/, escapeAttr(page.title));
  html = setValue(html, /(<meta name="twitter:description" content=")[^"]*(")/, escapeAttr(page.description));
  html = setValue(html, /(<link rel="canonical" href=")[^"]*(")/, url);

  html = html.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
    (_, open, json, close) => {
      const data = JSON.parse(json);
      data.url = url;
      data.description = page.description;
      const indented = JSON.stringify(data, null, 2).replace(/\n/g, '\n    ');
      return `${open}\n    ${indented}\n    ${close}`;
    }
  );

  html = replaceOnce(
    html,
    /<div id="root">[\s\S]*?<\/main>\s*<\/div>/,
    `<div id="root">
      <main style="max-width:42rem;margin:0 auto;padding:1.5rem;font-family:Inter,system-ui,sans-serif">
        <h1>${escapeText(page.h1)}</h1>
        <p>${escapeText(page.body)}</p>
      </main>
    </div>`
  );
  return html;
};

const write = (relPath, html) => {
  const full = join(distDir, relPath);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, html);
  console.log(`prerender: wrote ${relPath}`);
};

for (const [lang, page] of Object.entries(pages)) {
  write(`${lang}/index.html`, render(page, `/${lang}/`));
}
for (const [route, page] of Object.entries(routePages)) {
  write(`${route}/index.html`, render(page, `/${route}/`));
}
write('404.html', template);
