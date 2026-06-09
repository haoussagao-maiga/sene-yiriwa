/**
 * Composant CustomButton - Sènè Yiriwa
 * 
 * Ce composant fournit un système de boutons personnalisés, réutilisables
 * et adaptés aux besoins des agriculteurs maliens. Il supporte plusieurs
 * variantes, tailles, états et inclut le chargement et les icônes.
 * 
 * Fonctionnalités :
 * - Multiples variantes (principale, secondaire, outline, text, danger, succès)
 * - Plusieurs tailles (petit, moyen, grand)
 * - États de chargement avec spinner intégré
 * - Icônes gauche et droite
 * - Désactivation automatique pendant le chargement
 * - Accessibilité (VoiceOver, TalkBack)
 * - Adapté aux gros doigts des agriculteurs (zones tactiles généreuses)
 * 
 * @module components/common/CustomButton
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  StyleSheet,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../styles/colors';
import { typography } from '../../styles/typography';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Variantes de bouton disponibles
 * - primary: Bouton principal (action importante)
 * - secondary: Bouton secondaire (action moins prioritaire)
 * - outline: Bouton avec bordure (action alternative)
 * - text: Bouton textuel (action subtile)
 * - danger: Bouton d'action dangereuse (suppression, etc.)
 * - success: Bouton d'action positive (validation, confirmation)
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger' | 'success';

/**
 * Tailles de bouton disponibles
 * - small: Pour les actions secondaires, espaces réduits
 * - medium: Taille par défaut
 * - large: Boutons principaux, CTA importants
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Props du composant CustomButton
 * Étend les props standard de TouchableOpacity
 */
export interface CustomButtonProps extends TouchableOpacityProps {
  /** Texte du bouton */
  title: string;
  
  /** Variante de style du bouton */
  variant?: ButtonVariant;
  
  /** Taille du bouton */
  size?: ButtonSize;
  
  /** État de chargement (affiche un spinner) */
  loading?: boolean;
  
  /** Désactive le bouton */
  disabled?: boolean;
  
  /** Icône à afficher à gauche du texte */
  leftIcon?: string;
  
  /** Icône à afficher à droite du texte */
  rightIcon?: string;
  
  /** Couleur personnalisée (outline uniquement) */
  customColor?: string;
  
  /** Largeur complète du bouton */
  fullWidth?: boolean;
  
  /** Style personnalisé pour le conteneur */
  containerStyle?: ViewStyle;
  
  /** Style personnalisé pour le texte */
  textStyle?: TextStyle;
  
  /** Fonction de rappel au clic */
  onPress?: () => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * CustomButton - Bouton personnalisé pour Sènè Yiriwa
 * 
 * @example
 * // Bouton principal
 * <CustomButton
 *   title="Se connecter"
 *   variant="primary"
 *   size="large"
 *   onPress={handleLogin}
 * />
 * 
 * @example
 * // Bouton avec icône et chargement
 * <CustomButton
 *   title="Chargement..."
 *   variant="success"
 *   leftIcon="check"
 *   loading={true}
 *   onPress={handleSubmit}
 * />
 * 
 * @example
 * // Bouton outline pour Bambara
 * <CustomButton
 *   title="Bambara"
 *   variant="outline"
 *   size="small"
 *   leftIcon="translate"
 *   onPress={() => changeLanguage('bm')}
 * />
 */
const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  customColor,
  fullWidth = false,
  containerStyle,
  textStyle,
  onPress,
  ...restProps
}) => {
  // Hook pour accéder au thème Paper
  const theme = useTheme();
  
  /**
   * Détermine si le bouton est désactivé
   * Désactivé si le prop disabled est true ou si loading est true
   */
  const isDisabled = disabled || loading;
  
  /**
   * Récupère les couleurs du bouton selon la variante
   * @returns Object contenant background, text, border
   */
  const getButtonColors = () => {
    // Couleur personnalisée prioritaire pour la variante outline
    if (customColor && variant === 'outline') {
      return {
        background: 'transparent',
        text: customColor,
        border: customColor,
      };
    }
    
    // Gestion du thème Paper et des couleurs par défaut
    const primaryColor = theme.colors.primary || colors.primary;
    const secondaryColor = '#FFA000'; // Orange doré
    const dangerColor = colors.error || '#F44336';
    const successColor = colors.success || '#4CAF50';
    
    switch (variant) {
      case 'primary':
        return {
          background: primaryColor,
          text: colors.white,
          border: primaryColor,
        };
      case 'secondary':
        return {
          background: secondaryColor,
          text: colors.white,
          border: secondaryColor,
        };
      case 'outline':
        return {
          background: 'transparent',
          text: customColor || primaryColor,
          border: customColor || primaryColor,
        };
      case 'text':
        return {
          background: 'transparent',
          text: customColor || primaryColor,
          border: 'transparent',
        };
      case 'danger':
        return {
          background: dangerColor,
          text: colors.white,
          border: dangerColor,
        };
      case 'success':
        return {
          background: successColor,
          text: colors.white,
          border: successColor,
        };
      default:
        return {
          background: primaryColor,
          text: colors.white,
          border: primaryColor,
        };
    }
  };
  
  /**
   * Récupère les styles dimensionnels selon la taille
   * @returns Object contenant padding, fontSize, iconSize
   */
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          fontSize: typography.fontSize.sm,
          iconSize: 18,
          borderRadius: 8,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          fontSize: typography.fontSize.lg,
          iconSize: 24,
          borderRadius: 14,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          fontSize: typography.fontSize.md,
          iconSize: 20,
          borderRadius: 12,
        };
    }
  };
  
  // Récupération des styles dynamiques
  const colorsStyle = getButtonColors();
  const sizeStyle = getSizeStyles();
  
  // Styles calculés pour le conteneur
  const buttonStyles: StyleProp<ViewStyle> = [
    styles.baseButton,
    {
      backgroundColor: colorsStyle.background,
      borderColor: colorsStyle.border,
      paddingVertical: sizeStyle.paddingVertical,
      paddingHorizontal: sizeStyle.paddingHorizontal,
      borderRadius: sizeStyle.borderRadius,
      borderWidth: variant === 'outline' ? 1.5 : 0,
      opacity: isDisabled ? 0.6 : 1,
    },
    fullWidth && styles.fullWidth,
    containerStyle,
  ];
  
  // Styles calculés pour le texte
  const textStyles: StyleProp<TextStyle> = [
    styles.baseText,
    {
      color: colorsStyle.text,
      fontSize: sizeStyle.fontSize,
      fontFamily: typography.fontFamily.medium,
    },
    textStyle,
  ];
  
  /**
   * Gère l'appel onPress avec prévention des clics multiples
   * Bloque l'exécution si désactivé ou en chargement
   */
  const handlePress = () => {
    if (!isDisabled && onPress) {
      onPress();
    }
  };
  
  return (
    <TouchableOpacity
      activeOpacity={0.7} // Feedback tactile pour l'utilisateur
      onPress={handlePress}
      disabled={isDisabled}
      style={buttonStyles}
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...restProps}
    >
      <View style={styles.contentContainer}>
        {/* Icône gauche (si présente et non en chargement) */}
        {!loading && leftIcon && (
          <Icon
            name={leftIcon}
            size={sizeStyle.iconSize}
            color={colorsStyle.text}
            style={styles.leftIcon}
          />
        )}
        
        {/* Spinner de chargement */}
        {loading && (
          <ActivityIndicator
            size={sizeStyle.iconSize}
            color={colorsStyle.text}
            style={styles.spinner}
          />
        )}
        
        {/* Texte du bouton */}
        <Text style={textStyles}>{title}</Text>
        
        {/* Icône droite (si présente) */}
        {!loading && rightIcon && (
          <Icon
            name={rightIcon}
            size={sizeStyle.iconSize}
            color={colorsStyle.text}
            style={styles.rightIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  /**
   * Style de base pour tous les boutons
   * Assure une zone tactile suffisamment grande
   */
  baseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Taille minimale pour accessibilité (Apple guideline)
  },
  
  /**
   * Conteneur flexible pour le contenu
   * Permet l'alignement du texte et des icônes
   */
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  /**
   * Style de base pour le texte
   */
  baseText: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  
  /**
   * Largeur complète du bouton
   * Utile pour les formulaires et CTA principaux
   */
  fullWidth: {
    width: '100%',
  },
  
  /**
   * Marge pour l'icône gauche
   */
  leftIcon: {
    marginRight: 8,
  },
  
  /**
   * Marge pour l'icône droite
   */
  rightIcon: {
    marginLeft: 8,
  },
  
  /**
   * Style du spinner de chargement
   */
  spinner: {
    marginRight: 8,
  },
});

// ============================================
// COMPOSANTS DÉRIVÉS POUR CAS SPÉCIFIQUES
// ============================================

/**
 * Bouton d'action principal préconfiguré
 * Idéal pour les CTA importants (connexion, validation, etc.)
 */
export const PrimaryButton: React.FC<Omit<CustomButtonProps, 'variant'>> = (props) => (
  <CustomButton {...props} variant="primary" />
);

/**
 * Bouton d'action secondaire préconfiguré
 * Idéal pour les actions moins prioritaires (annuler, retour, etc.)
 */
export const SecondaryButton: React.FC<Omit<CustomButtonProps, 'variant'>> = (props) => (
  <CustomButton {...props} variant="secondary" />
);

/**
 * Bouton d'action dangereuse préconfiguré
 * Idéal pour les actions de suppression, déconnexion, etc.
 */
export const DangerButton: React.FC<Omit<CustomButtonProps, 'variant'>> = (props) => (
  <CustomButton {...props} variant="danger" />
);

/**
 * Bouton de succès préconfiguré
 * Idéal pour les actions de validation, confirmation, etc.
 */
export const SuccessButton: React.FC<Omit<CustomButtonProps, 'variant'>> = (props) => (
  <CustomButton {...props} variant="success" />
);

/**
 * Bouton outline préconfiguré
 * Idéal pour les actions alternatives (changement de langue, etc.)
 */
export const OutlineButton: React.FC<Omit<CustomButtonProps, 'variant'>> = (props) => (
  <CustomButton {...props} variant="outline" />
);

/**
 * Bouton textuel préconfiguré
 * Idéal pour les liens et actions subtiles
 */
export const TextButton: React.FC<Omit<CustomButtonProps, 'variant'>> = (props) => (
  <CustomButton {...props} variant="text" />
);

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default CustomButton;