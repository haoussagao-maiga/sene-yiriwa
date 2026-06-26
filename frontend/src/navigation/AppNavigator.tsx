/**
 * AppNavigator - Sènè Yiriwa
 * 
 * Ce fichier configure la navigation principale de l'application.
 * Il gère les écrans d'authentification et les écrans principaux
 * en fonction de l'état de connexion de l'utilisateur.
 * 
 * Fonctionnalités :
 * - Gestion des écrans publics (non authentifiés)
 * - Gestion des écrans privés (authentifiés)
 * - Animation de transition entre les écrans
 * - Deep linking (optionnel)
 * - Gestion des erreurs de navigation
 * - Types TypeScript pour la navigation
 * 
 * @module navigation/AppNavigator
 */

import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { StatusBar, Platform, Linking } from 'react-native';

// Import des écrans d'authentification
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';
import OnboardingScreen from './screens/auth/OnboardingScreen';

// Import des écrans principaux
import MainNavigator from './MainNavigator';

// Import du navigateur admin
import AdminNavigator from './AdminNavigator';

// Import des types
import { RootStackParamList, AuthStackParamList, MainStackParamList } from './types';

// Import des hooks et services
import { useAuth } from '../hooks/useAuth';
import colors from '../styles/colors';

// Création des stack navigators
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Props du composant AppNavigator
 */
export interface AppNavigatorProps {}

/**
 * État de l'application pour la navigation
 */
interface NavigationState {
  isReady: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  initialRoute: string;
}

// ============================================
// STACK NAVIGATORS
// ============================================

/**
 * Stack Navigator pour les écrans non authentifiés
 * 
 * @example
 * <AuthStackNavigator />
 */
const AuthStackNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
        // animation options are managed per-screen or by the navigator implementation
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
      />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
      />
      <AuthStack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
      />
      <AuthStack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
      />
    </AuthStack.Navigator>
  );
};

/**
 * Stack Navigator principal (authentifié)
 * 
 * @example
 * <MainStackNavigator />
 */
const MainStackNavigator = () => {
  return <MainNavigator />;
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * AppNavigator - Navigateur principal de l'application
 * 
 * @example
 * // Dans App.tsx
 * <AppNavigator />
 * 
 * @example
 * // Avec référence pour navigation programmatique
 * <AppNavigator setNavigationRef={(ref) => navigationRef = ref} />
 */
const AppNavigator: React.FC<AppNavigatorProps> = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const dispatch = useDispatch();
  
  // État local pour le chargement initial
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);

  /**
   * Détermination de l'écran initial
   */
  const getInitialRouteName = (): keyof RootStackParamList => {
    // Priorité au onboarding si non complété
    if (!hasCompletedOnboarding) {
      return 'Onboarding';
    }
    
    // Navigation selon l'état d'authentification
    if (isAuthenticated) {
      // Si l'utilisateur est administrateur, aller vers Admin
      if (user?.role === 'administrateur') {
        return 'Admin';
      }
      return 'App';
    }
    
    return 'Auth';
  };

  // Simuler le chargement du onboarding (à remplacer par AsyncStorage)
  React.useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Vérifier si l'utilisateur a déjà vu le onboarding
        // const completed = await AsyncStorage.getItem('onboarding_completed');
        // setHasCompletedOnboarding(!!completed);
        
        // Simulation - à remplacer par la vraie vérification
        setHasCompletedOnboarding(true);
      } catch (error) {
        console.error('[AppNavigator] Erreur chargement onboarding:', error);
        setHasCompletedOnboarding(true);
      }
    };
    
    checkOnboardingStatus();
  }, []);

  // Configuration de la barre de statut
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor(colors.background);
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(false);
    }
  }, []);

  // Attendre uniquement le chargement de la session auth.
  // isReady est défini dans onReady du NavigationContainer : ne pas l'utiliser
  // ici, sinon le conteneur ne monte jamais (deadlock sur le splash).
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
      initialRouteName={getInitialRouteName()}
    >
      {/* Écran Onboarding (premier lancement) */}
      <RootStack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      
      {/* Stack d'authentification */}
      <RootStack.Screen 
        name="Auth" 
        component={AuthStackNavigator}
      />
      
      {/* Stack principal (authentifié) */}
      <RootStack.Screen 
        name="App" 
        component={MainStackNavigator}
      />
      
      {/* Stack administrateur */}
      <RootStack.Screen 
        name="Admin" 
        component={AdminNavigator}
        options={{
          headerShown: false,
        }}
      />
    </RootStack.Navigator>
  );
};

// ============================================
// DEEP LINKING CONFIGURATION (optionnel)
// ============================================

/**
 * Configuration du deep linking
 * Permet d'ouvrir l'application depuis des URLs
 */
export const linking = {
  prefixes: [
    'seneyiriwa://',
    'https://seneyiriwa.com',
    'https://www.seneyiriwa.com',
  ],
  config: {
    screens: {
      Onboarding: 'onboarding',
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token',
        },
      },
      App: {
        screens: {
          Home: 'home',
          Conseils: 'conseils',
          ConseilDetail: 'conseil/:id',
          Techniques: 'techniques',
          TechniqueDetail: 'technique/:id',
          Meteo: 'meteo',
          Profile: 'profile',
          Notifications: 'notifications',
        },
      },
    },
  },
  // Fonction pour obtenir l'URL initiale
  async getInitialURL() {
    // Vérifier si l'app a été ouverte par un lien
    const url = await Linking.getInitialURL();
    if (url) {
      return url;
    }
    return null;
  },
  // Fonction pour écouter les URLs
  subscribe(listener: (url: string) => void) {
    const onReceiveURL = ({ url }: { url: string }) => listener(url);
    const subscription = Linking.addEventListener('url', onReceiveURL);
    return () => subscription.remove();
  },
};

// ============================================
// EXPORT
// ============================================

export default AppNavigator;

// ============================================
// SERVICE DE NAVIGATION (NavigationService.ts)
// ============================================

/**
 * Ce fichier doit être créé séparément pour gérer
 * la navigation programmatique en dehors des composants
 * 
 * @file NavigationService.ts
 */

/*
import { createRef } from 'react';
import { NavigationContainerRef, CommonActions, StackActions } from '@react-navigation/native';

export const navigationRef = createRef<NavigationContainerRef<any>>();
export const isReadyRef = createRef<boolean>();

export const navigate = (name: string, params?: object) => {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
};

export const goBack = () => {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.goBack();
  }
};

export const reset = (name: string, params?: object) => {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name, params }],
      })
    );
  }
};

export const push = (name: string, params?: object) => {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.dispatch(StackActions.push(name, params));
  }
};

export const pop = (count?: number) => {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.dispatch(StackActions.pop(count));
  }
};

export const popToTop = () => {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.dispatch(StackActions.popToTop());
  }
};

export const replace = (name: string, params?: object) => {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.dispatch(StackActions.replace(name, params));
  }
};
*/