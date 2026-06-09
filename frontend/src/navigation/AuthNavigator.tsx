/**
 * AuthNavigator - Sènè Yiriwa
 * 
 * Ce fichier configure la navigation pour les écrans d'authentification
 * de l'application. Il gère l'accès aux écrans de connexion, d'inscription,
 * de récupération de mot de passe et d'onboarding.
 * 
 * Fonctionnalités :
 * - Navigation entre les écrans d'authentification
 * - Animations de transition personnalisées
 * - Gestion des en-têtes avec/sans bouton de retour
 * - Types TypeScript pour la sécurité
 * - Deep linking pour les liens de réinitialisation
 * - Gestion des erreurs de navigation
 * 
 * @module navigation/AuthNavigator
 */

import React, { useCallback } from 'react';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import des écrans d'authentification
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';
import OnboardingScreen from './screens/auth/OnboardingScreen';
import WelcomeScreen from './screens/auth/WelcomeScreen';

// Import des types
import { AuthStackParamList } from './types';

// Import des styles
import colors from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

// Création du stack navigator
const Stack = createStackNavigator<AuthStackParamList>();

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Props du composant AuthNavigator
 */
export interface AuthNavigatorProps {
  /** Écran initial (par défaut: 'Login') */
  initialRouteName?: keyof AuthStackParamList;
  
  /** Désactiver les animations */
  disableAnimations?: boolean;
  
  /** Mode onboarding actif */
  isOnboarding?: boolean;
}

// ============================================
// COMPOSANTS PERSONNALISÉS POUR LES EN-TÊTES
// ============================================

/**
 * Bouton de retour personnalisé
 */
const BackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.backButton}>
    <Icon name="chevron-left" size={24} color={colors.gray[800]} />
  </TouchableOpacity>
);

/**
 * Bouton de fermeture personnalisé
 */
const CloseButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.closeButton}>
    <Icon name="close" size={24} color={colors.gray[800]} />
  </TouchableOpacity>
);

/**
 * Titre personnalisé pour l'en-tête
 */
const HeaderTitle: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.headerTitle}>{title}</Text>
);

// ============================================
// OPTIONS D'ÉCRANS
// ============================================

/**
 * Options par défaut pour tous les écrans d'authentification
 */
const defaultScreenOptions = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerTitleAlign: 'center' as const,
  headerStyle: {
    backgroundColor: colors.white,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.gray[900],
  },
  cardStyle: {
    backgroundColor: colors.background,
  },
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
};

/**
 * Options pour les écrans avec bouton de retour
 */
const screenOptionsWithBack = ({ navigation }: any) => ({
  ...defaultScreenOptions,
  headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
});

/**
 * Options pour les écrans sans bouton de retour
 */
const screenOptionsWithoutBack = {
  ...defaultScreenOptions,
  headerLeft: () => null,
};

/**
 * Options pour l'écran de connexion
 */
const loginScreenOptions = {
  ...defaultScreenOptions,
  title: '',
  headerShown: false,
};

/**
 * Options pour l'écran d'inscription
 */
const registerScreenOptions = ({ navigation }: any) => ({
  ...defaultScreenOptions,
  title: '',
  headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
  headerShown: true,
});

/**
 * Options pour l'écran mot de passe oublié
 */
const forgotPasswordScreenOptions = ({ navigation }: any) => ({
  ...defaultScreenOptions,
  title: '',
  headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
  headerShown: true,
});

/**
 * Options pour l'écran de réinitialisation du mot de passe
 */
const resetPasswordScreenOptions = ({ navigation }: any) => ({
  ...defaultScreenOptions,
  title: '',
  headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
  headerShown: true,
});

/**
 * Options pour l'écran d'onboarding
 */
const onboardingScreenOptions = {
  ...defaultScreenOptions,
  headerShown: false,
  gestureEnabled: false,
};

/**
 * Options pour l'écran de bienvenue
 */
const welcomeScreenOptions = {
  ...defaultScreenOptions,
  headerShown: false,
  gestureEnabled: false,
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * AuthNavigator - Navigateur pour les écrans d'authentification
 * 
 * @example
 * // Utilisation basique
 * <AuthNavigator />
 * 
 * @example
 * // Avec écran initial personnalisé
 * <AuthNavigator initialRouteName="Register" />
 * 
 * @example
 * // Mode onboarding
 * <AuthNavigator isOnboarding={true} />
 */
const AuthNavigator: React.FC<AuthNavigatorProps> = ({
  initialRouteName = 'Login',
  disableAnimations = false,
  isOnboarding = false,
}) => {
  const { t } = useTranslation();

  // Si en mode onboarding, afficher seulement l'écran d'onboarding
  if (isOnboarding) {
    return (
      <Stack.Navigator
        screenOptions={{
          ...onboardingScreenOptions,
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={onboardingScreenOptions}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={welcomeScreenOptions}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        ...defaultScreenOptions,
      }}
    >
      {/* Écran de connexion */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={loginScreenOptions}
      />

      {/* Écran d'inscription */}
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={registerScreenOptions}
      />

      {/* Écran mot de passe oublié */}
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={forgotPasswordScreenOptions}
      />

      {/* Écran de réinitialisation du mot de passe */}
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={resetPasswordScreenOptions}
      />

      {/* Écran d'onboarding (accessible depuis l'authentification) */}
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={onboardingScreenOptions}
      />
    </Stack.Navigator>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginLeft: spacing.xs,
  },
  closeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.gray[900],
  },
});

// ============================================
// COMPOSANTS DÉRIVÉS
// ============================================

/**
 * Navigateur pour le mode onboarding uniquement
 * 
 * @example
 * <OnboardingNavigator />
 */
export const OnboardingNavigator: React.FC = () => (
  <AuthNavigator isOnboarding={true} />
);

/**
 * Navigateur pour la réinitialisation du mot de passe
 * 
 * @example
 * <ResetPasswordNavigator token="reset-token-123" />
 */
export const ResetPasswordNavigator: React.FC<{ token: string }> = ({ token }) => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="ResetPassword"
      component={ResetPasswordScreen}
      initialParams={{ token }}
      options={resetPasswordScreenOptions}
    />
  </Stack.Navigator>
);

// ============================================
// HOOK PERSONNALISÉ POUR LA NAVIGATION AUTH
// ============================================

/**
 * Hook personnalisé pour la navigation dans AuthNavigator
 * 
 * @example
 * const { navigateToLogin, navigateToRegister, goBack } = useAuthNavigation();
 */
export const useAuthNavigation = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  
  const navigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);
  
  const navigateToRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);
  
  const navigateToForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);
  
  const navigateToResetPassword = useCallback((token: string) => {
    navigation.navigate('ResetPassword', { token });
  }, [navigation]);
  
  const navigateToOnboarding = useCallback(() => {
    navigation.navigate('Onboarding');
  }, [navigation]);
  
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  return {
    navigateToLogin,
    navigateToRegister,
    navigateToForgotPassword,
    navigateToResetPassword,
    navigateToOnboarding,
    goBack,
  };
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default AuthNavigator;

