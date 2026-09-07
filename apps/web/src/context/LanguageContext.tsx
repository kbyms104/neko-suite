import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['ko'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('neko_suite_lang');
    if (saved === 'ko' || saved === 'en') return saved;
    // 브라우저 기본 언어가 한국어가 아니면 영어 기본값
    if (typeof navigator !== 'undefined' && !navigator.language.startsWith('ko')) {
      return 'en';
    }
    return 'ko';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('neko_suite_lang', newLang);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
