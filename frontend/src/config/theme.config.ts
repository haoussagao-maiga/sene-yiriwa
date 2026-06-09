/**
 * Configuration du thème - Sènè Yiriwa
 * 
 * Ce fichier contient la configuration complète du thème de l'application,
 * incluant les couleurs, la typographie, les espacements, les animations
 * et les styles personnalisés pour les composants React Native Paper.
 * 
 * Fonctionnalités :
 * - Thème clair et sombre
 * - Couleurs personnalisées adaptées à l'agriculture
 * - Typographie responsive
 * - Espacements cohérents
 * - Styles personnalisés pour les composants Paper
 * - Support du mode contraste élevé
 * - Thème saisonnier (optionnel)
 * 
 * @module config/theme.config
 */

import {
  MD3LightTheme,
  MD3DarkTheme,
  adaptNavigationTheme,
  configureFonts,
} from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import colors from '../styles/colors';
const customColors = colors;
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Thème saisonnier pour l'agriculture
 */
export type SeasonalTheme = 'printemps' | 'ete' | 'automne' | 'hiver';

/**
 * Mode d'affichage
 */
export type ThemeMode = 'light' | 'dark' | 'highContrast' | 'seasonal';

/**
 * Configuration du thème personnalisé
 */
export interface CustomTheme {
  mode: ThemeMode;
  colors: typeof customColors;
  spacing: typeof spacing;
  typography: typeof typography;
  roundness: number;
  animation: {
    scale: number;
    defaultDuration: number;
    fastDuration: number;
    slowDuration: number;
  };
}

// ============================================
// PALETTE DE COULEURS ÉTENDUE
// ============================================

/**
 * Couleurs spécifiques au thème clair
 */
export const lightThemeColors = {
  ...customColors,
  
  // Couleurs de surface
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  surfaceDisabled: '#E0E0E0',
  
  // Couleurs d'arrière-plan
  background: '#F8F9FA',
  backgroundSecondary: '#F1F3F4',
  
  // Couleurs de texte
  text: '#212121',
  textSecondary: '#757575',
  textDisabled: '#9E9E9E',
  textHint: '#BDBDBD',
  
  // Couleurs de bordure
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  
  // États
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  info: '#1976D2',
  
  // Couleurs agricoles claires
  primaryLight: '#E8F5E9',   // Vert très clair pour fonds
  secondaryLight: '#FFF8E1', // Jaune très clair pour fonds
  earthLight: '#EFEBE9',     // Terre claire
  skyLight: '#E3F2FD',       // Ciel clair
  
  // Overlays
  overlayLight: 'rgba(0, 0, 0, 0.05)',
  overlayMedium: 'rgba(0, 0, 0, 0.1)',
  overlayDark: 'rgba(0, 0, 0, 0.2)',
};

/**
 * Couleurs spécifiques au thème sombre
 */
export const darkThemeColors = {
  ...customColors,
  
  // Couleurs de surface
  surface: '#1E1E1E',
  surfaceVariant: '#2D2D2D',
  surfaceDisabled: '#3D3D3D',
  
  // Couleurs d'arrière-plan
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  
  // Couleurs de texte
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textDisabled: '#6B6B6B',
  textHint: '#4B4B4B',
  
  // Couleurs de bordure
  border: '#2D2D2D',
  borderLight: '#3D3D3D',
  
  // États
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Couleurs agricoles sombres
  primaryLight: '#1B5E20',   // Vert foncé pour fonds
  secondaryLight: '#F57C00', // Jaune foncé pour fonds
  earthLight: '#4E342E',     // Terre foncée
  skyLight: '#0D47A1',       // Ciel foncé
  
  // Overlays
  overlayLight: 'rgba(255, 255, 255, 0.05)',
  overlayMedium: 'rgba(255, 255, 255, 0.1)',
  overlayDark: 'rgba(255, 255, 255, 0.2)',
};

/**
 * Couleurs pour le mode contraste élevé (accessibilité)
 */
export const highContrastColors = {
  ...lightThemeColors,
  
  // Contrastes maximisés
  text: '#000000',
  textSecondary: '#000000',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  
  // Couleurs plus vives
  primary: '#006400',        // Vert très foncé
  secondary: '#B85C00',      // Orange très foncé
  error: '#B71C1C',
  success: '#1B5E20',
  warning: '#E65100',
  info: '#0D47A1',
  
  // Bordures plus épaisses visuellement
  border: '#000000',
  borderWidth: 2,
};

// ============================================
// FONCTIONS DE CONFIGURATION DE LA TYPOGRAPHIE
// ============================================

/**
 * Configuration des polices pour React Native Paper
 * Utilise les polices système par défaut pour compatibilité maximale
 */
export const fontConfig = {
  displayLarge: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0,
    lineHeight: typography.fontSize['4xl'] * typography.lineHeight.tight,
  },
  displayMedium: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0,
    lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
  },
  displaySmall: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0,
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.tight,
  },
  headlineLarge: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0,
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.tight,
  },
  headlineMedium: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0,
    lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
  },
  headlineSmall: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0,
    lineHeight: typography.fontSize.lg * typography.lineHeight.tight,
  },
  titleLarge: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 0,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  titleMedium: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 0.1,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  titleSmall: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 0.1,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  labelLarge: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 0.1,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  labelMedium: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 0.5,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  labelSmall: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 0.5,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
  },
  bodyLarge: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: 0,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  bodyMedium: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: 0,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  bodySmall: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: 0,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
  },
};

// ============================================
// THÈMES PRINCIPAUX
// ============================================

/**
 * Thème clair par défaut pour l'application
 * Basé sur MD3LightTheme de React Native Paper
 */
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: customColors.primary,
    primaryContainer: lightThemeColors.primaryLight,
    secondary: customColors.secondary,
    secondaryContainer: lightThemeColors.secondaryLight,
    tertiary: customColors.earth,
    tertiaryContainer: lightThemeColors.earthLight,
    surface: lightThemeColors.surface,
    surfaceVariant: lightThemeColors.surfaceVariant,
    surfaceDisabled: lightThemeColors.surfaceDisabled,
    background: lightThemeColors.background,
    error: lightThemeColors.error,
    errorContainer: `${lightThemeColors.error}15`,
    success: lightThemeColors.success,
    successContainer: `${lightThemeColors.success}15`,
    warning: lightThemeColors.warning,
    warningContainer: `${lightThemeColors.warning}15`,
    info: lightThemeColors.info,
    infoContainer: `${lightThemeColors.info}15`,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: lightThemeColors.text,
    onSurfaceVariant: lightThemeColors.textSecondary,
    onBackground: lightThemeColors.text,
    onError: '#FFFFFF',
    onSuccess: '#FFFFFF',
    onWarning: '#FFFFFF',
    onInfo: '#FFFFFF',
    outline: lightThemeColors.border,
    outlineVariant: lightThemeColors.borderLight,
    inverseSurface: lightThemeColors.text,
    inverseOnSurface: lightThemeColors.background,
    inversePrimary: customColors.primaryLight,
    shadow: 'rgba(0, 0, 0, 0.1)',
    scrim: 'rgba(0, 0, 0, 0.3)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
  animation: {
    scale: 1.0,
    defaultAnimationDuration: 300,
    fastAnimationDuration: 150,
    slowAnimationDuration: 500,
  },
};

/**
 * Thème sombre pour l'application
 * Basé sur MD3DarkTheme de React Native Paper
 */
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: customColors.primaryLight,
    primaryContainer: darkThemeColors.primaryLight,
    secondary: customColors.secondaryLight,
    secondaryContainer: darkThemeColors.secondaryLight,
    tertiary: customColors.earth,
    tertiaryContainer: darkThemeColors.earthLight,
    surface: darkThemeColors.surface,
    surfaceVariant: darkThemeColors.surfaceVariant,
    surfaceDisabled: darkThemeColors.surfaceDisabled,
    background: darkThemeColors.background,
    error: darkThemeColors.error,
    errorContainer: `${darkThemeColors.error}15`,
    success: darkThemeColors.success,
    successContainer: `${darkThemeColors.success}15`,
    warning: darkThemeColors.warning,
    warningContainer: `${darkThemeColors.warning}15`,
    info: darkThemeColors.info,
    infoContainer: `${darkThemeColors.info}15`,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: darkThemeColors.text,
    onSurfaceVariant: darkThemeColors.textSecondary,
    onBackground: darkThemeColors.text,
    onError: '#FFFFFF',
    onSuccess: '#FFFFFF',
    onWarning: '#FFFFFF',
    onInfo: '#FFFFFF',
    outline: darkThemeColors.border,
    outlineVariant: darkThemeColors.borderLight,
    inverseSurface: darkThemeColors.text,
    inverseOnSurface: darkThemeColors.background,
    inversePrimary: customColors.primary,
    shadow: 'rgba(0, 0, 0, 0.3)',
    scrim: 'rgba(0, 0, 0, 0.6)',
    backdrop: 'rgba(0, 0, 0, 0.7)',
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
  animation: {
    scale: 1.0,
    defaultAnimationDuration: 300,
    fastAnimationDuration: 150,
    slowAnimationDuration: 500,
  },
};

/**
 * Thème pour mode contraste élevé (accessibilité)
 */
export const highContrastTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: highContrastColors.primary,
    secondary: highContrastColors.secondary,
    background: highContrastColors.background,
    surface: highContrastColors.surface,
    text: highContrastColors.text,
    textSecondary: highContrastColors.text,
    border: highContrastColors.border,
    error: highContrastColors.error,
    success: highContrastColors.success,
    warning: highContrastColors.warning,
    info: highContrastColors.info,
    onSurface: highContrastColors.text,
    onBackground: highContrastColors.text,
  },
  roundness: 8, // Bordures moins arrondies pour meilleure lisibilité
};

// ============================================
// ADAPTATION POUR REACT NAVIGATION
// ============================================

/**
 * Thème pour React Navigation (clair)
 */
export const navigationLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: customColors.primary,
    background: lightThemeColors.background,
    card: lightThemeColors.surface,
    text: lightThemeColors.text,
    border: lightThemeColors.border,
    notification: customColors.secondary,
  },
};

/**
 * Thème pour React Navigation (sombre)
 */
export const navigationDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: customColors.primaryLight,
    background: darkThemeColors.background,
    card: darkThemeColors.surface,
    text: darkThemeColors.text,
    border: darkThemeColors.border,
    notification: customColors.secondaryLight,
  },
};

/**
 * Adaptation automatique des thèmes Paper et Navigation
 */
export const { LightTheme: combinedLightTheme, DarkTheme: combinedDarkTheme } = 
  adaptNavigationTheme({
    reactNavigationLight: navigationLightTheme,
    reactNavigationDark: navigationDarkTheme,
    materialLight: lightTheme,
    materialDark: darkTheme,
  });

// ============================================
// STYLES PERSONNALISÉS POUR COMPOSANTS
// ============================================

/**
 * Styles supplémentaires pour les composants Paper
 */
export const paperComponentStyles = {
  // Styles pour les boutons
  button: {
    contained: {
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    outlined: {
      borderRadius: 12,
      borderWidth: 1.5,
      paddingVertical: 7,
      paddingHorizontal: 15,
    },
    text: {
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
  },
  
  // Styles pour les cartes
  card: {
    elevation: 2,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  
  // Styles pour les inputs
  textInput: {
    outlined: {
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
    filled: {
      borderRadius: 12,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
  },
  
  // Styles pour les dialogues
  dialog: {
    borderRadius: 20,
    margin: 20,
  },
  
  // Styles pour les menus
  menu: {
    borderRadius: 12,
  },
  
  // Styles pour les snackbars
  snackbar: {
    borderRadius: 8,
    margin: 16,
  },
};

/**
 * Styles pour les composants personnalisés
 */
export const customComponentStyles = {
  // Style pour les écrans d'accueil
  homeScreen: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  
  // Style pour les formulaires
  formContainer: {
    padding: spacing.lg,
    backgroundColor: lightThemeColors.surface,
    borderRadius: 16,
    margin: spacing.md,
  },
  
  // Style pour les listes
  listItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  
  // Style pour les séparateurs
  divider: {
    height: 1,
    backgroundColor: lightThemeColors.border,
    marginVertical: spacing.md,
  },
};

// ============================================
// THÈMES SAISONNIERS (OPTIONNELS)
// ============================================

/**
 * Thème printemps - couleurs plus vives et fleuries
 */
export const springTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#2E7D32',     // Vert printemps
    secondary: '#FF6F00',   // Orange fleuri
    tertiary: '#7B1FA2',    // Violet lavande
  },
};

/**
 * Thème été - couleurs chaudes et ensoleillées
 */
export const summerTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#F57C00',     // Orange soleil
    secondary: '#FFB300',   // Jaune chaud
    tertiary: '#E65100',    // Orange terre cuite
  },
};

/**
 * Thème automne - couleurs chaudes et dorées
 */
export const autumnTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#BF360C',     // Rouge automne
    secondary: '#F9A825',   // Or
    tertiary: '#5D4037',    // Brun
  },
};

/**
 * Thème hiver - couleurs froides et apaisantes
 */
export const winterTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#1565C0',     // Bleu froid
    secondary: '#00838F',   // Bleu-vert
    tertiary: '#78909C',    // Gris bleuté
  },
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Obtient le thème approprié selon le mode
 * 
 * @param mode - Mode du thème ('light', 'dark', 'highContrast', 'seasonal')
 * @param season - Saison pour le mode seasonal (optionnel)
 * @returns Thème correspondant
 * 
 * @example
 * const theme = getTheme('light');
 * const summerTheme = getTheme('seasonal', 'ete');
 */
export const getTheme = (mode: ThemeMode, season?: SeasonalTheme) => {
  switch (mode) {
    case 'dark':
      return darkTheme;
    case 'highContrast':
      return highContrastTheme;
    case 'seasonal':
      if (season === 'printemps') return springTheme;
      if (season === 'ete') return summerTheme;
      if (season === 'automne') return autumnTheme;
      if (season === 'hiver') return winterTheme;
      return lightTheme;
    case 'light':
    default:
      return lightTheme;
  }
};

/**
 * Vérifie si le thème actuel est sombre
 * 
 * @param theme - Thème actuel
 * @returns true si le thème est sombre
 */
export const isDarkTheme = (theme: typeof lightTheme): boolean => {
  return theme === darkTheme || theme === highContrastTheme;
};

/**
 * Récupère la couleur de texte contrastée pour un fond donné
 * 
 * @param backgroundColor - Couleur de fond
 * @returns Couleur de texte ('#FFFFFF' ou '#000000')
 */
export const getContrastColor = (backgroundColor: string): string => {
  // Convertir la couleur hexadécimale en RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Formule de luminance relative
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retourne blanc ou noir selon la luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Applique le thème à l'application
 * 
 * @param mode - Mode du thème
 * @param season - Saison (optionnel)
 */
export const applyTheme = (mode: ThemeMode, season?: SeasonalTheme) => {
  // Cette fonction serait utilisée dans le gestionnaire de thème global
  const theme = getTheme(mode, season);
  
  // Stocker le thème dans le state global ou via AsyncStorage si nécessaire
  return theme;
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

/**
 * Export du thème par défaut (clair)
 */
export const theme = lightTheme;

/**
 * Export combiné pour React Navigation
 */
export const navigationTheme = combinedLightTheme;

/**
 * Export de toutes les configurations
 */
export default {
  light: lightTheme,
  dark: darkTheme,
  highContrast: highContrastTheme,
  seasonal: {
    printemps: springTheme,
    ete: summerTheme,
    automne: autumnTheme,
    hiver: winterTheme,
  },
  navigation: {
    light: navigationLightTheme,
    dark: navigationDarkTheme,
    combined: combinedLightTheme,
  },
  styles: paperComponentStyles,
  customStyles: customComponentStyles,
  getTheme,
  isDarkTheme,
  getContrastColor,
  applyTheme,
};