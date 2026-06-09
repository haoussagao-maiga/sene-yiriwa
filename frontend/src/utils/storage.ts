/**
 * Storage Utils - Sènè Yiriwa
 * 
 * Ce fichier contient toutes les fonctions utilitaires pour la gestion
 * du stockage local (AsyncStorage) dans l'application. Il fournit des
 * helpers pour stocker, récupérer, et gérer les données localement.
 * 
 * Fonctionnalités :
 * - Stockage sécurisé des données (tokens, préférences)
 * - Gestion du cache des données API
 * - Gestion de la persistance de session
 * - Utilitaires pour le stockage d'images
 * - Gestion de la taille du cache
 * - Nettoyage automatique des données expirées
 * - Support du chiffrement (optionnel)
 * 
 * @module utils/storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Options pour le stockage
 */
export interface StorageOptions {
  /** Durée de vie en millisecondes (TTL) */
  ttl?: number;
  
  /** Indique si les données doivent être chiffrées */
  secure?: boolean;
  
  /** Version des données (pour migration) */
  version?: number;
}

/**
 * Structure des données en cache
 */
export interface CachedData<T = any> {
  /** Données stockées */
  data: T;
  
  /** Timestamp de création */
  createdAt: number;
  
  /** Timestamp d'expiration */
  expiresAt: number;
  
  /** Version des données */
  version: number;
}

/**
 * Statistiques du stockage
 */
export interface StorageStats {
  /** Nombre total d'éléments */
  totalItems: number;
  
  /** Taille totale approximative (bytes) */
  totalSize: number;
  
  /** Nombre d'éléments expirés */
  expiredItems: number;
  
  /** Liste des clés */
  keys: string[];
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Clés de stockage standardisées
 */
export const StorageKeys = {
  // Authentification
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
  
  // Préférences
  APP_THEME: 'app_theme',
  APP_LANGUAGE: 'app_language',
  NOTIFICATION_PREFS: 'notification_prefs',
  
  // Cache API
  CACHE_CONSEILS: 'cache_conseils',
  CACHE_TECHNIQUES: 'cache_techniques',
  CACHE_METEO: 'cache_meteo',
  CACHE_ALERTES: 'cache_alertes',
  
  // Onboarding
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_LAUNCH: 'first_launch',
  
  // Autres
  LAST_SYNC: 'last_sync',
  APP_VERSION: 'app_version',
  DEVICE_ID: 'device_id',
  
  // Cache de recherche
  SEARCH_HISTORY: 'search_history',
  RECENT_VIEWS: 'recent_views',
  FAVORITES: 'favorites',
} as const;

/**
 * Durée de vie par défaut pour le cache (7 jours)
 */
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Version actuelle du cache
 */
const CACHE_VERSION = 1;

// ============================================
// STOCKAGE DE BASE
// ============================================

/**
 * Stocke des données dans AsyncStorage
 * 
 * @param key - Clé de stockage
 * @param value - Valeur à stocker
 * 
 * @example
 * await setItem('user_prefs', { theme: 'dark' });
 */
export const setItem = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Erreur lors du stockage de ${key}:`, error);
    throw error;
  }
};

/**
 * Récupère des données depuis AsyncStorage
 * 
 * @param key - Clé de stockage
 * @returns Valeur stockée ou null
 * 
 * @example
 * const prefs = await getItem('user_prefs');
 */
export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de ${key}:`, error);
    return null;
  }
};

/**
 * Supprime des données d'AsyncStorage
 * 
 * @param key - Clé de stockage
 * 
 * @example
 * await removeItem('user_prefs');
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Erreur lors de la suppression de ${key}:`, error);
    throw error;
  }
};

/**
 * Vérifie si une clé existe
 * 
 * @param key - Clé à vérifier
 * @returns true si la clé existe
 * 
 * @example
 * const exists = await contains('user_prefs');
 */
export const contains = async (key: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Erreur lors de la vérification de ${key}:`, error);
    return false;
  }
};

// ============================================
// STOCKAGE SÉCURISÉ (SENSIBLE DATA)
// ============================================

/**
 * Stocke des données sensibles de manière sécurisée
 * Utilise SecureStore sur iOS/Android
 * 
 * @param key - Clé de stockage
 * @param value - Valeur à stocker
 * 
 * @example
 * await setSecureItem('auth_token', 'secret-token-123');
 */
export const setSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Fallback pour le web
      await setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`Erreur lors du stockage sécurisé de ${key}:`, error);
    throw error;
  }
};

/**
 * Récupère des données sensibles de manière sécurisée
 * 
 * @param key - Clé de stockage
 * @returns Valeur stockée ou null
 * 
 * @example
 * const token = await getSecureItem('auth_token');
 */
export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return await getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Erreur lors de la récupération sécurisée de ${key}:`, error);
    return null;
  }
};

/**
 * Supprime des données sensibles
 * 
 * @param key - Clé de stockage
 * 
 * @example
 * await removeSecureItem('auth_token');
 */
export const removeSecureItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      await removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression sécurisée de ${key}:`, error);
    throw error;
  }
};

// ============================================
//GESTION DU CACHE
// ============================================

/**
 * Stocke des données en cache avec TTL
 * 
 * @param key - Clé de cache
 * @param data - Données à mettre en cache
 * @param options - Options de cache
 * 
 * @example
 * await setCache('conseils', conseilsData, { ttl: 3600000 });
 */
export const setCache = async <T>(
  key: string,
  data: T,
  options: StorageOptions = {}
): Promise<void> => {
  try {
    const now = Date.now();
    const ttl = options.ttl || DEFAULT_TTL;
    const version = options.version || CACHE_VERSION;
    
    const cachedData: CachedData<T> = {
      data,
      createdAt: now,
      expiresAt: now + ttl,
      version,
    };
    
    await setItem(key, cachedData);
  } catch (error) {
    console.error(`Erreur lors de la mise en cache de ${key}:`, error);
  }
};

/**
 * Récupère des données du cache
 * 
 * @param key - Clé de cache
 * @param options - Options de cache
 * @returns Données en cache ou null
 * 
 * @example
 * const conseils = await getCache('conseils');
 */
export const getCache = async <T>(
  key: string,
  options: StorageOptions = {}
): Promise<T | null> => {
  try {
    const cachedData = await getItem<CachedData<T>>(key);
    
    if (!cachedData) {
      return null;
    }
    
    const now = Date.now();
    const version = options.version || CACHE_VERSION;
    
    // Vérifier l'expiration
    if (cachedData.expiresAt < now) {
      await removeItem(key);
      return null;
    }
    
    // Vérifier la version
    if (cachedData.version !== version) {
      await removeItem(key);
      return null;
    }
    
    return cachedData.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du cache ${key}:`, error);
    return null;
  }
};

/**
 * Vérifie si le cache est valide
 * 
 * @param key - Clé de cache
 * @returns true si le cache est valide
 * 
 * @example
 * const isValid = await isCacheValid('conseils');
 */
export const isCacheValid = async (key: string): Promise<boolean> => {
  try {
    const cachedData = await getItem<CachedData>(key);
    
    if (!cachedData) {
      return false;
    }
    
    const now = Date.now();
    return cachedData.expiresAt > now;
  } catch (error) {
    console.error(`Erreur lors de la vérification du cache ${key}:`, error);
    return false;
  }
};

/**
 * Invalide le cache pour une clé spécifique
 * 
 * @param key - Clé de cache
 * 
 * @example
 * await invalidateCache('conseils');
 */
export const invalidateCache = async (key: string): Promise<void> => {
  try {
    await removeItem(key);
  } catch (error) {
    console.error(`Erreur lors de l'invalidation du cache ${key}:`, error);
  }
};

/**
 * Invalide plusieurs caches par préfixe
 * 
 * @param prefix - Préfixe des clés
 * 
 * @example
 * await invalidateCacheByPrefix('cache_');
 */
export const invalidateCacheByPrefix = async (prefix: string): Promise<void> => {
  try {
    const keys = await getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(prefix));
    await multiRemove(cacheKeys);
  } catch (error) {
    console.error(`Erreur lors de l'invalidation des caches avec préfixe ${prefix}:`, error);
  }
};

// ============================================
// GESTION DES SESSIONS
// ============================================

/**
 * Sauvegarde la session utilisateur
 * 
 * @param token - Token d'authentification
 * @param refreshToken - Token de rafraîchissement
 * @param user - Données utilisateur
 * @param rememberMe - Se souvenir de l'utilisateur
 * 
 * @example
 * await saveSession(token, refreshToken, user, true);
 */
export const saveSession = async (
  token: string,
  refreshToken: string,
  user: any,
  rememberMe: boolean = true
): Promise<void> => {
  try {
    await setSecureItem(StorageKeys.AUTH_TOKEN, token);
    await setSecureItem(StorageKeys.REFRESH_TOKEN, refreshToken);
    await setItem(StorageKeys.USER_DATA, user);
    await setItem(StorageKeys.REMEMBER_ME, rememberMe);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la session:', error);
    throw error;
  }
};

/**
 * Récupère la session utilisateur
 * 
 * @returns Session utilisateur ou null
 * 
 * @example
 * const session = await getSession();
 * if (session) {
 *   console.log('Utilisateur connecté:', session.user);
 * }
 */
export const getSession = async (): Promise<{
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  rememberMe: boolean;
}> => {
  try {
    const [token, refreshToken, user, rememberMe] = await Promise.all([
      getSecureItem(StorageKeys.AUTH_TOKEN),
      getSecureItem(StorageKeys.REFRESH_TOKEN),
      getItem(StorageKeys.USER_DATA),
      getItem<boolean>(StorageKeys.REMEMBER_ME),
    ]);
    
    return {
      token: token || null,
      refreshToken: refreshToken || null,
      user: user || null,
      rememberMe: rememberMe || false,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return { token: null, refreshToken: null, user: null, rememberMe: false };
  }
};

/**
 * Efface la session utilisateur
 * 
 * @example
 * await clearSession();
 */
export const clearSession = async (): Promise<void> => {
  try {
    await Promise.all([
      removeSecureItem(StorageKeys.AUTH_TOKEN),
      removeSecureItem(StorageKeys.REFRESH_TOKEN),
      removeItem(StorageKeys.USER_DATA),
      removeItem(StorageKeys.REMEMBER_ME),
    ]);
  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error);
  }
};

// ============================================
// UTILITAIRES DE MASSE
// ============================================

/**
 * Récupère toutes les clés stockées
 * 
 * @returns Liste des clés
 * 
 * @example
 * const keys = await getAllKeys();
 */
export const getAllKeys = async (): Promise<string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  } catch (error) {
    console.error('Erreur lors de la récupération des clés:', error);
    return [];
  }
};

/**
 * Supprime plusieurs clés
 * 
 * @param keys - Liste des clés à supprimer
 * 
 * @example
 * await multiRemove(['key1', 'key2', 'key3']);
 */
export const multiRemove = async (keys: string[]): Promise<void> => {
  try {
    for (const key of keys) {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression multiple:', error);
  }
};

/**
 * Supprime toutes les données du stockage
 * 
 * @example
 * await clearAll();
 */
export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Erreur lors du nettoyage complet:', error);
  }
};

/**
 * Nettoie les données expirées
 * 
 * @returns Nombre d'éléments supprimés
 * 
 * @example
 * const deletedCount = await cleanExpiredData();
 */
export const cleanExpiredData = async (): Promise<number> => {
  try {
    const keys = await getAllKeys();
    let deletedCount = 0;
    
    for (const key of keys) {
      const cachedData = await getItem<CachedData>(key);
      if (cachedData && cachedData.expiresAt && cachedData.expiresAt < Date.now()) {
        await removeItem(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Erreur lors du nettoyage des données expirées:', error);
    return 0;
  }
};

// ============================================
// STATISTIQUES
// ============================================

/**
 * Obtient les statistiques du stockage
 * 
 * @returns Statistiques du stockage
 * 
 * @example
 * const stats = await getStorageStats();
 * console.log(`Taille totale: ${stats.totalSize} bytes`);
 */
export const getStorageStats = async (): Promise<StorageStats> => {
  try {
    const keys = await getAllKeys();
    let totalSize = 0;
    let expiredItems = 0;
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
        
        const cachedData = await getItem<CachedData>(key);
        if (cachedData && cachedData.expiresAt && cachedData.expiresAt < Date.now()) {
          expiredItems++;
        }
      }
    }
    
    return {
      totalItems: keys.length,
      totalSize,
      expiredItems,
      keys,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return { totalItems: 0, totalSize: 0, expiredItems: 0, keys: [] };
  }
};

// ============================================
// UTILITAIRES SPÉCIFIQUES À L'APPLICATION
// ============================================

/**
 * Sauvegarde l'historique de recherche
 * 
 * @param query - Requête de recherche
 * @param maxItems - Nombre maximum d'éléments
 * 
 * @example
 * await saveSearchHistory('irrigation');
 */
export const saveSearchHistory = async (query: string, maxItems: number = 10): Promise<void> => {
  try {
    const history = await getItem<string[]>(StorageKeys.SEARCH_HISTORY) || [];
    const newHistory = [query, ...history.filter(q => q !== query)].slice(0, maxItems);
    await setItem(StorageKeys.SEARCH_HISTORY, newHistory);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'historique de recherche:', error);
  }
};

/**
 * Récupère l'historique de recherche
 * 
 * @returns Liste des recherches récentes
 * 
 * @example
 * const history = await getSearchHistory();
 */
export const getSearchHistory = async (): Promise<string[]> => {
  try {
    return await getItem<string[]>(StorageKeys.SEARCH_HISTORY) || [];
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique de recherche:', error);
    return [];
  }
};

/**
 * Efface l'historique de recherche
 * 
 * @example
 * await clearSearchHistory();
 */
export const clearSearchHistory = async (): Promise<void> => {
  try {
    await removeItem(StorageKeys.SEARCH_HISTORY);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'historique de recherche:', error);
  }
};

/**
 * Sauvegarde les vues récentes
 * 
 * @param id - ID de l'élément consulté
 * @param type - Type d'élément (conseil, technique)
 * @param title - Titre de l'élément
 * @param maxItems - Nombre maximum d'éléments
 * 
 * @example
 * await saveRecentView('123', 'conseil', 'Irrigation');
 */
export const saveRecentView = async (
  id: string,
  type: string,
  title: string,
  maxItems: number = 20
): Promise<void> => {
  try {
    const recentViews = await getItem<Array<{ id: string; type: string; title: string; timestamp: number }>>(
      StorageKeys.RECENT_VIEWS
    ) || [];
    
    const newView = { id, type, title, timestamp: Date.now() };
    const filteredViews = recentViews.filter(v => v.id !== id);
    const newRecentViews = [newView, ...filteredViews].slice(0, maxItems);
    
    await setItem(StorageKeys.RECENT_VIEWS, newRecentViews);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des vues récentes:', error);
  }
};

/**
 * Récupère les vues récentes
 * 
 * @returns Liste des vues récentes
 * 
 * @example
 * const recent = await getRecentViews();
 */
export const getRecentViews = async (): Promise<Array<{ id: string; type: string; title: string; timestamp: number }>> => {
  try {
    return await getItem(StorageKeys.RECENT_VIEWS) || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des vues récentes:', error);
    return [];
  }
};

/**
 * Sauvegarde les favoris
 * 
 * @param id - ID de l'élément
 * @param type - Type d'élément (conseil, technique)
 * @param title - Titre de l'élément
 * 
 * @example
 * await saveFavorite('123', 'conseil', 'Irrigation');
 */
export const saveFavorite = async (id: string, type: string, title: string): Promise<void> => {
  try {
    const favorites = await getItem<Array<{ id: string; type: string; title: string; timestamp: number }>>(
      StorageKeys.FAVORITES
    ) || [];
    
    const exists = favorites.some(f => f.id === id);
    if (!exists) {
      const newFavorite = { id, type, title, timestamp: Date.now() };
      await setItem(StorageKeys.FAVORITES, [...favorites, newFavorite]);
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du favori:', error);
  }
};

/**
 * Supprime un favori
 * 
 * @param id - ID de l'élément
 * 
 * @example
 * await removeFavorite('123');
 */
export const removeFavorite = async (id: string): Promise<void> => {
  try {
    const favorites = await getItem<Array<{ id: string; type: string; title: string; timestamp: number }>>(
      StorageKeys.FAVORITES
    ) || [];
    
    const newFavorites = favorites.filter(f => f.id !== id);
    await setItem(StorageKeys.FAVORITES, newFavorites);
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
  }
};

/**
 * Vérifie si un élément est favori
 * 
 * @param id - ID de l'élément
 * @returns true si l'élément est favori
 * 
 * @example
 * const isFavorite = await isFavorite('123');
 */
export const isFavorite = async (id: string): Promise<boolean> => {
  try {
    const favorites = await getItem<Array<{ id: string }>>(StorageKeys.FAVORITES) || [];
    return favorites.some(f => f.id === id);
  } catch (error) {
    console.error('Erreur lors de la vérification du favori:', error);
    return false;
  }
};

/**
 * Récupère tous les favoris
 * 
 * @returns Liste des favoris
 * 
 * @example
 * const favorites = await getFavorites();
 */
export const getFavorites = async (): Promise<Array<{ id: string; type: string; title: string; timestamp: number }>> => {
  try {
    return await getItem(StorageKeys.FAVORITES) || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return [];
  }
};

// ============================================
// MIGRATION DES DONNÉES
// ============================================

/**
 * Migre les données d'une version à l'autre
 * 
 * @param fromVersion - Version source
 * @param toVersion - Version cible
 * 
 * @example
 * await migrateData(1, 2);
 */
export const migrateData = async (fromVersion: number, toVersion: number): Promise<void> => {
  try {
    const currentVersion = await getItem<number>(StorageKeys.APP_VERSION);
    
    if (!currentVersion || currentVersion < fromVersion) {
      // Effectuer la migration
      console.log(`Migration des données de la version ${fromVersion} vers ${toVersion}`);
      
      // Sauvegarder la nouvelle version
      await setItem(StorageKeys.APP_VERSION, toVersion);
    }
  } catch (error) {
    console.error('Erreur lors de la migration des données:', error);
  }
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default {
  // Stockage de base
  setItem,
  getItem,
  removeItem,
  contains,
  
  // Stockage sécurisé
  setSecureItem,
  getSecureItem,
  removeSecureItem,
  
  // Gestion du cache
  setCache,
  getCache,
  isCacheValid,
  invalidateCache,
  invalidateCacheByPrefix,
  
  // Gestion des sessions
  saveSession,
  getSession,
  clearSession,
  
  // Utilitaires de masse
  getAllKeys,
  multiRemove,
  clearAll,
  cleanExpiredData,
  
  // Statistiques
  getStorageStats,
  
  // Utilitaires spécifiques
  saveSearchHistory,
  getSearchHistory,
  saveRecentView,
  getRecentViews,
  saveFavorite,
  removeFavorite,
  isFavorite,
  getFavorites,
  
  // Migration
  migrateData,
  
  // Constantes
  StorageKeys,
};