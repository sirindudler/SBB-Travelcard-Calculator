import { Language } from '../translations';

const supportedLanguages: Language[] = ['en', 'de', 'fr', 'it', 'rm'];

// Language pages are served from /de/, /fr/ and /it/ (see scripts/prerender.mjs).
// The URL wins over the browser language so that search results land in the right language.
export const detectLanguage = (): Language => {
  const pathLang = window.location.pathname.split('/')[1]?.toLowerCase() as Language;
  if (supportedLanguages.includes(pathLang)) {
    return pathLang;
  }

  const browserLanguages = navigator.languages || [navigator.language];
  for (const browserLang of browserLanguages) {
    const langCode = browserLang.split('-')[0].toLowerCase() as Language;
    if (supportedLanguages.includes(langCode)) {
      return langCode;
    }
  }
  return 'en';
};
