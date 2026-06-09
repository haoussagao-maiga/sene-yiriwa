/**
 * Spacing - Sènè Yiriwa
 * 
 * Ce fichier contient le système d'espacement unifié pour l'application.
 * Il fournit des valeurs cohérentes pour les marges, les paddings,
 * et les gaps, basées sur une échelle modulaire.
 * 
 * Fonctionnalités :
 * - Échelle modulaire d'espacement (basée sur une unité de base)
 * - Valeurs prédéfinies pour tous les cas d'usage
 * - Fonctions utilitaires pour créer des espacements personnalisés
 * - Constantes pour les espacements spécifiques (écrans, composants)
 * - Support du responsive design
 * 
 * @module styles/spacing
 */

// ============================================
// UNITÉ DE BASE
// ============================================

/**
 * Unité de base pour l'échelle d'espacement (en pixels)
 * 4px est l'unité de base pour créer une échelle cohérente
 */
export const BASE_UNIT = 4;

// ============================================
// ÉCHELLE MODULAIRE
// ============================================

/**
 * Échelle d'espacement modulaire
 * Basée sur une progression géométrique pour des proportions harmonieuses
 */
export const spacing = {
  /** 0px - Aucun espacement */
  none: 0,
  
  /** 2px - Espacement ultra fin (séparateurs subtils) */
  xxs: BASE_UNIT * 0.5,        // 2
  
  /** 4px - Espacement très fin (icônes, petits éléments) */
  xs: BASE_UNIT,                // 4
  
  /** 8px - Espacement fin (entre éléments rapprochés) */
  sm: BASE_UNIT * 2,            // 8
  
  /** 12px - Espacement petit (groupes d'éléments) */
  smd: BASE_UNIT * 3,           // 12
  
  /** 16px - Espacement standard (padding par défaut) */
  md: BASE_UNIT * 4,            // 16
  
  /** 20px - Espacement moyen (sections) */
  mdlg: BASE_UNIT * 5,          // 20
  
  /** 24px - Espacement large (écrans, cartes) */
  lg: BASE_UNIT * 6,            // 24
  
  /** 32px - Espacement très large (grandes sections) */
  xl: BASE_UNIT * 8,            // 32
  
  /** 40px - Espacement extra large (écrans) */
  xxl: BASE_UNIT * 10,          // 40
  
  /** 48px - Espacement géant (marges importantes) */
  xxxl: BASE_UNIT * 12,         // 48
  
  /** 56px - Espacement énorme (écrans complets) */
  huge: BASE_UNIT * 14,         // 56
  
  /** 64px - Espacement massif (sections principales) */
  massive: BASE_UNIT * 16,      // 64
} as const;

// ============================================
// ALIAS PRATIQUES
// ============================================

/**
 * Alias pour les espacements (noms plus intuitifs)
 */
export const spacingAliases = {
  /** Espacement ultra fin */
  hairline: spacing.xxs,
  
  /** Espacement très petit */
  tiny: spacing.xs,
  
  /** Petit espacement */
  small: spacing.sm,
  
  /** Espacement moyen */
  medium: spacing.md,
  
  /** Grand espacement */
  large: spacing.lg,
  
  /** Très grand espacement */
  extraLarge: spacing.xl,
  
  /** Énorme espacement */
  huge: spacing.xxl,
} as const;

// ============================================
// SPACINGS SPÉCIFIQUES AUX COMPOSANTS
// ============================================

/**
 * Espacements pour les écrans
 */
export const screenSpacing = {
  /** Padding horizontal standard pour les écrans */
  horizontalPadding: spacing.md,
  
  /** Padding vertical standard pour les écrans */
  verticalPadding: spacing.lg,
  
  /** Padding horizontal pour les écrans avec grande marge */
  wideHorizontalPadding: spacing.lg,
  
  /** Marge entre les sections */
  sectionMargin: spacing.xl,
  
  /** Marge entre les éléments d'une section */
  itemMargin: spacing.md,
} as const;

/**
 * Espacements pour les cartes
 */
export const cardSpacing = {
  /** Padding interne des cartes */
  innerPadding: spacing.md,
  
  /** Marge entre les cartes */
  cardMargin: spacing.sm,
  
  /** Espacement entre les éléments d'une carte */
  elementSpacing: spacing.sm,
  
  /** Espacement entre le titre et le contenu */
  titleSpacing: spacing.xs,
} as const;

/**
 * Espacements pour les formulaires
 */
export const formSpacing = {
  /** Espacement entre les champs */
  fieldSpacing: spacing.md,
  
  /** Espacement entre le label et le champ */
  labelSpacing: spacing.xs,
  
  /** Espacement entre le champ et le message d'erreur */
  errorSpacing: spacing.xxs,
  
  /** Marge entre le formulaire et le bouton */
  buttonSpacing: spacing.xl,
} as const;

/**
 * Espacements pour les listes
 */
export const listSpacing = {
  /** Espacement vertical entre les éléments */
  itemSpacing: spacing.sm,
  
  /** Padding des éléments */
  itemPadding: spacing.md,
  
  /** Espacement entre l'icône et le texte */
  iconSpacing: spacing.md,
  
  /** Espacement entre le texte principal et le secondaire */
  textSpacing: spacing.xxs,
} as const;

/**
 * Espacements pour la navigation
 */
export const navigationSpacing = {
  /** Padding des éléments du menu */
  menuItemPadding: spacing.md,
  
  /** Espacement entre les éléments du menu */
  menuItemSpacing: spacing.xs,
  
  /** Marge entre l'icône et le texte du menu */
  menuIconSpacing: spacing.md,
} as const;

/**
 * Espacements pour les boutons
 */
export const buttonSpacing = {
  /** Padding horizontal des boutons */
  horizontalPadding: spacing.lg,
  
  /** Padding vertical des boutons */
  verticalPadding: spacing.sm,
  
  /** Espacement entre l'icône et le texte */
  iconSpacing: spacing.sm,
  
  /** Espacement entre les boutons */
  buttonSpacing: spacing.md,
} as const;

/**
 * Espacements pour les écrans de chargement
 */
export const loadingSpacing = {
  /** Espacement entre le spinner et le texte */
  spinnerTextSpacing: spacing.md,
  
  /** Espacement entre les éléments */
  elementSpacing: spacing.lg,
} as const;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Crée un espacement personnalisé basé sur l'unité de base
 * 
 * @param multiplier - Multiplicateur de l'unité de base
 * @returns Valeur d'espacement en pixels
 * 
 * @example
 * const customSpacing = createSpacing(3); // Retourne 12px
 */
export const createSpacing = (multiplier: number): number => {
  return BASE_UNIT * multiplier;
};

/**
 * Obtient une valeur d'espacement par son nom
 * 
 * @param key - Clé de l'espacement
 * @returns Valeur d'espacement
 * 
 * @example
 * const spacingValue = getSpacing('md'); // Retourne 16
 */
export const getSpacing = (key: keyof typeof spacing): number => {
  return spacing[key] || spacing.md;
};

/**
 * Crée un objet d'espacement pour StyleSheet
 * 
 * @param top - Espacement en haut
 * @param right - Espacement à droite
 * @param bottom - Espacement en bas
 * @param left - Espacement à gauche
 * @returns Objet avec les propriétés margin/padding
 * 
 * @example
 * const styles = {
 *   container: {
 *     ...createMargin(16, 24, 16, 24),
 *   }
 * }
 */
export const createMargin = (
  top: number,
  right: number = top,
  bottom: number = top,
  left: number = right
): { marginTop: number; marginRight: number; marginBottom: number; marginLeft: number } => {
  return {
    marginTop: top,
    marginRight: right,
    marginBottom: bottom,
    marginLeft: left,
  };
};

/**
 * Crée un objet de padding pour StyleSheet
 * 
 * @param top - Espacement en haut
 * @param right - Espacement à droite
 * @param bottom - Espacement en bas
 * @param left - Espacement à gauche
 * @returns Objet avec les propriétés padding
 * 
 * @example
 * const styles = {
 *   container: {
 *     ...createPadding(16, 24, 16, 24),
 *   }
 * }
 */
export const createPadding = (
  top: number,
  right: number = top,
  bottom: number = top,
  left: number = right
): { paddingTop: number; paddingRight: number; paddingBottom: number; paddingLeft: number } => {
  return {
    paddingTop: top,
    paddingRight: right,
    paddingBottom: bottom,
    paddingLeft: left,
  };
};

/**
 * Crée un objet d'espacement vertical
 * 
 * @param vertical - Espacement vertical
 * @param horizontal - Espacement horizontal
 * @returns Objet avec les propriétés margin/padding
 * 
 * @example
 * const styles = {
 *   container: {
 *     ...createSpacingObject(16, 24),
 *   }
 * }
 */
export const createSpacingObject = (
  vertical: number,
  horizontal: number
): { paddingVertical: number; paddingHorizontal: number } => {
  return {
    paddingVertical: vertical,
    paddingHorizontal: horizontal,
  };
};

/**
 * Calcule l'espacement responsive en fonction de la largeur de l'écran
 * 
 * @param baseSpacing - Espacement de base (sur écran 375px)
 * @param screenWidth - Largeur de l'écran (optionnel, utilise Dimensions par défaut)
 * @returns Espacement ajusté
 * 
 * @example
 * const responsiveSpacing = getResponsiveSpacing(16);
 */
export const getResponsiveSpacing = (baseSpacing: number, screenWidth?: number): number => {
  const { width } = require('react-native').Dimensions.get('window');
  const referenceWidth = 375; // iPhone SE width
  const scale = (screenWidth || width) / referenceWidth;
  return Math.round(baseSpacing * Math.min(scale, 1.2)); // Limiter à 120% max
};

// ============================================
// CONSTANTES PRÉDÉFINIES POUR CAS COURANTS
// ============================================

/**
 * Espacements standards pour les écrans
 */
export const screenPadding = {
  default: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  compact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  wide: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
} as const;

/**
 * Espacements standards pour les formulaires
 */
export const formFieldSpacing = {
  default: spacing.md,
  compact: spacing.sm,
  relaxed: spacing.lg,
} as const;

/**
 * Espacements pour les grilles
 */
export const gridSpacing = {
  /** Espacement entre les colonnes */
  columnGap: spacing.md,
  
  /** Espacement entre les lignes */
  rowGap: spacing.md,
  
  /** Espacement pour les petites grilles */
  small: spacing.sm,
  
  /** Espacement pour les grandes grilles */
  large: spacing.lg,
} as const;

// ============================================
// THÈME D'ESPACEMENT (pour utilisation avec styled-components)
// ============================================

/**
 * Thème d'espacement pour l'application
 * Peut être utilisé avec styled-components ou ThemeProvider
 */
export const spacingTheme = {
  space: spacing,
  spaceAliases: spacingAliases,
  screen: screenSpacing,
  card: cardSpacing,
  form: formSpacing,
  list: listSpacing,
  navigation: navigationSpacing,
  button: buttonSpacing,
  loading: loadingSpacing,
  grid: gridSpacing,
} as const;

// ============================================
// TYPES
// ============================================

/**
 * Type pour les clés d'espacement
 */
export type SpacingKey = keyof typeof spacing;

/**
 * Type pour les alias d'espacement
 */
export type SpacingAliasKey = keyof typeof spacingAliases;

/**
 * Type pour les espacements de carte
 */
export type CardSpacingKey = keyof typeof cardSpacing;

/**
 * Type pour les espacements de formulaire
 */
export type FormSpacingKey = keyof typeof formSpacing;

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

/**
 * Export principal du système d'espacement
 */
export default {
  ...spacing,
  aliases: spacingAliases,
  screen: screenSpacing,
  card: cardSpacing,
  form: formSpacing,
  list: listSpacing,
  navigation: navigationSpacing,
  button: buttonSpacing,
  loading: loadingSpacing,
  grid: gridSpacing,
  utils: {
    createSpacing,
    getSpacing,
    createMargin,
    createPadding,
    createSpacingObject,
    getResponsiveSpacing,
  },
  theme: spacingTheme,
};