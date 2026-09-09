'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LANGUAGES, t as translate } from '../lib/translations';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
  languages: LANGUAGES,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('nawi_lang');
    if (saved && translations[saved]) {
      setLangState(saved);
    }
  }, []);

  const setLang = (code) => {
    setLangState(code);
    localStorage.setItem('nawi_lang', code);
  };

  const t = (key) => translate(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
