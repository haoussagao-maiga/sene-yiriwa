/**
 * Endpoints d'authentification - Sènè Yiriwa
 * 
 * Ce fichier contient toutes les fonctions d'appel API liées à l'authentification
 * et à la gestion des comptes utilisateurs. Chaque fonction est typée et
 * gère les erreurs de manière appropriée.
 * 
 * Fonctionnalités :
 * - Connexion / Inscription
 * - Rafraîchissement de token
 * - Déconnexion
 * - Gestion du mot de passe (oublié, réinitialisation)
 * - Vérification d'email
 * - Gestion des sessions
 * 
 * @module api/endpoints/auth
 */

import { apiClient } from '../clients';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config/api.config';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour les identifiants de connexion
 */
export interface LoginCredentials {
  email: string;
  password: string;
  /** Optionnel : token FCM pour les notifications push */
  fcmToken?: string;
}

/**
 * Interface pour les données d'inscription
 */
export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  confirmPassword: string;
  /** Localisation de l'agriculteur (région, cercle, commune) */
  localisation?: {
    region: string;
    cercle?: string;
    commune?: string;
    latitude?: number;
    longitude?: number;
  };
  /** Type de culture pratiquée (mil, maïs, riz, etc.) */
  cultureType?: string;
  /** Superficie en hectares */
  superficie?: number;
  /** Type d'agriculture : 'pluvial' ou 'irrigue' */
  agricultureType?: 'pluvial' | 'irrigue';
  /** Acceptation des conditions d'utilisation */
  acceptTerms: boolean;
}

/**
 * Interface pour la réponse d'authentification
 */
export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    expiresIn: number; // Durée de validité du token en secondes
    user: User;
  };
  message?: string;
}

/**
 * Interface pour l'utilisateur connecté
 */
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'agriculteur' | 'expert' | 'administrateur';
  isEmailVerified: boolean;
  isActive: boolean;
  localisation?: {
    region: string;
    cercle?: string;
    commune?: string;
    latitude?: number;
    longitude?: number;
  };
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  // Champs spécifiques aux agriculteurs
  cultureType?: string;
  superficie?: number;
  agricultureType?: 'pluvial' | 'irrigue';
  // Champs spécifiques aux experts
  specialite?: string;
  bio?: string;
}

/**
 * Interface pour la demande de réinitialisation de mot de passe
 */
export interface ForgotPasswordData {
  email: string;
}

/**
 * Interface pour la réinitialisation du mot de passe
 */
export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Interface pour le changement de mot de passe (utilisateur connecté)
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Interface pour la vérification d'email
 */
export interface VerifyEmailData {
  token: string;
}

/**
 * Interface pour la demande de renvoi d'email de vérification
 */
export interface ResendVerificationData {
  email: string;
}

/**
 * Interface pour la réponse de vérification
 */
export interface VerificationResponse {
  success: boolean;
  message: string;
}

// ============================================
// FONCTIONS D'AUTHENTIFICATION
// ============================================

/**
 * Connexion utilisateur
 * 
 * Authentifie un utilisateur avec son email et mot de passe.
 * Retourne un token JWT et les informations de l'utilisateur.
 * 
 * @param credentials - Identifiants de connexion (email, mot de passe)
 * @returns Promise avec la réponse d'authentification
 * 
 * @example
 * const result = await login({
 *   email: 'agriculteur@example.com',
 *   password: 'monMotDePasse123'
 * });
 * 
 * if (result.success) {
 *   const { token, user } = result.data;
 *   await AsyncStorage.setItem('auth_token', token);
 *   navigation.navigate('Home');
 * }
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Log de succès (mode développement uniquement)
    if (__DEV__) {
      console.log(`✅ [Auth] Utilisateur connecté: ${credentials.email}`);
    }
    
    return response;
  } catch (error: unknown) {
    // Log de l'erreur
    console.error(`❌ [Auth] Erreur connexion pour ${credentials.email}:`, error);
    
    const safeError =
      error && typeof error === 'object' && !Array.isArray(error)
        ? { ...(error as Record<string, unknown>) }
        : { message: String(error) };

    // Propagation de l'erreur avec un message personnalisé
    throw {
      ...safeError,
      userMessage: 'Impossible de vous connecter. Vérifiez votre email et mot de passe.',
    };
  }
};

/**
 * Inscription d'un nouvel utilisateur
 * 
 * Crée un nouveau compte utilisateur dans le système.
 * Un email de vérification est envoyé à l'adresse fournie.
 * 
 * @param data - Données d'inscription complètes
 * @returns Promise avec la réponse d'authentification
 * 
 * @example
 * const result = await register({
 *   nom: 'Diallo',
 *   prenom: 'Mamadou',
 *   email: 'mamadou@example.com',
 *   telephone: '+223 12345678',
 *   password: 'Password123!',
 *   confirmPassword: 'Password123!',
 *   localisation: {
 *     region: 'Sikasso',
 *     cercle: 'Koutiala'
 *   },
 *   cultureType: 'maïs',
 *   superficie: 5.5,
 *   agricultureType: 'pluvial',
 *   acceptTerms: true
 * });
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    // Validation supplémentaire avant l'envoi
    if (data.password !== data.confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    
    if (!data.acceptTerms) {
      throw new Error('Vous devez accepter les conditions d\'utilisation');
    }
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data
    );
    
    if (__DEV__) {
      console.log(`✅ [Auth] Nouvel utilisateur inscrit: ${data.email}`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ [Auth] Erreur inscription pour ${data.email}:`, error);
    throw error;
  }
};

/**
 * Rafraîchissement du token JWT
 * 
 * Utilise le refresh token pour obtenir un nouveau token d'accès
 * sans demander à l'utilisateur de se reconnecter.
 * 
 * @param refreshToken - Token de rafraîchissement stocké localement
 * @returns Promise avec le nouveau token
 * 
 * @example
 * const refreshToken = await AsyncStorage.getItem('refresh_token');
 * const result = await refreshToken(refreshToken);
 * await AsyncStorage.setItem('auth_token', result.token);
 */
export const refreshToken = async (refreshToken: string): Promise<{ token: string; refreshToken: string; expiresIn: number }> => {
  try {
    const response = await apiClient.post<{
      success: boolean;
      data: { token: string; refreshToken: string; expiresIn: number };
    }>(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
    
    if (__DEV__) {
      console.log('✅ [Auth] Token rafraîchi avec succès');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Auth] Erreur rafraîchissement token:', error);
    throw error;
  }
};

/**
 * Déconnexion utilisateur
 * 
 * Invalide le token côté serveur et nettoie les données locales.
 * 
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec confirmation de déconnexion
 * 
 * @example
 * await logout(currentToken);
 * await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
 * navigation.navigate('Login');
 */
export const logout = async (token: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (__DEV__) {
      console.log('✅ [Auth] Utilisateur déconnecté');
    }
    
    return response;
  } catch (error) {
    console.error('❌ [Auth] Erreur déconnexion:', error);
    // On ne propage pas l'erreur car on veut quand même nettoyer localement
    return { success: false, message: 'Erreur lors de la déconnexion' };
  }
};

/**
 * Demande de réinitialisation de mot de passe
 * 
 * Envoie un email avec un lien de réinitialisation à l'utilisateur.
 * 
 * @param data - Email de l'utilisateur
 * @returns Promise avec confirmation d'envoi
 * 
 * @example
 * const result = await forgotPassword({ email: 'user@example.com' });
 * if (result.success) {
 *   Alert.alert('Email envoyé', 'Consultez votre boîte mail');
 * }
 */
export const forgotPassword = async (data: ForgotPasswordData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );
    
    if (__DEV__) {
      console.log(`✅ [Auth] Email de réinitialisation envoyé à ${data.email}`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ [Auth] Erreur envoi email réinitialisation pour ${data.email}:`, error);
    throw error;
  }
};

/**
 * Réinitialisation du mot de passe
 * 
 * Définit un nouveau mot de passe pour l'utilisateur en utilisant le token
 * reçu par email.
 * 
 * @param data - Token de réinitialisation et nouveau mot de passe
 * @returns Promise avec confirmation de réinitialisation
 * 
 * @example
 * const result = await resetPassword({
 *   token: 'reset-token-from-email',
 *   newPassword: 'NouveauMotDePasse123!',
 *   confirmPassword: 'NouveauMotDePasse123!'
 * });
 */
export const resetPassword = async (data: ResetPasswordData): Promise<{ success: boolean; message: string }> => {
  try {
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    
    if (__DEV__) {
      console.log('✅ [Auth] Mot de passe réinitialisé avec succès');
    }
    
    return response;
  } catch (error) {
    console.error('❌ [Auth] Erreur réinitialisation mot de passe:', error);
    throw error;
  }
};

/**
 * Changement de mot de passe (utilisateur connecté)
 * 
 * Permet à un utilisateur authentifié de changer son mot de passe.
 * 
 * @param data - Mot de passe actuel et nouveau mot de passe
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec confirmation du changement
 * 
 * @example
 * const result = await changePassword({
 *   currentPassword: 'AncienMotDePasse123!',
 *   newPassword: 'NouveauMotDePasse456!',
 *   confirmPassword: 'NouveauMotDePasse456!'
 * }, authToken);
 */
export const changePassword = async (
  data: ChangePasswordData,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('Les nouveaux mots de passe ne correspondent pas');
    }
    
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (__DEV__) {
      console.log('✅ [Auth] Mot de passe modifié avec succès');
    }
    
    return response;
  } catch (error) {
    console.error('❌ [Auth] Erreur changement mot de passe:', error);
    throw error;
  }
};

/**
 * Vérification de l'adresse email
 * 
 * Confirme l'adresse email de l'utilisateur après inscription.
 * 
 * @param data - Token de vérification reçu par email
 * @returns Promise avec confirmation de vérification
 * 
 * @example
 * // Appelé automatiquement via le lien dans l'email
 * const result = await verifyEmail({ token: 'verification-token' });
 */
export const verifyEmail = async (data: VerifyEmailData): Promise<VerificationResponse> => {
  try {
    const response = await apiClient.post<VerificationResponse>(
      API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL,
      data
    );
    
    if (__DEV__) {
      console.log('✅ [Auth] Email vérifié avec succès');
    }
    
    return response;
  } catch (error) {
    console.error('❌ [Auth] Erreur vérification email:', error);
    throw error;
  }
};

/**
 * Renvoi de l'email de vérification
 * 
 * Envoie à nouveau l'email de vérification à l'utilisateur.
 * 
 * @param data - Email de l'utilisateur
 * @returns Promise avec confirmation d'envoi
 * 
 * @example
 * const result = await resendVerificationEmail({ email: 'user@example.com' });
 * Alert.alert('Email envoyé', 'Vérifiez votre boîte mail');
 */
export const resendVerificationEmail = async (data: ResendVerificationData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION,
      data
    );
    
    if (__DEV__) {
      console.log(`✅ [Auth] Email de vérification renvoyé à ${data.email}`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ [Auth] Erreur renvoi vérification pour ${data.email}:`, error);
    throw error;
  }
};

/**
 * Récupération des informations de l'utilisateur connecté
 * 
 * Obtient le profil complet de l'utilisateur à partir du token JWT.
 * 
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec les informations utilisateur
 * 
 * @example
 * const user = await getCurrentUser(authToken);
 * setUserData(user);
 */
export const getCurrentUser = async (token: string): Promise<User> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: User }>(
      API_CONFIG.ENDPOINTS.AUTH.CURRENT_USER,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ [Auth] Erreur récupération utilisateur courant:', error);
    throw error;
  }
};

/**
 * Mise à jour du profil utilisateur
 * 
 * Met à jour les informations du profil de l'utilisateur connecté.
 * 
 * @param data - Données à mettre à jour (partielles)
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec l'utilisateur mis à jour
 * 
 * @example
 * const updatedUser = await updateUserProfile({
 *   nom: 'Diallo',
 *   prenom: 'Amadou',
 *   cultureType: 'riz',
 *   superficie: 10
 * }, authToken);
 */
export const updateUserProfile = async (
  data: Partial<Pick<User, 'nom' | 'prenom' | 'telephone' | 'localisation' | 'cultureType' | 'superficie' | 'agricultureType' | 'profileImage'>>,
  token: string
): Promise<User> => {
  try {
    const response = await apiClient.put<{ success: boolean; data: User }>(
      API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (__DEV__) {
      console.log('✅ [Auth] Profil utilisateur mis à jour');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Auth] Erreur mise à jour profil:', error);
    throw error;
  }
};

/**
 * Suppression du compte utilisateur
 * 
 * Supprime définitivement le compte de l'utilisateur connecté.
 * Cette action est irréversible.
 * 
 * @param token - Token JWT de l'utilisateur
 * @param password - Mot de passe de confirmation
 * @returns Promise avec confirmation de suppression
 * 
 * @example
 * const result = await deleteAccount(authToken, 'monMotDePasse');
 * if (result.success) {
 *   await clearLocalData();
 *   navigation.navigate('Login');
 * }
 */
export const deleteAccount = async (
  token: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.DELETE_ACCOUNT,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { password }, // Body pour la requête DELETE
      }
    );
    
    if (__DEV__) {
      console.log('✅ [Auth] Compte utilisateur supprimé');
    }
    
    return response;
  } catch (error) {
    console.error('❌ [Auth] Erreur suppression compte:', error);
    throw error;
  }
};

// ============================================
// UTILITAIRES POUR LA GESTION DES SESSIONS
// ============================================

/**
 * Vérifie si le token est expiré
 * 
 * Décode le token JWT et vérifie sa date d'expiration.
 * 
 * @param token - Token JWT à vérifier
 * @returns true si le token est expiré, false sinon
 * 
 * @example
 * const isExpired = isTokenExpired(userToken);
 * if (isExpired) {
 *   await refreshUserToken();
 * }
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    // Décode le token JWT (format: header.payload.signature)
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    
    // Vérifie l'expiration (exp est en secondes)
    const expirationTime = payload.exp * 1000; // Conversion en millisecondes
    const now = Date.now();
    
    const isExpired = now >= expirationTime;
    
    if (__DEV__ && isExpired) {
      console.log('⚠️ [Auth] Token expiré');
    }
    
    return isExpired;
  } catch (error) {
    console.error('❌ [Auth] Erreur vérification expiration token:', error);
    return true; // En cas d'erreur, considère le token comme expiré
  }
};

/**
 * Récupère les données du token (sans vérification d'expiration)
 * 
 * @param token - Token JWT
 * @returns Données décodées du token ou null
 */
export const getTokenData = (token: string): any | null => {
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    return JSON.parse(payloadJson);
  } catch (error) {
    console.error('❌ [Auth] Erreur décodage token:', error);
    return null;
  }
};

/**
 * Sauvegarde les tokens dans le stockage local
 * 
 * @param token - Token d'accès
 * @param refreshToken - Token de rafraîchissement
 */
export const saveTokens = async (token: string, refreshToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('refresh_token', refreshToken);
    
    if (__DEV__) {
      console.log('✅ [Auth] Tokens sauvegardés');
    }
  } catch (error) {
    console.error('❌ [Auth] Erreur sauvegarde tokens:', error);
    throw error;
  }
};

/**
 * Nettoie les tokens du stockage local
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user_data');
    
    if (__DEV__) {
      console.log('✅ [Auth] Tokens supprimés');
    }
  } catch (error) {
    console.error('❌ [Auth] Erreur suppression tokens:', error);
    throw error;
  }
};

/**
 * Rafraîchit automatiquement le token si nécessaire
 * 
 * Vérifie l'expiration du token et le rafraîchit automatiquement.
 * 
 * @param token - Token actuel
 * @param refreshToken - Token de rafraîchissement
 * @returns Nouveau token ou token actuel si encore valide
 * 
 * @example
 * const validToken = await autoRefreshToken(currentToken, refreshToken);
 * if (validToken !== currentToken) {
 *   await saveTokens(validToken, newRefreshToken);
 * }
 */
export const autoRefreshToken = async (token: string, refreshTokenValue: string): Promise<string> => {
  // Vérifie si le token est sur le point d'expirer (moins de 5 minutes restantes)
  const tokenData = getTokenData(token);
  if (tokenData) {
    const expirationTime = tokenData.exp * 1000;
    const now = Date.now();
    const timeUntilExpiry = expirationTime - now;
    
    // Si le token expire dans moins de 5 minutes, on le rafraîchit
    if (timeUntilExpiry < 5 * 60 * 1000) {
      if (__DEV__) {
        console.log('🔄 [Auth] Rafraîchissement automatique du token');
      }
      
      try {
        const result = await refreshToken(refreshTokenValue);
        return result.token;
      } catch (error) {
        console.error('❌ [Auth] Échec rafraîchissement automatique:', error);
        throw error;
      }
    }
  }
  
  return token;
};

// ============================================
// EXPORT PAR DÉFAUT POUR FACILITÉ D'UTILISATION
// ============================================

/**
 * Exporte toutes les fonctions sous un namespace pour une utilisation plus propre
 * 
 * @example
 * import AuthAPI from './endpoints/auth';
 * 
 * const result = await AuthAPI.login({ email, password });
 */
export default {
  login,
  register,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  getCurrentUser,
  updateUserProfile,
  deleteAccount,
  isTokenExpired,
  getTokenData,
  saveTokens,
  clearTokens,
  autoRefreshToken,
};

// ============================================
// HOOK PERSONNALISÉ POUR L'AUTHENTIFICATION
// ============================================

/**
 * Note: Le hook useAuth doit être implémenté dans le dossier hooks/
 * 
 * Voici un exemple de ce à quoi il pourrait ressembler pour utiliser ces endpoints:
 * 
 * import { useCallback } from 'react';
 * import { useDispatch } from 'react-redux';
 * import * as AuthAPI from '../api/endpoints/auth';
 * import { setUser, clearUser } from '../store/slices/authSlice';
 * 
 * export const useAuth = () => {
 *   const dispatch = useDispatch();
 *   
 *   const handleLogin = useCallback(async (email, password) => {
 *     try {
 *       const response = await AuthAPI.login({ email, password });
 *       const { token, refreshToken, user } = response.data;
 *       await AuthAPI.saveTokens(token, refreshToken);
 *       dispatch(setUser(user));
 *       return { success: true, user };
 *     } catch (error) {
 *       return { success: false, error };
 *     }
 *   }, [dispatch]);
 *   
 *   return { login: handleLogin };
 * };
 */