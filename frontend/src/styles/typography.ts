/**
 * Typography - Sènè Yiriwa
 * 
 * Ce fichier contient le système typographique unifié pour l'application.
 * Il fournit des configurations cohérentes pour les polices, les tailles,
 * les poids, les hauteurs de ligne et les styles de texte.
 * 
 * Fonctionnalités :
 * - Configuration des polices (par défaut: System)
 * - Échelle typographique modulaire
 * - Poids de police (normal, medium, semibold, bold)
 * - Hauteurs de ligne adaptées
 * - Styles de texte prédéfinis (titres, corps, légendes)
 * - Support du responsive design
 * - Accessibilité (Dynamic Type sur iOS)
 * 
 * @module styles/typography
 */

import { Platform, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// ============================================
// CONFIGURATION DES POLICES
// ============================================

/**
 * Configuration des polices par plateforme
 * Sur iOS, utilise les polices système San Francisco
 * Sur Android, utilise Roboto
 */
export const fontFamily = {
  /** Police normale */
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  /** Police moyenne (semi-gras) */
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  
  /** Police semi-gras */
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  
  /** Police grasse */
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  
  /** Police italique */
  italic: Platform.select({
    ios: 'System',
    android: 'Roboto-Italic',
    default: 'System',
  }),
} as const;

// ============================================
// ÉCHELLE TYPOGRAPHIQUE
// ============================================

/**
 * Échelle typographique modulaire (en pixels)
 * Basée sur une progression harmonieuse
 */
export const fontSize = {
  /** 10px - Très petit (badges, légendes) */
  xxs: 10,
  
  /** 11px - Extrêmement petit (timestamps) */
  xs: 11,
  
  /** 12px - Petit (légendes, notes) */
  sm: 12,
  
  /** 13px - Corps de texte petit */
  smd: 13,
  
  /** 14px - Corps de texte standard */
  md: 14,
  
  /** 15px - Corps de texte légèrement plus grand */
  mdg: 15,
  
  /** 16px - Texte normal (sous-titres) */
  lg: 16,
  
  /** 18px - Titres petits */
  xl: 18,
  
  /** 20px - Titres moyens */
  xxl: 20,
  
  /** 24px - Titres grands (H3) */
  '2xl': 24,
  
  /** 28px - Titres très grands (H2) */
  '3xl': 28,
  
  /** 32px - Titres énormes (H1) */
  '4xl': 32,
  
  /** 36px - Titres géants */
  '5xl': 36,
  
  /** 40px - Titres massifs */
  '6xl': 40,
  
  /** 48px - Titres monumentaux */
  '7xl': 48,
} as const;

// ============================================
// POIDS DE POLICE
// ============================================

/**
 * Poids de police standardisés
 */
export const fontWeight = {
  /** Normal (400) */
  normal: '400' as const,
  
  /** Moyen (500) */
  medium: '500' as const,
  
  /** Semi-gras (600) */
  semibold: '600' as const,
  
  /** Gras (700) */
  bold: '700' as const,
  
  /** Extra-gras (800) */
  extrabold: '800' as const,
} as const;

// ============================================
// HAUTEURS DE LIGNE
// ============================================

/**
 * Facteurs de hauteur de ligne (multiplicateurs)
 */
export const lineHeight = {
  /** Très serré (1.2) - Titres */
  tight: 1.2,
  
  /** Normal (1.4) - Corps de texte */
  normal: 1.4,
  
  /** Détendu (1.6) - Textes longs */
  relaxed: 1.6,
  
  /** Très détendu (1.8) - Accessibilité */
  loose: 1.8,
} as const;

// ============================================
// STYLES DE TEXTE PRÉDÉFINIS
// ============================================

/**
 * Styles de texte pour les titres
 */
export const titleStyles = {
  /** Titre principal H1 */
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    letterSpacing: -0.5,
  },
  
  /** Titre H2 */
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    letterSpacing: -0.3,
  },
  
  /** Titre H3 */
  h3: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['2xl'] * lineHeight.tight,
    letterSpacing: -0.2,
  },
  
  /** Titre H4 */
  h4: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xxl * lineHeight.tight,
    letterSpacing: -0.1,
  },
  
  /** Titre H5 */
  h5: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  
  /** Titre H6 */
  h6: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.lg * lineHeight.tight,
  },
} as const;

/**
 * Styles de texte pour le corps
 */
export const bodyStyles = {
  /** Grand texte (pour mises en avant) */
  large: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.lg * lineHeight.normal,
  },
  
  /** Texte standard */
  regular: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  
  /** Petit texte (pour les détails) */
  small: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  
  /** Très petit texte (légendes, badges) */
  tiny: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
} as const;

/**
 * Styles de texte pour les légendes
 */
export const captionStyles = {
  /** Légende standard */
  regular: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs * lineHeight.relaxed,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  
  /** Légende semi-grasse */
  medium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.xs * lineHeight.relaxed,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
} as const;

/**
 * Styles de texte pour les boutons
 */
export const buttonStyles = {
  /** Bouton grand */
  large: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  
  /** Bouton moyen */
  medium: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
  
  /** Bouton petit */
  small: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.2,
  },
} as const;

/**
 * Styles de texte pour les inputs
 */
export const inputStyles = {
  /** Input standard */
  regular: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  
  /** Input avec placeholder */
  placeholder: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    color: '#9E9E9E',
  },
  
  /** Label d'input */
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.2,
  },
  
  /** Message d'erreur */
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
} as const;

// ============================================
// STYLES DE TEXTE SPÉCIFIQUES
// ============================================

/**
 * Styles pour les liens
 */
export const linkStyles = {
  /** Lien standard */
  regular: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textDecorationLine: 'underline' as const,
  },
  
  /** Lien petit */
  small: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textDecorationLine: 'underline' as const,
  },
} as const;

/**
 * Styles pour les messages d'erreur
 */
export const errorStyles = {
  /** Message d'erreur standard */
  regular: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
  },
  
  /** Message d'erreur pour formulaire */
  formError: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    marginTop: 4,
  },
} as const;

// ============================================
// STYLES DE TEXTE COMBINÉS
// ============================================

/**
 * Objet complet des styles typographiques
 */
export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  
  // Styles regroupés
  title: titleStyles,
  body: bodyStyles,
  caption: captionStyles,
  button: buttonStyles,
  input: inputStyles,
  link: linkStyles,
  error: errorStyles,
} as const;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Calcule la taille de police responsive
 * 
 * @param size - Taille de base
 * @param maxSize - Taille maximale (optionnel)
 * @returns Taille ajustée
 * 
 * @example
 * const responsiveFont = responsiveFontSize(16, 24);
 */
export const responsiveFontSize = (size: number, maxSize?: number): number => {
  const referenceWidth = 375; // iPhone SE width
  const scale = screenWidth / referenceWidth;
  let scaledSize = size * Math.min(scale, 1.2);
  
  if (maxSize) {
    scaledSize = Math.min(scaledSize, maxSize);
  }
  
  return Math.round(scaledSize);
};

/**
 * Obtient un style de texte complet
 * 
 * @param style - Style de base (title, body, caption, etc.)
 * @param customStyles - Styles personnalisés à fusionner
 * @returns Style de texte complet
 * 
 * @example
 * const textStyle = getTextStyle('h1', { color: '#2E7D32' });
 */
export const getTextStyle = (
  style: keyof typeof typography.title | keyof typeof typography.body,
  customStyles?: object
): object => {
  let baseStyle: object;
  
  if (style in titleStyles) {
    baseStyle = titleStyles[style as keyof typeof titleStyles];
  } else if (style in bodyStyles) {
    baseStyle = bodyStyles[style as keyof typeof bodyStyles];
  } else {
    baseStyle = bodyStyles.regular;
  }
  
  return { ...baseStyle, ...customStyles };
};

/**
 * Crée un style de texte personnalisé
 * 
 * @param options - Options de style
 * @returns Style de texte personnalisé
 * 
 * @example
 * const customText = createTextStyle({
 *   size: 18,
 *   weight: 'bold',
 *   lineHeight: 1.5,
 * });
 */
export const createTextStyle = (options: {
  size?: number;
  weight?: keyof typeof fontWeight;
  lineHeight?: number;
  family?: keyof typeof fontFamily;
  letterSpacing?: number;
}): object => {
  return {
    fontFamily: options.family ? fontFamily[options.family] : fontFamily.regular,
    fontSize: options.size || fontSize.md,
    fontWeight: options.weight ? fontWeight[options.weight] : fontWeight.normal,
    lineHeight: options.lineHeight 
      ? (options.size || fontSize.md) * options.lineHeight 
      : (options.size || fontSize.md) * lineHeight.normal,
    letterSpacing: options.letterSpacing,
  };
};

// ============================================
// CONSTANTES POUR L'ACCESSIBILITÉ
// ============================================

/**
 * Tailles minimales pour l'accessibilité (WCAG)
 */
export const accessibility = {
  /** Taille minimale pour les textes standards */
  minBodySize: 14,
  
  /** Taille minimale pour les titres */
  minTitleSize: 18,
  
  /** Taille minimale pour les boutons */
  minButtonSize: 16,
  
  /** Rapport de contraste minimum pour le texte normal (4.5:1) */
  minContrastRatio: 4.5,
  
  /** Rapport de contraste minimum pour les grands textes (3:1) */
  minLargeTextContrastRatio: 3,
} as const;

// ============================================
// THÈME TYPOGRAPHIQUE (pour styled-components)
// ============================================

/**
 * Thème typographique complet pour l'application
 */
export const typographyTheme = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  styles: {
    title: titleStyles,
    body: bodyStyles,
    caption: captionStyles,
    button: buttonStyles,
    input: inputStyles,
    link: linkStyles,
    error: errorStyles,
  },
  utils: {
    responsive: responsiveFontSize,
    getTextStyle,
    createTextStyle,
  },
  accessibility,
} as const;

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default typography;