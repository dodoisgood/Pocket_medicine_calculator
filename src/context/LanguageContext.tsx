/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Language =
  | 'zh'
  | 'zh_hans'
  | 'en'
  | 'es'
  | 'hi'
  | 'ar'
  | 'pt'
  | 'bn'
  | 'ru'
  | 'ja'
  | 'pa';

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = {
  zh: {
    'app.title': 'Pocket MedCalc',
    'app.tagline': '全球內科臨床醫學計算機',
    'app.subtitle': '專為內科醫護人員設計的高階臨床計算與風險評估工具',
    // Additional Traditional Chinese keys can be added here
  },
  zh_hans: {
    // Simplified Chinese overrides; fallback to zh if empty
    // Example: 'app.title': 'Pocket MedCalc',
  },
  en: {
    'app.title': 'Pocket MedCalc',
    'app.tagline': 'Global Top‑10 Clinical Calculator',
    'app.subtitle': 'Advanced clinical calculations and risk assessments for internal medicine professionals',
    // Additional English keys can be added here
  },
  es: {},
  hi: {},
  ar: {},
  pt: {},
  bn: {},
  ru: {},
  ja: {},
  pa: {},
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tl: (obj: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const stored = localStorage.getItem('language') as Language | null;
  const [language, setLanguageState] = useState<Language>(stored ?? 'zh');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] ?? translations.en[key] ?? key;
  };

  const tl = (obj: Record<string, string>): string => {
    if (!obj) return '';
    // Prefer exact language, then fallback to Traditional Chinese for Simplified, then English
    if (obj[language]) {
      return obj[language];
    }
    if (language === 'zh_hans' && obj['zh']) {
      return obj['zh'];
    }
    return obj['en'] ?? '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
