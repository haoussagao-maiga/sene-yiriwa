/**
 * Composant LoadingSpinner - Sènè Yiriwa
 * 
 * Ce composant fournit un système de chargement personnalisé,
 * réutilisable et adapté aux besoins des agriculteurs maliens.
 * 
 * Fonctionnalités :
 * - Multiple tailles (petit, moyen, grand, extra-large)
 * - Variantes de style (couleurs)
 * - Overlay avec fond semi-transparent
 * - Texte personnalisable
 * - Support des animations Lottie (optionnel)
 * - Délai d'affichage (évite les flashs pour les chargements courts)
 * - Composant complet pour écran entier
 * - Accessibilité (VoiceOver, TalkBack)
 * 
 * @module components/common/LoadingSpinner
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ViewStyle,
  TextStyle,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import colors from '../../styles/colors';
import { typography } from '../../styles/typography';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Tailles du spinner
 */
export type SpinnerSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Variantes de couleur
 */
export type SpinnerVariant = 'primary' | 'white' | 'dark' | 'success' | 'error';

/**
 * Mode d'affichage
 */
export type SpinnerMode = 'inline' | 'overlay' | 'fullscreen';

/**
 * Props du composant LoadingSpinner
 */
export interface LoadingSpinnerProps {
  /** Texte optionnel à afficher sous le spinner */
  text?: string;
  
  /** Taille du spinner */
  size?: SpinnerSize;
  
  /** Variante de couleur */
  variant?: SpinnerVariant;
  
  /** Mode d'affichage */
  mode?: SpinnerMode;
  
  /** Afficher en fullscreen (equivalent to mode: 'fullscreen') */
  fullScreen?: boolean;
  
  /** Délai avant affichage (ms) - évite les flashs pour les chargements courts */
  delay?: number;
  
  /** Transparence de l'overlay (0-1) */
  overlayOpacity?: number;
  
  /** Permet de fermer en cliquant sur l'overlay (mode overlay uniquement) */
  dismissOnOverlayPress?: boolean;
  
  /** Fonction de rappel à la fermeture (dismissOnOverlayPress uniquement) */
  onDismiss?: () => void;
  
  /** Style personnalisé du conteneur */
  containerStyle?: ViewStyle;
  
  /** Style personnalisé du texte */
  textStyle?: TextStyle;
  
  /** Afficher le spinner */
  visible?: boolean;
  
  /** Animation de rotation personnalisée */
  animated?: boolean;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * LoadingSpinner - Indicateur de chargement personnalisé
 * 
 * @example
 * // Spinner inline simple
 * <LoadingSpinner size="medium" />
 * 
 * @example
 * // Spinner avec texte
 * <LoadingSpinner
 *   text="Chargement des conseils..."
 *   size="large"
 *   variant="primary"
 * />
 * 
 * @example
 * // Spinner en overlay avec délai
 * <LoadingSpinner
 *   mode="overlay"
 *   visible={isLoading}
 *   text="Connexion en cours..."
 *   delay={300}
 *   dismissOnOverlayPress
 *   onDismiss={() => setCancelLoading(true)}
 * />
 * 
 * @example
 * // Spinner plein écran
 * <LoadingSpinner
 *   mode="fullscreen"
 *   visible={isPageLoading}
 *   text="Chargement de l'application..."
 *   variant="primary"
 * />
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = 'medium',
  variant = 'primary',
  mode = 'inline',
  fullScreen = false,
  delay = 0,
  overlayOpacity = 0.6,
  dismissOnOverlayPress = false,
  onDismiss,
  containerStyle,
  textStyle,
  visible = true,
  animated = true,
}) => {
  // Use fullScreen prop to set mode
  const displayMode = fullScreen ? 'fullscreen' : mode;
  
  // État pour le délai d'affichage
  const [showSpinner, setShowSpinner] = useState(delay === 0);
  
  // Animation de rotation (pour spinner personnalisé)
  const spinValue = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  /**
   * Gestion du délai d'affichage
   */
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (delay > 0 && visible) {
      timeout = setTimeout(() => {
        setShowSpinner(true);
      }, delay);
    } else {
      setShowSpinner(delay === 0);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [delay, visible]);

  /**
   * Animation d'entrée
   */
  useEffect(() => {
    if (animated && showSpinner && visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();
    } else if (!visible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showSpinner, visible, animated]);

  /**
   * Animation de rotation continue
   */
  useEffect(() => {
    if (animated && showSpinner && visible) {
      const startSpin = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start(() => {
          if (showSpinner && visible) startSpin();
        });
      };
      startSpin();
    }
  }, [showSpinner, visible, animated]);

  /**
   * Récupère la taille du spinner selon la prop size
   */
  const getSpinnerSize = (): number | 'small' | 'large' => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 36;
      case 'large':
        return 48;
      case 'xlarge':
        return 64;
      default:
        return 36;
    }
  };

  /**
   * Récupère la couleur du spinner selon la variante
   */
  const getSpinnerColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'white':
        return colors.white;
      case 'dark':
        return colors.gray[800];
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  /**
   * Récupère la couleur du texte selon la variante
   */
  const getTextColor = (): string => {
    switch (variant) {
      case 'white':
        return colors.white;
      case 'primary':
        return colors.primary;
      case 'dark':
        return colors.gray[800];
      default:
        return colors.gray[600];
    }
  };

  /**
   * Récupère la couleur de fond de l'overlay
   */
  const getOverlayBackgroundColor = (): string => {
    if (variant === 'white') {
      return `rgba(0, 0, 0, ${overlayOpacity})`;
    }
    return `rgba(0, 0, 0, ${overlayOpacity})`;
  };

  /**
   * Animation de rotation
   */
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /**
   * Rendu du contenu du spinner
   */
  const renderSpinnerContent = () => {
    const spinnerColor = getSpinnerColor();
    const spinnerSize = getSpinnerSize();
    const textColor = getTextColor();

    return (
      <Animated.View
        style={[
          styles.spinnerContainer,
          animated && { opacity: fadeAnim },
          mode === 'inline' && styles.inlineContainer,
        ]}
      >
        {/* Spinner animé ou standard */}
        {animated ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <ActivityIndicator
              size={Platform.OS === 'ios' ? spinnerSize : 'large'}
              color={spinnerColor}
              animating={showSpinner && visible}
            />
          </Animated.View>
        ) : (
          <ActivityIndicator
            size={Platform.OS === 'ios' ? spinnerSize : 'large'}
            color={spinnerColor}
            animating={showSpinner && visible}
          />
        )}
        
        {/* Texte optionnel */}
        {text && (
          <Text
            style={[
              styles.text,
              { color: textColor },
              size === 'small' && styles.textSmall,
              size === 'xlarge' && styles.textLarge,
              textStyle,
            ]}
          >
            {text}
          </Text>
        )}
      </Animated.View>
    );
  };

  // Ne rien afficher si le spinner est masqué ou en délai
  if (!visible || !showSpinner) {
    return null;
  }

  // Mode inline - simple conteneur
  if (displayMode === 'inline') {
    return renderSpinnerContent();
  }

  // Mode overlay - avec overlay semi-transparent
  if (displayMode === 'overlay') {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (dismissOnOverlayPress && onDismiss) {
            onDismiss();
          }
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (dismissOnOverlayPress && onDismiss) {
              onDismiss();
            }
          }}
        >
          <View
            style={[
              styles.overlayContainer,
              { backgroundColor: getOverlayBackgroundColor() },
            ]}
          >
            <View style={styles.overlayContent}>
              {renderSpinnerContent()}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  // Mode fullscreen - écran complet
  return (
    <Modal
      transparent={false}
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
    >
      <View style={[styles.fullscreenContainer, containerStyle]}>
        {renderSpinnerContent()}
      </View>
    </Modal>
  );
};

// ============================================
// COMPOSANTS DÉRIVÉS
// ============================================

/**
 * Spinner inline standard (pour listes, boutons)
 */
export const InlineSpinner: React.FC<Omit<LoadingSpinnerProps, 'mode'>> = (props) => (
  <LoadingSpinner {...props} mode="inline" />
);

/**
 * Spinner overlay avec fond semi-transparent
 */
export const OverlaySpinner: React.FC<Omit<LoadingSpinnerProps, 'mode'>> = (props) => (
  <LoadingSpinner {...props} mode="overlay" />
);

/**
 * Spinner plein écran (chargement de page)
 */
export const FullscreenSpinner: React.FC<Omit<LoadingSpinnerProps, 'mode'>> = (props) => (
  <LoadingSpinner {...props} mode="fullscreen" variant="primary" />
);

/**
 * Petit spinner (pour boutons, petites zones)
 */
export const SmallSpinner: React.FC<Pick<LoadingSpinnerProps, 'variant' | 'text'>> = (props) => (
  <LoadingSpinner {...props} size="small" />
);

/**
 * Grand spinner (pour chargements importants)
 */
export const LargeSpinner: React.FC<Pick<LoadingSpinnerProps, 'variant' | 'text'>> = (props) => (
  <LoadingSpinner {...props} size="large" />
);

/**
 * Spinner blanc (pour fonds colorés)
 */
export const WhiteSpinner: React.FC<Pick<LoadingSpinnerProps, 'size' | 'text' | 'mode'>> = (props) => (
  <LoadingSpinner {...props} variant="white" />
);

/**
 * Spinner de chargement avec message personnalisé
 */
export const LoadingMessage: React.FC<{ message: string; visible?: boolean }> = ({
  message,
  visible = true,
}) => (
  <LoadingSpinner
    text={message}
    size="medium"
    variant="primary"
    mode="overlay"
    visible={visible}
    delay={200}
  />
);

// ============================================
// COMPOSANT POUR ÉCRAN DE CHARGEMENT INITIAL
// ============================================

/**
 * Écran de chargement complet avec logo et animation
 */
export const SplashLoadingScreen: React.FC<{
  text?: string;
  logo?: React.ReactNode;
}> = ({ text = "Sènè Yiriwa", logo }) => {
  return (
    <View style={styles.splashContainer}>
      {logo ? (
        logo
      ) : (
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🌾</Text>
        </View>
      )}
      
      <Text style={styles.splashTitle}>Sènè Yiriwa</Text>
      <Text style={styles.splashSubtitle}>{text}</Text>
      
      <View style={styles.splashSpinnerContainer}>
        <LoadingSpinner size="small" variant="primary" />
      </View>
    </View>
  );
};

// ============================================
// HOOK PERSONNALISÉ POUR GÉRER LE CHARGEMENT
// ============================================

/**
 * Hook pour gérer l'état de chargement
 * 
 * @example
 * const { isLoading, startLoading, stopLoading, LoadingComponent } = useLoading();
 * 
 * // Démarrer le chargement
 * startLoading("Chargement des données...");
 * 
 * // Arrêter le chargement
 * stopLoading();
 * 
 * // Dans le rendu
 * <LoadingComponent mode="overlay" />
 */
export const useLoading = (defaultMode: SpinnerMode = 'inline') => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string | undefined>();
  const [mode, setMode] = useState<SpinnerMode>(defaultMode);

  const startLoading = (text?: string, loadingMode?: SpinnerMode) => {
    setLoadingText(text);
    if (loadingMode) setMode(loadingMode);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingText(undefined);
  };

  const LoadingComponent = () => (
    <LoadingSpinner
      visible={isLoading}
      text={loadingText}
      mode={mode}
    />
  );

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    LoadingComponent,
    setMode,
  };
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  /**
   * Conteneur inline
   */
  inlineContainer: {
    padding: 8,
  },

  /**
   * Conteneur du spinner
   */
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  /**
   * Texte du spinner
   */
  text: {
    fontSize: typography.fontSize.sm,
    marginTop: 12,
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular,
  },

  /**
   * Petit texte
   */
  textSmall: {
    fontSize: typography.fontSize.xs,
    marginTop: 8,
  },

  /**
   * Grand texte
   */
  textLarge: {
    fontSize: typography.fontSize.lg,
    marginTop: 16,
  },

  /**
   * Conteneur overlay
   */
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /**
   * Contenu overlay
   */
  overlayContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    minWidth: 150,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  /**
   * Conteneur fullscreen
   */
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },

  /**
   * Conteneur splash screen
   */
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },

  /**
   * Conteneur du logo
   */
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  /**
   * Texte du logo
   */
  logoText: {
    fontSize: 50,
  },

  /**
   * Titre splash screen
   */
  splashTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },

  /**
   * Sous-titre splash screen
   */
  splashSubtitle: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },

  /**
   * Conteneur spinner splash
   */
  splashSpinnerContainer: {
    marginTop: 20,
  },
});

// Import pour TouchableWithoutFeedback (évite l'erreur)
import { TouchableWithoutFeedback } from 'react-native';

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default LoadingSpinner;