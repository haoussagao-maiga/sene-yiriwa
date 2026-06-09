/**
 * API Interceptors - Gestion avancée des requêtes et réponses HTTP
 * 
 * Ce fichier étend la configuration du client API avec des intercepteurs
 * spécialisés pour la gestion des erreurs, la retry logic, la mise en cache,
 * la gestion de la concurrence et l'analyse des performances.
 * 
 * Fonctionnalités :
 * - Gestion des tokens JWT (refresh token automatique)
 * - Retry logic avec backoff exponentiel
 * - Mise en cache des réponses
 * - Dédoublonnage des requêtes simultanées
 * - Logging et monitoring
 * - Gestion des erreurs réseau avancée
 * - Timeout personnalisé par requête
 * 
 * @module api/interceptors
 */

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * Interface étendue pour la configuration des requêtes
 * Ajoute des propriétés personnalisées pour les intercepteurs
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  /** Nombre de tentatives de retry pour cette requête */
  _retryCount?: number;
  
  /** Timestamp de début de la requête (pour mesurer la latence) */
  _startTime?: number;
  
  /** Cache la réponse pour cette requête */
  _cache?: boolean;
  
  /** Durée de vie du cache en millisecondes */
  _cacheTTL?: number;
  
  /** Évite le retry automatique pour cette requête */
  _skipRetry?: boolean;
  
  /** Évite le refresh token automatique */
  _skipTokenRefresh?: boolean;
  
  /** Priorité de la requête (pour le queueing) */
  _priority?: 'high' | 'normal' | 'low';
  
  /** ID unique pour dédoublonner les requêtes */
  _requestId?: string;
}

/**
 * Interface pour la réponse en cache
 */
interface CachedResponse {
  data: any;
  timestamp: number;
  ttl: number;
  url: string;
  method: string;
}

/**
 * Interface pour les tokens en attente de rafraîchissement
 */
interface PendingTokenRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

/**
 * Configuration des retries
 */
interface RetryConfig {
  maxRetries: number;      // Nombre maximum de tentatives
  baseDelay: number;       // Délai initial en ms
  maxDelay: number;        // Délai maximum en ms
  retryableStatuses: number[]; // Codes HTTP qui méritent un retry
  retryableErrors: string[];   // Types d'erreurs réseau qui méritent un retry
}

/**
 * Configuration par défaut des retries
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,    // 1 seconde
  maxDelay: 10000,    // 10 secondes maximum
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNABORTED', 'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'Network Error'],
};

/**
 * Cache des réponses
 */
class ResponseCache {
  private cache: Map<string, CachedResponse> = new Map();
  private maxSize: number = 100; // Nombre maximum d'entrées en cache
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes par défaut

  /**
   * Génère une clé de cache unique pour une requête
   */
  private generateKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config;
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
  }

  /**
   * Récupère une réponse du cache si elle est encore valide
   */
  get(config: AxiosRequestConfig): CachedResponse | null {
    const key = this.generateKey(config);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Vérifie si le cache est expiré
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    if (__DEV__) {
      console.log(`📦 [Cache] Hit pour ${config.url}`);
    }
    
    return cached;
  }

  /**
   * Stocke une réponse dans le cache
   */
  set(config: AxiosRequestConfig, data: any, ttl?: number): void {
    // Nettoie le cache s'il est trop grand
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    const key = this.generateKey(config);
    const cachedResponse: CachedResponse = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      url: config.url || '',
      method: config.method || 'GET',
    };
    
    this.cache.set(key, cachedResponse);
    
    if (__DEV__) {
      console.log(`💾 [Cache] Stocké pour ${config.url} (TTL: ${cachedResponse.ttl}ms)`);
    }
  }

  /**
   * Vide le cache ou une entrée spécifique
   */
  clear(url?: string): void {
    if (url) {
      // Supprime toutes les entrées correspondant à l'URL
      for (const [key, value] of this.cache.entries()) {
        if (value.url === url) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    
    console.log(`🧹 [Cache] Nettoyé${url ? ` pour ${url}` : ''}`);
  }
}

/**
 * Gestionnaire de requêtes simultanées (dédoublonnage)
 */
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * Génère un ID unique pour la requête
   */
  private getRequestId(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config;
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
  }

  /**
   * Exécute une requête en évitant les doublons
   */
  async execute<T>(
    requestId: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Si une requête identique est déjà en cours, retourne sa promesse
    if (this.pendingRequests.has(requestId)) {
      if (__DEV__) {
        console.log(`🔄 [Dedupe] Requête en cours pour ${requestId}, attente...`);
      }
      return this.pendingRequests.get(requestId) as Promise<T>;
    }
    
    // Exécute la nouvelle requête
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(requestId);
    });
    
    this.pendingRequests.set(requestId, promise);
    return promise;
  }

  /**
   * Supprime les requêtes en attente pour une URL spécifique
   */
  clear(url?: string): void {
    if (url) {
      for (const [key, value] of this.pendingRequests.entries()) {
        if (key.includes(url)) {
          this.pendingRequests.delete(key);
        }
      }
    } else {
      this.pendingRequests.clear();
    }
  }
}

/**
 * Gestionnaire de rafraîchissement de token
 */
class TokenRefreshManager {
  private isRefreshing: boolean = false;
  private pendingRequests: PendingTokenRequest[] = [];
  private refreshEndpoint: string = '/auth/refresh-token';

  /**
   * Rafraîchit le token d'authentification
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post(this.refreshEndpoint, {
        refreshToken,
      });
      
      const { token, refreshToken: newRefreshToken } = response.data;
      
      // Sauvegarde les nouveaux tokens
      await AsyncStorage.setItem('auth_token', token);
      if (newRefreshToken) {
        await AsyncStorage.setItem('refresh_token', newRefreshToken);
      }
      
      return token;
    } catch (error) {
      // Token invalide, déconnexion forcée
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user_data');
      throw error;
    }
  }

  /**
   * Ajoute une requête en attente de rafraîchissement de token
   */
  queueRequest(request: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({ resolve, reject });
    }).then(() => {
      return request();
    });
  }

  /**
   * Traite le rafraîchissement du token
   */
  async handleTokenRefresh(): Promise<void> {
    if (this.isRefreshing) {
      return;
    }
    
    this.isRefreshing = true;
    
    try {
      const newToken = await this.refreshToken();
      
      // Résout toutes les requêtes en attente avec le nouveau token
      this.pendingRequests.forEach(({ resolve }) => {
        resolve(newToken);
      });
      
      this.pendingRequests = [];
    } catch (error) {
      // Rejette toutes les requêtes en attente
      this.pendingRequests.forEach(({ reject }) => {
        reject(error);
      });
      
      this.pendingRequests = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }
}

/**
 * Classe principale pour la gestion des intercepteurs
 */
export class InterceptorManager {
  private cache: ResponseCache;
  private deduplicator: RequestDeduplicator;
  private tokenManager: TokenRefreshManager;
  private axiosInstance: AxiosInstance;
  
  // Statistiques de performance
  private performanceStats: Map<string, number[]> = new Map();

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
    this.cache = new ResponseCache();
    this.deduplicator = new RequestDeduplicator();
    this.tokenManager = new TokenRefreshManager();
    
    // Initialise les intercepteurs
    this.setupRequestInterceptors();
    this.setupResponseInterceptors();
  }

  /**
   * Calcule le délai exponentiel pour les retries
   */
  private calculateRetryDelay(retryCount: number, baseDelay: number, maxDelay: number): number {
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    // Ajoute un jitter aléatoire pour éviter les thundering herds
    return delay + Math.random() * 1000;
  }

  /**
   * Vérifie si une erreur mérite un retry
   */
  private shouldRetry(error: AxiosError, config: ExtendedAxiosRequestConfig): boolean {
    // Si le retry est explicitement désactivé
    if (config._skipRetry) {
      return false;
    }
    
    // Vérifie le nombre de retries
    const retryCount = config._retryCount || 0;
    if (retryCount >= DEFAULT_RETRY_CONFIG.maxRetries) {
      return false;
    }
    
    // Vérifie les codes HTTP éligibles
    const status = error.response?.status;
    if (status && DEFAULT_RETRY_CONFIG.retryableStatuses.includes(status)) {
      return true;
    }
    
    // Vérifie les erreurs réseau
    const errorCode = error.code;
    if (errorCode && DEFAULT_RETRY_CONFIG.retryableErrors.includes(errorCode)) {
      return true;
    }
    
    return false;
  }

  /**
   * Exécute une requête avec système de retry
   */
  private async executeWithRetry(
    config: ExtendedAxiosRequestConfig,
    originalRequest: () => Promise<any>
  ): Promise<any> {
    const retryCount = config._retryCount || 0;
    
    try {
      return await originalRequest();
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (this.shouldRetry(axiosError, config)) {
        config._retryCount = (config._retryCount || 0) + 1;
        
        const delay = this.calculateRetryDelay(
          retryCount,
          DEFAULT_RETRY_CONFIG.baseDelay,
          DEFAULT_RETRY_CONFIG.maxDelay
        );
        
        if (__DEV__) {
          console.log(`🔄 [Retry] Tentative ${config._retryCount}/${DEFAULT_RETRY_CONFIG.maxRetries} pour ${config.url} (delay: ${delay}ms)`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(config, originalRequest);
      }
      
      throw error;
    }
  }

  /**
   * Vérifie la connexion internet avant la requête
   */
  private async checkConnectivity(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true;
  }

  /**
   * Configure les intercepteurs de requêtes
   */
  private setupRequestInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      async (config: ExtendedAxiosRequestConfig): Promise<ExtendedAxiosRequestConfig> => {
        
        // 1. VÉRIFICATION DE LA CONNEXION INTERNET
        const isConnected = await this.checkConnectivity();
        if (!isConnected) {
          const error = new Error('Pas de connexion internet');
          (error as any).code = 'NETWORK_ERROR';
          throw error;
        }
        
        // 2. MESURE DES PERFORMANCES
        config._startTime = Date.now();
        
        // 3. LOGGING DE LA REQUÊTE
        if (__DEV__) {
          console.log(`\n🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`);
          console.log(`📋 Headers:`, config.headers);
          if (config.params) {
            console.log(`🔍 Params:`, config.params);
          }
          if (config.data && config.method !== 'GET') {
            console.log(`📦 Data:`, config.data);
          }
        }
        
        // 4. GESTION DU TOKEN
        if (!config._skipTokenRefresh) {
          const token = await AsyncStorage.getItem('auth_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        
        // 5. GESTION DU CACHE POUR LES REQUÊTES GET
        if (config.method === 'GET' && config._cache !== false) {
          const cachedResponse = this.cache.get(config);
          if (cachedResponse) {
            // Retourne la réponse en cache avec un flag spécial
            const cachedResult = {
              ...cachedResponse.data,
              _fromCache: true,
              _cachedAt: cachedResponse.timestamp,
            };
            // Lance un événement pour informer que les données viennent du cache
            const runtimeGlobal = globalThis as any;
            if (typeof runtimeGlobal !== 'undefined' && typeof runtimeGlobal.emit === 'function') {
              runtimeGlobal.emit('cache-hit', { url: config.url });
            }
            throw { __cachedResponse: cachedResult };
          }
        }
        
        // 6. DÉDOUBLONNAGE DES REQUÊTES
        if (config.method === 'GET' && !config._requestId) {
          config._requestId = `${config.url}:${Date.now()}`;
        }
        
        return config;
      },
      (error: any) => {
        console.error('❌ [Request Error]', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Configure les intercepteurs de réponses
   */
  private setupResponseInterceptors(): void {
    // Intercepteur pour les réponses réussies
    this.axiosInstance.interceptors.response.use(
      async (response: AxiosResponse): Promise<AxiosResponse> => {
        const config = response.config as ExtendedAxiosRequestConfig;
        
        // 1. MESURE DES PERFORMANCES
        if (config._startTime) {
          const duration = Date.now() - config._startTime;
          
          // Enregistre les statistiques
          const url = config.url || 'unknown';
          if (!this.performanceStats.has(url)) {
            this.performanceStats.set(url, []);
          }
          const stats = this.performanceStats.get(url)!;
          stats.push(duration);
          
          // Garde seulement les 100 dernières mesures
          if (stats.length > 100) {
            stats.shift();
          }
          
          if (__DEV__) {
            console.log(`⏱️ [Performance] ${config.url} - ${duration}ms`);
          }
        }
        
        // 2. MISE EN CACHE
        if (config.method === 'GET' && config._cache !== false) {
          const ttl = config._cacheTTL || 5 * 60 * 1000; // 5 minutes par défaut
          this.cache.set(config, response.data, ttl);
        }
        
        // 3. LOGGING DE LA RÉPONSE
        if (__DEV__) {
          console.log(`✅ [Response] ${response.status} ${config.url}`);
          
          // Log un extrait des données (évite de surcharger la console)
          const dataPreview = JSON.stringify(response.data).slice(0, 200);
          console.log(`📦 Data preview: ${dataPreview}...`);
        }
        
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as ExtendedAxiosRequestConfig;
        
        if (!config) {
          return Promise.reject(error);
        }
        
        // 1. GESTION DES RÉPONSES EN CACHE
        if ((error as any).__cachedResponse) {
          return Promise.resolve({ data: (error as any).__cachedResponse });
        }
        
        // 2. LOGGING DE L'ERREUR
        if (__DEV__) {
          console.log(`\n❌ [Error Response] ${config.url}`);
          console.log(`📊 Status: ${error.response?.status}`);
          console.log(`💬 Message: ${error.message}`);
          if (error.response?.data) {
            console.log(`📦 Error data:`, error.response.data);
          }
        }
        
        // 3. GESTION DES ERREURS 401 (NON AUTORISÉ)
        if (error.response?.status === 401 && !config._skipTokenRefresh) {
          try {
            // Tente de rafraîchir le token
            await this.tokenManager.handleTokenRefresh();
            
            // Rafraîchit la configuration avec le nouveau token
            const newToken = await AsyncStorage.getItem('auth_token');
            if (newToken && config.headers) {
              config.headers.Authorization = `Bearer ${newToken}`;
            }
            
            // Réexécute la requête originale
            return this.axiosInstance(config);
          } catch (refreshError) {
            // Échec du rafraîchissement, redirige vers login
            const runtimeGlobal = globalThis as any;
            if (typeof runtimeGlobal !== 'undefined' && typeof runtimeGlobal.emit === 'function') {
              runtimeGlobal.emit('unauthorized');
            }
            return Promise.reject(refreshError);
          }
        }
        
        // 4. GESTION DES RETRIES
        if (this.shouldRetry(error, config)) {
          const retryCount = (config._retryCount || 0) + 1;
          config._retryCount = retryCount;
          
          const delay = this.calculateRetryDelay(
            retryCount - 1,
            DEFAULT_RETRY_CONFIG.baseDelay,
            DEFAULT_RETRY_CONFIG.maxDelay
          );
          
          if (__DEV__) {
            console.log(`🔄 [Retry] ${retryCount}/${DEFAULT_RETRY_CONFIG.maxRetries} pour ${config.url} (delay: ${delay}ms)`);
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.axiosInstance(config);
        }
        
        // 5. FORMATAGE DE L'ERREUR POUR L'UI
        const formattedError = {
          message: this.getUserFriendlyErrorMessage(error),
          statusCode: error.response?.status || 500,
          originalError: __DEV__ ? error : undefined,
          url: config.url,
          method: config.method,
        };
        
        return Promise.reject(formattedError);
      }
    );
  }

  /**
   * Génère un message d'erreur compréhensible par l'utilisateur
   */
  private getUserFriendlyErrorMessage(error: AxiosError): string {
    const status = error.response?.status;
    const code = error.code;
    
    // Erreurs de connexion
    if (code === 'NETWORK_ERROR') {
      return 'Pas de connexion internet. Vérifiez votre réseau.';
    }
    
    if (code === 'ECONNABORTED') {
      return 'La requête a expiré. Vérifiez votre connexion.';
    }
    
    if (code === 'ECONNREFUSED') {
      return 'Impossible de joindre le serveur. Réessayez plus tard.';
    }
    
    // Erreurs HTTP
    switch (status) {
      case 400:
        return 'Données invalides. Veuillez vérifier votre saisie.';
      case 401:
        return 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return 'Accès interdit. Vous n\'avez pas les droits nécessaires.';
      case 404:
        return 'Ressource non trouvée.';
      case 408:
        return 'La requête a expiré. Réessayez.';
      case 409:
        return 'Conflit avec les données existantes.';
      case 422:
        return 'Erreur de validation. Vérifiez les champs saisis.';
      case 429:
        return 'Trop de requêtes. Veuillez patienter.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Erreur serveur. Réessayez plus tard.';
      default:
        return 'Une erreur est survenue. Réessayez.';
    }
  }

  /**
   * Récupère les statistiques de performance
   */
  getPerformanceStats(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const stats: Record<string, any> = {};
    
    for (const [url, durations] of this.performanceStats.entries()) {
      const sum = durations.reduce((a, b) => a + b, 0);
      stats[url] = {
        avg: Math.round(sum / durations.length),
        min: Math.min(...durations),
        max: Math.max(...durations),
        count: durations.length,
      };
    }
    
    return stats;
  }

  /**
   * Vide le cache
   */
  clearCache(url?: string): void {
    this.cache.clear(url);
  }

  /**
   * Vide les requêtes en attente
   */
  clearPendingRequests(url?: string): void {
    this.deduplicator.clear(url);
  }

  /**
   * Réinitialise tous les intercepteurs (utile pour les tests)
   */
  reset(): void {
    this.cache.clear();
    this.deduplicator.clear();
    this.performanceStats.clear();
  }
}

/**
 * Fonction utilitaire pour initialiser les intercepteurs
 * @param axiosInstance - Instance Axios à équiper
 * @returns Instance du gestionnaire d'intercepteurs
 */
export const setupInterceptors = (axiosInstance: AxiosInstance): InterceptorManager => {
  return new InterceptorManager(axiosInstance);
};

/**
 * Exporte les classes pour une utilisation externe
 */
export { ResponseCache, RequestDeduplicator, TokenRefreshManager };
export type { ExtendedAxiosRequestConfig, CachedResponse, RetryConfig };