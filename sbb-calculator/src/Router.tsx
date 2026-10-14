import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';

// The language pages (/de/, /fr/, /it/) are static files written by scripts/prerender.mjs;
// App reads the language from the URL (see utils/detectLanguage.ts).
const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {['de', 'fr', 'it'].map((lang) => (
          <Route key={lang} path={`/${lang}`} element={<App />} />
        ))}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
