/**
 * Types Navigation - Sènè Yiriwa
 * 
 * Ce fichier contient tous les types, interfaces et énumérations
 * relatifs à la navigation dans l'application.
 * 
 * Fonctionnalités :
 * - Types pour les paramètres des écrans
 * - Types pour les stacks de navigation
 * - Types pour les onglets (tabs)
 * - Types pour les props de navigation
 * - Énumérations des routes
 * - Utilitaires pour la navigation typée
 * 
 * @module types/navigation.types
 */

import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// ============================================
// ENUMÉRATIONS DES ROUTES
// ============================================

/**
 * Routes de l'application
 */
export enum AppRoutes {
  // Routes d'authentification
  SPLASH = 'Splash',
  ONBOARDING = 'Onboarding',
  LOGIN = 'Login',
  REGISTER = 'Register',
  FORGOT_PASSWORD = 'ForgotPassword',
  RESET_PASSWORD = 'ResetPassword',
  
  // Routes principales
  HOME = 'Home',
  METEO = 'Meteo',
  CONSEILS = 'Conseils',
  TECHNIQUES = 'Techniques',
  PROFILE = 'Profile',
  
  // Routes de détail
  CONSEIL_DETAIL = 'ConseilDetail',
  TECHNIQUE_DETAIL = 'TechniqueDetail',
  ALERTE_DETAIL = 'AlerteDetail',
  
  // Routes de navigation
  MAIN_TABS = 'MainTabs',
  
  // Autres routes
  NOTIFICATIONS = 'Notifications',
  SEARCH = 'Search',
  SETTINGS = 'Settings',
  HELP = 'Help',
  ABOUT = 'About',
  EDIT_PROFILE = 'EditProfile',
  CHANGE_PASSWORD = 'ChangePassword',
  STATS = 'Stats',
  FAVORITES = 'Favorites',
  LANGUAGE = 'Language',
  NOTIFICATION_SETTINGS = 'NotificationSettings',
}

// ============================================
// PARAMÈTRES DES ÉCRANS
// ============================================

/**
 * Paramètres pour l'écran de détail d'un conseil
 */
export interface ConseilDetailParams {
  /** ID du conseil à afficher */
  id: string;
  /** Titre du conseil (optionnel, pour optimisation) */
  titre?: string;
  /** Source de navigation (pour analytics) */
  source?: string;
}

/**
 * Paramètres pour l'écran de détail d'une technique
 */
export interface TechniqueDetailParams {
  /** ID de la technique à afficher */
  id: string;
  /** Titre de la technique (optionnel) */
  titre?: string;
  /** Source de navigation */
  source?: string;
}

/**
 * Paramètres pour l'écran de réinitialisation du mot de passe
 */
export interface ResetPasswordParams {
  /** Token de réinitialisation */
  token: string;
  /** Email de l'utilisateur (optionnel) */
  email?: string;
}

/**
 * Paramètres pour l'écran de recherche
 */
export interface SearchParams {
  /** Requête de recherche initiale */
  initialQuery?: string;
  /** Type de recherche (conseils, techniques, tout) */
  type?: 'conseils' | 'techniques' | 'all';
}

/**
 * Paramètres pour l'écran de détail d'une alerte
 */
export interface AlerteDetailParams {
  /** ID de l'alerte */
  id: string;
  /** Titre de l'alerte */
  titre?: string;
}

// ============================================
// TYPES DES STACK NAVIGATORS
// ============================================

/**
 * Stack Navigator d'authentification
 */
export type AuthStackParamList = {
  /** Écran d'onboarding (premier lancement) */
  Onboarding: undefined;
  /** Écran de connexion */
  Login: undefined;
  /** Écran d'inscription */
  Register: undefined;
  /** Écran mot de passe oublié */
  ForgotPassword: undefined;
  /** Écran de réinitialisation du mot de passe */
  ResetPassword: ResetPasswordParams;
};

/**
 * Stack Navigator principal (après authentification)
 */
export type MainStackParamList = {
  /** Onglets principaux */
  MainTabs: undefined;
  /** Détail d'un conseil */
  ConseilDetail: ConseilDetailParams;
  /** Détail d'une technique */
  TechniqueDetail: TechniqueDetailParams;
  /** Détail d'une alerte */
  AlerteDetail: AlerteDetailParams;
  /** Liste des notifications */
  Notifications: undefined;
  /** Recherche */
  Search: SearchParams;
  /** Paramètres */
  Settings: undefined;
  /** Aide */
  Help: undefined;
  /** À propos */
  About: undefined;
  /** Modifier le profil */
  EditProfile: undefined;
  /** Changer le mot de passe */
  ChangePassword: undefined;
  /** Statistiques */
  Stats: undefined;
  /** Favoris */
  Favorites: undefined;
  /** Langue */
  Language: undefined;
  /** Paramètres de notification */
  NotificationSettings: undefined;
};

/**
 * Bottom Tab Navigator
 */
export type TabParamList = {
  /** Accueil */
  Home: undefined;
  /** Météo */
  Meteo: undefined;
  /** Conseils agricoles */
  Conseils: undefined;
  /** Techniques agricoles */
  Techniques: undefined;
  /** Profil utilisateur */
  Profile: undefined;
};

/**
 * Root Stack Navigator (combine auth et main)
 */
export type RootStackParamList = {
  /** Écran de démarrage */
  Splash: undefined;
  /** Stack d'authentification */
  Auth: undefined;
  /** Stack principal */
  App: undefined;
};

// ============================================
// PROPS DES ÉCRANS
// ============================================

/**
 * Props génériques pour un écran avec navigation
 */
export type ScreenProps<
  T extends keyof (AuthStackParamList & MainStackParamList & TabParamList)
> = {
  navigation: any;
  route: RouteProp<AuthStackParamList & MainStackParamList & TabParamList, T>;
};

/**
 * Props pour l'écran de connexion
 */
export type LoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
  route: RouteProp<AuthStackParamList, 'Login'>;
};

/**
 * Props pour l'écran d'inscription
 */
export type RegisterScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Register'>;
  route: RouteProp<AuthStackParamList, 'Register'>;
};

/**
 * Props pour l'écran de détail d'un conseil
 */
export type ConseilDetailScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'ConseilDetail'>;
  route: RouteProp<MainStackParamList, 'ConseilDetail'>;
};

/**
 * Props pour l'écran de détail d'une technique
 */
export type TechniqueDetailScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'TechniqueDetail'>;
  route: RouteProp<MainStackParamList, 'TechniqueDetail'>;
};

/**
 * Props pour l'écran de recherche
 */
export type SearchScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'Search'>;
  route: RouteProp<MainStackParamList, 'Search'>;
};

// ============================================
// TYPES POUR LA NAVIGATION PROGRAMMATIQUE
// ============================================

/**
 * Types pour la navigation programmatique (hors composants)
 */
export interface NavigationService {
  /** Naviguer vers un écran */
  navigate: <T extends keyof (AuthStackParamList & MainStackParamList)>(
    name: T,
    params?: (AuthStackParamList & MainStackParamList)[T]
  ) => void;
  
  /** Revenir en arrière */
  goBack: () => void;
  
  /** Réinitialiser la navigation */
  reset: (name: keyof (AuthStackParamList & MainStackParamList), params?: any) => void;
  
  /** Naviguer et remplacer l'écran courant */
  replace: <T extends keyof (AuthStackParamList & MainStackParamList)>(
    name: T,
    params?: (AuthStackParamList & MainStackParamList)[T]
  ) => void;
  
  /** Pousser un nouvel écran */
  push: <T extends keyof (AuthStackParamList & MainStackParamList)>(
    name: T,
    params?: (AuthStackParamList & MainStackParamList)[T]
  ) => void;
  
  /** Revenir à l'écran précédent */
  pop: (count?: number) => void;
  
  /** Revenir au premier écran de la pile */
  popToTop: () => void;
}

// ============================================
// TYPES POUR LES OPTIONS DE NAVIGATION
// ============================================

/**
 * Options de transition entre écrans
 */
export interface TransitionOptions {
  /** Type d'animation */
  animation?: 'default' | 'fade' | 'slide' | 'none';
  
  /** Durée de l'animation (ms) */
  duration?: number;
  
  /** Type de courbe d'animation */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Options d'en-tête personnalisées
 */
export interface HeaderOptions {
  /** Titre de l'en-tête */
  title?: string;
  
  /** Afficher le bouton de retour */
  showBackButton?: boolean;
  
  /** Couleur de fond de l'en-tête */
  backgroundColor?: string;
  
  /** Couleur du texte de l'en-tête */
  textColor?: string;
  
  /** Actions personnalisées à droite */
  rightActions?: {
    icon: string;
    onPress: () => void;
    badge?: number;
  }[];
  
  /** Action personnalisée à gauche */
  leftAction?: {
    icon: string;
    onPress: () => void;
  };
}

// ============================================
// CONSTANTES DE NAVIGATION
// ============================================

/**
 * Configuration des animations par défaut
 */
export const DEFAULT_NAVIGATION_OPTIONS = {
  animation: 'default' as const,
  duration: 300,
  easing: 'ease-in-out' as const,
};

/**
 * Cartographie des routes vers les titres d'écran
 */
export const SCREEN_TITLES: Record<keyof MainStackParamList, string> = {
  MainTabs: '',
  ConseilDetail: 'Détail du conseil',
  TechniqueDetail: 'Détail de la technique',
  AlerteDetail: 'Détail de l\'alerte',
  Notifications: 'Notifications',
  Search: 'Recherche',
  Settings: 'Paramètres',
  Help: 'Aide',
  About: 'À propos',
  EditProfile: 'Modifier le profil',
  ChangePassword: 'Changer le mot de passe',
  Stats: 'Mes statistiques',
  Favorites: 'Mes favoris',
  Language: 'Langue',
  NotificationSettings: 'Paramètres de notification',
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Vérifie si une route existe dans le stack d'authentification
 * 
 * @param routeName - Nom de la route
 * @returns true si la route existe
 */
export const isAuthRoute = (routeName: string): routeName is keyof AuthStackParamList => {
  return ['Login', 'Register', 'ForgotPassword', 'ResetPassword', 'Onboarding'].includes(routeName);
};

/**
 * Vérifie si une route existe dans le stack principal
 * 
 * @param routeName - Nom de la route
 * @returns true si la route existe
 */
export const isMainRoute = (routeName: string): routeName is keyof MainStackParamList => {
  return [
    'MainTabs', 'ConseilDetail', 'TechniqueDetail', 'AlerteDetail',
    'Notifications', 'Search', 'Settings', 'Help', 'About',
    'EditProfile', 'ChangePassword', 'Stats', 'Favorites', 'Language',
    'NotificationSettings'
  ].includes(routeName);
};

/**
 * Obtient le titre d'un écran
 * 
 * @param routeName - Nom de la route
 * @returns Titre de l'écran ou le nom de la route par défaut
 */
export const getScreenTitle = (routeName: string): string => {
  return SCREEN_TITLES[routeName as keyof MainStackParamList] || routeName;
};

/**
 * Type helper pour la navigation avec paramètres
 */
export type NavigationParams<T extends keyof (AuthStackParamList & MainStackParamList)> =
  (AuthStackParamList & MainStackParamList)[T];

/**
 * Type pour le hook useNavigation typé
 */
export type AppNavigationProp = any;

/**
 * Type pour le hook useRoute typé
 */
export type AppRouteProp<T extends keyof (AuthStackParamList & MainStackParamList & TabParamList)> =
  RouteProp<AuthStackParamList & MainStackParamList & TabParamList, T>;