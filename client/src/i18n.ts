import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define available namespaces for better organization
export const namespaces = {
  common: 'common',
  flights: 'flights',
  airports: 'airports',
  map: 'map',
  auth: 'auth',
  subscription: 'subscription',
  history: 'history',
};

// Define supported languages
export const supportedLanguages = {
  en: { name: 'English', flag: '🇺🇸', dir: 'ltr' },
  fr: { name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  es: { name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  zh: { name: '中文', flag: '🇨🇳', dir: 'ltr' },
  ar: { name: 'العربية', flag: '🇦🇪', dir: 'rtl' }, // Arabic with RTL support
  ja: { name: '日本語', flag: '🇯🇵', dir: 'ltr' },   // Japanese
  de: { name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },  // German
  ru: { name: 'Русский', flag: '🇷🇺', dir: 'ltr' },  // Russian
};

// Determine language direction (LTR or RTL)
export const getLanguageDir = (language: string): 'ltr' | 'rtl' => {
  const langSettings = supportedLanguages[language as keyof typeof supportedLanguages];
  return langSettings && langSettings.dir === 'rtl' ? 'rtl' : 'ltr';
};

// Initialize i18next with proper type casting to fix LSP issues
const i18nInstance = i18n
  // Load translations from /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next);

// Initialize i18n with proper configuration type for detection
i18nInstance.init({
  // Default language
  fallbackLng: 'en',
  // Debug mode in development only
  debug: import.meta.env.DEV,
  // Namespace(s) for translations - load all by default
  ns: Object.values(namespaces),
  defaultNS: namespaces.common,
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
    // Check cookie first, then browser settings, then HTML lang attribute
    order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
    // Look for 'i18nextLng' in localStorage
    lookupLocalStorage: 'i18nextLng',
    lookupCookie: 'i18next',
    lookupQuerystring: 'lng',
    // Cache user language in cookie and localStorage for persistence
    caches: ['localStorage', 'cookie'],
    // Cookie settings
    cookieSameSite: 'lax',
    // Set expiration to 1 year
    cookieExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString(),
    // Used to exclude languages
    excludeCacheFor: ['cimode'],
  }
});

// Function to set document dir attribute based on language direction
export const setDocumentDirection = (language: string) => {
  const dir = getLanguageDir(language);
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
  
  // Add RTL class if needed for styling
  if (dir === 'rtl') {
    document.documentElement.classList.add('rtl');
  } else {
    document.documentElement.classList.remove('rtl');
  }
};

// Set initial document direction on load
setDocumentDirection(i18n.language);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
});

export default i18n;