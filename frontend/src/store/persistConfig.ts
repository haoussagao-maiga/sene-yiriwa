/**
 * Redux Persist configurations for various slices
 * Consolidated into a single module exporting named configs.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
  whitelist: ['preferences', 'lastUpdated'],
  blacklist: ['loading', 'loadingProfile', 'loadingPreferences', 'loadingChamps', 'error'],
};

export const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['token', 'refreshToken', 'user', 'isAuthenticated', 'role', 'rememberMe'],
  blacklist: ['isLoading', 'isRefreshing', 'error'],
};

export const appPersistConfig = {
  key: 'app',
  storage: AsyncStorage,
  whitelist: ['theme', 'isFirstLaunch', 'onboardingCompleted', 'isOfflineMode'],
  blacklist: ['isLoading', 'isRefreshing', 'modals', 'toast', 'networkStatus', 'isConnected'],
};

export default {
  userPersistConfig,
  authPersistConfig,
  appPersistConfig,
};
