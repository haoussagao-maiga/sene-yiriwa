/**
 * Déclarations TypeScript pour les traductions
 * Ce fichier permet l'auto-complétion des clés de traduction
 * 
 * @module i18n/translation.d.ts
 */

import 'react-i18next';
import fr from './locales/fr';
import bm from './locales/bm';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof fr;
    };
  }
}

// Type pour les clés de traduction
export type TranslationKey = keyof typeof fr;

// Type pour les traductions bambara
export type BambaraTranslationKey = keyof typeof bm;

// Helper pour les clés avec interpolation
export type InterpolationValue = string | number | boolean | Date;