/**
 * Composant CustomCard - Sènè Yiriwa
 * 
 * Ce composant fournit un système de cartes personnalisées, réutilisables
 * et adaptées aux besoins des agriculteurs maliens. Il supporte plusieurs
 * variantes, mises en page et inclut le support des images, icônes et actions.
 * 
 * Fonctionnalités :
 * - Multiples variantes (standard, elevation, outline, compact, featured)
 * - Support d'image d'en-tête et d'avatar
 * - Actions configurables (boutons, icônes cliquables)
 * - Badges pour statuts et informations
 * - Animation au toucher
 * - Accessibilité (VoiceOver, TalkBack)
 * - Adapté aux agriculteurs (texte lisible, espacements généreux)
 * 
 * @module components/common/CustomCard
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../styles/colors';
import { typography } from '../../styles/typography';

const { width: screenWidth } = Dimensions.get('window');

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Variantes de carte disponibles
 * - standard: Carte simple avec ombre légère
 * - elevation: Carte avec ombre prononcée (effet flottant)
 * - outline: Carte avec bordure seulement
 * - compact: Version compacte pour listes denses
 * - featured: Carte mise en avant (image large, couleurs vives)
 */
export type CardVariant = 'standard' | 'elevation' | 'outline' | 'compact' | 'featured';

/**
 * Positions pour les badges
 */
export type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Types de badges
 */
export type BadgeType = 'info' | 'success' | 'warning' | 'error' | 'primary' | 'secondary';

/**
 * Interface pour une action de carte
 */
export interface CardAction {
  /** Icône de l'action (MaterialCommunityIcons) */
  icon: string;
  /** Fonction de rappel */
  onPress: () => void;
  /** Couleur personnalisée */
  color?: string;
  /** Label pour accessibilité */
  accessibilityLabel?: string;
}

/**
 * Interface pour un badge
 */
export interface CardBadge {
  /** Texte du badge */
  text: string;
  /** Type de badge (définit la couleur) */
  type?: BadgeType;
  /** Position du badge */
  position?: BadgePosition;
  /** Couleur personnalisée */
  customColor?: string;
}

/**
 * Props du composant CustomCard
 */
export interface CustomCardProps {
  /** Titre de la carte */
  title?: string;
  /** Sous-titre de la carte */
  subtitle?: string;
  /** Description/text contenu */
  description?: string;
  /** URL ou URI de l'image principale */
  imageUrl?: string;
  /** Hauteur de l'image (défaut: 200) */
  imageHeight?: number;
  /** Avatar à afficher (icône ou URL) */
  avatar?: {
    type: 'icon' | 'image' | 'text';
    value: string;
    color?: string;
    backgroundColor?: string;
  };
  /** Variante de la carte */
  variant?: CardVariant;
  /** Liste des badges à afficher */
  badges?: CardBadge[];
  /** Actions (icônes cliquables) */
  actions?: CardAction[];
  /** Contenu personnalisé (remplace description) */
  children?: React.ReactNode;
  /** Indique si la carte est cliquable */
  clickable?: boolean;
  /** Fonction de rappel au clic (si clickable) */
  onPress?: () => void;
  /** Animation au clic (scale effect) */
  animated?: boolean;
  /** Style personnalisé pour le conteneur */
  containerStyle?: ViewStyle;
  /** Style personnalisé pour le titre */
  titleStyle?: TextStyle;
  /** Style personnalisé pour le sous-titre */
  subtitleStyle?: TextStyle;
  /** Style personnalisé pour la description */
  descriptionStyle?: TextStyle;
  /** Style personnalisé pour l'image */
  imageStyle?: ImageStyle;
  /** Style personnalisé pour l'avatar */
  avatarStyle?: ViewStyle;
}

// ============================================
// SOUS-COMPOSANTS
// ============================================

/**
 * AvatarComponent - Affiche un avatar (icône, image ou texte)
 */
const AvatarComponent: React.FC<{ avatar: CustomCardProps['avatar']; size?: number }> = ({ 
  avatar, 
  size = 50 
}) => {
  if (!avatar) return null;

  const avatarSize = size;
  const iconSize = size * 0.5;

  switch (avatar.type) {
    case 'image':
      return (
        <Image
          source={{ uri: avatar.value }}
          style={[
            styles.avatarImage,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        />
      );
    case 'icon':
      return (
        <View
          style={[
            styles.avatarIconContainer,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: avatar.backgroundColor || colors.primaryLight,
            },
          ]}
        >
          <Icon name={avatar.value} size={iconSize} color={avatar.color || colors.white} />
        </View>
      );
    case 'text':
      return (
        <View
          style={[
            styles.avatarTextContainer,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: avatar.backgroundColor || colors.primary,
            },
          ]}
        >
          <Text style={[styles.avatarText, { fontSize: iconSize, color: avatar.color || colors.white }]}>
            {avatar.value.charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    default:
      return null;
  }
};

/**
 * BadgeComponent - Affiche un badge coloré
 */
const BadgeComponent: React.FC<{ badge: CardBadge }> = ({ badge }) => {
  const getBadgeColor = (): string => {
    if (badge.customColor) return badge.customColor;
    
    switch (badge.type) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'info':
        return colors.info;
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const getBadgePosition = (): ViewStyle => {
    switch (badge.position) {
      case 'top-left':
        return styles.badgeTopLeft;
      case 'top-right':
        return styles.badgeTopRight;
      case 'bottom-left':
        return styles.badgeBottomLeft;
      case 'bottom-right':
        return styles.badgeBottomRight;
      default:
        return styles.badgeTopRight;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBadgeColor() }, getBadgePosition()]}>
      <Text style={styles.badgeText}>{badge.text}</Text>
    </View>
  );
};

/**
 * ActionsComponent - Affiche les actions de la carte
 */
const ActionsComponent: React.FC<{ actions: CardAction[] }> = ({ actions }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <View style={styles.actionsContainer}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.actionButton}
          onPress={action.onPress}
          accessibilityLabel={action.accessibilityLabel || `Action ${index + 1}`}
          activeOpacity={0.7}
        >
          <Icon name={action.icon} size={24} color={action.color || colors.gray[600]} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * CustomCard - Carte personnalisée pour Sènè Yiriwa
 * 
 * @example
 * // Carte standard avec image
 * <CustomCard
 *   title="Irrigation goutte à goutte"
 *   subtitle="Technique moderne"
 *   description="Apprenez à installer un système d'irrigation économique pour vos champs"
 *   imageUrl="https://example.com/irrigation.jpg"
 *   variant="elevation"
 *   clickable
 *   onPress={() => navigation.navigate('Technique')}
 * />
 * 
 * @example
 * // Carte avec avatar et actions
 * <CustomCard
 *   title="Conseil du jour"
 *   subtitle="Par Expert Agricole"
 *   avatar={{
 *     type: 'icon',
 *     value: 'leaf',
 *     backgroundColor: '#4CAF50'
 *   }}
 *   actions={[
 *     { icon: 'heart-outline', onPress: () => addFavori() },
 *     { icon: 'share-variant', onPress: () => share() }
 *   ]}
 * />
 * 
 * @example
 * // Carte compacte pour liste
 * <CustomCard
 *   title="Préparation du sol"
 *   variant="compact"
 *   badges={[{ text: 'Débutant', type: 'info' }]}
 *   clickable
 *   onPress={handlePress}
 * />
 */
const CustomCard: React.FC<CustomCardProps> = ({
  title,
  subtitle,
  description,
  imageUrl,
  imageHeight = 200,
  avatar,
  variant = 'standard',
  badges = [],
  actions = [],
  children,
  clickable = false,
  onPress,
  animated = true,
  containerStyle,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  imageStyle,
  avatarStyle,
}) => {
  // État pour l'animation de pression
  const [isPressed, setIsPressed] = useState(false);

  /**
   * Récupère les styles selon la variante
   */
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevation':
        return styles.elevationCard;
      case 'outline':
        return styles.outlineCard;
      case 'compact':
        return styles.compactCard;
      case 'featured':
        return styles.featuredCard;
      case 'standard':
      default:
        return styles.standardCard;
    }
  };

  /**
   * Récupère le style du titre selon la variante
   */
  const getTitleVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'featured':
        return styles.featuredTitle;
      case 'compact':
        return styles.compactTitle;
      default:
        return styles.standardTitle;
    }
  };

  /**
   * Récupère le style de la description selon la variante
   */
  const getDescriptionVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'compact':
        return styles.compactDescription;
      default:
        return styles.standardDescription;
    }
  };

  /**
   * Gère la pression sur la carte
   */
  const handlePressIn = () => {
    if (animated && clickable) {
      setIsPressed(true);
    }
  };

  /**
   * Gère le relâchement sur la carte
   */
  const handlePressOut = () => {
    if (animated && clickable) {
      setIsPressed(false);
    }
  };

  // Styles combinés
  const cardStyles: StyleProp<ViewStyle> = [
    styles.baseCard,
    getVariantStyles(),
    clickable && styles.clickableCard,
    animated && isPressed && styles.pressedCard,
    variant === 'compact' && styles.compactCardContainer,
    containerStyle,
  ];

  /**
   * Rendu du contenu principal de la carte
   */
  const renderContent = () => {
    // Si un contenu personnalisé est fourni, l'utiliser
    if (children) {
      return children;
    }

    return (
      <>
        {/* En-tête avec avatar et titres */}
        {(avatar || title || subtitle) && (
          <View style={styles.header}>
            {avatar && (
              <View style={[styles.avatarWrapper, avatarStyle]}>
                <AvatarComponent avatar={avatar} />
              </View>
            )}
            <View style={styles.headerTextContainer}>
              {title && (
                <Text 
                  style={[getTitleVariantStyle(), titleStyle]} 
                  numberOfLines={variant === 'compact' ? 1 : 2}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Description */}
        {description && (
          <Text 
            style={[getDescriptionVariantStyle(), descriptionStyle]} 
            numberOfLines={variant === 'compact' ? 2 : 3}
          >
            {description}
          </Text>
        )}

        {/* Actions */}
        {actions.length > 0 && <ActionsComponent actions={actions} />}
      </>
    );
  };

  // Carte avec image d'en-tête
  if (imageUrl) {
    const featuredImageHeight = variant === 'featured' ? imageHeight + 60 : imageHeight;
    
    return (
      <TouchableOpacity
        activeOpacity={clickable ? 0.9 : 1}
        onPress={clickable ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!clickable}
        accessibilityRole={clickable ? 'button' : 'none'}
      >
        <View style={cardStyles}>
          {/* Image d'en-tête */}
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.cardImage,
              { height: featuredImageHeight },
              variant === 'featured' && styles.featuredImage,
              imageStyle,
            ]}
            resizeMode="cover"
          />
          
          {/* Badges sur l'image */}
          {badges.map((badge, index) => (
            <BadgeComponent key={index} badge={badge} />
          ))}
          
          {/* Contenu */}
          <View style={styles.contentContainer}>{renderContent()}</View>
        </View>
      </TouchableOpacity>
    );
  }

  // Carte sans image
  return (
    <TouchableOpacity
      activeOpacity={clickable ? 0.9 : 1}
      onPress={clickable ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!clickable}
      accessibilityRole={clickable ? 'button' : 'none'}
      style={cardStyles}
    >
      {/* Badges pour cartes sans image */}
      {badges.map((badge, index) => (
        <BadgeComponent key={index} badge={badge} />
      ))}
      
      {/* Contenu */}
      <View style={styles.contentContainer}>{renderContent()}</View>
    </TouchableOpacity>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  /**
   * Style de base pour toutes les cartes
   */
  baseCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
  },

  /**
   * Carte standard avec ombre légère
   */
  standardCard: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  /**
   * Carte avec ombre prononcée (effet flottant)
   */
  elevationCard: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  /**
   * Carte avec bordure (style outline)
   */
  outlineCard: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },

  /**
   * Carte compacte pour listes denses
   */
  compactCard: {
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
  },

  /**
   * Carte compacte - conteneur
   */
  compactCardContainer: {
    padding: 0,
  },

  /**
   * Carte mise en avant
   */
  featuredCard: {
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },

  /**
   * Style pour carte cliquable
   */
  clickableCard: {
    cursor: 'pointer',
  },

  /**
   * Animation de pression
   */
  pressedCard: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },

  /**
   * Image de la carte
   */
  cardImage: {
    width: '100%',
    backgroundColor: colors.gray[200],
  },

  /**
   * Image pour carte featured
   */
  featuredImage: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  /**
   * Conteneur du contenu
   */
  contentContainer: {
    padding: 16,
  },

  /**
   * En-tête de la carte
   */
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  /**
   * Conteneur de l'avatar
   */
  avatarWrapper: {
    marginRight: 12,
  },

  /**
   * Avatar sous forme d'image
   */
  avatarImage: {
    resizeMode: 'cover',
  },

  /**
   * Conteneur de l'avatar icône
   */
  avatarIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  /**
   * Conteneur de l'avatar texte
   */
  avatarTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  /**
   * Texte de l'avatar
   */
  avatarText: {
    fontWeight: typography.fontWeight.bold,
  },

  /**
   * Conteneur du texte d'en-tête
   */
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  /**
   * Titre standard
   */
  standardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: 4,
  },

  /**
   * Titre compact
   */
  compactTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: 2,
  },

  /**
   * Titre pour carte featured
   */
  featuredTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: 8,
  },

  /**
   * Sous-titre
   */
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },

  /**
   * Description standard
   */
  standardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    lineHeight: 20,
    marginTop: 8,
  },

  /**
   * Description compacte
   */
  compactDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
    lineHeight: 18,
    marginTop: 4,
  },

  /**
   * Conteneur des actions
   */
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },

  /**
   * Bouton d'action
   */
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },

  /**
   * Badge
   */
  badge: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 10,
  },

  /**
   * Texte du badge
   */
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },

  /**
   * Position badge: haut-gauche
   */
  badgeTopLeft: {
    top: 12,
    left: 12,
  },

  /**
   * Position badge: haut-droit
   */
  badgeTopRight: {
    top: 12,
    right: 12,
  },

  /**
   * Position badge: bas-gauche
   */
  badgeBottomLeft: {
    bottom: 12,
    left: 12,
  },

  /**
   * Position badge: bas-droit
   */
  badgeBottomRight: {
    bottom: 12,
    right: 12,
  },
});

// ============================================
// COMPOSANTS DÉRIVÉS POUR CAS SPÉCIFIQUES
// ============================================

/**
 * Carte pour les conseils agricoles
 * Préconfigurée pour l'affichage des conseils
 */
export const ConseilCard: React.FC<Omit<CustomCardProps, 'variant'>> = (props) => (
  <CustomCard
    {...props}
    variant="elevation"
    avatar={{
      type: 'icon',
      value: 'leaf',
      backgroundColor: colors.primaryLight,
    }}
  />
);

/**
 * Carte pour les techniques agricoles
 * Préconfigurée pour l'affichage des techniques
 */
export const TechniqueCard: React.FC<Omit<CustomCardProps, 'variant'>> = (props) => (
  <CustomCard
    {...props}
    variant="standard"
    avatar={{
      type: 'icon',
      value: 'school',
      backgroundColor: colors.secondary,
    }}
  />
);

/**
 * Carte pour les alertes météo
 * Préconfigurée avec style d'alerte
 */
export const AlerteCard: React.FC<Omit<CustomCardProps, 'variant'>> = (props) => (
  <CustomCard
    {...props}
    variant="elevation"
    badges={[{ text: 'Alerte', type: 'error' }]}
  />
);

/**
 * Carte pour les actualités
 * Préconfigurée pour le contenu informatif
 */
export const ActualiteCard: React.FC<Omit<CustomCardProps, 'variant'>> = (props) => (
  <CustomCard
    {...props}
    variant="outline"
  />
);

// ============================================
// EXPORT PAR DÉFAUT
// ============================================
                                  
export default CustomCard;