import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '@/locales/en.json';
import arTranslations from '@/locales/ar.json';

export type Language = 'en' | 'ar';

const LANGUAGE_STORAGE_KEY = 'app-language';
const DEFAULT_LANGUAGE: Language = 'en';

// Get initial language from localStorage or use default
const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === 'en' || saved === 'ar') {
    return saved;
  }
  return DEFAULT_LANGUAGE;
};

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ar: { translation: arTranslations },
    },
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    ns: ['translation'],
    defaultNS: 'translation',
  });

// Update document attributes when language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

export default i18n;
