/**
 * Hook useAuth - Sènè Yiriwa
 * 
 * Ce hook personnalisé gère toute l'authentification et la gestion
 * des utilisateurs dans l'application. Il fournit une interface simple
 * pour se connecter, s'inscrire, gérer les tokens et les sessions.
 * 
 * Fonctionnalités :
 * - Connexion / Inscription
 * - Déconnexion
 * - Rafraîchissement automatique des tokens
 * - Gestion du mot de passe oublié
 * - Mise à jour du profil utilisateur
 * - Persistance de la session
 * - Gestion des rôles (agriculteur, expert, admin)
 * - Validation des formulaires
 * - Gestion des erreurs avec messages localisés
 * 
 * @module hooks/useAuth
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthAPI from '../api/endpoints/auth';
import type {
  LoginCredentials,
  RegisterData,
  User,
  AuthResponse,
} from '../api/endpoints/auth';
import { showErrorMessage, showSuccessMessage } from '../utils/notifications';
import { validateEmail, validatePassword, validatePhoneMali, maskPhoneNumber, normalizePhoneMali } from '../utils/validators';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour l'état du hook useAuth
 */
export interface UseAuthState {
  /** Utilisateur connecté */
  user: User | null;
  
  /** Token JWT */
  token: string | null;
  
  /** Refresh token */
  refreshToken: string | null;
  
  /** Indique si l'utilisateur est authentifié */
  isAuthenticated: boolean;
  
  /** Indique si le chargement est en cours */
  isLoading: boolean;
  
  /** Indique si le rafraîchissement du token est en cours */
  isRefreshing: boolean;
  
  /** Message d'erreur */
  error: string | null;
  
  /** Rôle de l'utilisateur */
  role: 'agriculteur' | 'expert' | 'administrateur' | null;
}

/**
 * Interface pour les paramètres de connexion
 */
export interface LoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Interface pour les paramètres d'inscription
 */
export interface RegisterParams extends RegisterData {
  confirmPassword: string;
  acceptTerms: boolean;
}

/**
 * Interface pour le résultat des opérations
 */
export interface AuthResult {
  success: boolean;
  data?: any;
  error?: string;
}

// ============================================
// ÉTAT INITIAL
// ============================================

const initialState: UseAuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  isRefreshing: false,
  error: null,
  role: null,
};

// Clés pour AsyncStorage
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  REMEMBER_ME: 'remember_me',
};

// ============================================
// HOOK PRINCIPAL
// ============================================

/**
 * Hook useAuth - Gestion de l'authentification
 * 
 * @example
 * // Utilisation basique
 * const { user, login, logout, isLoading } = useAuth();
 * 
 * @example
 * // Connexion
 * const handleLogin = async () => {
 *   const result = await login({ email, password });
 *   if (result.success) {
 *     navigation.navigate('Home');
 *   }
 * };
 * 
 * @example
 * // Vérification du rôle
 * const { user } = useAuth();
 * if (user?.role === 'expert') {
 *   // Afficher les fonctions d'expert
 * }
 * 
 * @example
 * // Mise à jour du profil
 * const { updateProfile } = useAuth();
 * await updateProfile({ nom: 'Diallo', prenom: 'Mamadou' });
 */
export const useAuth = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // État local
  const [state, setState] = useState<UseAuthState>(initialState);
  
  // Référence pour éviter les appels multiples
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  const isMountedRef = useRef(true);
  
  // Sélecteurs Redux (si utilisés)
  const reduxUser = useSelector((state: any) => state.auth.user);
  const reduxToken = useSelector((state: any) => state.auth.token);

  // ============================================
  // FONCTIONS DE MISE À JOUR D'ÉTAT
  // ============================================

  /**
   * Met à jour partiellement l'état du hook
   */
  const updateState = useCallback((updates: Partial<UseAuthState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  /**
   * Met à jour l'état utilisateur dans Redux (si utilisé)
   */
  const updateRedux = useCallback((user: User | null, token: string | null) => {
    if (typeof dispatch === 'function') {
      // Exemple avec Redux Toolkit
      // dispatch(setAuth({ user, token }));
    }
  }, [dispatch]);

  /**
   * Sauvegarde les données d'authentification localement
   */
  const persistAuth = useCallback(async (token: string, refreshToken: string, user: User, rememberMe: boolean = true) => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        // Session uniquement (stockage temporaire)
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
      
      if (__DEV__) {
        console.log('[useAuth] Données d\'authentification persistées');
      }
    } catch (error) {
      console.error('[useAuth] Erreur lors de la persistance:', error);
    }
  }, []);

  /**
   * Nettoie les données d'authentification locales
   */
  const clearPersistedAuth = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      
      if (__DEV__) {
        console.log('[useAuth] Données d\'authentification effacées');
      }
    } catch (error) {
      console.error('[useAuth] Erreur lors du nettoyage:', error);
    }
  }, []);

  /**
   * Gère les erreurs de manière centralisée
   */
  const handleError = useCallback((error: any, defaultMessage: string): string => {
    const errorMessage = error?.userMessage || error?.message || defaultMessage;
    
    updateState({ error: errorMessage, isLoading: false });
    
    // Afficher une notification d'erreur
    showErrorMessage(errorMessage);
    
    if (__DEV__) {
      console.error('[useAuth] Erreur:', error);
    }
    
    return errorMessage;
  }, [updateState]);

  // ============================================
  // CHARGEMENT DE LA SESSION
  // ============================================

  /**
   * Charge la session utilisateur depuis le stockage local
   * 
   * @returns Promise avec l'utilisateur chargé ou null
   */
  const loadSession = useCallback(async (): Promise<User | null> => {
    try {
      updateState({ isLoading: true });
      
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      
      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Vérifier si le token est expiré
        const isExpired = AuthAPI.isTokenExpired(token);
        
        if (isExpired && refreshToken) {
          // Tentative de rafraîchissement automatique
          const newToken = await refreshAuthToken(refreshToken);
          if (newToken) {
            updateState({
              user,
              token: newToken,
              refreshToken,
              isAuthenticated: true,
              role: user.role,
              isLoading: false,
            });
            return user;
          }
        } else if (!isExpired) {
          updateState({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            role: user.role,
            isLoading: false,
          });
          return user;
        }
      }
      
      updateState({ isLoading: false });
      return null;
      
    } catch (error) {
      console.error('[useAuth] Erreur chargement session:', error);
      updateState({ isLoading: false });
      return null;
    }
  }, [updateState]);

  // ============================================
  // RAFRAÎCHISSEMENT DU TOKEN
  // ============================================

  /**
   * Rafraîchit le token JWT
   * 
   * @param currentRefreshToken - Token de rafraîchissement
   * @returns Nouveau token ou null
   */
  const refreshAuthToken = useCallback(async (currentRefreshToken: string): Promise<string | null> => {
    // Éviter les appels multiples simultanés
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }
    
    refreshPromiseRef.current = (async () => {
      try {
        updateState({ isRefreshing: true });
        
        const result = await AuthAPI.refreshToken(currentRefreshToken);
        const { token, refreshToken: newRefreshToken } = result;
        
        // Mettre à jour le stockage
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
        if (newRefreshToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }
        
        updateState({
          token,
          refreshToken: newRefreshToken || currentRefreshToken,
          isRefreshing: false,
        });
        
        return token;
        
      } catch (error) {
        console.error('[useAuth] Échec du rafraîchissement:', error);
        
        // En cas d'échec, déconnecter l'utilisateur
        await logout();
        updateState({ isRefreshing: false });
        
        return null;
        
      } finally {
        refreshPromiseRef.current = null;
      }
    })();
    
    return refreshPromiseRef.current;
  }, [updateState]);

  // ============================================
  // CONNEXION
  // ============================================

  /**
   * Connecte un utilisateur
   * 
   * @param params - Identifiants de connexion
   * @returns Promise avec le résultat
   * 
   * @example
   * const result = await login({ email: 'user@example.com', password: 'password123' });
   * if (result.success) {
   *   // Rediriger vers l'accueil
   * }
   */
  const login = useCallback(async (params: LoginParams): Promise<AuthResult> => {
    // Validation des entrées
    if (!params.email || !params.password) {
      const error = t('email_password_required');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (!validateEmail(params.email)) {
      const error = t('invalid_email');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    updateState({ isLoading: true, error: null });
    
    try {
      const credentials: LoginCredentials = {
        email: params.email.toLowerCase().trim(),
        password: params.password,
      };
      
      const response = await AuthAPI.login(credentials);
      const { token, refreshToken, user } = response.data;
      
      // Persister les données
      await persistAuth(token, refreshToken, user, params.rememberMe ?? true);
      
      // Mettre à jour l'état
      updateState({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        role: user.role,
        isLoading: false,
        error: null,
      });
      
      // Mettre à jour Redux
      updateRedux(user, token);
      
      showSuccessMessage(t('login_success'));
      
      return { success: true, data: { user, token } };
      
    } catch (error: any) {
      const errorMessage = handleError(error, t('login_error'));
      return { success: false, error: errorMessage };
    }
  }, [t, persistAuth, updateState, updateRedux, handleError]);

  // ============================================
  // INSCRIPTION
  // ============================================

  /**
   * Inscrit un nouvel utilisateur
   * 
   * @param data - Données d'inscription
   * @returns Promise avec le résultat
   * 
   * @example
   * const result = await register({
   *   nom: 'Diallo',
   *   prenom: 'Mamadou',
   *   email: 'mamadou@example.com',
   *   telephone: '771234567',
   *   password: 'password123',
   *   confirmPassword: 'password123',
   *   acceptTerms: true
   * });
   */
  const register = useCallback(async (data: RegisterParams): Promise<AuthResult> => {
    // Validations
    if (!data.nom || !data.prenom || !data.email || !data.telephone || !data.password) {
      const error = t('all_fields_required');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (!validateEmail(data.email)) {
      const error = t('invalid_email');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (!validatePhoneMali(data.telephone)) {
      const error = t('invalid_phone');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (!validatePassword(data.password)) {
      const error = t('password_min_length');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (data.password !== data.confirmPassword) {
      const error = t('passwords_do_not_match');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (!data.acceptTerms) {
      const error = t('accept_terms_required');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    updateState({ isLoading: true, error: null });
    
    try {
      // Préparer les données d'inscription
      const registerData: RegisterData = {
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        email: data.email.toLowerCase().trim(),
        telephone: normalizePhoneMali(data.telephone),
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
        localisation: data.localisation,
        cultureType: data.cultureType,
        superficie: data.superficie,
        agricultureType: data.agricultureType,
      };
      
      const response = await AuthAPI.register(registerData);
      const { token, refreshToken, user } = response.data;
      
      // Persister les données
      await persistAuth(token, refreshToken, user, true);
      
      // Mettre à jour l'état
      updateState({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        role: user.role,
        isLoading: false,
        error: null,
      });
      
      // Mettre à jour Redux
      updateRedux(user, token);
      
      showSuccessMessage(t('registration_success'));
      
      return { success: true, data: { user, token } };
      
    } catch (error: any) {
      const errorMessage = handleError(error, t('registration_error'));
      return { success: false, error: errorMessage };
    }
  }, [t, persistAuth, updateState, updateRedux, handleError]);

  // ============================================
  // DÉCONNEXION
  // ============================================

  /**
   * Déconnecte l'utilisateur
   * 
   * @returns Promise avec le résultat
   * 
   * @example
   * const handleLogout = async () => {
   *   await logout();
   *   navigation.navigate('Login');
   * };
   */
  const logout = useCallback(async (): Promise<AuthResult> => {
    updateState({ isLoading: true });
    
    try {
      // Appel API de déconnexion (optionnel)
      if (state.token) {
        await AuthAPI.logout(state.token).catch(() => {});
      }
      
      // Nettoyer le stockage local
      await clearPersistedAuth();
      
      // Réinitialiser l'état
      updateState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        role: null,
        isLoading: false,
        error: null,
      });
      
      // Mettre à jour Redux
      updateRedux(null, null);
      
      showSuccessMessage(t('logout_success'));
      
      return { success: true };
      
    } catch (error: any) {
      // Même en cas d'erreur, on nettoie localement
      await clearPersistedAuth();
      
      updateState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        role: null,
        isLoading: false,
      });
      
      updateRedux(null, null);
      
      return { success: true };
    }
  }, [state.token, clearPersistedAuth, updateState, updateRedux, t]);

  // ============================================
  // MOT DE PASSE OUBLIÉ
  // ============================================

  /**
   * Envoie un email de réinitialisation de mot de passe
   * 
   * @param email - Email de l'utilisateur
   * @returns Promise avec le résultat
   * 
   * @example
   * const result = await forgotPassword('user@example.com');
   * if (result.success) {
   *   showSuccessMessage('Email envoyé');
   * }
   */
  const forgotPassword = useCallback(async (email: string): Promise<AuthResult> => {
    if (!email || !validateEmail(email)) {
      const error = t('invalid_email');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    updateState({ isLoading: true, error: null });
    
    try {
      await AuthAPI.forgotPassword({ email: email.toLowerCase().trim() });
      
      updateState({ isLoading: false });
      showSuccessMessage(t('reset_email_sent'));
      
      return { success: true };
      
    } catch (error: any) {
      const errorMessage = handleError(error, t('reset_email_error'));
      return { success: false, error: errorMessage };
    }
  }, [t, updateState, handleError]);

  /**
   * Réinitialise le mot de passe
   * 
   * @param token - Token de réinitialisation
   * @param newPassword - Nouveau mot de passe
   * @param confirmPassword - Confirmation
   * @returns Promise avec le résultat
   */
  const resetPassword = useCallback(async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<AuthResult> => {
    if (!newPassword || !confirmPassword) {
      const error = t('password_required');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (!validatePassword(newPassword)) {
      const error = t('password_min_length');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (newPassword !== confirmPassword) {
      const error = t('passwords_do_not_match');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    updateState({ isLoading: true, error: null });
    
    try {
      await AuthAPI.resetPassword({ token, newPassword, confirmPassword });
      
      updateState({ isLoading: false });
      showSuccessMessage(t('password_reset_success'));
      
      return { success: true };
      
    } catch (error: any) {
      const errorMessage = handleError(error, t('password_reset_error'));
      return { success: false, error: errorMessage };
    }
  }, [t, updateState, handleError]);

  // ============================================
  // GESTION DU PROFIL
  // ============================================

  /**
   * Met à jour le profil utilisateur
   * 
   * @param data - Données à mettre à jour
   * @returns Promise avec le résultat
   * 
   * @example
   * const result = await updateProfile({
   *   nom: 'Diallo',
   *   prenom: 'Amadou',
   *   telephone: '771234567'
   * });
   */
  const updateProfile = useCallback(async (data: Partial<User>): Promise<AuthResult> => {
    if (!state.isAuthenticated || !state.token) {
      const error = t('not_authenticated');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    updateState({ isLoading: true, error: null });
    
    try {
      const updatedUser = await AuthAPI.updateUserProfile(data, state.token);
      
      // Mettre à jour l'état
      updateState({
        user: updatedUser,
        isLoading: false,
      });
      
      // Mettre à jour le stockage
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      // Mettre à jour Redux
      updateRedux(updatedUser, state.token);
      
      showSuccessMessage(t('profile_updated'));
      
      return { success: true, data: updatedUser };
      
    } catch (error: any) {
      const errorMessage = handleError(error, t('profile_update_error'));
      return { success: false, error: errorMessage };
    }
  }, [state.isAuthenticated, state.token, t, updateState, updateRedux, handleError]);

  /**
   * Change le mot de passe de l'utilisateur
   * 
   * @param currentPassword - Mot de passe actuel
   * @param newPassword - Nouveau mot de passe
   * @param confirmPassword - Confirmation
   * @returns Promise avec le résultat
   */
  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<AuthResult> => {
    if (!state.isAuthenticated || !state.token) {
      const error = t('not_authenticated');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (!currentPassword || !newPassword) {
      const error = t('password_required');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (!validatePassword(newPassword)) {
      const error = t('password_min_length');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (newPassword !== confirmPassword) {
      const error = t('passwords_do_not_match');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    updateState({ isLoading: true, error: null });
    
    try {
      await AuthAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      }, state.token);
      
      updateState({ isLoading: false });
      showSuccessMessage(t('password_changed'));
      
      return { success: true };
      
    } catch (error: any) {
      const errorMessage = handleError(error, t('password_change_error'));
      return { success: false, error: errorMessage };
    }
  }, [state.isAuthenticated, state.token, t, updateState, handleError]);

  /**
   * Supprime le compte utilisateur
   * 
   * @param password - Mot de passe de confirmation
   * @returns Promise avec le résultat
   */
  const deleteAccount = useCallback(async (password: string): Promise<AuthResult> => {
    if (!state.isAuthenticated || !state.token) {
      const error = t('not_authenticated');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    if (!password) {
      const error = t('password_required');
      showErrorMessage(error);
      return { success: false, error };
    }
    
    updateState({ isLoading: true, error: null });
    
    try {
      await AuthAPI.deleteAccount(state.token, password);
      
      // Nettoyer toutes les données
      await clearPersistedAuth();
      
      // Réinitialiser l'état
      updateState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        role: null,
        isLoading: false,
        error: null,
      });
      
      updateRedux(null, null);
      
      showSuccessMessage(t('account_deleted'));
      
      return { success: true };
      
    } catch (error: any) {
      const errorMessage = handleError(error, t('account_delete_error'));
      return { success: false, error: errorMessage };
    }
  }, [state.isAuthenticated, state.token, t, clearPersistedAuth, updateState, updateRedux, handleError]);

  // ============================================
  // MODE INVITÉ (DÉVELOPPEMENT / DÉMO)
  // ============================================

  /**
   * Connexion en mode invité pour explorer l'application sans compte
   */
  const loginAsGuest = useCallback(async (): Promise<AuthResult> => {
    const guestUser: User = {
      id: 'guest',
      nom: 'Visiteur',
      prenom: 'Invité',
      email: 'invite@seneyiriwa.local',
      telephone: '77000000',
      role: 'agriculteur',
      isEmailVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateState({
      user: guestUser,
      token: 'guest-token',
      refreshToken: null,
      isAuthenticated: true,
      role: 'agriculteur',
      isLoading: false,
      error: null,
    });

    updateRedux(guestUser, 'guest-token');

    if (__DEV__) {
      console.log('[useAuth] Mode invité activé');
    }

    return { success: true, data: { user: guestUser } };
  }, [updateState, updateRedux]);

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * 
   * @param role - Rôle à vérifier
   * @returns true si l'utilisateur a le rôle
   * 
   * @example
   * if (hasRole('expert')) {
   *   // Afficher le contenu expert
   * }
   */
  const hasRole = useCallback((role: 'agriculteur' | 'expert' | 'administrateur'): boolean => {
    return state.user?.role === role;
  }, [state.user?.role]);

  /**
   * Vérifie si l'utilisateur est un agriculteur
   */
  const isAgriculteur = useCallback((): boolean => {
    return state.user?.role === 'agriculteur';
  }, [state.user?.role]);

  /**
   * Vérifie si l'utilisateur est un expert
   */
  const isExpert = useCallback((): boolean => {
    return state.user?.role === 'expert';
  }, [state.user?.role]);

  /**
   * Vérifie si l'utilisateur est un administrateur
   */
  const isAdmin = useCallback((): boolean => {
    return state.user?.role === 'administrateur';
  }, [state.user?.role]);

  // ============================================
  // CHARGEMENT INITIAL DE LA SESSION
  // ============================================

  useEffect(() => {
    isMountedRef.current = true;
    
    // Charger la session au montage
    loadSession();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [loadSession]);

  // ============================================
  // RÉTABLIR LA SESSION EN ARRIÈRE-PLAN (optionnel)
  // ============================================

  useEffect(() => {
    // Vérifier périodiquement si le token est expiré
    const checkTokenExpiration = async () => {
      if (state.token && state.refreshToken) {
        const isExpired = AuthAPI.isTokenExpired(state.token);
        if (isExpired) {
          await refreshAuthToken(state.refreshToken);
        }
      }
    };
    
    // Vérifier toutes les 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [state.token, state.refreshToken, refreshAuthToken]);

  // ============================================
  // RETOUR DU HOOK
  // ============================================

  return {
    // État
    user: state.user,
    token: state.token,
    refreshToken: state.refreshToken,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    role: state.role,
    
    // Actions principales
    login,
    register,
    logout,
    loginAsGuest,
    
    // Mot de passe
    forgotPassword,
    resetPassword,
    changePassword,
    
    // Profil
    updateProfile,
    deleteAccount,
    
    // Utilitaires
    hasRole,
    isAgriculteur,
    isExpert,
    isAdmin,
    loadSession,
    refreshAuthToken,
  };
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default useAuth;