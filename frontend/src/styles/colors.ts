/**
 * Couleurs - Sènè Yiriwa
 * 
 * Ce fichier contient la palette de couleurs complète de l'application.
 * Les couleurs sont inspirées de l'agriculture malienne, des paysages
 * naturels et des traditions locales.
 * 
 * Fonctionnalités :
 * - Palette principale (vert agricole, orange doré, terre)
 * - Couleurs neutres (gris, blanc, noir)
 * - Couleurs fonctionnelles (succès, erreur, avertissement)
 - Support du mode clair/sombre (préparé)
 * - Accessibilité (contrastes)
 * - Variations de couleurs (light/dark)
 * 
 * @module styles/colors
 */

// ============================================
// PALETTE PRINCIPALE - INSPIRATION AGRICOLE
// ============================================

// Palette de couleurs principale
const colors = {
  /**
   * Couleurs primaires - Vert agricole
   * Inspiré des champs de maïs, du mil et des forêts maliennes
   */
  primary: '#2E7D32',        // Vert forêt - couleur principale
  primaryLight: '#4CAF50',   // Vert clair - accents
  primaryDark: '#1B5E20',    // Vert foncé - contrastes
  primaryLightest: '#E8F5E9', // Vert très clair - fonds
  
  /**
   * Couleurs secondaires - Orange doré
   * Inspiré du soleil couchant, des récoltes et du sable
   */
  secondary: '#FFA000',      // Orange doré - couleur secondaire
  secondaryLight: '#FFB300', // Orange clair - accents
  secondaryDark: '#F57C00',  // Orange foncé - contrastes
  secondaryLightest: '#FFF8E1', // Orange très clair - fonds
  
  /**
   * Couleurs tertiaires - Terre
   * Inspiré du sol fertile, de l'argile et des laterites
   */
  tertiary: '#8D6E63',       // Terre cuite
  tertiaryLight: '#A1887F',  // Terre claire
  tertiaryDark: '#5D4037',   // Terre foncée
  tertiaryLightest: '#EFEBE9', // Terre très claire - fonds
  earth: '#8D6E63',          // Couleur terre alternative
  earthLight: '#A1887F',     // Terre claire alternative
  earthDark: '#5D4037',      // Terre foncée alternative
  background: '#F5F5F5',     // Fond principal de l'application
  surface: '#FFFFFF',        // Surface par défaut
  
  /**
   * Couleurs naturelles complémentaires
   */
  sky: '#64B5F6',            // Bleu ciel - ciel malien
  skyLight: '#E3F2FD',       // Bleu ciel clair
  skyDark: '#1E88E5',        // Bleu ciel foncé
  
  leaf: '#81C784',           // Vert feuille
  leafLight: '#C8E6C9',      // Vert feuille clair
  leafDark: '#388E3C',       // Vert feuille foncé
  
  sun: '#FFD54F',            // Jaune soleil
  sunLight: '#FFF9C4',       // Jaune soleil clair
  sunDark: '#FFB300',        // Jaune soleil foncé
  
  // ============================================
  // COULEURS FONCTIONNELLES
  // ============================================
  
  /**
   * États et actions
   */
  success: '#4CAF50',        // Vert succès
  successLight: '#A5D6A7',   // Vert succès clair
  successDark: '#2E7D32',    // Vert succès foncé
  
  error: '#D32F2F',          // Rouge erreur
  errorLight: '#EF9A9A',     // Rouge erreur clair
  errorDark: '#C62828',      // Rouge erreur foncé
  
  warning: '#FF9800',        // Orange avertissement
  warningLight: '#FFE0B2',   // Orange avertissement clair
  warningDark: '#E65100',    // Orange avertissement foncé
  
  info: '#2196F3',           // Bleu information
  infoLight: '#90CAF9',      // Bleu information clair
  infoDark: '#1565C0',       // Bleu information foncé
  
  // ============================================
  // COULEURS NEUTRES
  // ============================================
  
  /**
   * Blanc et blancs cassés
   */
  white: '#FFFFFF',          // Blanc pur
  whiteSmoke: '#F5F5F5',     // Blanc cassé
  whiteOff: '#FAFAFA',       // Blanc léger
  
  /**
   * Noir et nuances
   */
  black: '#000000',          // Noir pur
  blackLight: '#212121',     // Noir léger
  blackMedium: '#424242',    // Noir moyen
  blackDark: '#1A1A1A',      // Noir foncé
  
  /**
   * Échelle de gris
   */
  gray: {
    50: '#FAFAFA',           // Gris le plus clair
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',          // Gris moyen
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',          // Gris le plus foncé
  },
  
  /**
   * Overlays et fonds transparents
   */
  backdrop: 'rgba(0, 0, 0, 0.5)',     // Fond semi-transparent (modale)
  overlay: 'rgba(0, 0, 0, 0.3)',      // Overlay léger
  overlayDark: 'rgba(0, 0, 0, 0.7)',  // Overlay foncé
  overlayLight: 'rgba(255, 255, 255, 0.2)', // Overlay blanc
};

// ============================================
// COULEURS SPÉCIFIQUES PAR COMPOSANT
// ============================================

/**
 * Couleurs pour les cartes et surfaces
 */
export const surfaceColors = {
  card: colors.white,
  cardElevated: colors.white,
  cardPressed: colors.gray[50],
  modal: colors.white,
  sheet: colors.white,
  tooltip: colors.gray[800],
};

/**
 * Couleurs pour les textes
 */
export const textColors = {
  primary: colors.gray[900],
  secondary: colors.gray[700],
  tertiary: colors.gray[600],
  disabled: colors.gray[400],
  placeholder: colors.gray[500],
  inverse: colors.white,
  link: colors.primary,
  error: colors.error,
  success: colors.success,
  warning: colors.warning,
};

/**
 * Couleurs pour les bordures
 */
export const borderColors = {
  default: colors.gray[300],
  light: colors.gray[200],
  dark: colors.gray[400],
  focus: colors.primary,
  error: colors.error,
  success: colors.success,
};

/**
 * Couleurs pour les boutons
 */
export const buttonColors = {
  primary: {
    background: colors.primary,
    text: colors.white,
    pressed: colors.primaryDark,
    disabled: colors.gray[300],
  },
  secondary: {
    background: colors.secondary,
    text: colors.white,
    pressed: colors.secondaryDark,
    disabled: colors.gray[300],
  },
  outline: {
    background: 'transparent',
    text: colors.primary,
    border: colors.primary,
    pressed: colors.primaryLightest,
  },
  danger: {
    background: colors.error,
    text: colors.white,
    pressed: colors.errorDark,
    disabled: colors.gray[300],
  },
};



/**
 * Couleurs pour les inputs
 */
export const inputColors = {
  background: colors.white,
  border: colors.gray[300],
  borderFocus: colors.primary,
  borderError: colors.error,
  text: colors.gray[800],
  placeholder: colors.gray[400],
  label: colors.gray[700],
  disabled: colors.gray[100],
};

/**
 * Couleurs pour la météo
 */
export const weatherColors = {
  clear: colors.sun,
  cloudy: colors.gray[500],
  rainy: colors.sky,
  storm: colors.skyDark,
  snowy: colors.white,
  foggy: colors.gray[400],
  windy: colors.gray[500],
};

// ============================================
// VARIATIONS DE COULEURS (CLAIR/SOMBRE)
// ============================================

/**
 * Thème clair (défaut)
 */
export const lightThemeColors = {
  background: colors.background,
  surface: colors.white,
  text: colors.gray[900],
  textSecondary: colors.gray[600],
  border: colors.gray[200],
  card: colors.white,
  modal: colors.white,
  statusBar: colors.primary,
};

/**
 * Thème sombre (préparé pour future implémentation)
 */
export const darkThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#2C2C2C',
  card: '#1E1E1E',
  modal: '#1E1E1E',
  statusBar: '#121212',
};

// ============================================
// COULEURS POUR L'AGRICULTURE
// ============================================

/**
 * Couleurs par type de culture (pour visualisation)
 */
export const cropColors = {
  mil: '#CDA869',      // Couleur du mil
  sorgho: '#A0522D',   // Couleur du sorgho
  mais: '#F4A460',     // Couleur du maïs
  riz: '#F5F5DC',      // Couleur du riz
  coton: '#FAFAFA',    // Couleur du coton
  arachide: '#D2691E', // Couleur de l'arachide
  niebe: '#8B4513',    // Couleur du niébé
  manioc: '#DEB887',   // Couleur du manioc
  igname: '#D2B48C',   // Couleur de l'igname
  oignon: '#FFA07A',   // Couleur de l'oignon
  tomate: '#FF6347',   // Couleur de la tomate
  gombo: '#6B8E23',    // Couleur du gombo
};

/**
 * Couleurs par niveau d'alerte
 */
export const alertColors = {
  critical: colors.error,
  high: colors.errorDark,
  medium: colors.warning,
  low: colors.info,
  info: colors.sky,
};

/**
 * Couleurs par niveau de risque agricole
 */
export const riskColors = {
  extreme: colors.error,
  high: colors.warning,
  moderate: colors.secondary,
  low: colors.success,
  none: colors.gray[500],
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Assombrit une couleur hexadécimale
 * 
 * @param hex - Couleur hexadécimale
 * @param percent - Pourcentage d'assombrissement (0-100)
 * @returns Couleur assombrie
 * 
 * @example
 * const darker = darkenColor('#2E7D32', 20);
 */
export const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return `#${((1 << 24) + (R < 0 ? 0 : R) * (1 << 16) + (G < 0 ? 0 : G) * (1 << 8) + (B < 0 ? 0 : B)).toString(16).slice(1)}`;
};

/**
 * Éclaircit une couleur hexadécimale
 * 
 * @param hex - Couleur hexadécimale
 * @param percent - Pourcentage d'éclaircissement (0-100)
 * @returns Couleur éclaircie
 * 
 * @example
 * const lighter = lightenColor('#2E7D32', 20);
 */
export const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${((1 << 24) + (R > 255 ? 255 : R) * (1 << 16) + (G > 255 ? 255 : G) * (1 << 8) + (B > 255 ? 255 : B)).toString(16).slice(1)}`;
};

/**
 * Vérifie le contraste d'une couleur (simplifié)
 * 
 * @param hex - Couleur à vérifier
 * @returns true si la couleur est claire
 */
export const isLightColor = (hex: string): boolean => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

/**
 * Retourne blanc ou noir selon le contraste
 * 
 * @param hex - Couleur de fond
 * @returns '#FFFFFF' ou '#000000'
 */
export const getContrastColor = (hex: string): string => {
  return isLightColor(hex) ? '#000000' : '#FFFFFF';
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default colors;










