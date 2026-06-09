/**
 * API Client - Configuration Axios pour Sènè Yiriwa
 * 
 * Ce fichier gère toutes les communications HTTP entre l'application mobile
 * et le backend. Il utilise le pattern Singleton pour avoir une seule instance
 * de l'API client dans toute l'application.
 * 
 * Fonctionnalités :
 * - Configuration de base d'Axios (baseURL, timeout, headers)
 * - Intercepteurs pour les requêtes (ajout automatique du token JWT)
 * - Intercepteurs pour les réponses (gestion des erreurs 401)
 * - Méthodes génériques GET, POST, PUT, DELETE
 * - Gestion des fichiers (upload)
 * 
 * @module api/client
 */

import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  AxiosProgressEvent,
  InternalAxiosRequestConfig 
} from 'axios';
import { setupInterceptors, InterceptorManager } from './interceptors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';

/**
 * Interface pour la réponse standard de l'API
 * Tous les endpoints retournent cette structure
 */
interface ApiResponse<T = any> {
  success: boolean;      // Indique si la requête a réussi
  data?: T;             // Les données retournées (en cas de succès)
  message?: string;     // Message d'information ou d'erreur
  error?: string;       // Message d'erreur détaillé
  statusCode?: number;  // Code HTTP
}

/**
 * Interface pour les erreurs personnalisées
 */
interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>; // Erreurs de validation
}

/**
 * Classe principale du client API
 * Implémente le pattern Singleton pour garantir une instance unique
 */
class ApiClient {
  /** Instance unique d'Axios pour toutes les requêtes HTTP */
  private instance: AxiosInstance;
  private interceptorManager: InterceptorManager;
  
  /** Instance statique du singleton */
  private static instanceObj: ApiClient;

  /**
   * Constructeur privé pour le pattern Singleton
   * Initialise la configuration Axios et les intercepteurs
   */
  private constructor() {
    // Création de l'instance Axios avec configuration de base
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Platform': 'mobile',
        'X-App-Version': '1.0.0',
      },
      withCredentials: false,
    });

    // Configuration des intercepteurs (requêtes et réponses)
    this.setupInterceptors();
    this.interceptorManager = setupInterceptors(this.instance);
  }

  /**
   * Récupère l'instance unique du client API (Singleton)
   * 
   * @returns L'instance unique du ApiClient
   * 
   * @example
   * const api = ApiClient.getInstance();
   * const userData = await api.get('/users/me');
   */
  public static getInstance(): ApiClient {
    // Crée une nouvelle instance si elle n'existe pas encore
    if (!ApiClient.instanceObj) {
      ApiClient.instanceObj = new ApiClient();
    }
    return ApiClient.instanceObj;
  }

  /**
   * Configure les intercepteurs de requêtes et réponses
   * 
   * Intercepteur de requête : Ajoute automatiquement le token JWT
   * Intercepteur de réponse : Gère les erreurs globales (401, 403, 500...)
   */
  private setupInterceptors(): void {
    /**
     * INTERCEPTEUR DE REQUÊTE
     * S'exécute avant chaque envoi de requête HTTP
     * Ajoute le token d'authentification dans le header Authorization
     */
    this.instance.interceptors.request.use(
      /**
       * Fonction de succès - Transformation de la requête
       * @param config - Configuration de la requête
       * @returns Configuration modifiée avec le token
       */
      async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        try {
          // Récupère le token JWT stocké localement
          const token = await AsyncStorage.getItem('auth_token');
          
          // Si un token existe, l'ajoute au header Authorization
          if (token && config.headers) {
            // Format standard: Bearer <token>
            config.headers.Authorization = `Bearer ${token}`;
            
            // Log de débogage (désactiver en production)
            if (__DEV__) {
              console.log(`🔐 [API] Token ajouté pour ${config.url}`);
            }
          }
          
          // Log de la requête (mode développement uniquement)
          if (__DEV__) {
            console.log(`📤 [API] ${config.method?.toUpperCase()} ${config.url}`);
          }
          
          return config;
        } catch (error) {
          // En cas d'erreur lors de la récupération du token
          console.error('❌ [API] Erreur intercepteur requête:', error);
          return config;
        }
      },
      
      /**
       * Fonction d'erreur - Gestion des erreurs avant l'envoi
       * @param error - Erreur survenue
       * @returns Rejet de la promesse avec l'erreur
       */
      (error: AxiosError): Promise<AxiosError> => {
        console.error('❌ [API] Erreur avant envoi:', error.message);
        return Promise.reject(error);
      }
    );

    /**
     * INTERCEPTEUR DE RÉPONSE
     * S'exécute après chaque réception de réponse HTTP
     * Gère les erreurs globales et la déconnexion automatique
     */
    this.instance.interceptors.response.use(
      /**
       * Fonction de succès - Traitement des réponses réussies
       * @param response - Réponse HTTP reçue
       * @returns Réponse transformée
       */
      (response: AxiosResponse): AxiosResponse => {
        // Log de la réponse (mode développement uniquement)
        if (__DEV__) {
          console.log(`📥 [API] Réponse ${response.status} pour ${response.config.url}`);
        }
        
        // Vérifie si la réponse a une structure standard
        if (response.data && typeof response.data === 'object') {
          // Ajoute un timestamp pour le cache (optionnel)
          response.data._timestamp = Date.now();
        }
        
        return response;
      },
      
      /**
       * Fonction d'erreur - Gestion centralisée des erreurs HTTP
       * @param error - Erreur Axios complète
       * @returns Rejet avec une erreur formatée
       */
      async (error: AxiosError): Promise<any> => {
        // Log de l'erreur détaillée
        console.error('❌ [API] Erreur réponse:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
        });

        // Structure standardisée pour l'erreur
        const apiError: ApiError = {
          message: 'Une erreur est survenue',
          statusCode: error.response?.status || 500,
        };

        /**
         * Gestion des différents codes d'erreur HTTP
         */
        
        // 400 - Bad Request (Données invalides)
        if (error.response?.status === 400) {
          apiError.message = 'Données invalides. Veuillez vérifier votre saisie.';
          
          // Récupère les erreurs de validation détaillées si disponibles
          const responseData = error.response?.data as any;
          if (responseData?.errors) {
            apiError.errors = responseData.errors;
          }
        }
        
        // 401 - Unauthorized (Token expiré ou invalide)
        else if (error.response?.status === 401) {
          apiError.message = 'Session expirée. Veuillez vous reconnecter.';
          
          // Supprime le token invalide du stockage local
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
          
          // Émet un événement pour rediriger vers l'écran de connexion
          // Cette logique sera capturée par le gestionnaire d'état global
          const runtimeGlobal = globalThis as any;
          if (typeof runtimeGlobal !== 'undefined' && typeof runtimeGlobal.emit === 'function') {
            runtimeGlobal.emit('unauthorized');
          }
        }
        
        // 403 - Forbidden (Accès interdit)
        else if (error.response?.status === 403) {
          apiError.message = 'Vous n\'avez pas les droits nécessaires pour accéder à cette ressource.';
        }
        
        // 404 - Not Found (Ressource inexistante)
        else if (error.response?.status === 404) {
          apiError.message = 'La ressource demandée n\'existe pas.';
        }
        
        // 409 - Conflict (Conflit de données)
        else if (error.response?.status === 409) {
          apiError.message = 'Conflit de données. Cette ressource existe peut-être déjà.';
        }
        
        // 422 - Unprocessable Entity (Erreur de validation)
        else if (error.response?.status === 422) {
          apiError.message = 'Erreur de validation. Veuillez vérifier les champs saisis.';
          const responseData = error.response?.data as any;
          if (responseData?.errors) {
            apiError.errors = responseData.errors;
          }
        }
        
        // 429 - Too Many Requests (Trop de requêtes)
        else if (error.response?.status === 429) {
          apiError.message = 'Trop de requêtes. Veuillez réessayer dans quelques instants.';
        }
        
        // 500+ - Erreurs serveur
        else if (error.response?.status && error.response.status >= 500) {
          apiError.message = 'Erreur serveur. Veuillez réessayer plus tard.';
        }
        
        // Pas de réponse du serveur (problème réseau)
        else if (error.code === 'ECONNABORTED') {
          apiError.message = 'La requête a expiré. Vérifiez votre connexion internet.';
        } else if (error.message === 'Network Error') {
          apiError.message = 'Erreur de connexion. Vérifiez votre réseau internet.';
        }
        
        // Ajoute des informations supplémentaires pour le débogage
        if (__DEV__) {
          console.log('🔍 [API] Détails erreur:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
          });
        }
        
        // Retourne une erreur formatée et standardisée
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Méthode HTTP GET générique
   * Récupère des données depuis le serveur
   * 
   * @template T - Type attendu pour la réponse
   * @param url - Endpoint de l'API (ex: '/users/me')
   * @param config - Configuration optionnelle Axios
   * @returns Promesse contenant les données de type T
   * 
   * @example
   * // Récupérer le profil utilisateur
   * const user = await apiClient.get<User>('/users/me');
   * 
   * // Avec paramètres de requête
   * const users = await apiClient.get<User[]>('/users', {
   *   params: { page: 1, limit: 10 }
   * });
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.get<T>(url, config);
      return response.data;
    } catch (error) {
      // Rejette l'erreur pour qu'elle soit gérée par l'appelant
      throw error;
    }
  }

  /**
   * Méthode HTTP POST générique
   * Envoie des données pour créer une ressource
   * 
   * @template T - Type attendu pour la réponse
   * @param url - Endpoint de l'API
   * @param data - Données à envoyer dans le corps de la requête
   * @param config - Configuration optionnelle Axios
   * @returns Promesse contenant les données de type T
   * 
   * @example
   * // Créer un nouvel utilisateur
   * const newUser = await apiClient.post<User>('/users/register', {
   *   name: 'John',
   *   email: 'john@example.com',
   *   password: 'secret123'
   * });
   * 
   * // Avec configuration spéciale
   * const result = await apiClient.post('/upload', formData, {
   *   headers: { 'Content-Type': 'multipart/form-data' }
   * });
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Méthode HTTP PUT générique
   * Met à jour complètement une ressource existante
   * 
   * @template T - Type attendu pour la réponse
   * @param url - Endpoint de l'API (inclut généralement l'ID)
   * @param data - Nouvelles données complètes
   * @param config - Configuration optionnelle Axios
   * @returns Promesse contenant les données de type T
   * 
   * @example
   * // Mettre à jour un utilisateur
   * const updatedUser = await apiClient.put<User>('/users/123', {
   *   name: 'John Updated',
   *   email: 'john.updated@example.com'
   * });
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Méthode HTTP PATCH générique
   * Met à jour partiellement une ressource existante
   * Utile pour les mises à jour partielles
   * 
   * @template T - Type attendu pour la réponse
   * @param url - Endpoint de l'API
   * @param data - Données à mettre à jour partiellement
   * @param config - Configuration optionnelle Axios
   * @returns Promesse contenant les données de type T
   * 
   * @example
   * // Mettre à jour seulement l'email
   * const result = await apiClient.patch<User>('/users/123', {
   *   email: 'newemail@example.com'
   * });
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Méthode HTTP DELETE générique
   * Supprime une ressource du serveur
   * 
   * @template T - Type attendu pour la réponse (généralement un message de confirmation)
   * @param url - Endpoint de l'API (inclut l'ID de la ressource)
   * @param config - Configuration optionnelle Axios
   * @returns Promesse contenant les données de type T
   * 
   * @example
   * // Supprimer un utilisateur
   * const result = await apiClient.delete<{ message: string }>('/users/123');
   * 
   * // Supprimer avec confirmation
   * const deleted = await apiClient.delete('/posts/456', {
   *   data: { confirm: true }
   * });
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload de fichier multipart/form-data
   * Spécialement conçu pour l'envoi d'images, vidéos, documents
   * 
   * @template T - Type attendu pour la réponse
   * @param url - Endpoint d'upload
   * @param formData - Objet FormData contenant les fichiers
   * @param onProgress - Callback optionnel pour suivre la progression
   * @returns Promesse contenant les données de type T
   * 
   * @example
   * // Upload d'une image de profil
   * const formData = new FormData();
   * formData.append('avatar', {
   *   uri: 'file://path/to/image.jpg',
   *   type: 'image/jpeg',
   *   name: 'avatar.jpg'
   * });
   * 
   * const result = await apiClient.upload('/users/avatar', formData, (progress) => {
   *   console.log(`Progression: ${progress}%`);
   * });
   */
  public async upload<T = any>(
    url: string, 
    formData: FormData, 
    onProgress?: (progress: number) => void
  ): Promise<T> {
    try {
      const response = await this.instance.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Configuration pour suivre la progression de l'upload
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent?.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Téléchargement de fichier avec progression
   * Pour les fichiers volumineux (PDF, vidéos, etc.)
   * 
   * @param url - URL du fichier à télécharger
   * @param onProgress - Callback optionnel pour suivre la progression
   * @returns Promesse contenant les données du fichier (ArrayBuffer)
   * 
   * @example
   * const fileData = await apiClient.download('/documents/guide.pdf', (progress) => {
   *   console.log(`Téléchargement: ${progress}%`);
   * });
   */
  public async download(url: string, onProgress?: (progress: number) => void): Promise<ArrayBuffer> {
    try {
      const response = await this.instance.get(url, {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent?.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Méthode utilitaire pour annuler une requête en cours
   * Utile pour les recherches en temps réel ou les navigation
   * 
   * @returns Source d'annulation AbortController
   * 
   * @example
   * const abortController = apiClient.createAbortController();
   * 
   * try {
   *   const results = await apiClient.get('/search', {
   *     signal: abortController.signal,
   *     params: { q: 'maïs' }
   *   });
   * } catch (error) {
   *   if (error.name === 'CanceledError') {
   *     console.log('Requête annulée');
   *   }
   * }
   * 
   * // Annuler la requête
   * abortController.abort();
   */
  public createAbortController(): AbortController {
    return new AbortController();
  }

  /**
   * Vérifie l'état de connexion au serveur
   * Utile avant d'effectuer des opérations critiques
   * 
   * @returns Promesse booléenne indiquant si le serveur répond
   * 
   * @example
   * const isConnected = await apiClient.checkHealth();
   * if (!isConnected) {
   *   Alert.alert('Pas de connexion', 'Vérifiez votre réseau');
   * }
   */
  public async checkHealth(): Promise<boolean> {
    try {
      await this.instance.get('/health', { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupère l'instance Axios brute pour des cas particuliers
   * À utiliser avec précaution, uniquement pour des besoins spécifiques
   * 
   * @returns Instance Axios originale
   */
  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * Met à jour dynamiquement la baseURL
   * Utile pour changer d'environnement (dev/staging/prod)
   * 
   * @param newBaseURL - Nouvelle URL de base
   * 
   * @example
   * apiClient.setBaseURL('https://api.seneyiriwa.com/v2');
   */
  public setBaseURL(newBaseURL: string): void {
    this.instance.defaults.baseURL = newBaseURL;
    console.log(`🔄 [API] BaseURL mise à jour: ${newBaseURL}`);
  }

  /**
   * Met à jour le token d'authentification manuellement
   * Utile après une connexion réussie ou un rafraîchissement de token
   * 
   * @param token - Nouveau token JWT
   * 
   * @example
   * await apiClient.setAuthToken('new-jwt-token-here');
   */
  public async setAuthToken(token: string | null): Promise<void> {
    if (token) {
      // Sauvegarde du token
      await AsyncStorage.setItem('auth_token', token);
      
      // Mise à jour du header par défaut
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('✅ [API] Token d\'authentification mis à jour');
    } else {
      // Suppression du token
      await AsyncStorage.removeItem('auth_token');
      delete this.instance.defaults.headers.common['Authorization'];
      
      console.log('🔓 [API] Token d\'authentification supprimé');
    }
  }

  /**
   * Vide le cache géré par les intercepteurs
   */
  public clearCache(url?: string): void {
    this.interceptorManager.clearCache(url);
  }

  /**
   * Retourne les statistiques de performance des intercepteurs
   */
  public getPerformanceStats() {
    return this.interceptorManager.getPerformanceStats();
  }
}

/**
 * Exporte une instance unique du client API
 * Toutes les parties de l'application utilisent la même instance
 */
export const apiClient = ApiClient.getInstance();

/**
 * Exporte également la classe pour d'éventuels tests unitaires
 */
export { ApiClient };

/**
 * Exporte les types pour une meilleure expérience de développement
 */
export type { ApiResponse, ApiError };