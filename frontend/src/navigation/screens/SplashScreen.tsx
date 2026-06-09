/**
 * SplashScreen - Sènè Yiriwa
 * 
 * Écran de démarrage de l'application. S'affiche pendant le chargement
 * initial des ressources et la vérification de l'authentification.
 * 
 * Fonctionnalités :
 * - Animation de logo
 * - Animation de texte
 * - Chargement des ressources
 * - Vérification de session
 * - Transition automatique
 * - Version de l'application
 * 
 * @module screens/SplashScreen
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import  colors  from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const { width, height } = Dimensions.get('window');

// ============================================
// CONSTANTES
// ============================================

/**
 * Durée d'affichage du splash screen (millisecondes)
 */
const SPLASH_DURATION = 2000;

/**
 * Messages à afficher en rotation
 */
const LOADING_MESSAGES = [
  'Chargement des conseils agricoles...',
  'Préparation de la météo...',
  'Techniques en cours de chargement...',
  'Bientôt prêt !',
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * SplashScreen - Écran de démarrage
 * 
 * @example
 * // Navigation automatique après chargement
 * <SplashScreen />
 */
const SplashScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Animations
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const messageIndex = useRef(0);
  const [currentMessage, setCurrentMessage] = React.useState(LOADING_MESSAGES[0]);
  
  // Timer pour les messages rotatifs
  const messageInterval = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // ANIMATIONS
  // ============================================

  useEffect(() => {
    // Animation du logo (zoom + fondu)
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation du texte principal
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // Animation du sous-titre
    setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 600);

    // Animation de la barre de progression
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: SPLASH_DURATION,
      useNativeDriver: false,
    }).start();

    // Rotation des messages
    messageInterval.current = setInterval(() => {
      messageIndex.current = (messageIndex.current + 1) % LOADING_MESSAGES.length;
      setCurrentMessage(LOADING_MESSAGES[messageIndex.current]);
      
      // Animation de transition des messages
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    // Nettoyage
    return () => {
      if (messageInterval.current) {
        clearInterval(messageInterval.current);
      }
    };
  }, []);

  // ============================================
  // CONFIGURATION DE LA BARRE DE STATUT
  // ============================================

  useEffect(() => {
    // Barre de statut claire pour le splash screen
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.primary);
      StatusBar.setTranslucent(false);
    }
  }, []);

  // ============================================
  // GESTION DE LA TRANSITION
  // ============================================

  // Attendre la fin de l'animation et la vérification d'auth
  useEffect(() => {
    const timer = setTimeout(() => {
      // La navigation sera gérée par AppNavigator
      // en fonction de isAuthenticated
    }, SPLASH_DURATION);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, authLoading]);

  // ============================================
  // RENDU
  // ============================================

  const progressPercentage = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Logo animé */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Text style={styles.logoEmoji}>🌾</Text>
        <Text style={styles.logoText}>Sènè Yiriwa</Text>
      </Animated.View>

      {/* Message de chargement */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.loadingMessage}>{currentMessage}</Text>
        
        {/* Barre de progression */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              { width: progressPercentage },
            ]}
          />
        </View>
      </Animated.View>

      {/* Sous-titre */}
      <Animated.View style={[styles.subtitleContainer, { opacity: subtitleOpacity }]}>
        <Text style={styles.subtitle}>
          Agriculture moderne au Mali
        </Text>
      </Animated.View>

      {/* Version de l'application */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    letterSpacing: 1,
  },
  
  // Chargement
  loadingContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  loadingMessage: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    width: width * 0.6,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 3,
  },
  
  // Sous-titre
  subtitleContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Version
  version: {
    position: 'absolute',
    bottom: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

// ============================================
// COMPOSANT SPLASH AVEC ANIMATION LOTTIE (OPTIONNEL)
// ============================================

/**
 * SplashScreenLottie - Version avec animation Lottie
 * Nécessite l'installation de lottie-react-native
 * 
 * @example
 * import LottieView from 'lottie-react-native';
 * 
 * const SplashScreenLottie: React.FC = () => {
 *   const animation = useRef(null);
 *   
 *   return (
 *     <View style={styles.container}>
 *       <LottieView
 *         ref={animation}
 *         source={require('../assets/animations/splash.json')}
 *         autoPlay
 *         loop={false}
 *         onAnimationFinish={() => {
 *           // Navigation après animation
 *         }}
 *         style={styles.lottie}
 *       />
 *     </View>
 *   );
 * };
 */

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default SplashScreen;