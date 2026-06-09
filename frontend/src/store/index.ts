/**
 * Store Redux - Sènè Yiriwa
 * 
 * Configuration du store Redux principal de l'application.
 * Combine tous les slices et configure les middlewares.
 * 
 * Fonctionnalités :
 * - Combinaison des reducers (auth, user, app)
 * - Configuration du store avec middlewares
 * - Intégration de Redux Persist pour la persistance
 * - Configuration des middlewares de développement (logger, etc.)
 * - Types TypeScript pour le store et le dispatch
 * - Hooks typés pour une meilleure expérience de développement
 * 
 * @module store/index
 */

import { configureStore, combineReducers, Middleware } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import des reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import appReducer from './slices/appSlice';

// ============================================
// CONFIGURATION REDUX PERSIST
// ============================================

/**
 * Configuration Redux Persist pour chaque slice
 */

// Configuration pour auth slice
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['token', 'refreshToken', 'user', 'isAuthenticated', 'role', 'rememberMe'],
  blacklist: ['isLoading', 'isRefreshing', 'error'],
};

// Configuration pour user slice
const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
  whitelist: ['preferences', 'lastUpdated'],
  blacklist: ['loading', 'loadingProfile', 'loadingPreferences', 'loadingChamps', 'error', 'champs', 'cultures', 'agriculteurStats'],
};

// Configuration pour app slice
const appPersistConfig = {
  key: 'app',
  storage: AsyncStorage,
  whitelist: ['theme', 'isFirstLaunch', 'onboardingCompleted', 'isOfflineMode'],
  blacklist: ['isLoading', 'isRefreshing', 'modals', 'toast', 'networkStatus', 'isConnected'],
};

// ============================================
// COMBINAISON DES REDUCERS
// ============================================

/**
 * Combinaison des reducers avec persistance
 */
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  user: persistReducer(userPersistConfig, userReducer),
  app: persistReducer(appPersistConfig, appReducer),
});

// ============================================
// MIDDLEWARES
// ============================================

/**
 * Middleware de logging (développement uniquement)
 */
const loggerMiddleware: Middleware = (store) => (next) => (action: any) => {
  if (__DEV__) {
    console.log('🔴 [Redux] Action:', action.type);
    console.log('📦 [Redux] Payload:', action.payload);
    const result = next(action);
    console.log('✅ [Redux] New State:', store.getState());
    return result;
  }
  return next(action);
};

/**
 * Middleware pour gérer les erreurs asynchrones
 */
const errorHandlingMiddleware: Middleware = () => (next) => (action: any) => {
  if (action?.type && String(action.type).endsWith('/rejected')) {
    console.error('❌ [Redux] Action rejetée:', action.type, action.error);
  }
  return next(action);
};

/**
 * Middleware pour la persistance des tokens (rafraîchissement automatique)
 */
const tokenMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);
  
  // Vérifier si le token est sur le point d'expirer
  if (action.type === 'auth/login/fulfilled' || action.type === 'auth/refreshToken/fulfilled') {
    const state = store.getState();
    const tokenExpiration = state.auth.tokenExpiration;
    
    if (tokenExpiration) {
      const timeUntilExpiry = tokenExpiration - Date.now();
      // Planifier un rafraîchissement 5 minutes avant expiration
      if (timeUntilExpiry > 0) {
        setTimeout(() => {
          store.dispatch({ type: 'auth/checkAndRefreshToken' });
        }, Math.max(0, timeUntilExpiry - 5 * 60 * 1000));
      }
    }
  }
  
  return result;
};

// ============================================
//CONFIGURATION DU STORE
// ============================================

/**
 * Middlewares par défaut
 */
const getDefaultMiddlewares = () => {
  const middlewares = [
    // Middlewares personnalisés
    errorHandlingMiddleware,
    tokenMiddleware,
  ];
  
  // Ajouter le logger uniquement en développement
  if (__DEV__) {
    middlewares.push(loggerMiddleware);
  }
  
  return middlewares;
};

/**
 * Création du store
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer les actions Redux Persist (non sérialisables)
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignorer les chemins avec des dates ou fonctions non sérialisables
        ignoredPaths: ['auth.tokenExpiration', 'app.lastSync', 'user.lastUpdated', 'auth.user?.createdAt', 'auth.user?.updatedAt'],
      },
      thunk: {
        extraArgument: {}, // Pour injecter des dépendances si nécessaire
      },
    }).concat(getDefaultMiddlewares()),
  devTools: __DEV__, // Activer Redux DevTools uniquement en développement
  preloadedState: undefined, // État initial (peut être chargé depuis AsyncStorage)
});

/**
 * Persistor pour Redux Persist
 */
export const persistor = persistStore(store);

// ============================================
//TYPES TYPESCRIPT
// ============================================

/**
 * Type du state global
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Type du dispatch
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Hook useDispatch typé
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Hook useSelector typé
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ============================================
// SÉLECTEURS COMBINÉS
// ============================================

/**
 * Sélecteurs combinés pour faciliter l'accès aux données
 * Ces sélecteurs peuvent être utilisés directement dans les composants
 */

// Auth selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectToken = (state: RootState) => state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectUserRole = (state: RootState) => state.auth.role;
export const selectIsAgriculteur = (state: RootState) => state.auth.role === 'agriculteur';
export const selectIsExpert = (state: RootState) => state.auth.role === 'expert';
export const selectIsAdmin = (state: RootState) => state.auth.role === 'administrateur';

// User selectors
export const selectUserState = (state: RootState) => state.user;
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserPreferences = (state: RootState) => state.user.preferences;
export const selectUserChamps = (state: RootState) => state.user.champs;
export const selectUserCultures = (state: RootState) => state.user.cultures;
export const selectAgriculteurStats = (state: RootState) => state.user.agriculteurStats;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectLastUserUpdate = (state: RootState) => state.user.lastUpdated;

// App selectors
export const selectAppState = (state: RootState) => state.app;
export const selectTheme = (state: RootState) => state.app.theme;
export const selectIsConnected = (state: RootState) => state.app.isConnected;
export const selectNetworkStatus = (state: RootState) => state.app.networkStatus;
export const selectIsFirstLaunch = (state: RootState) => state.app.isFirstLaunch;
export const selectOnboardingCompleted = (state: RootState) => state.app.onboardingCompleted;
export const selectAppLoading = (state: RootState) => state.app.isLoading;
export const selectLoadingMessage = (state: RootState) => state.app.loadingMessage;
export const selectIsOfflineMode = (state: RootState) => state.app.isOfflineMode;
export const selectLastSync = (state: RootState) => state.app.lastSync;
export const selectLocationPermission = (state: RootState) => state.app.locationPermission;
export const selectToast = (state: RootState) => state.app.toast;

// Modal selectors
export const selectModalVisible = (state: RootState, modalId: string) => {
  const modal = state.app.modals.find((m: any) => m.id === modalId);
  return modal?.visible ?? false;
};

export const selectModalData = (state: RootState, modalId: string) => {
  const modal = state.app.modals.find((m: any) => m.id === modalId);
  return modal?.data;
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Réinitialise tout l'état de l'application
 * Utile pour la déconnexion ou la réinitialisation complète
 */
export const resetStore = () => {
  store.dispatch({ type: 'auth/resetAuthState' });
  store.dispatch({ type: 'user/resetUserState' });
  store.dispatch({ type: 'app/resetAppState' });
};

/**
 * Purge le store complet (Redux Persist)
 * Supprime toutes les données persistées
 */
export const purgeStore = async () => {
  await persistor.purge();
  resetStore();
};

/**
 * Hydrate le store avec des données sauvegardées
 */
export const rehydrateStore = async () => {
  // Wait until redux-persist has finished bootstrapping
  await new Promise<void>((resolve) => {
    const unsubscribe = (persistor as any).subscribe(() => {
      const state = (persistor as any).getState?.();
      if (state && state.bootstrapped) {
        unsubscribe();
        resolve();
      }
    });
  });
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default store;