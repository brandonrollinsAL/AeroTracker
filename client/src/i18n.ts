import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18next
i18n
  // Load translations from /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18n
  .init({
    // Default language
    fallbackLng: 'en',
    // Debug mode in development only
    debug: import.meta.env.DEV,
    // Namespace(s) for translations
    ns: ['translation'],
    defaultNS: 'translation',
    // Path to load translations from
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // Allow keys to be organized with dots like 'header.profile'
    keySeparator: '.',
    interpolation: {
      // React already protects from XSS
      escapeValue: false,
    },
    // React settings
    react: {
      useSuspense: true,
    },
    // Detect languages using multiple methods
    detection: {
      // Order of methods to detect language
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Look for 'i18nextLng' in localStorage
      lookupLocalStorage: 'i18nextLng',
      // Cache user language in localStorage
      caches: ['localStorage'],
      // Used to exclude languages
      excludeCacheFor: ['cimode'],
    }
  });

export default i18n;