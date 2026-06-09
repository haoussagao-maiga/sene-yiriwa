/**
 * Configuration API
 * Centralise toutes les configurations liées aux appels API
 */

export const API_CONFIG = {
  // URLs
  BASE_URL: 'https://api.seneyiriwa.com/api',
  
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
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH_TOKEN: '/auth/refresh-token',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      CHANGE_PASSWORD: '/auth/change-password',
      VERIFY_EMAIL: '/auth/verify-email',
      RESEND_VERIFICATION: '/auth/resend-verification',
      CURRENT_USER: '/auth/me',
      UPDATE_PROFILE: '/auth/me',
      DELETE_ACCOUNT: '/auth/me',
    },
    USER: {
      PROFILE: '/users/me',
      UPDATE_PROFILE: '/users/me',
      CHANGE_PASSWORD: '/users/change-password',
      DELETE_ACCOUNT: '/users/me',
    },
    METEO: {
      CURRENT: '/meteo/current',
      FORECAST: '/meteo/forecast',
      SIMPLE_FORECAST: '/meteo/forecast/simple',
      HOURLY: '/meteo/forecast/hourly',
      ALERTS: '/meteo/alerts',
      ALERTS_BY_CULTURE: '/meteo/alerts/culture',
      INDICES: '/meteo/indices',
      HISTORICAL: '/meteo/historical',
      NORMALS: '/meteo/normales',
      RECOMMENDATIONS: '/meteo/recommendations',
      SATELLITE: '/meteo/satellite',
      RADAR: '/meteo/radar',
    },
    CONSEILS: {
      LIST: '/conseils',
      DETAIL: (id: string) => `/conseils/${id}`,
      BY_CULTURE: '/conseils/culture',
      SEARCH: '/conseils/search',
      PERSONNALISES: '/conseils/personnalises',
      URGENTS: '/conseils/urgents',
      FAVORIS: '/conseils/favoris',
      CALENDRIER_CULTURAL: '/conseils/calendrier',
      ALERTES: '/conseils/alertes',
      STATS: '/conseils/stats',
      RECOMMANDATIONS: '/conseils/recommandations',
    },
    TECHNIQUES: {
      LIST: '/techniques',
      DETAIL: (id: string) => `/techniques/${id}`,
      CATEGORIES: '/techniques/categories',
      FAVORITES: '/techniques/favorites',
      FAVORIS: '/techniques/favorites',
      STATS: '/techniques/stats',
      CERTIFICATS: '/techniques/certificats',
      RECOMMANDEES: '/techniques/recommandees',
      AVIS: '/techniques/avis',
      SEARCH: '/techniques/search',
      BY_CATEGORIE: (categorie: string) => `/techniques/categorie/${categorie}`,
      BY_CULTURE: (culture: string) => `/techniques/culture/${culture}`,
    },
    NOTIFICATIONS: {
      LIST: '/notifications',
      MARK_READ: (id: string) => `/notifications/${id}/read`,
      MARK_ALL_READ: '/notifications/read-all',
      PREFERENCES: '/notifications/preferences',
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