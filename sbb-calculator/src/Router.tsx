import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Visitors from './Visitors';

// The language pages (/de/, /fr/, /it/) are static files written by scripts/prerender.mjs;
// App reads the language from the URL (see utils/detectLanguage.ts).
const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/visitors" element={<Visitors />} />
        {['de', 'fr', 'it'].map((lang) => (
          <Route key={lang} path={`/${lang}`} element={<App />} />
        ))}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
