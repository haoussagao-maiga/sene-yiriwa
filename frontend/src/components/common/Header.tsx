/**
 * Composant Header - Sènè Yiriwa
 * 
 * Ce composant fournit une barre de navigation supérieure personnalisable,
 * réutilisable et adaptée aux besoins des agriculteurs maliens.
 * 
 * Fonctionnalités :
 * - Bouton de retour personnalisé
 * - Titre centré ou aligné à gauche
 * - Actions personnalisables (droite et gauche)
 * - Support des icônes et textes
 * - Animation lors du défilement
 * - Variantes de styles (principal, transparent, avec image de fond)
 * - Badge de notification
 * - Accessibilité (VoiceOver, TalkBack)
 * - Zone tactile généreuse pour les gros doigts
 * 
 * @module components/common/Header
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  Platform,
  StatusBar,
  Animated,
  ViewStyle,
  TextStyle,
  Image,
  ImageSourcePropType,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../styles/colors';
import { typography } from '../../styles/typography';

const { width: screenWidth } = Dimensions.get('window');

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Variantes de style du header
 */
export type HeaderVariant = 
  | 'default'      // Fond blanc, ombre légère
  | 'primary'      // Fond vert principal
  | 'transparent'  // Fond transparent
  | 'gradient'     // Dégradé vertical
  | 'image';       // Avec image de fond

/**
 * Position du titre
 */
export type TitleAlignment = 'center' | 'left';

/**
 * Action du header (bouton)
 */
export interface HeaderAction {
  /** Icône (MaterialCommunityIcons) */
  icon?: string;
  /** Texte alternatif à l'icône */
  text?: string;
  /** Fonction de rappel */
  onPress: () => void;
  /** Badge (nombre de notifications) */
  badge?: number;
  /** Couleur personnalisée */
  color?: string;
  /** Label pour l'accessibilité */
  accessibilityLabel?: string;
  /** Désactiver le bouton */
  disabled?: boolean;
}

/**
 * Props du composant Header
 */
export interface HeaderProps {
  /** Titre du header */
  title?: string;
  
  /** Variante de style */
  variant?: HeaderVariant;
  
  /** Alignement du titre */
  titleAlignment?: TitleAlignment;
  
  /** Afficher le bouton de retour */
  showBackButton?: boolean;
  
  /** Fonction de rappel personnalisée pour le retour */
  onBackPress?: () => void;
  
  /** Actions à droite */
  rightActions?: HeaderAction[];
  
  /** Action à gauche (remplace le bouton retour par défaut) */
  leftAction?: HeaderAction;
  
  /** Sous-titre (optionnel) */
  subtitle?: string;
  
  /** Image de fond (variant 'image' uniquement) */
  backgroundImage?: ImageSourcePropType;
  
  /** Hauteur personnalisée */
  height?: number;
  
  /** Transparence animée (pour défilement) */
  scrollY?: Animated.Value;
  
  /** Couleur personnalisée du fond */
  backgroundColor?: string;
  
  /** Couleur personnalisée du texte */
  textColor?: string;
  
  /** Afficher l'ombre */
  showShadow?: boolean;
  
  /** Style personnalisé du conteneur */
  containerStyle?: ViewStyle;
  
  /** Style personnalisé du titre */
  titleStyle?: TextStyle;
  
  /** Style personnalisé du sous-titre */
  subtitleStyle?: TextStyle;
  
  /** Élément personnalisé à droite */
  customRightElement?: React.ReactNode;
  
  /** Élément personnalisé à gauche */
  customLeftElement?: React.ReactNode;
  
  /** Élément central personnalisé (remplace le titre) */
  customCenterElement?: React.ReactNode;
}

// ============================================
// SOUS-COMPOSANTS
// ============================================

/**
 * Bouton d'action avec badge
 */
const ActionButton: React.FC<{
  action: HeaderAction;
  variant: HeaderVariant;
  textColor?: string;
}> = ({ action, variant, textColor }) => {
  const getDefaultColor = (): string => {
    if (action.color) return action.color;
    if (variant === 'primary') return colors.white;
    if (variant === 'transparent') return colors.white;
    return colors.gray[800];
  };

  const color = getDefaultColor();
  const isDisabled = action.disabled || false;

  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={action.onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityLabel={
        action.accessibilityLabel || action.text || `Bouton ${action.icon}`
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {action.icon && (
        <Icon name={action.icon} size={24} color={color} />
      )}
      {action.text && (
        <Text style={[styles.actionText, { color }]}>{action.text}</Text>
      )}
      {action.badge !== undefined && action.badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {action.badge > 99 ? '99+' : action.badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Bouton de retour
 */
const BackButton: React.FC<{
  onPress: () => void;
  variant: HeaderVariant;
  textColor?: string;
}> = ({ onPress, variant, textColor }) => {
  const getColor = (): string => {
    if (textColor) return textColor;
    if (variant === 'primary') return colors.white;
    if (variant === 'transparent') return colors.white;
    return colors.gray[800];
  };

  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel="Retour"
      accessibilityRole="button"
    >
      <Icon name="chevron-left" size={28} color={getColor()} />
    </TouchableOpacity>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * Header - Barre de navigation supérieure personnalisée
 * 
 * @example
 * // Header simple
 * <Header title="Accueil" />
 * 
 * @example
 * // Header avec bouton de retour et actions
 * <Header
 *   title="Détails du conseil"
 *   showBackButton
 *   rightActions={[
 *     { icon: 'heart-outline', onPress: () => addToFavorites() },
 *     { icon: 'share-variant', onPress: () => share() }
 *   ]}
 * />
 * 
 * @example
 * // Header avec notification
 * <Header
 *   title="Notifications"
 *   rightActions={[
 *     { icon: 'bell', onPress: () => {}, badge: 3 }
 *   ]}
 * />
 * 
 * @example
 * // Header transparent avec animation au scroll
 * <Header
 *   title="Profil"
 *   variant="transparent"
 *   scrollY={scrollY}
 *   showBackButton
 * />
 * 
 * @example
 * // Header avec sous-titre
 * <Header
 *   title="Bienvenue"
 *   subtitle="Mamadou Diallo"
 *   variant="primary"
 * />
 */
const Header: React.FC<HeaderProps> = ({
  title,
  variant = 'default',
  titleAlignment = 'center',
  showBackButton = false,
  onBackPress,
  rightActions = [],
  leftAction,
  subtitle,
  backgroundImage,
  height = Platform.OS === 'ios' ? 44 : 56,
  scrollY,
  backgroundColor: customBackgroundColor,
  textColor: customTextColor,
  showShadow = true,
  containerStyle,
  titleStyle,
  subtitleStyle,
  customRightElement,
  customLeftElement,
  customCenterElement,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerHeight = useRef(new Animated.Value(height)).current;
  
  // Calcul de la hauteur totale avec la safe area
  const totalHeight = height + insets.top;

  /**
   * Gère le bouton de retour
   */
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  /**
   * Récupère la couleur de fond selon la variante
   */
  const getBackgroundColor = (): string => {
    if (customBackgroundColor) return customBackgroundColor;
    
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'transparent':
        return 'transparent';
      case 'gradient':
      case 'image':
      case 'default':
      default:
        return colors.white;
    }
  };

  /**
   * Récupère la couleur du texte selon la variante
   */
  const getTextColor = (): string => {
    if (customTextColor) return customTextColor;
    
    switch (variant) {
      case 'primary':
        return colors.white;
      case 'transparent':
        return colors.white;
      case 'gradient':
      case 'image':
      case 'default':
      default:
        return colors.gray[900];
    }
  };

  /**
   * Récupère l'opacité de l'ombre selon la variante
   */
  const getShadowOpacity = (): number => {
    if (!showShadow) return 0;
    if (variant === 'transparent') return 0;
    if (variant === 'image') return 0;
    return 0.1;
  };

  /**
   * Récupère le style d'élévation
   */
  const getElevation = (): number => {
    if (!showShadow) return 0;
    if (variant === 'transparent') return 0;
    return 4;
  };

  /**
   * Animation du header lors du défilement
   */
  useEffect(() => {
    if (scrollY && variant === 'transparent') {
      const listenerId = scrollY.addListener(({ value }) => {
        // Opacité du fond: 0 au début, 1 après 100px de défilement
        const opacity = Math.min(value / 100, 1);
        headerOpacity.setValue(opacity);
        
        // Hauteur: normale au début, réduite après défilement
        const newHeight = Math.max(44, height - value / 2);
        headerHeight.setValue(Math.min(newHeight, height));
      });
      
      return () => {
        scrollY.removeListener(listenerId);
      };
    }
  }, [scrollY, variant, height]);

  // Styles dynamiques
  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  const shadowOpacity = getShadowOpacity();
  const elevation = getElevation();

  // Style du conteneur principal
  const mainContainerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      backgroundColor,
      paddingTop: insets.top,
      height: totalHeight,
      shadowOpacity,
      elevation,
    },
    variant === 'transparent' && styles.transparentContainer,
    showShadow && styles.shadow,
    containerStyle,
  ];

  // Animation du fond pour variant transparent
  const animatedBackgroundStyle = scrollY && variant === 'transparent'
    ? {
        backgroundColor: headerOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: ['transparent', colors.white],
        }),
      }
    : {};

  // Animation de la hauteur
  const animatedHeightStyle = scrollY && variant === 'transparent'
    ? { height: Animated.add(headerHeight, insets.top) }
    : {};

  // Rendu du contenu central
  const renderCenterContent = () => {
    if (customCenterElement) {
      return customCenterElement;
    }

    if (!title && !subtitle) return null;

    return (
      <View style={[
        styles.centerContainer,
        titleAlignment === 'center' ? styles.centerAligned : styles.leftAligned,
      ]}>
        {title && (
          <Text
            style={[
              styles.title,
              { color: textColor },
              titleAlignment === 'center' && styles.centerTitle,
              titleStyle,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: textColor + 'CC' }, // 80% opacity
              subtitleStyle,
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  // Rendu du contenu gauche
  const renderLeftContent = () => {
    if (customLeftElement) {
      return customLeftElement;
    }

    if (leftAction) {
      return <ActionButton action={leftAction} variant={variant} textColor={textColor} />;
    }

    if (showBackButton) {
      return <BackButton onPress={handleBackPress} variant={variant} textColor={textColor} />;
    }

    // Espace vide pour équilibrer
    return <View style={styles.placeholder} />;
  };

  // Rendu du contenu droit
  const renderRightContent = () => {
    if (customRightElement) {
      return customRightElement;
    }

    if (rightActions.length === 0) {
      return <View style={styles.placeholder} />;
    }

    return (
      <View style={styles.rightActionsContainer}>
        {rightActions.map((action, index) => (
          <ActionButton key={index} action={action} variant={variant} textColor={textColor} />
        ))}
      </View>
    );
  };

  // Conteneur avec image de fond
  if (variant === 'image' && backgroundImage) {
    return (
      <Animated.View style={[mainContainerStyle, animatedHeightStyle]}>
        <Image
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.contentContainer}>
          <View style={styles.leftContainer}>{renderLeftContent()}</View>
          <View style={styles.centerContainer}>{renderCenterContent()}</View>
          <View style={styles.rightContainer}>{renderRightContent()}</View>
        </View>
      </Animated.View>
    );
  }

  // Conteneur standard
  return (
    <Animated.View style={[mainContainerStyle, animatedBackgroundStyle, animatedHeightStyle]}>
      <View style={styles.contentContainer}>
        <View style={styles.leftContainer}>{renderLeftContent()}</View>
        <View style={styles.centerContainer}>{renderCenterContent()}</View>
        <View style={styles.rightContainer}>{renderRightContent()}</View>
      </View>
    </Animated.View>
  );
};

// ============================================
// COMPOSANTS DÉRIVÉS
// ============================================

/**
 * Header principal de l'application (avec thème par défaut)
 */
export const MainHeader: React.FC<Omit<HeaderProps, 'variant'>> = (props) => (
  <Header variant="default" showShadow {...props} />
);

/**
 * Header pour les écrans de connexion/inscription
 */
export const AuthHeader: React.FC<Omit<HeaderProps, 'variant' | 'showBackButton'>> = (props) => (
  <Header variant="transparent" showBackButton {...props} />
);

/**
 * Header pour les écrans de détail (conseils, techniques)
 */
export const DetailHeader: React.FC<Omit<HeaderProps, 'variant'>> = (props) => (
  <Header variant="primary" showBackButton titleAlignment="left" {...props} />
);

/**
 * Header avec actions de partage et favoris
 */
export const ShareableHeader: React.FC<{
  title: string;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  onSharePress?: () => void;
  variant?: HeaderVariant;
}> = ({ title, isFavorite, onFavoritePress, onSharePress, variant = 'primary' }) => (
  <Header
    title={title}
    variant={variant}
    showBackButton
    rightActions={[
      {
        icon: isFavorite ? 'heart' : 'heart-outline',
        onPress: onFavoritePress || (() => {}),
        color: isFavorite ? colors.error : undefined,
      },
      {
        icon: 'share-variant',
        onPress: onSharePress || (() => {}),
      },
    ]}
  />
);

/**
 * Header avec recherche
 */
export const SearchHeader: React.FC<{
  onSearchPress: () => void;
  title?: string;
}> = ({ onSearchPress, title = "Sènè Yiriwa" }) => (
  <Header
    title={title}
    rightActions={[
      {
        icon: 'magnify',
        onPress: onSearchPress,
      },
    ]}
  />
);

/**
 * Header avec notification
 */
export const NotifiableHeader: React.FC<{
  title: string;
  notificationCount: number;
  onNotificationPress: () => void;
  variant?: HeaderVariant;
}> = ({ title, notificationCount, onNotificationPress, variant = 'default' }) => (
  <Header
    title={title}
    variant={variant}
    rightActions={[
      {
        icon: 'bell',
        onPress: onNotificationPress,
        badge: notificationCount,
      },
    ]}
  />
);

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  /**
   * Conteneur principal
   */
  container: {
    width: '100%',
    zIndex: 10,
  },

  /**
   * Ombre pour iOS
   */
  shadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  /**
   * Conteneur transparent
   */
  transparentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  /**
   * Conteneur du contenu (flex row)
   */
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  /**
   * Conteneur gauche
   */
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  /**
   * Conteneur central
   */
  centerContainer: {
    flex: 2,
    justifyContent: 'center',
  },

  /**
   * Alignement centré
   */
  centerAligned: {
    alignItems: 'center',
  },

  /**
   * Alignement à gauche
   */
  leftAligned: {
    alignItems: 'flex-start',
  },

  /**
   * Conteneur droit
   */
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  /**
   * Conteneur pour les actions droites
   */
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /**
   * Titre principal
   */
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  /**
   * Titre centré
   */
  centerTitle: {
    textAlign: 'center',
  },

  /**
   * Sous-titre
   */
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  /**
   * Bouton de retour
   */
  backButton: {
    padding: 8,
    marginLeft: -8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /**
   * Bouton d'action
   */
  actionButton: {
    padding: 8,
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  /**
   * Texte du bouton d'action
   */
  actionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  /**
   * Badge de notification
   */
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  /**
   * Texte du badge
   */
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },

  /**
   * Placeholder pour équilibrage
   */
  placeholder: {
    width: 40,
  },

  /**
   * Image de fond
   */
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  /**
   * Overlay pour image de fond
   */
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default Header;