/**
 * Composant ErrorMessage - Sènè Yiriwa
 * 
 * Ce composant fournit un système d'affichage d'erreurs et de messages
 * d'information personnalisés, réutilisables et adaptés aux besoins
 * des agriculteurs maliens.
 * 
 * Fonctionnalités :
 * - Multiples types de messages (erreur, succès, avertissement, info)
 * - Animations d'entrée et de sortie
 * - Icônes automatiques par type
 * - Bouton de fermeture optionnel
 * - Auto-dissipation configurable
 * - Support des actions (boutons)
 * - Accessibilité (VoiceOver, TalkBack)
 * 
 * @module components/common/ErrorMessage
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../styles/colors';
import { typography } from '../../styles/typography';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Types de messages disponibles
 */
export type MessageType = 'error' | 'success' | 'warning' | 'info';

/**
 * Positions d'affichage
 */
export type MessagePosition = 'top' | 'bottom' | 'center';

/**
 * Animation d'entrée/sortie
 */
export type AnimationType = 'fade' | 'slide' | 'scale';

/**
 * Action du message (bouton)
 */
export interface MessageAction {
  /** Texte du bouton */
  label: string;
  /** Fonction de rappel */
  onPress: () => void;
  /** Variante de style */
  variant?: 'primary' | 'secondary' | 'text';
}

/**
 * Props du composant ErrorMessage
 */
export interface ErrorMessageProps {
  /** Message à afficher */
  message: string;
  
  /** Type de message */
  type?: MessageType;
  
  /** Position d'affichage */
  position?: MessagePosition;
  
  /** Type d'animation */
  animation?: AnimationType;
  
  /** Durée d'affichage (0 pour illimité) */
  duration?: number;
  
  /** Afficher le bouton de fermeture */
  showCloseButton?: boolean;
  
  /** Fonction de rappel à la fermeture */
  onClose?: () => void;
  
  /** Actions supplémentaires (boutons) */
  actions?: MessageAction[];
  
  /** Style personnalisé du conteneur */
  containerStyle?: ViewStyle;
  
  /** Style personnalisé du texte */
  textStyle?: TextStyle;
  
  /** Style personnalisé de l'icône */
  iconStyle?: ViewStyle;
  
  /** Désactiver l'accessibilité auto */
  disableAccessibility?: boolean;
  
  /** En-tête du message (optionnel) */
  title?: string;
  
  /** Afficher l'icône */
  showIcon?: boolean;
  
  /** Permet de réessayer (affiche un bouton réessayer) */
  showRetry?: boolean;
  
  /** Fonction de rappel pour réessayer */
  onRetry?: () => void;
  
  /** Icône personnalisée */
  customIcon?: string;
}

// ============================================
// SOUS-COMPOSANTS
// ============================================

/**
 * Icône du message selon le type
 */
const MessageIcon: React.FC<{ type: MessageType; customIcon?: string }> = ({ 
  type, 
  customIcon 
}) => {
  if (customIcon) {
    return <Icon name={customIcon} size={24} color={colors.white} />;
  }

  const iconMap = {
    error: 'alert-circle',
    success: 'check-circle',
    warning: 'alert',
    info: 'information',
  };

  const colorMap = {
    error: colors.white,
    success: colors.white,
    warning: colors.white,
    info: colors.white,
  };

  return (
    <Icon
      name={iconMap[type]}
      size={24}
      color={colorMap[type]}
    />
  );
};

/**
 * Bouton d'action
 */
const ActionButton: React.FC<{ action: MessageAction; type: MessageType }> = ({ 
  action, 
  type 
}) => {
  const getButtonStyle = (): ViewStyle => {
    switch (action.variant) {
      case 'primary':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.5)',
        };
      default:
        return {};
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (action.variant) {
      case 'primary':
      case 'secondary':
        return { color: colors.white };
      default:
        return { color: colors.white, textDecorationLine: 'underline' };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.actionButton, getButtonStyle()]}
      onPress={action.onPress}
      activeOpacity={0.7}
      accessibilityLabel={action.label}
      accessibilityRole="button"
    >
      <Text style={[styles.actionText, getTextStyle()]}>{action.label}</Text>
    </TouchableOpacity>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * ErrorMessage - Message d'erreur/information personnalisé
 * 
 * @example
 * // Message d'erreur simple
 * <ErrorMessage
 *   message="Une erreur est survenue lors de la connexion"
 *   type="error"
 *   showCloseButton
 *   onClose={() => setError(null)}
 * />
 * 
 * @example
 * // Message de succès avec auto-dissipation
 * <ErrorMessage
 *   message="Inscription réussie !"
 *   type="success"
 *   duration={3000}
 *   onClose={() => setSuccess(null)}
 * />
 * 
 * @example
 * // Message d'avertissement avec action
 * <ErrorMessage
 *   message="Votre session va expirer dans 5 minutes"
 *   type="warning"
 *   title="Attention"
 *   actions={[
 *     { label: 'Rester connecté', onPress: refreshSession, variant: 'primary' },
 *     { label: 'Se déconnecter', onPress: logout }
 *   ]}
 * />
 * 
 * @example
 * // Message d'erreur avec bouton réessayer
 * <ErrorMessage
 *   message="Impossible de charger les conseils"
 *   type="error"
 *   showRetry
 *   onRetry={fetchConseils}
 *   onClose={() => setError(null)}
 * />
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  position = 'top',
  animation = 'fade',
  duration = 0,
  showCloseButton = true,
  onClose,
  actions = [],
  containerStyle,
  textStyle,
  iconStyle,
  disableAccessibility = false,
  title,
  showIcon = true,
  showRetry = false,
  onRetry,
  customIcon,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Récupère la couleur de fond selon le type
   */
  const getBackgroundColor = (): string => {
    switch (type) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.error;
    }
  };

  /**
   * Récupère la position initiale pour l'animation slide
   */
  const getInitialSlideValue = (): number => {
    switch (position) {
      case 'top':
        return -100;
      case 'bottom':
        return 100;
      case 'center':
        return 0;
      default:
        return -100;
    }
  };

  /**
   * Récupère la position finale pour l'animation slide
   */
  const getFinalSlideValue = (): number => {
    return 0;
  };

  /**
   * Récupère le style de positionnement
   */
  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'top':
        return styles.positionTop;
      case 'bottom':
        return styles.positionBottom;
      case 'center':
        return styles.positionCenter;
      default:
        return styles.positionTop;
    }
  };

  /**
   * Lance l'animation d'entrée
   */
  const animateIn = () => {
    switch (animation) {
      case 'fade':
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        break;
      case 'slide':
        slideAnim.setValue(getInitialSlideValue());
        Animated.spring(slideAnim, {
          toValue: getFinalSlideValue(),
          tension: 65,
          friction: 7,
          useNativeDriver: true,
        }).start();
        break;
      case 'scale':
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 7,
          useNativeDriver: true,
        }).start();
        break;
    }
  };

  /**
   * Lance l'animation de sortie
   */
  const animateOut = (callback: () => void) => {
    switch (animation) {
      case 'fade':
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => callback());
        break;
      case 'slide':
        Animated.timing(slideAnim, {
          toValue: getInitialSlideValue(),
          duration: 250,
          useNativeDriver: true,
        }).start(() => callback());
        break;
      case 'scale':
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => callback());
        break;
    }
  };

  /**
   * Ferme le message
   */
  const closeMessage = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    animateOut(() => {
      onClose?.();
    });
  };

  /**
   * Gère le clic sur réessayer
   */
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      closeMessage();
    }
  };

  // Effet pour l'animation d'entrée
  useEffect(() => {
    animateIn();

    // Auto-dissipation
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        closeMessage();
      }, duration);
    }

    // Annonce d'accessibilité
    if (!disableAccessibility && message) {
      const announcement = `${type === 'error' ? 'Erreur' : type === 'success' ? 'Succès' : 'Information'}: ${message}`;
      AccessibilityInfo.announceForAccessibility(announcement);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Animation style
  const getAnimatedStyle = (): any => {
    switch (animation) {
      case 'fade':
        return { opacity: fadeAnim };
      case 'slide':
        return { transform: [{ translateY: slideAnim }] };
      case 'scale':
        return { transform: [{ scale: scaleAnim }] };
      default:
        return { opacity: fadeAnim };
    }
  };

  // Toutes les actions (incluant réessayer si demandé)
  const allActions = [...actions];
  if (showRetry && onRetry) {
    allActions.push({
      label: 'Réessayer',
      onPress: handleRetry,
      variant: 'primary',
    });
  }

  const backgroundColor = getBackgroundColor();

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        { backgroundColor },
        getAnimatedStyle(),
        containerStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View style={styles.contentContainer}>
        {/* Icône */}
        {showIcon && (
          <View style={[styles.iconContainer, iconStyle]}>
            <MessageIcon type={type} customIcon={customIcon} />
          </View>
        )}

        {/* Texte */}
        <View style={styles.textContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={[styles.message, textStyle]}>{message}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {allActions.map((action, index) => (
            <ActionButton key={index} action={action} type={type} />
          ))}
          
          {/* Bouton de fermeture */}
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeMessage}
              activeOpacity={0.7}
              accessibilityLabel="Fermer"
              accessibilityRole="button"
            >
              <Icon name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

// ============================================
// COMPOSANTS DÉRIVÉS
// ============================================

/**
 * Composant pour les erreurs de connexion réseau
 * 
 * @example
 * <NetworkErrorMessage
 *   onRetry={reconnect}
 *   onClose={() => setShowError(false)}
 * />
 */
export const NetworkErrorMessage: React.FC<{
  onRetry: () => void;
  onClose: () => void;
}> = ({ onRetry, onClose }) => (
  <ErrorMessage
    type="error"
    title="Problème de connexion"
    message="Vérifiez votre connexion internet et réessayez"
    showRetry
    onRetry={onRetry}
    showCloseButton
    onClose={onClose}
    duration={0}
  />
);

/**
 * Composant pour les erreurs 401 (non authentifié)
 */
export const UnauthorizedErrorMessage: React.FC<{
  onLogin: () => void;
  onClose: () => void;
}> = ({ onLogin, onClose }) => (
  <ErrorMessage
    type="warning"
    title="Session expirée"
    message="Veuillez vous reconnecter pour continuer"
    actions={[
      {
        label: 'Se connecter',
        onPress: onLogin,
        variant: 'primary',
      },
    ]}
    showCloseButton
    onClose={onClose}
  />
);

/**
 * Composant pour les erreurs serveur (500)
 */
export const ServerErrorMessage: React.FC<{
  onRetry: () => void;
  onClose: () => void;
}> = ({ onRetry, onClose }) => (
  <ErrorMessage
    type="error"
    title="Erreur serveur"
    message="Une erreur est survenue. Veuillez réessayer plus tard."
    showRetry
    onRetry={onRetry}
    showCloseButton
    onClose={onClose}
  />
);

/**
 * Composant pour les messages de succès d'enregistrement
 */
export const SuccessSaveMessage: React.FC<{
  message?: string;
  onClose: () => void;
  duration?: number;
}> = ({ message = "Enregistrement réussi !", onClose, duration = 3000 }) => (
  <ErrorMessage
    type="success"
    message={message}
    duration={duration}
    showCloseButton
    onClose={onClose}
  />
);

/**
 * Composant pour les messages de chargement/attente
 */
export const InfoMessage: React.FC<{
  message: string;
  duration?: number;
  onClose?: () => void;
}> = ({ message, duration = 4000, onClose }) => (
  <ErrorMessage
    type="info"
    message={message}
    duration={duration}
    showCloseButton
    onClose={onClose}
  />
);

// ============================================
// HOOK PERSONNALISÉ POUR GÉRER LES MESSAGES
// ============================================

/**
 * Hook pour gérer l'affichage des messages
 * 
 * @example
 * const { showMessage, hideMessage, MessageComponent } = useErrorMessage();
 * 
 * // Afficher un message
 * showMessage({
 *   message: "Connexion réussie !",
 *   type: "success",
 *   duration: 3000
 * });
 * 
 * // Afficher une erreur
 * showMessage({
 *   message: "Erreur de connexion",
 *   type: "error",
 *   showRetry: true,
 *   onRetry: () => console.log("Retry")
 * });
 */
export const useErrorMessage = () => {
  const [messageProps, setMessageProps] = React.useState<ErrorMessageProps | null>(null);

  const showMessage = (props: ErrorMessageProps) => {
    setMessageProps(props);
  };

  const hideMessage = () => {
    setMessageProps(null);
  };

  const MessageComponent = () => {
    if (!messageProps) return null;
    
    return (
      <ErrorMessage
        {...messageProps}
        onClose={() => {
          messageProps.onClose?.();
          hideMessage();
        }}
      />
    );
  };

  return {
    showMessage,
    hideMessage,
    MessageComponent,
  };
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  /**
   * Conteneur principal
   */
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 1000,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  /**
   * Position: haut
   */
  positionTop: {
    top: Platform.OS === 'ios' ? 50 : 40,
  },

  /**
   * Position: bas
   */
  positionBottom: {
    bottom: Platform.OS === 'ios' ? 80 : 70,
  },

  /**
   * Position: centre
   */
  positionCenter: {
    top: '45%',
    transform: [{ translateY: -50 }],
  },

  /**
   * Conteneur du contenu
   */
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  /**
   * Conteneur de l'icône
   */
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },

  /**
   * Conteneur du texte
   */
  textContainer: {
    flex: 1,
  },

  /**
   * Titre du message
   */
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: 4,
  },

  /**
   * Texte du message
   */
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    lineHeight: 20,
    flex: 1,
  },

  /**
   * Conteneur des actions
   */
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },

  /**
   * Bouton d'action
   */
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },

  /**
   * Texte du bouton d'action
   */
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },

  /**
   * Bouton de fermeture
   */
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default ErrorMessage;