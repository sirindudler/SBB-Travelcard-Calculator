import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Info from './Info';
import { Language } from './translations';

const AppWrapper: React.FC = () => {
  // Detect browser language with English fallback
  const detectBrowserLanguage = (): Language => {
    const browserLanguages = navigator.languages || [navigator.language];
    const supportedLanguages: Language[] = ['en', 'de', 'fr', 'it', 'rm'];

    for (const browserLang of browserLanguages) {
      const langCode = browserLang.split('-')[0].toLowerCase() as Language;
      if (supportedLanguages.includes(langCode)) {
        return langCode;
      }
    }
    return 'en';
  };

  const [language] = useState<Language>(detectBrowserLanguage());

  return (
    <Routes>
      <Route
        path="/"
        element={<App />}
      />
      <Route
        path="/info"
        element={<Info language={language} />}
      />
    </Routes>
  );
};

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
};

export default Router;