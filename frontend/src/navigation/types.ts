/**
 * Types de navigation - Sènè Yiriwa
 * 
 * Ce fichier contient tous les types et interfaces pour la navigation
 * dans l'application, assurant la sécurité des types TypeScript.
 * 
 * @module navigation/types
 */

import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// ============================================
// PARAMÈTRES DES ÉCRANS
// ============================================

/**
 * Paramètres du stack root (principal)
 */
export type RootStackParamList = {
  /** Écran de bienvenue (premier lancement) */
  Onboarding: undefined;
  /** Stack d'authentification */
  Auth: undefined;
  /** Stack principal (après connexion) */
  App: undefined;
};

/**
 * Paramètres du stack d'authentification
 */
export type AuthStackParamList = {
  /** Écran de connexion */
  Login: undefined;
  
  /** Écran d'inscription */
  Register: undefined;
  
  /** Écran mot de passe oublié */
  ForgotPassword: undefined;
  
  /** Écran réinitialisation du mot de passe */
  ResetPassword: { token: string };
  
  /** Écran de bienvenue */
  Onboarding: undefined;
  /** Écran de bienvenue après onboarding */
  Welcome: undefined;
};

/**
 * Paramètres du stack principal (authentifié)
 */
export type MainStackParamList = {
  /** Navigation par onglets (accueil, conseils, etc.) */
  MainTabs: undefined;
  
  /** Détails d'un conseil */
  ConseilDetail: { id: string };
  
  /** Détails d'une technique */
  TechniqueDetail: { id: string };
  
  /** Écran météo détaillé */
  MeteoDetail: undefined;
  
  /** Écran de recherche */
  Search: { initialQuery?: string };
  
  /** Écran des notifications */
  Notifications: undefined;
  
  /** Écran des paramètres */
  Settings: undefined;
  
  /** Écran d'aide */
  Help: undefined;
  
  /** Écran à propos */
  About: undefined;
  
  /** Écran d'édition du profil */
  EditProfile: undefined;
  
  /** Écran de changement de mot de passe */
  ChangePassword: undefined;
};

/**
 * Paramètres de la navigation par onglets
 */
export type TabParamList = {
  /** Écran d'accueil */
  Home: undefined;
  
  /** Écran météo */
  Meteo: undefined;
  
  /** Écran des conseils */
  Conseils: undefined;
  
  /** Écran des techniques */
  Techniques: undefined;
  
  /** Écran du profil */
  Profile: undefined;
};

// ============================================
// TYPES DE NAVIGATION PAR ÉCRAN
// ============================================

/**
 * Props de navigation pour l'écran de connexion
 */
export type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
export type LoginScreenRouteProp = RouteProp<AuthStackParamList, 'Login'>;

/**
 * Props de navigation pour l'écran d'inscription
 */
export type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;
export type RegisterScreenRouteProp = RouteProp<AuthStackParamList, 'Register'>;

/**
 * Props de navigation pour l'écran de détail d'un conseil
 */
export type ConseilDetailScreenNavigationProp = StackNavigationProp<MainStackParamList, 'ConseilDetail'>;
export type ConseilDetailScreenRouteProp = RouteProp<MainStackParamList, 'ConseilDetail'>;

/**
 * Props de navigation pour l'écran de détail d'une technique
 */
export type TechniqueDetailScreenNavigationProp = StackNavigationProp<MainStackParamList, 'TechniqueDetail'>;
export type TechniqueDetailScreenRouteProp = RouteProp<MainStackParamList, 'TechniqueDetail'>;

// ============================================
// PROPS DES COMPOSANTS D'ÉCRAN
// ============================================

/**
 * Props pour l'écran de connexion
 */
export interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
}

/**
 * Props pour l'écran d'inscription
 */
export interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
  route: RegisterScreenRouteProp;
}

/**
 * Props pour l'écran de détail d'un conseil
 */
export interface ConseilDetailScreenProps {
  navigation: ConseilDetailScreenNavigationProp;
  route: ConseilDetailScreenRouteProp;
}

/**
 * Props pour l'écran de détail d'une technique
 */
export interface TechniqueDetailScreenProps {
  navigation: TechniqueDetailScreenNavigationProp;
  route: TechniqueDetailScreenRouteProp;
}

// ============================================
// UTILITAIRES DE NAVIGATION
// ============================================

/**
 * Type pour le hook useNavigation typé
 */
export type AppNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * Type pour le hook useRoute typé
 */
export type AppRouteProp<K extends keyof RootStackParamList> = RouteProp<RootStackParamList, K>;

/**
 * Helper pour obtenir le type de navigation d'un écran spécifique
 */
export type ScreenNavigationProp<
  T extends keyof (AuthStackParamList & MainStackParamList & TabParamList)
> = T extends keyof AuthStackParamList
  ? StackNavigationProp<AuthStackParamList, T>
  : T extends keyof MainStackParamList
  ? StackNavigationProp<MainStackParamList, T>
  : T extends keyof TabParamList
  ? StackNavigationProp<TabParamList, T>
  : never;

/**
 * Helper pour obtenir le type de route d'un écran spécifique
 */
export type ScreenRouteProp<
  T extends keyof (AuthStackParamList & MainStackParamList & TabParamList)
> = T extends keyof AuthStackParamList
  ? RouteProp<AuthStackParamList, T>
  : T extends keyof MainStackParamList
  ? RouteProp<MainStackParamList, T>
  : T extends keyof TabParamList
  ? RouteProp<TabParamList, T>
  : never;