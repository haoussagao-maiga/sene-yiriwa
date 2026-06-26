/**
 * Configuration i18n - Sènè Yiriwa
 * 
 * Ce fichier configure le système d'internationalisation (i18n) pour
 * l'application Sènè Yiriwa. Il gère le chargement des traductions,
 * la détection de la langue, la persistance des préférences et
 * l'initialisation du système de traduction.
 * 
 * Fonctionnalités :
 * - Configuration de i18next et react-i18next
 * - Détection automatique de la langue du téléphone
 * - Persistance du choix de langue (AsyncStorage)
 * - Support du bambara (langue locale du Mali)
 * - Support du français (langue officielle)
 * - Fallback vers le français
 * - Mise à jour dynamique des traductions
 * 
 * @module i18n/index
 */

import * as React from 'react';
import i18n, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import fr from './locales/fr';
import bm from './locales/bm';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Langues supportées par l'application
 */
export type SupportedLanguage = 'fr' | 'bm';

/**
 * Interface pour les ressources de traduction
 */
interface TranslationResources extends Resource {
  fr: {
    translation: typeof fr;
  };
  bm: {
    translation: typeof bm;
  };
}

/**
 * Interface pour la configuration de langue
 */
interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Clé de stockage pour la langue préférée
 */
const STORAGE_KEY_LANGUAGE = '@app_language';

/**
 * Langue par défaut de l'application
 */
const DEFAULT_LANGUAGE: SupportedLanguage = 'fr';

/**
 * Configuration des langues supportées
 */
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },
  {
    code: 'bm',
    name: 'Bambara',
    nativeName: 'Bamanankan',
    flag: '🌾',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },
];

/**
 * Mappage des codes de langue
 */
export const LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  fr: 'fr',
  bm: 'bm',
};

/**
 * Détection de la langue système
 * 
 * @returns Langue système ou langue par défaut
 */
export const getSystemLanguage = (): SupportedLanguage => {
  try {
    const locales = Localization.getLocales?.() ?? [];
    const languageCode = (locales[0]?.languageCode ?? DEFAULT_LANGUAGE).toLowerCase();

    if (languageCode === 'fr') return 'fr';
    if (languageCode === 'bm') return 'bm';

    return DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('[i18n] Erreur détection langue système:', error);
    return DEFAULT_LANGUAGE;
  }
};

/**
 * Sauvegarde la langue dans AsyncStorage
 * 
 * @param language - Langue à sauvegarder
 */
export const saveLanguagePreference = async (language: SupportedLanguage): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_LANGUAGE, language);
    if (__DEV__) {
      console.log(`[i18n] Langue sauvegardée: ${language}`);
    }
  } catch (error) {
    console.error('[i18n] Erreur sauvegarde langue:', error);
  }
};

/**
 * Charge la langue préférée depuis AsyncStorage
 * 
 * @returns Langue préférée ou null si non trouvée
 */
export const loadLanguagePreference = async (): Promise<SupportedLanguage | null> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'bm')) {
      return savedLanguage;
    }
    return null;
  } catch (error) {
    console.error('[i18n] Erreur chargement langue:', error);
    return null;
  }
};

/**
 * Initialise la langue de l'application
 * Priorité: 1. Langue sauvegardée, 2. Langue système, 3. Langue par défaut
 * 
 * @returns Langue initiale
 */
export const initializeLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const savedLanguage = await loadLanguagePreference();
    if (savedLanguage === 'bm') {
      if (__DEV__) console.log('[i18n] Utilisation langue sauvegardée: bm');
      return 'bm';
    }

    if (__DEV__) console.log(`[i18n] Utilisation du français par défaut`);
    return DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('[i18n] Erreur initialisation langue:', error);
    return DEFAULT_LANGUAGE;
  }
};

/**
 * Obtient la configuration complète d'une langue
 * 
 * @param languageCode - Code de la langue
 * @returns Configuration de la langue ou configuration par défaut
 */
export const getLanguageConfig = (languageCode: SupportedLanguage): LanguageConfig => {
  const config = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
  return config || SUPPORTED_LANGUAGES[0];
};

/**
 * Vérifie si une langue est supportée
 * 
 * @param languageCode - Code de la langue à vérifier
 * @returns true si la langue est supportée
 */
export const isLanguageSupported = (languageCode: string): boolean => {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode);
};

/**
 * Change la langue de l'application
 * 
 * @param language - Nouvelle langue
 * @returns Promise avec succès ou échec
 */
export const changeLanguage = async (language: SupportedLanguage): Promise<boolean> => {
  try {
    // Sauvegarder la préférence
    await saveLanguagePreference(language);
    
    // Changer la langue dans i18next
    await i18n.changeLanguage(language);
    
    if (__DEV__) {
      console.log(`[i18n] Langue changée vers: ${language}`);
    }
    
    return true;
  } catch (error) {
    console.error('[i18n] Erreur changement langue:', error);
    return false;
  }
};

/**
 * Obtient la langue actuelle
 * 
 * @returns Code de la langue actuelle
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  const currentLang = i18n.language;
  if (currentLang === 'bm' || currentLang === 'fr') {
    return currentLang;
  }
  return DEFAULT_LANGUAGE;
};

/**
 * Obtient le nom complet de la langue actuelle
 * 
 * @returns Nom de la langue
 */
export const getCurrentLanguageName = (): string => {
  const lang = getCurrentLanguage();
  const config = getLanguageConfig(lang);
  return config.name;
};

/**
 * Traduit une date selon la langue actuelle
 * 
 * @param date - Date à formater
 * @param format - Format souhaité (par défaut: 'date')
 * @returns Date formatée
 */
export const formatDate = (date: Date, format: 'date' | 'time' | 'datetime' = 'date'): string => {
  const lang = getCurrentLanguage();
  const config = getLanguageConfig(lang);
  
  const options: Intl.DateTimeFormatOptions = {};
  
  if (format === 'date') {
    options.year = 'numeric';
    options.month = 'long';
    options.day = 'numeric';
  } else if (format === 'time') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  } else {
    options.year = 'numeric';
    options.month = 'long';
    options.day = 'numeric';
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat(lang === 'bm' ? 'fr' : lang, options).format(date);
};

/**
 * Traduit un nombre selon la langue actuelle
 * 
 * @param number - Nombre à formater
 * @param options - Options de formatage
 * @returns Nombre formaté
 */
export const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
  const lang = getCurrentLanguage();
  return new Intl.NumberFormat(lang === 'bm' ? 'fr' : lang, options).format(number);
};

/**
 * Objet de ressources de traduction
 */
const resources: TranslationResources = {
  fr: {
    translation: fr,
  },
  bm: {
    translation: bm,
  },
};

/**
 * Configuration i18next
 */
const initI18n = async (): Promise<void> => {
  try {
    // Récupérer la langue initiale
    const initialLanguage = await initializeLanguage();
    
    // Configuration i18next
    i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v4', // Compatibilité avec React Native
        resources,
        lng: initialLanguage,
        fallbackLng: DEFAULT_LANGUAGE,
        interpolation: {
          escapeValue: false, // React gère déjà l'échappement
        },
        react: {
          useSuspense: false,
        },
        debug: __DEV__,
      });
    
    // Écouter les changements de langue pour sauvegarder
    i18n.on('languageChanged', (language: string) => {
      if (isLanguageSupported(language)) {
        saveLanguagePreference(language as SupportedLanguage);
      }
    });
    
    if (__DEV__) {
      console.log(`[i18n] Initialisation réussie avec la langue: ${initialLanguage}`);
    }
  } catch (error) {
    console.error('[i18n] Erreur initialisation:', error);
  }
};

// ============================================
// HOOKS PERSONNALISÉS
// ============================================

/**
 * Hook personnalisé pour la gestion de la langue
 * 
 * @example
 * const { currentLanguage, changeLanguage, t } = useAppTranslation();
 * 
 * // Changer la langue
 * await changeLanguage('bm');
 */
export const useAppTranslation = () => {
  const { t } = i18n;
  const [currentLanguage, setCurrentLanguage] = React.useState<SupportedLanguage>(getCurrentLanguage());
  
  React.useEffect(() => {
    const unsubscribe = () => {
      // Nettoyage si nécessaire
    };
    
    // Écouter les changements de langue
    i18n.on('languageChanged', (lang: string) => {
      setCurrentLanguage(lang as SupportedLanguage);
    });
    
    return unsubscribe;
  }, []);
  
  const handleChangeLanguage = async (lang: SupportedLanguage) => {
    const success = await changeLanguage(lang);
    if (success) {
      setCurrentLanguage(lang);
    }
    return success;
  };
  
  return {
    t,
    currentLanguage,
    changeLanguage: handleChangeLanguage,
    isFrench: currentLanguage === 'fr',
    isBambara: currentLanguage === 'bm',
    languageConfig: getLanguageConfig(currentLanguage),
    formatDate: (date: Date, format?: 'date' | 'time' | 'datetime') => formatDate(date, format),
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) => formatNumber(number, options),
  };
};

// ============================================
// INITIALISATION
// ============================================

// Initialiser i18n immédiatement
initI18n();

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default i18n;

/**
 * Export des fonctions utilitaires
 */
export {
  resources,
  initI18n,
  STORAGE_KEY_LANGUAGE,
  DEFAULT_LANGUAGE,
};

/**
 * Export des types
 */
export type { TranslationResources, LanguageConfig };