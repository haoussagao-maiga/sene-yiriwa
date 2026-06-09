/**
 * App Slice - Sènè Yiriwa
 * 
 * Gestion de l'état global de l'application dans Redux Toolkit.
 * Ce slice gère les paramètres généraux, l'état de l'interface,
 * les thèmes, la connectivité, et les états de chargement globaux.
 * 
 * Fonctionnalités :
 * - Gestion du thème (clair/sombre/système)
 * - Gestion de la connectivité réseau
 * - Gestion des modals et dialogues
 * - Gestion des toasts et alertes
 * - État de chargement global
 * - Version de l'application
 * - Premier lancement (onboarding)
 * - Mode hors ligne
 * 
 * @module store/slices/appSlice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Types de thème disponibles
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Types de connectivité réseau
 */
export type NetworkStatus = 'wifi' | 'cellular' | 'none' | 'unknown';

/**
 * Types de modals
 */
export interface ModalState {
  id: string;
  visible: boolean;
  data?: any;
}

/**
 * Types de toast
 */
export interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

/**
 * État initial du slice application
 */
export interface AppState {
  /** Thème actuel */
  theme: ThemeMode;
  
  /** Statut de la connexion réseau */
  networkStatus: NetworkStatus;
  
  /** Indique si l'appareil est en ligne */
  isConnected: boolean;
  
  /** Indique si c'est le premier lancement */
  isFirstLaunch: boolean;
  
  /** Indique si l'onboarding a été complété */
  onboardingCompleted: boolean;
  
  /** État de chargement global */
  isLoading: boolean;
  
  /** Message de chargement global */
  loadingMessage: string | null;
  
  /** Modals actifs */
  modals: ModalState[];
  
  /** Toast actif */
  toast: ToastState | null;
  
  /** Version de l'application */
  appVersion: string;
  
  /** Code de build */
  buildNumber: string;
  
  /** Indique si le mode hors ligne est actif */
  isOfflineMode: boolean;
  
  /** Dernière synchronisation */
  lastSync: Date | null;
  
  /** Indicateur de rafraîchissement global */
  isRefreshing: boolean;
  
  /** Permission de localisation */
  locationPermission: 'granted' | 'denied' | 'unknown';
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Clés pour AsyncStorage
 */
const STORAGE_KEYS = {
  THEME: 'app_theme',
  FIRST_LAUNCH: 'app_first_launch',
  ONBOARDING_COMPLETED: 'app_onboarding_completed',
  OFFLINE_MODE: 'app_offline_mode',
};

/**
 * Version de l'application
 */
const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';

// ============================================
// ÉTAT INITIAL
// ============================================

const initialState: AppState = {
  theme: 'system',
  networkStatus: 'unknown',
  isConnected: true,
  isFirstLaunch: true,
  onboardingCompleted: false,
  isLoading: false,
  loadingMessage: null,
  modals: [],
  toast: null,
  appVersion: APP_VERSION,
  buildNumber: BUILD_NUMBER,
  isOfflineMode: false,
  lastSync: null,
  isRefreshing: false,
  locationPermission: 'unknown',
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Initialise les paramètres de l'application
 */
export const initializeApp = createAsyncThunk(
  'app/initialize',
  async (_, { dispatch }) => {
    try {
      // Charger le thème sauvegardé
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        dispatch(setTheme(savedTheme as ThemeMode));
      }
      
      // Vérifier si c'est le premier lancement
      const isFirstLaunch = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
      if (isFirstLaunch === null) {
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
        dispatch(setFirstLaunch(true));
      } else {
        dispatch(setFirstLaunch(false));
      }
      
      // Vérifier si l'onboarding est complété
      const onboardingCompleted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      dispatch(setOnboardingCompleted(onboardingCompleted === 'true'));
      
      // Vérifier le mode hors ligne
      const offlineMode = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
      dispatch(setOfflineMode(offlineMode === 'true'));
      
      // Surveiller la connectivité réseau
      NetInfo.addEventListener(state => {
        dispatch(setNetworkStatus({
          isConnected: state.isConnected ?? false,
          type: state.type as NetworkStatus,
        }));
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      return false;
    }
  }
);

/**
 * Complète l'onboarding
 */
export const completeOnboarding = createAsyncThunk(
  'app/completeOnboarding',
  async (_, { dispatch }) => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    dispatch(setOnboardingCompleted(true));
    return true;
  }
);

// ============================================
// SLICE
// ============================================

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // ============================================
    // THÈME
    // ============================================
    
    /**
     * Définit le thème de l'application
     */
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      AsyncStorage.setItem(STORAGE_KEYS.THEME, action.payload).catch(console.error);
    },
    
    /**
     * Bascule entre le mode clair et sombre
     */
    toggleTheme: (state) => {
      if (state.theme === 'light') {
        state.theme = 'dark';
      } else if (state.theme === 'dark') {
        state.theme = 'light';
      } else {
        state.theme = 'light';
      }
      AsyncStorage.setItem(STORAGE_KEYS.THEME, state.theme).catch(console.error);
    },
    
    // ============================================
    // CONNECTIVITÉ RÉSEAU
    // ============================================
    
    /**
     * Définit le statut réseau
     */
    setNetworkStatus: (state, action: PayloadAction<{ isConnected: boolean; type: NetworkStatus }>) => {
      state.isConnected = action.payload.isConnected;
      state.networkStatus = action.payload.type;
      
      // Activer automatiquement le mode hors ligne si pas de connexion
      if (!action.payload.isConnected && !state.isOfflineMode) {
        state.isOfflineMode = true;
      } else if (action.payload.isConnected && state.isOfflineMode) {
        // Optionnel: désactiver automatiquement le mode hors ligne quand la connexion revient
        // state.isOfflineMode = false;
      }
    },
    
    // ============================================
    // PREMIER LANCEMENT
    // ============================================
    
    /**
     * Définit si c'est le premier lancement
     */
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.isFirstLaunch = action.payload;
    },
    
    /**
     * Définit si l'onboarding est complété
     */
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload;
    },
    
    // ============================================
    // ÉTATS DE CHARGEMENT
    // ============================================
    
    /**
     * Définit l'état de chargement global
     */
    setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || null;
    },
    
    /**
     * Définit l'état de rafraîchissement global
     */
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    
    // ============================================
    // MODALS
    // ============================================
    
    /**
     * Affiche un modal
     */
    showModal: (state, action: PayloadAction<{ id: string; data?: any }>) => {
      const existingIndex = state.modals.findIndex(m => m.id === action.payload.id);
      if (existingIndex !== -1) {
        state.modals[existingIndex] = {
          id: action.payload.id,
          visible: true,
          data: action.payload.data,
        };
      } else {
        state.modals.push({
          id: action.payload.id,
          visible: true,
          data: action.payload.data,
        });
      }
    },
    
    /**
     * Cache un modal
     */
    hideModal: (state, action: PayloadAction<string>) => {
      const index = state.modals.findIndex(m => m.id === action.payload);
      if (index !== -1) {
        state.modals[index].visible = false;
      }
    },
    
    /**
     * Ferme tous les modals
     */
    hideAllModals: (state) => {
      state.modals.forEach(modal => {
        modal.visible = false;
      });
    },
    
    /**
     * Supprime un modal de la liste
     */
    removeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(m => m.id !== action.payload);
    },
    
    // ============================================
    // TOASTS
    // ============================================
    
    /**
     * Affiche un toast
     */
    showToast: (state, action: PayloadAction<Omit<ToastState, 'visible'>>) => {
      state.toast = {
        ...action.payload,
        visible: true,
      };
    },
    
    /**
     * Cache le toast
     */
    hideToast: (state) => {
      if (state.toast) {
        state.toast.visible = false;
      }
    },
    
    /**
     * Efface le toast
     */
    clearToast: (state) => {
      state.toast = null;
    },
    
    // ============================================
    // MODE HORS LIGNE
    // ============================================
    
    /**
     * Active/désactive le mode hors ligne
     */
    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.isOfflineMode = action.payload;
      AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, String(action.payload)).catch(console.error);
    },
    
    /**
     * Met à jour la dernière synchronisation
     */
    setLastSync: (state, action: PayloadAction<Date>) => {
      state.lastSync = action.payload;
    },
    
    // ============================================
    // PERMISSIONS
    // ============================================
    
    /**
     * Définit la permission de localisation
     */
    setLocationPermission: (state, action: PayloadAction<'granted' | 'denied' | 'unknown'>) => {
      state.locationPermission = action.payload;
    },
    
    // ============================================
    // RÉINITIALISATION
    // ============================================
    
    /**
     * Réinitialise l'état de l'application
     */
    resetAppState: (state) => {
      state.isLoading = false;
      state.loadingMessage = null;
      state.modals = [];
      state.toast = null;
      state.isRefreshing = false;
    },
    
    /**
     * Réinitialise complètement l'application (tous les paramètres)
     */
    resetAllSettings: (state) => {
      state.theme = 'system';
      state.isFirstLaunch = true;
      state.onboardingCompleted = false;
      state.isOfflineMode = false;
      state.lastSync = null;
      state.locationPermission = 'unknown';
      
      // Nettoyer AsyncStorage
      AsyncStorage.removeItem(STORAGE_KEYS.THEME).catch(console.error);
      AsyncStorage.removeItem(STORAGE_KEYS.FIRST_LAUNCH).catch(console.error);
      AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED).catch(console.error);
      AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_MODE).catch(console.error);
    },
  },
  
  // ============================================
  // GESTION DES ACTIONS ASYNC
  // ============================================
  
  extraReducers: (builder) => {
    builder
      .addCase(initializeApp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeApp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(initializeApp.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(completeOnboarding.fulfilled, (state) => {
        state.onboardingCompleted = true;
      });
  },
});

// ============================================
// SÉLECTEURS
// ============================================

/**
 * Sélecteur pour le thème actuel
 */
export const selectTheme = (state: { app: AppState }) => state.app.theme;

/**
 * Sélecteur pour l'état de connexion
 */
export const selectIsConnected = (state: { app: AppState }) => state.app.isConnected;

/**
 * Sélecteur pour le statut réseau
 */
export const selectNetworkStatus = (state: { app: AppState }) => state.app.networkStatus;

/**
 * Sélecteur pour le premier lancement
 */
export const selectIsFirstLaunch = (state: { app: AppState }) => state.app.isFirstLaunch;

/**
 * Sélecteur pour l'état de l'onboarding
 */
export const selectOnboardingCompleted = (state: { app: AppState }) => state.app.onboardingCompleted;

/**
 * Sélecteur pour l'état de chargement global
 */
export const selectAppLoading = (state: { app: AppState }) => state.app.isLoading;

/**
 * Sélecteur pour le message de chargement
 */
export const selectLoadingMessage = (state: { app: AppState }) => state.app.loadingMessage;

/**
 * Sélecteur pour le mode hors ligne
 */
export const selectIsOfflineMode = (state: { app: AppState }) => state.app.isOfflineMode;

/**
 * Sélecteur pour la dernière synchronisation
 */
export const selectLastSync = (state: { app: AppState }) => state.app.lastSync;

/**
 * Sélecteur pour l'état de rafraîchissement
 */
export const selectIsRefreshing = (state: { app: AppState }) => state.app.isRefreshing;

/**
 * Sélecteur pour la permission de localisation
 */
export const selectLocationPermission = (state: { app: AppState }) => state.app.locationPermission;

/**
 * Sélecteur pour la version de l'application
 */
export const selectAppVersion = (state: { app: AppState }) => state.app.appVersion;

/**
 * Sélecteur pour vérifier si un modal est visible
 */
export const selectModalVisible = (state: { app: AppState }, modalId: string) => {
  const modal = state.app.modals.find(m => m.id === modalId);
  return modal?.visible ?? false;
};

/**
 * Sélecteur pour les données d'un modal
 */
export const selectModalData = (state: { app: AppState }, modalId: string) => {
  const modal = state.app.modals.find(m => m.id === modalId);
  return modal?.data;
};

/**
 * Sélecteur pour le toast actif
 */
export const selectToast = (state: { app: AppState }) => state.app.toast;

// ============================================
// EXPORT DES ACTIONS
// ============================================

export const {
  // Thème
  setTheme,
  toggleTheme,
  
  // Connectivité
  setNetworkStatus,
  
  // Premier lancement
  setFirstLaunch,
  setOnboardingCompleted,
  
  // États de chargement
  setLoading,
  setRefreshing,
  
  // Modals
  showModal,
  hideModal,
  hideAllModals,
  removeModal,
  
  // Toasts
  showToast,
  hideToast,
  clearToast,
  
  // Mode hors ligne
  setOfflineMode,
  setLastSync,
  
  // Permissions
  setLocationPermission,
  
  // Réinitialisation
  resetAppState,
  resetAllSettings,
} = appSlice.actions;

// ============================================
// EXPORT DU REDUCER
// ============================================

export default appSlice.reducer;