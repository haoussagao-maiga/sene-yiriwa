/**
 * GlobalStyles - Sènè Yiriwa
 * 
 * Ce fichier contient les styles globaux réutilisables dans toute l'application.
 * Il fournit des styles de base, des utilitaires de mise en page,
 * des styles de typographie, des ombres, des animations et des styles
 * spécifiques aux composants récurrents.
 * 
 * Fonctionnalités :
 * - Styles de conteneurs (flex, centrage, padding)
 * - Styles de typographie (titres, textes, légendes)
 * - Styles de cartes et surfaces
 * - Styles de formulaires et inputs
 * - Styles de boutons
 * - Ombres et élévations
 * - Animations et transitions
 * - Styles responsive
 * - Utilitaires de mise en page
 * 
 * @module styles/globalStyles
 */

import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import  colors  from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

const { width, height } = Dimensions.get('window');

// ============================================
// CONSTANTES
// ============================================

/**
 * Largeur de l'écran
 */
export const SCREEN_WIDTH = width;

/**
 * Hauteur de l'écran
 */
export const SCREEN_HEIGHT = height;

/**
 * Barre de statut (Android)
 */
export const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

/**
 * Hauteur de la barre de navigation (iOS)
 */
export const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

/**
 * Ratio pour le responsive design
 */
export const scale = SCREEN_WIDTH / 375; // 375 est la largeur de référence (iPhone SE)

/**
 * Fonction pour mettre à l'échelle une valeur
 */
export const normalize = (size: number): number => {
  return Math.round(scale * size);
};

// ============================================
// STYLES GLOBAUX// ============================================

export const globalStyles = StyleSheet.create({
  // ============================================
  // CONTENEURS
  // ============================================
  
  /**
   * Conteneur principal de l'écran
   */
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  /**
   * Conteneur avec padding standard
   */
  containerWithPadding: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  
  /**
   * Conteneur centré
   */
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  /**
   * Conteneur avec défilement
   */
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  
  /**
   * Conteneur de carte
   */
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  
  // ============================================
  // TYPOGRAPHIE
  // ============================================
  
  /**
   * Titre principal H1
   */
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  
  /**
   * Titre H2
   */
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  
  /**
   * Titre H3
   */
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  
  /**
   * Titre H4
   */
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  
  /**
   * Titre H5
   */
  h5: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  
  /**
   * Texte normal
   */
  bodyText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.normal,
    color: colors.gray[700],
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  
  /**
   * Petit texte
   */
  smallText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.gray[600],
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  
  /**
   * Très petit texte (légendes)
   */
  captionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: colors.gray[500],
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
  },
  
  /**
   * Texte en gras
   */
  boldText: {
    fontWeight: typography.fontWeight.bold,
  },
  
  /**
   * Texte en italique
   */
  italicText: {
    fontStyle: 'italic',
  },
  
  /**
   * Texte centré
   */
  textCenter: {
    textAlign: 'center',
  },
  
  /**
   * Texte à droite
   */
  textRight: {
    textAlign: 'right',
  },
  
  /**
   * Couleur primaire
   */
  textPrimary: {
    color: colors.primary,
  },
  
  /**
   * Couleur secondaire
   */
  textSecondary: {
    color: colors.secondary,
  },
  
  /**
   * Couleur d'erreur
   */
  textError: {
    color: colors.error,
  },
  
  /**
   * Couleur de succès
   */
  textSuccess: {
    color: colors.success,
  },
  
  // ============================================
  // FLEXBOX
  // ============================================
  
  /**
   * Direction row
   */
  row: {
    flexDirection: 'row',
  },
  
  /**
   * Direction column
   */
  column: {
    flexDirection: 'column',
  },
  
  /**
   * Alignement centré
   */
  centerAlign: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  /**
   * Centrage horizontal
   */
  centerHorizontal: {
    justifyContent: 'center',
  },
  
  /**
   * Centrage vertical
   */
  centerVertical: {
    alignItems: 'center',
  },
  
  /**
   * Espacement entre les éléments (row)
   */
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  /**
   * Espacement autour des éléments
   */
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  /**
   * Espacement égal entre les éléments
   */
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  
  /**
   * Flex wrap
   */
  wrap: {
    flexWrap: 'wrap',
  },
  
  /**
   * Flex 1 (prend tout l'espace)
   */
  flex1: {
    flex: 1,
  },
  
  /**
   * Flex 2
   */
  flex2: {
    flex: 2,
  },
  
  /**
   * Flex 3
   */
  flex3: {
    flex: 3,
  },
  
  // ============================================
  // MARGES ET PADDINGS
  // ============================================
  
  // Marges standard
  m0: { margin: 0 },
  mXS: { margin: spacing.xs },
  mSM: { margin: spacing.sm },
  mMD: { margin: spacing.md },
  mLG: { margin: spacing.lg },
  mXL: { margin: spacing.xl },
  
  // Marges horizontales
  mH0: { marginHorizontal: 0 },
  mHXS: { marginHorizontal: spacing.xs },
  mHSM: { marginHorizontal: spacing.sm },
  mHMD: { marginHorizontal: spacing.md },
  mHLG: { marginHorizontal: spacing.lg },
  mHXL: { marginHorizontal: spacing.xl },
  
  // Marges verticales
  mV0: { marginVertical: 0 },
  mVXS: { marginVertical: spacing.xs },
  mVSM: { marginVertical: spacing.sm },
  mVMD: { marginVertical: spacing.md },
  mVLG: { marginVertical: spacing.lg },
  mVXL: { marginVertical: spacing.xl },
  
  // Marges supérieures
  mT0: { marginTop: 0 },
  mTXS: { marginTop: spacing.xs },
  mTSM: { marginTop: spacing.sm },
  mTMD: { marginTop: spacing.md },
  mTLG: { marginTop: spacing.lg },
  mTXL: { marginTop: spacing.xl },
  
  // Marges inférieures
  mB0: { marginBottom: 0 },
  mBXS: { marginBottom: spacing.xs },
  mBSM: { marginBottom: spacing.sm },
  mBMD: { marginBottom: spacing.md },
  mBLG: { marginBottom: spacing.lg },
  mBXL: { marginBottom: spacing.xl },
  
  // Paddings standard
  p0: { padding: 0 },
  pXS: { padding: spacing.xs },
  pSM: { padding: spacing.sm },
  pMD: { padding: spacing.md },
  pLG: { padding: spacing.lg },
  pXL: { padding: spacing.xl },
  
  // Paddings horizontaux
  pH0: { paddingHorizontal: 0 },
  pHXS: { paddingHorizontal: spacing.xs },
  pHSM: { paddingHorizontal: spacing.sm },
  pHMD: { paddingHorizontal: spacing.md },
  pHLG: { paddingHorizontal: spacing.lg },
  pHXL: { paddingHorizontal: spacing.xl },
  
  // Paddings verticaux
  pV0: { paddingVertical: 0 },
  pVXS: { paddingVertical: spacing.xs },
  pVSM: { paddingVertical: spacing.sm },
  pVMD: { paddingVertical: spacing.md },
  pVLG: { paddingVertical: spacing.lg },
  pVXL: { paddingVertical: spacing.xl },
  
  // ============================================
  // BORDURES
  // ============================================
  
  /**
   * Bordure standard
   */
  border: {
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  
  /**
   * Bordure inférieure
   */
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  
  /**
   * Bordure supérieure
   */
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  
  /**
   * Pas de bordure
   */
  noBorder: {
    borderWidth: 0,
  },
  
  /**
   * Coins arrondis (petit)
   */
  roundedSM: {
    borderRadius: 8,
  },
  
  /**
   * Coins arrondis (moyen)
   */
  roundedMD: {
    borderRadius: 12,
  },
  
  /**
   * Coins arrondis (grand)
   */
  roundedLG: {
    borderRadius: 16,
  },
  
  /**
   * Coins arrondis (extra large)
   */
  roundedXL: {
    borderRadius: 24,
  },
  
  /**
   * Cercle parfait
   */
  roundedCircle: {
    borderRadius: 999,
  },
  
  // ============================================
  // OMBRES
  // ============================================
  
  /**
   * Ombre légère
   */
  shadowLight: {
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  /**
   * Ombre moyenne
   */
  shadowMedium: {
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  /**
   * Ombre forte
   */
  shadowStrong: {
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  
  // ============================================
  // POSITIONNEMENT
  // ============================================
  
  /**
   * Position absolute
   */
  absolute: {
    position: 'absolute',
  },
  
  /**
   * Position relative
   */
  relative: {
    position: 'relative',
  },
  
  /**
   * Plein écran (position absolute)
   */
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  /**
   * Centrage absolu
   */
  absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  
  // ============================================
  // LARGEURS ET HAUTEURS
  // ============================================
  
  /**
   * Largeur pleine
   */
  fullWidth: {
    width: '100%',
  },
  
  /**
   * Hauteur pleine
   */
  fullHeight: {
    height: '100%',
  },
  
  /**
   * Largeur de l'écran
   */
  screenWidth: {
    width: SCREEN_WIDTH,
  },
  
  /**
   * Hauteur de l'écran
   */
  screenHeight: {
    height: SCREEN_HEIGHT,
  },
  
  /**
   * Largeur 50%
   */
  w50: {
    width: '50%',
  },
  
  /**
   * Largeur 33%
   */
  w33: {
    width: '33.33%',
  },
  
  /**
   * Largeur 25%
   */
  w25: {
    width: '25%',
  },
  
  // ============================================
  // FONDS
  // ============================================
  
  /**
   * Fond blanc
   */
  bgWhite: {
    backgroundColor: colors.white,
  },
  
  /**
   * Fond primaire
   */
  bgPrimary: {
    backgroundColor: colors.primary,
  },
  
  /**
   * Fond secondaire
   */
  bgSecondary: {
    backgroundColor: colors.secondary,
  },
  
  /**
   * Fond d'erreur
   */
  bgError: {
    backgroundColor: colors.error,
  },
  
  /**
   * Fond de succès
   */
  bgSuccess: {
    backgroundColor: colors.success,
  },
  
  /**
   * Fond transparent
   */
  bgTransparent: {
    backgroundColor: 'transparent',
  },
  
  // ============================================
  // OVERLAYS
  // ============================================
  
  /**
   * Overlay sombre
   */
  overlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  /**
   * Overlay clair
   */
  overlayLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  
  // ============================================
  // SÉPARATEURS
  // ============================================
  
  /**
   * Séparateur horizontal
   */
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.md,
  },
  
  /**
   * Séparateur vertical
   */
  dividerVertical: {
    width: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.md,
  },
  
  // ============================================
  // GESTION DU CLAVIER
  // ============================================
  
  /**
   * Évitement du clavier
   */
  keyboardAvoid: {
    flex: 1,
    ...Platform.select({
      ios: {
        paddingBottom: 20,
      },
      android: {
        paddingBottom: 0,
      },
    }),
  },
  
  // ============================================
  // GESTION DES SAFE AREAS
  // ============================================
  
  /**
   * Safe area pour iOS (notch)
   */
  safeAreaTop: {
    paddingTop: Platform.OS === 'ios' ? STATUSBAR_HEIGHT : 0,
  },
  
  /**
   * Safe area pour le bas
   */
  safeAreaBottom: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  
  /**
   * Safe area complète
   */
  safeArea: {
    paddingTop: Platform.OS === 'ios' ? STATUSBAR_HEIGHT : 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  
  // ============================================
  // ÉTATS DE CHARGEMENT
  // ============================================
  
  /**
   * Conteneur de chargement
   */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  
  /**
   * Message de chargement
   */
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
  },
  
  // ============================================
  // ÉTATS D'ERREUR
  // ============================================
  
  /**
   * Conteneur d'erreur
   */
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  
  /**
   * Message d'erreur
   */
  errorText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.error,
    textAlign: 'center',
  },
  
  /**
   * Bouton réessayer
   */
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  
  /**
   * Texte du bouton réessayer
   */
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  
  // ============================================
  // ANIMATIONS
  // ============================================
  
  /**
   * Animation de fondu
   */
  fadeAnimation: {
    opacity: 0,
  },
  
  /**
   * Animation de scale
   */
  scaleAnimation: {
    transform: [{ scale: 0.8 }],
  },
  
  // ============================================
  // Z-INDEX
  // ============================================
  
  /**
   * Z-index élevé
   */
  zHigh: {
    zIndex: 1000,
  },
  
  /**
   * Z-index très élevé
   */
  zHigher: {
    zIndex: 2000,
  },
  
  /**
   * Z-index maximum
   */
  zMax: {
    zIndex: 9999,
  },
});

// ============================================
// STYLES SPÉCIFIQUES AUX COMPOSANTS
// ============================================

/**
 * Styles pour les cartes
 */
export const cardStyles = {
  /**
   * Carte standard
   */
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  
  /**
   * Carte sans ombre
   */
  cardFlat: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  
  /**
   * Carte pressée (effet tactile)
   */
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
};

/**
 * Styles pour les boutons
 */
export const buttonStyles = {
  /**
   * Bouton primaire
   */
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  /**
   * Bouton secondaire
   */
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  /**
   * Bouton outline
   */
  outline: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  
  /**
   * Bouton texte
   */
  text: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  /**
   * Bouton danger
   */
  danger: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  /**
   * Bouton désactivé
   */
  disabled: {
    opacity: 0.6,
  },
  
  /**
   * Texte du bouton primaire
   */
  primaryText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  
  /**
   * Texte du bouton outline
   */
  outlineText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
};

/**
 * Styles pour les inputs
 */
export const inputStyles = {
  /**
   * Champ de saisie standard
   */
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.gray[800],
    minHeight: 48,
  },
  
  /**
   * Champ de saisie en focus
   */
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  /**
   * Champ de saisie en erreur
   */
  inputError: {
    borderColor: colors.error,
  },
  
  /**
   * Label du champ
   */
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  
  /**
   * Message d'erreur
   */
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
};

/**
 * Styles pour les listes
 */
export const listStyles = {
  /**
   * Élément de liste
   */
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  
  /**
   * Dernier élément (sans bordure)
   */
  lastItem: {
    borderBottomWidth: 0,
  },
  
  /**
   * Icône de l'élément
   */
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  /**
   * Conteneur du texte
   */
  textContainer: {
    flex: 1,
  },
  
  /**
   * Titre de l'élément
   */
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[800],
    marginBottom: 2,
  },
  
  /**
   * Sous-titre de l'élément
   */
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
};

// ============================================
//EXPORT PAR DÉFAUT
// ============================================

export default globalStyles;