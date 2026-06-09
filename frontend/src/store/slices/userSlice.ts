/**
 * User Slice - Sènè Yiriwa
 * 
 * Gestion de l'état utilisateur dans Redux Toolkit.
 * Ce slice gère les informations du profil utilisateur,
 * les préférences, les statistiques et l'état de chargement.
 * 
 * Fonctionnalités :
 * - Gestion du profil utilisateur
 * - Gestion des préférences (langue, thème, notifications)
 * - Gestion des champs agricoles
 * - Gestion des cultures pratiquées
 * - Statistiques utilisateur
 * - Persistance des données
 * - Actions asynchrones (fetch, update)
 * 
 * @module store/slices/userSlice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../api/clients';
import { API_CONFIG } from '../../config/api.config';
import type { BaseUser as User, UserPreferences, ChampAgricole, CulturePratique, AgriculteurStats, Localisation } from '../../types/user.types';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * État initial du slice utilisateur
 */
export interface UserState {
  /** Profil utilisateur */
  profile: User | null;
  
  /** Préférences utilisateur */
  preferences: UserPreferences | null;
  
  /** Liste des champs agricoles */
  champs: ChampAgricole[];
  
  /** Liste des cultures pratiquées */
  cultures: CulturePratique[];
  
  /** Statistiques de l'agriculteur */
  agriculteurStats: AgriculteurStats | null;
  
  /** État de chargement */
  loading: boolean;
  
  /** État de chargement du profil */
  loadingProfile: boolean;
  
  /** État de chargement des préférences */
  loadingPreferences: boolean;
  
  /** État de chargement des champs */
  loadingChamps: boolean;
  
  /** Message d'erreur */
  error: string | null;
  
  /** Dernière mise à jour */
  lastUpdated: Date | null;
}

/**
 * Paramètres pour la mise à jour du profil
 */
export interface UpdateProfileParams {
  nom?: string;
  prenom?: string;
  telephone?: string;
  dateNaissance?: Date;
  bio?: string;
    localisation?: Partial<Localisation>;
}

/**
 * Paramètres pour la mise à jour des préférences
 */
export interface UpdatePreferencesParams {
  langue?: 'fr' | 'bm';
  theme?: 'clair' | 'sombre' | 'systeme';
  notifications?: Partial<UserPreferences['notifications']>;
}

// ============================================
// ÉTAT INITIAL
// ============================================

const initialState: UserState = {
  profile: null,
  preferences: null,
  champs: [],
  cultures: [],
  agriculteurStats: null,
  loading: false,
  loadingProfile: false,
  loadingPreferences: false,
  loadingChamps: false,
  error: null,
  lastUpdated: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Récupère le profil utilisateur
 */
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (token: string, { rejectWithValue }) => {
    try {
      const profile = await apiClient.get(API_CONFIG.ENDPOINTS.USER.PROFILE, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      return profile;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement du profil');
    }
  }
);

/**
 * Met à jour le profil utilisateur
 */
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ data, token }: { data: UpdateProfileParams; token: string }, { rejectWithValue }) => {
    try {
      const updatedProfile = await apiClient.put(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, data, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      return updatedProfile;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  }
);

/**
 * Récupère les préférences utilisateur
 */
export const fetchUserPreferences = createAsyncThunk(
  'user/fetchPreferences',
  async (token: string, { rejectWithValue }) => {
    try {
      const preferences = await apiClient.get('/users/preferences', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      return preferences;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des préférences');
    }
  }
);

/**
 * Met à jour les préférences utilisateur
 */
export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async ({ data, token }: { data: UpdatePreferencesParams; token: string }, { rejectWithValue }) => {
    try {
      const updatedPreferences = await apiClient.patch('/users/preferences', data, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      return updatedPreferences;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour des préférences');
    }
  }
);

/**
 * Récupère les champs agricoles de l'utilisateur
 */
export const fetchUserChamps = createAsyncThunk(
  'user/fetchChamps',
  async (token: string, { rejectWithValue }) => {
    try {
      const champs = await apiClient.get('/users/champs', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      return champs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des champs');
    }
  }
);

/**
 * Ajoute un champ agricole
 */
export const addUserChamp = createAsyncThunk(
  'user/addChamp',
  async ({ champ, token }: { champ: Partial<ChampAgricole>; token: string }, { rejectWithValue }) => {
    try {
      const newChamp = await apiClient.post('/users/champs', champ, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      return newChamp;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de l\'ajout du champ');
    }
  }
);

/**
 * Met à jour un champ agricole
 */
export const updateUserChamp = createAsyncThunk(
  'user/updateChamp',
  async ({ champId, data, token }: { champId: string; data: Partial<ChampAgricole>; token: string }, { rejectWithValue }) => {
    try {
      const updatedChamp = await apiClient.put(`/users/champs/${champId}`, data, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      return updatedChamp;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du champ');
    }
  }
);

/**
 * Supprime un champ agricole
 */
export const deleteUserChamp = createAsyncThunk(
  'user/deleteChamp',
  async ({ champId, token }: { champId: string; token: string }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/users/champs/${champId}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      return champId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la suppression du champ');
    }
  }
);

/**
 * Récupère les statistiques de l'agriculteur
 */
export const fetchAgriculteurStats = createAsyncThunk(
  'user/fetchAgriculteurStats',
  async (token: string, { rejectWithValue }) => {
    try {
      const stats = await apiClient.get('/users/stats', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des statistiques');
    }
  }
);

// ============================================
// SLICE
// ============================================

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // ============================================
    // ACTIONS SYNC
    // ============================================
    
    /**
     * Réinitialise l'état utilisateur
     */
    resetUserState: (state) => {
      state.profile = null;
      state.preferences = null;
      state.champs = [];
      state.cultures = [];
      state.agriculteurStats = null;
      state.loading = false;
      state.loadingProfile = false;
      state.loadingPreferences = false;
      state.loadingChamps = false;
      state.error = null;
      state.lastUpdated = null;
    },
    
    /**
     * Définit le profil utilisateur
     */
    setUserProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload;
      state.lastUpdated = new Date();
    },
    
    /**
     * Met à jour localement le profil (sans appel API)
     */
    updateLocalProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
        state.lastUpdated = new Date();
      }
    },
    
    /**
     * Définit les préférences utilisateur
     */
    setUserPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.preferences = action.payload;
    },
    
    /**
     * Met à jour localement les préférences
     */
    updateLocalPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      }
    },
    
    /**
     * Ajoute un champ à la liste locale
     */
    addLocalChamp: (state, action: PayloadAction<ChampAgricole>) => {
      state.champs.push(action.payload);
    },
    
    /**
     * Met à jour un champ localement
     */
    updateLocalChamp: (state, action: PayloadAction<ChampAgricole>) => {
      const index = state.champs.findIndex((c: ChampAgricole) => c.id === action.payload.id);
      if (index !== -1) {
        state.champs[index] = action.payload;
      }
    },
    
    /**
     * Supprime un champ localement
     */
    deleteLocalChamp: (state, action: PayloadAction<string>) => {
      state.champs = state.champs.filter((c: ChampAgricole) => c.id !== action.payload);
    },
    
    /**
     * Définit l'état de chargement
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    /**
     * Définit l'erreur
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    /**
     * Efface l'erreur
     */
    clearError: (state) => {
      state.error = null;
    },
    
    /**
     * Met à jour la dernière synchronisation
     */
    setLastUpdated: (state, action: PayloadAction<Date>) => {
      state.lastUpdated = action.payload;
    },
  },
  
  // ============================================
  // GESTION DES ACTIONS ASYNC
  // ============================================
  
  extraReducers: (builder) => {
    // ============================================
    // fetchUserProfile
    // ============================================
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loadingProfile = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loadingProfile = false;
        state.profile = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loadingProfile = false;
        state.error = action.payload as string;
      });
    
    // ============================================
    // updateUserProfile
    // ============================================
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loadingProfile = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loadingProfile = false;
        state.profile = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loadingProfile = false;
        state.error = action.payload as string;
      });
    
    // ============================================
    // fetchUserPreferences
    // ============================================
    builder
      .addCase(fetchUserPreferences.pending, (state) => {
        state.loadingPreferences = true;
        state.error = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.loadingPreferences = false;
        state.preferences = action.payload;
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loadingPreferences = false;
        state.error = action.payload as string;
      });
    
    // ============================================
    // updateUserPreferences
    // ============================================
    builder
      .addCase(updateUserPreferences.pending, (state) => {
        state.loadingPreferences = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loadingPreferences = false;
        state.preferences = action.payload;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loadingPreferences = false;
        state.error = action.payload as string;
      });
    
    // ============================================
    // fetchUserChamps
    // ============================================
    builder
      .addCase(fetchUserChamps.pending, (state) => {
        state.loadingChamps = true;
        state.error = null;
      })
      .addCase(fetchUserChamps.fulfilled, (state, action) => {
        state.loadingChamps = false;
        state.champs = action.payload;
      })
      .addCase(fetchUserChamps.rejected, (state, action) => {
        state.loadingChamps = false;
        state.error = action.payload as string;
      });
    
    // ============================================
    // addUserChamp
    // ============================================
    builder
      .addCase(addUserChamp.pending, (state) => {
        state.loadingChamps = true;
        state.error = null;
      })
      .addCase(addUserChamp.fulfilled, (state, action) => {
        state.loadingChamps = false;
        state.champs.push(action.payload);
      })
      .addCase(addUserChamp.rejected, (state, action) => {
        state.loadingChamps = false;
        state.error = action.payload as string;
      });
    
    // ============================================
    // updateUserChamp
    // ============================================
    builder
      .addCase(updateUserChamp.pending, (state) => {
        state.loadingChamps = true;
        state.error = null;
      })
      .addCase(updateUserChamp.fulfilled, (state, action) => {
        state.loadingChamps = false;
        const index = state.champs.findIndex((c: ChampAgricole) => c.id === action.payload.id);
        if (index !== -1) {
          state.champs[index] = action.payload;
        }
      })
      .addCase(updateUserChamp.rejected, (state, action) => {
        state.loadingChamps = false;
        state.error = action.payload as string;
      });
    
    // ============================================
    // deleteUserChamp
    // ============================================
    builder
      .addCase(deleteUserChamp.pending, (state) => {
        state.loadingChamps = true;
        state.error = null;
      })
      .addCase(deleteUserChamp.fulfilled, (state, action) => {
        state.loadingChamps = false;
        state.champs = state.champs.filter((c: ChampAgricole) => c.id !== action.payload);
      })
      .addCase(deleteUserChamp.rejected, (state, action) => {
        state.loadingChamps = false;
        state.error = action.payload as string;
      });
    
    // ============================================
    // fetchAgriculteurStats
    // ============================================
    builder
      .addCase(fetchAgriculteurStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgriculteurStats.fulfilled, (state, action) => {
        state.loading = false;
        state.agriculteurStats = action.payload;
      })
      .addCase(fetchAgriculteurStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================
// SÉLECTEURS
// ============================================

/**
 * Sélecteur pour le profil utilisateur
 */
export const selectUserProfile = (state: { user: UserState }) => state.user.profile;

/**
 * Sélecteur pour les préférences utilisateur
 */
export const selectUserPreferences = (state: { user: UserState }) => state.user.preferences;

/**
 * Sélecteur pour les champs agricoles
 */
export const selectUserChamps = (state: { user: UserState }) => state.user.champs;

/**
 * Sélecteur pour les cultures pratiquées
 */
export const selectUserCultures = (state: { user: UserState }) => state.user.cultures;

/**
 * Sélecteur pour les statistiques agriculteur
 */
export const selectAgriculteurStats = (state: { user: UserState }) => state.user.agriculteurStats;

/**
 * Sélecteur pour l'état de chargement
 */
export const selectUserLoading = (state: { user: UserState }) => state.user.loading;

/**
 * Sélecteur pour l'erreur
 */
export const selectUserError = (state: { user: UserState }) => state.user.error;

/**
 * Sélecteur pour la dernière mise à jour
 */
export const selectLastUpdated = (state: { user: UserState }) => state.user.lastUpdated;

// ============================================
// EXPORT DES ACTIONS
// ============================================

export const {
  resetUserState,
  setUserProfile,
  updateLocalProfile,
  setUserPreferences,
  updateLocalPreferences,
  addLocalChamp,
  updateLocalChamp,
  deleteLocalChamp,
  setLoading,
  setError,
  clearError,
  setLastUpdated,
} = userSlice.actions;

// ============================================
// EXPORT DU REDUCER
// ============================================

export default userSlice.reducer;