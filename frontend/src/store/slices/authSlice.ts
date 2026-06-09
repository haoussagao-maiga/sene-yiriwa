/**
 * Auth Slice - Sènè Yiriwa
 * 
 * Gestion de l'état d'authentification dans Redux Toolkit.
 * Ce slice gère les informations de l'utilisateur connecté,
 * le token JWT, l'état de connexion et les erreurs.
 * 
 * Fonctionnalités :
 * - Gestion du token d'authentification
 * - Gestion du refresh token
 * - Stockage des informations utilisateur
 * - Gestion de l'état de connexion
 * - Actions de connexion/déconnexion
 * - Rafraîchissement automatique du token
 * - Persistance des données
 * - Actions asynchrones (login, register, logout)
 * 
 * @module store/slices/authSlice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthAPI from '../../api/endpoints/auth';
import type { User, AuthResponse } from '../../api/endpoints/auth';

// ============================================
// CONSTANTES
// ============================================

/**
 * Clés pour AsyncStorage
 */
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  REMEMBER_ME: 'remember_me',
};

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * État initial du slice d'authentification
 */
export interface AuthState {
  /** Utilisateur connecté */
  user: User | null;
  
  /** Token JWT d'accès */
  token: string | null;
  
  /** Token de rafraîchissement */
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
  
  /** Date d'expiration du token */
  tokenExpiration: number | null;
  
  /** Indique si "Se souvenir de moi" est activé */
  rememberMe: boolean;
}

/**
 * Paramètres pour la connexion
 */
export interface LoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Paramètres pour l'inscription
 */
export interface RegisterParams {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  cultureType?: string;
  superficie?: number;
  localisation?: {
    region: string;
    cercle?: string;
  };
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Sauvegarde les données d'authentification
 */
const persistAuthData = async (
  token: string,
  refreshToken: string,
  user: User,
  rememberMe: boolean
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(rememberMe));
  } catch (error) {
    console.error('Erreur lors de la persistance des données auth:', error);
  }
};

/**
 * Nettoie les données d'authentification
 */
const clearPersistedAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  } catch (error) {
    console.error('Erreur lors du nettoyage des données auth:', error);
  }
};

/**
 * Charge les données d'authentification persistées
 */
export const loadPersistedAuthData = async (): Promise<Partial<AuthState>> => {
  try {
    const [token, refreshToken, userStr, rememberMeStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.USER),
      AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME),
    ]);

    if (token && refreshToken && userStr) {
      const user = JSON.parse(userStr);
      const rememberMe = rememberMeStr === 'true';
      
      return {
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        role: user.role,
        rememberMe,
      };
    }
    
    return {};
  } catch (error) {
    console.error('Erreur lors du chargement des données auth:', error);
    return {};
  }
};

// ============================================
// ÉTAT INITIAL
// ============================================

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
  role: null,
  tokenExpiration: null,
  rememberMe: false,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Connexion utilisateur
 */
export const login = createAsyncThunk(
  'auth/login',
  async (params: LoginParams, { rejectWithValue }) => {
    try {
      const response = await AuthAPI.login({
        email: params.email,
        password: params.password,
      });
      
      const { token, refreshToken, user } = response.data;
      const rememberMe = params.rememberMe ?? true;
      
      // Persister les données
      await persistAuthData(token, refreshToken, user, rememberMe);
      
      return { token, refreshToken, user, rememberMe };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Échec de la connexion');
    }
  }
);

/**
 * Inscription utilisateur
 */
export const register = createAsyncThunk(
  'auth/register',
  async (params: RegisterParams, { rejectWithValue }) => {
    try {
      const response = await AuthAPI.register({
        nom: params.nom,
        prenom: params.prenom,
        email: params.email,
        telephone: params.telephone,
        password: params.password,
        confirmPassword: params.confirmPassword,
        acceptTerms: params.acceptTerms,
        cultureType: params.cultureType,
        superficie: params.superficie,
        localisation: params.localisation,
      });
      
      const { token, refreshToken, user } = response.data;
      
      // Persister les données
      await persistAuthData(token, refreshToken, user, true);
      
      return { token, refreshToken, user, rememberMe: true };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Échec de l\'inscription');
    }
  }
);

/**
 * Déconnexion utilisateur
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      
      if (token) {
        await AuthAPI.logout(token);
      }
      
      await clearPersistedAuthData();
      
      return null;
    } catch (error: any) {
      // Même en cas d'erreur, on nettoie localement
      await clearPersistedAuthData();
      return null;
    }
  }
);

/**
 * Rafraîchissement du token
 */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshTokenValue = state.auth.refreshToken;
      
      if (!refreshTokenValue) {
        throw new Error('Aucun refresh token disponible');
      }
      
      const result = await AuthAPI.refreshToken(refreshTokenValue);
      
      // Mettre à jour le token dans le stockage
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, result.token);
      if (result.refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken);
      }
      
      return {
        token: result.token,
        refreshToken: result.refreshToken || refreshTokenValue,
      };
    } catch (error: any) {
      // En cas d'échec, déconnecter l'utilisateur
      await clearPersistedAuthData();
      return rejectWithValue(error.response?.data?.message || 'Échec du rafraîchissement du token');
    }
  }
);

/**
 * Vérification et rafraîchissement automatique du token
 */
export const checkAndRefreshToken = createAsyncThunk(
  'auth/checkAndRefreshToken',
  async (_, { dispatch, getState }) => {
    const state = getState() as { auth: AuthState };
    const { token, tokenExpiration } = state.auth;
    
    if (!token || !tokenExpiration) {
      return null;
    }
    
    const now = Date.now();
    const timeUntilExpiry = tokenExpiration - now;
    
    // Si le token expire dans moins de 5 minutes, on le rafraîchit
    if (timeUntilExpiry < 5 * 60 * 1000) {
      const result = await dispatch(refreshToken()).unwrap();
      return result;
    }
    
    return null;
  }
);

// ============================================
// SLICE
// ============================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ============================================
    // ACTIONS SYNC
    // ============================================
    
    /**
     * Définit l'état d'authentification
     */
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    
    /**
     * Définit l'utilisateur
     */
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.role = action.payload?.role || null;
    },
    
    /**
     * Définit le token
     */
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    
    /**
     * Définit le refresh token
     */
    setRefreshToken: (state, action: PayloadAction<string | null>) => {
      state.refreshToken = action.payload;
    },
    
    /**
     * Définit l'erreur
     */
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    /**
     * Efface l'erreur
     */
    clearAuthError: (state) => {
      state.error = null;
    },
    
    /**
     * Définit l'état de chargement
     */
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    /**
     * Met à jour localement l'utilisateur (sans appel API)
     */
    updateLocalUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    /**
     * Définit l'expiration du token
     */
    setTokenExpiration: (state, action: PayloadAction<number>) => {
      state.tokenExpiration = action.payload;
    },
    
    /**
     * Réinitialise l'état d'authentification
     */
    resetAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = null;
      state.role = null;
      state.tokenExpiration = null;
      state.rememberMe = false;
    },
    
    /**
     * Hydrate l'état à partir des données persistées
     */
    hydrateAuthState: (state, action: PayloadAction<Partial<AuthState>>) => {
      Object.assign(state, action.payload);
    },
  },
  
  // ============================================
  // GESTION DES ACTIONS ASYNC
  // ============================================
  
  extraReducers: (builder) => {
    // ============================================
    // LOGIN
    // ============================================
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.role = action.payload.user.role;
        state.rememberMe = action.payload.rememberMe;
        // Estimation de l'expiration (7 jours par défaut)
        state.tokenExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
    
    // ============================================
    // REGISTER
    // ============================================
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.role = action.payload.user.role;
        state.rememberMe = action.payload.rememberMe;
        state.tokenExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
    
    // ============================================
    // LOGOUT
    // ============================================
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.role = null;
        state.tokenExpiration = null;
        state.rememberMe = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        // En cas d'erreur, on réinitialise quand même
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.role = null;
        state.tokenExpiration = null;
        state.rememberMe = false;
        state.error = null;
      });
    
    // ============================================
    // REFRESH TOKEN
    // ============================================
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isRefreshing = false;
        if (action.payload) {
          state.token = action.payload.token;
          if (action.payload.refreshToken) {
            state.refreshToken = action.payload.refreshToken;
          }
          // Réinitialiser l'expiration
          state.tokenExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isRefreshing = false;
        // En cas d'échec, déconnecter l'utilisateur
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.role = null;
        state.tokenExpiration = null;
        state.rememberMe = false;
      });
  },
});

// ============================================
// SÉLECTEURS
// ============================================

/**
 * Sélecteur pour l'utilisateur
 */
export const selectUser = (state: { auth: AuthState }) => state.auth.user;

/**
 * Sélecteur pour le token
 */
export const selectToken = (state: { auth: AuthState }) => state.auth.token;

/**
 * Sélecteur pour l'état d'authentification
 */
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

/**
 * Sélecteur pour l'état de chargement
 */
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;

/**
 * Sélecteur pour l'erreur
 */
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

/**
 * Sélecteur pour le rôle utilisateur
 */
export const selectUserRole = (state: { auth: AuthState }) => state.auth.role;

/**
 * Sélecteur pour le refresh token
 */
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;

/**
 * Sélecteur pour l'expiration du token
 */
export const selectTokenExpiration = (state: { auth: AuthState }) => state.auth.tokenExpiration;

/**
 * Sélecteur pour vérifier si le token est expiré
 */
export const selectIsTokenExpired = (state: { auth: AuthState }) => {
  const { tokenExpiration } = state.auth;
  if (!tokenExpiration) return true;
  return Date.now() >= tokenExpiration;
};

/**
 * Sélecteur pour le nom complet de l'utilisateur
 */
export const selectUserFullName = (state: { auth: AuthState }) => {
  const { user } = state.auth;
  if (!user) return '';
  return `${user.prenom} ${user.nom}`;
};

/**
 * Sélecteur pour vérifier si l'utilisateur est un agriculteur
 */
export const selectIsAgriculteur = (state: { auth: AuthState }) => {
  return state.auth.role === 'agriculteur';
};

/**
 * Sélecteur pour vérifier si l'utilisateur est un expert
 */
export const selectIsExpert = (state: { auth: AuthState }) => {
  return state.auth.role === 'expert';
};

/**
 * Sélecteur pour vérifier si l'utilisateur est un administrateur
 */
export const selectIsAdmin = (state: { auth: AuthState }) => {
  return state.auth.role === 'administrateur';
};

// ============================================
// EXPORT DES ACTIONS
// ============================================

export const {
  setAuthenticated,
  setUser,
  setToken,
  setRefreshToken,
  setAuthError,
  clearAuthError,
  setAuthLoading,
  updateLocalUser,
  setTokenExpiration,
  resetAuthState,
  hydrateAuthState,
} = authSlice.actions;

// ============================================
// EXPORT DU REDUCER
// ============================================

export default authSlice.reducer;