/**
 * Ressources i18n - Sènè Yiriwa
 * 
 * Ce fichier centralise toutes les ressources de traduction pour l'application.
 * Il exporte les ressources organisées par langue pour i18next.
 * 
 * Fonctionnalités :
 * - Organisation des traductions par langue
 * - Séparation des namespaces (optionnel)
 * - Support du format JSON
 * - Types TypeScript pour les ressources
 * - Validation des clés de traduction
 * 
 * @module i18n/resources
 */

import fr from './locales/fr';
import bm from './locales/bm';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Type pour les traductions françaises
 */
export type FrenchTranslations = typeof fr;

/**
 * Type pour les traductions bambara
 */
export type BambaraTranslations = typeof bm;

/**
 * Interface des ressources complètes
 */
export interface I18nResources {
  fr: {
    translation: FrenchTranslations;
  };
  bm: {
    translation: BambaraTranslations;
  };
}

/**
 * Interface pour la validation des traductions
 */
export interface TranslationValidation {
  isValid: boolean;
  missingKeys: string[];
  extraKeys: string[];
  mismatchedKeys: string[];
}

// ============================================
// RESSOURCES PRINCIPALES
// ============================================

/**
 * Ressources de traduction pour i18next
 * Organisées par langue avec namespace 'translation'
 */
export const resources: I18nResources = {
  fr: {
    translation: fr,
  },
  bm: {
    translation: bm,
  },
};

/**
 * Liste des langues disponibles avec leurs métadonnées
 */
export const availableLanguages = [
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    resources: fr,
  },
  {
    code: 'bm',
    name: 'Bambara',
    nativeName: 'Bamanankan',
    flag: '🌾',
    resources: bm,
  },
] as const;

/**
 * Langues par défaut de l'application
 */
export const defaultLanguage = 'fr' as const;

/**
 * Namespaces disponibles dans l'application
 * (Extensible pour ajouter des namespaces comme 'common', 'errors', etc.)
 */
export const namespaces = ['translation'] as const;

// ============================================
// FONCTIONS DE VALIDATION
// ============================================

/**
 * Récupère toutes les clés d'un objet de traduction (récursivement)
 * 
 * @param obj - Objet de traduction
 * @param prefix - Préfixe pour la clé (utilisation récursive)
 * @returns Liste des clés
 * 
 * @example
 * const keys = getAllKeys(fr); // ['app_name', 'welcome', 'login', ...]
 */
export const getAllKeys = (obj: Record<string, any>, prefix: string = ''): string[] => {
  let keys: string[] = [];
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Objet imbriqué - appel récursif
      const nestedKeys = getAllKeys(obj[key], prefix ? `${prefix}.${key}` : key);
      keys = keys.concat(nestedKeys);
    } else {
      // Clé feuille
      keys.push(prefix ? `${prefix}.${key}` : key);
    }
  }
  
  return keys;
};

/**
 * Valide la cohérence des traductions entre deux langues
 * 
 * @param sourceLang - Langue source (référence)
 * @param targetLang - Langue cible à valider
 * @returns Résultat de la validation
 * 
 * @example
 * const validation = validateTranslations(fr, bm);
 * if (!validation.isValid) {
 *   console.log('Clés manquantes:', validation.missingKeys);
 * }
 */
export const validateTranslations = (
  sourceLang: Record<string, any>,
  targetLang: Record<string, any>
): TranslationValidation => {
  const sourceKeys = getAllKeys(sourceLang);
  const targetKeys = getAllKeys(targetLang);
  
  const sourceSet = new Set(sourceKeys);
  const targetSet = new Set(targetKeys);
  
  // Clés manquantes dans la langue cible
  const missingKeys = sourceKeys.filter(key => !targetSet.has(key));
  
  // Clés en trop dans la langue cible
  const extraKeys = targetKeys.filter(key => !sourceSet.has(key));
  
  // Clés avec structure différente
  const mismatchedKeys: string[] = [];
  
  // Vérification récursive des structures
  const checkStructure = (source: any, target: any, path: string = '') => {
    if (typeof source !== typeof target) {
      mismatchedKeys.push(path || 'root');
      return;
    }
    
    if (typeof source === 'object' && source !== null) {
      const sourceObjKeys = Object.keys(source);
      const targetObjKeys = Object.keys(target);
      
      sourceObjKeys.forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        checkStructure(source[key], target[key], newPath);
      });
    }
  };
  
  checkStructure(sourceLang, targetLang);
  
  return {
    isValid: missingKeys.length === 0 && mismatchedKeys.length === 0,
    missingKeys,
    extraKeys,
    mismatchedKeys,
  };
};

/**
 * Valide toutes les traductions de l'application
 * 
 * @returns Objet contenant les résultats de validation par langue
 */
export const validateAllTranslations = (): Record<string, TranslationValidation> => {
  const results: Record<string, TranslationValidation> = {};
  
  availableLanguages.forEach(lang => {
    if (lang.code !== defaultLanguage) {
      results[lang.code] = validateTranslations(fr, lang.resources);
    }
  });
  
  return results;
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Récupère une ressource de traduction par langue
 * 
 * @param languageCode - Code de la langue ('fr' ou 'bm')
 * @returns Les traductions pour la langue spécifiée
 */
export const getTranslationResources = (languageCode: 'fr' | 'bm'): FrenchTranslations | BambaraTranslations => {
  switch (languageCode) {
    case 'fr':
      return fr;
    case 'bm':
      return bm;
    default:
      return fr;
  }
};

/**
 * Vérifie si une clé de traduction existe dans une langue
 * 
 * @param languageCode - Code de la langue
 * @param key - Clé à vérifier
 * @returns true si la clé existe
 */
export const hasTranslationKey = (languageCode: 'fr' | 'bm', key: string): boolean => {
  const resources = getTranslationResources(languageCode);
  const keys = getAllKeys(resources);
  return keys.includes(key);
};

/**
 * Obtient la valeur d'une clé de traduction (utile pour le débogage)
 * 
 * @param languageCode - Code de la langue
 * @param key - Clé de traduction
 * @returns Valeur de la traduction ou undefined
 */
export const getTranslationValue = (
  languageCode: 'fr' | 'bm',
  key: string
): string | undefined => {
  const resources = getTranslationResources(languageCode);
  
  // Navigation par points (ex: 'user.profile.name')
  const parts = key.split('.');
  let current: any = resources;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
};

/**
 * Génère un rapport sur l'état des traductions
 * 
 * @returns Rapport détaillé
 */
export const generateTranslationReport = (): {
  totalKeys: number;
  languages: Record<string, { totalKeys: number; missingKeys: string[] }>;
} => {
  const frenchKeys = getAllKeys(fr);
  const bambaraKeys = getAllKeys(bm);
  
  const missingInBambara = frenchKeys.filter(key => !bambaraKeys.includes(key));
  const missingInFrench = bambaraKeys.filter(key => !frenchKeys.includes(key));
  
  return {
    totalKeys: Math.max(frenchKeys.length, bambaraKeys.length),
    languages: {
      fr: {
        totalKeys: frenchKeys.length,
        missingKeys: missingInFrench,
      },
      bm: {
        totalKeys: bambaraKeys.length,
        missingKeys: missingInBambara,
      },
    },
  };
};

// ============================================
// NAMESPACES (OPTIONNEL - POUR EXTENSION FUTURE)
// ============================================

/**
 * Configuration des namespaces pour une meilleure organisation
 * 
 * @example
 * // Structure avec namespaces
 * resources: {
 *   fr: {
 *     common: commonFr,
 *     errors: errorsFr,
 *     agriculture: agricultureFr,
 *   }
 * }
 */
export const namespaceConfig = {
  // Namespace principal (par défaut)
  default: 'translation',
  
  // Namespaces optionnels
  available: ['translation'] as const,
  
  // Structure des namespaces par langue
  // (À décommenter et implémenter si nécessaire)
  /*
  structure: {
    fr: {
      common: {},
      errors: {},
      agriculture: {},
    },
    bm: {
      common: {},
      errors: {},
      agriculture: {},
    },
  }
  */
};

// ============================================
// STATISTIQUES DES TRADUCTIONS
// ============================================

/**
 * Statistiques des traductions
 */
export const translationStats = {
  // Nombre total de clés de traduction
  totalKeys: {
    fr: Object.keys(fr).length,
    bm: Object.keys(bm).length,
  },
  
  // Dernière mise à jour
  lastUpdated: {
    fr: '2024-01-15',
    bm: '2024-01-15',
  },
  
  // Version des traductions
  version: '1.0.0',
  
  // Mainteneurs
  maintainers: {
    fr: 'Équipe Sènè Yiriwa',
    bm: 'Équipe Sènè Yiriwa',
  },
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

/**
 * Export par défaut des ressources
 */
export default resources;

/**
 * Export des types pour l'auto-complétion
 */

/**
 * Export des constantes
 */
export const SUPPORTED_LANGUAGES = availableLanguages;






