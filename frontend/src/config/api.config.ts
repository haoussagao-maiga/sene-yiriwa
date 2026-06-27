/**
 * Configuration API
 * Centralise toutes les configurations liées aux appels API
 */

export const API_CONFIG = {
  // URLs
  
  BASE_URL: __DEV__ ? 'http://192.168.118.1:3000' : 'https://api.seneyiriwa.com',
  
  // Timeouts
  TIMEOUT: 30000,           // 30 secondes
  UPLOAD_TIMEOUT: 60000,    // 60 secondes pour les uploads
  DOWNLOAD_TIMEOUT: 120000, // 2 minutes pour les downloads
  
  // Retries
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,        // 1 seconde
  
  // Cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  CACHE_MAX_SIZE: 100,
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      PROFILE: '/api/auth/profile',
      ADMIN: '/api/auth/admin',
    },
    USER: {
      PROFILE: '/api/profil',
      UPDATE_PROFILE: '/api/profil',
    },
    METEO: {
      CURRENT: '/api/meteo',
    },
    CONSEILS: {
      LIST: '/api/conseils',
    },
    VULGARISATION: {
      LIST: '/api/vulgarisation',
      ALL: '/api/vulgarisation/all',
    },
    TECHNIQUES: {
      LIST: '/api/vulgarisation',
      ALL: '/api/vulgarisation/all',
    },
    AGRICULTEUR: {
      CULTURES_DISPONIBLES: '/api/agriculteur/cultures/disponibles',
      CULTURES: '/api/agriculteur/cultures',
      CHAMPS: '/api/agriculteur/champs',
    },
    ALERTE: {
      LIST: '/api/alerte',
      ALL: '/api/alerte/all',
    },
    CALENDRIER: {
      LIST: '/api/calendrier',
      ALL: '/api/calendrier/all',
    },
    NOTIFICATIONS: {
      LIST: '/api/notifications',
      MARK_READ: '/api/notifications',
    },
    STATISTIQUE: {
      STATS_GENERALES: '/api/statistique/stats-generales',
      STATS_AGRICOLES: '/api/statistique/stats-agricoles',
    },
    ADMIN: {
      PROMOUVOIR_EXPERT: '/api/admin/promouvoir-expert',
    },
  },
  
  // Headers personnalisés
  HEADERS: {
    PLATFORM: 'mobile',
    VERSION: '1.0.0',
  },
};

/**
 * Configuration pour les requêtes avec retry
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error: any) => {
    // Retry sur les erreurs réseau et certains codes HTTP
    return (
      !error.response || // Pas de réponse (erreur réseau)
      error.response.status === 408 || // Timeout
      error.response.status === 429 || // Trop de requêtes
      error.response.status >= 500 // Erreur serveur
    );
  },
};

/**
 * Configuration pour les intercepteurs
 */
export const INTERCEPTOR_CONFIG = {
  // Désactive le cache pour certaines URLs
  CACHE_EXCLUDE_URLS: [
    '/auth/',
    '/notifications/mark-read',
    '/users/change-password',
  ],
  
  // URLs qui nécessitent un refresh token automatique
  TOKEN_REFRESH_URLS: [
    '/users/me',
    '/conseils/favorites',
    '/techniques/favorites',
  ],
  
  // Timeout spécifique par endpoint
  CUSTOM_TIMEOUTS: {
    '/upload': 60000,
    '/download': 120000,
    '/meteo/forecast': 10000,
  },
};