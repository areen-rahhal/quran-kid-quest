import { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language } from '@/config/i18n';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  isArabic: boolean;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  const language = (i18n.language === 'ar' ? 'ar' : 'en') as Language;

  const value: LanguageContextType = {
    language,
    toggleLanguage,
    setLanguage,
    isArabic: language === 'ar',
    isEnglish: language === 'en',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
