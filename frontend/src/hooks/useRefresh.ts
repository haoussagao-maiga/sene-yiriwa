/**
 * Hook useRefresh - Sènè Yiriwa
 * 
 * Ce hook personnalisé gère la fonctionnalité "pull to refresh" et le
 * rafraîchissement automatique des données dans l'application.
 * 
 * Fonctionnalités :
 * - Pull to refresh avec état de chargement
 * - Rafraîchissement automatique à intervalles
 * - Rafraîchissement au focus de l'écran
 * - Gestion des erreurs de rafraîchissement
 * - Debounce pour éviter les appels multiples
 * - Cache et expiration des données
 * - Rafraîchissement conditionnel
 * - Callbacks avant/après rafraîchissement
 * 
 * @module hooks/useRefresh
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { showErrorMessage, showSuccessMessage } from '../utils/notifications';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Options de rafraîchissement
 */
export interface RefreshOptions {
  /** Délai de debounce en millisecondes (évite les rafraîchissements multiples) */
  debounceDelay?: number;
  
  /** Afficher un message de succès après rafraîchissement */
  showSuccessMessage?: boolean;
  
  /** Message de succès personnalisé */
  successMessage?: string;
  
  /** Afficher un message d'erreur en cas d'échec */
  showErrorMessage?: boolean;
  
  /** Message d'erreur personnalisé */
  errorMessage?: string;
  
  /** Désactiver le rafraîchissement automatique au focus */
  disableAutoRefreshOnFocus?: boolean;
  
  /** Intervalle de rafraîchissement automatique (en millisecondes) - 0 = désactivé */
  autoRefreshInterval?: number;
  
  /** Expiration du cache avant rafraîchissement automatique (en millisecondes) */
  cacheExpiration?: number;
  
  /** Ne pas rafraîchir si les données sont récentes */
  skipIfRecent?: boolean;
  
  /** Temps considéré comme récent (en millisecondes) */
  recentThreshold?: number;
  
  /** Callback avant rafraîchissement */
  onBeforeRefresh?: () => void;
  
  /** Callback après rafraîchissement réussi */
  onAfterRefresh?: () => void;
  
  /** Callback en cas d'erreur */
  onError?: (error: any) => void;
}

/**
 * Interface pour la valeur de retour du hook
 */
export interface UseRefreshReturn {
  /** État de rafraîchissement */
  refreshing: boolean;
  
  /** Fonction de rafraîchissement manuel */
  onRefresh: () => Promise<void>;
  
  /** Force le rafraîchissement (ignore le debounce et les conditions) */
  forceRefresh: () => Promise<void>;
  
  /** Réinitialise l'état de rafraîchissement */
  resetRefresh: () => void;
  
  /** Met à jour le timestamp de dernière mise à jour */
  updateLastUpdated: () => void;
  
  /** Vérifie si les données sont expirées */
  isDataExpired: (lastUpdateTime?: number) => boolean;
  
  /** Dernier timestamp de mise à jour */
  lastUpdated: Date | null;
}

/**
 * Interface pour la configuration de cache
 */
interface CacheConfig {
  lastUpdated: number | null;
  data: any;
}

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_OPTIONS: Required<Omit<RefreshOptions, 'onBeforeRefresh' | 'onAfterRefresh' | 'onError'>> = {
  debounceDelay: 500,
  showSuccessMessage: false,
  successMessage: 'Données actualisées',
  showErrorMessage: true,
  errorMessage: 'Échec de l\'actualisation',
  disableAutoRefreshOnFocus: false,
  autoRefreshInterval: 0,
  cacheExpiration: 5 * 60 * 1000, // 5 minutes
  skipIfRecent: true,
  recentThreshold: 2 * 60 * 1000, // 2 minutes
};

// ============================================
// HOOK PRINCIPAL
// ============================================

/**
 * Hook useRefresh - Gestion du rafraîchissement
 * 
 * @param refreshFunction - Fonction asynchrone à exécuter lors du rafraîchissement
 * @param options - Options de configuration
 * @returns Object contenant l'état et les fonctions de rafraîchissement
 * 
 * @example
 * // Utilisation basique avec pull to refresh
 * const { refreshing, onRefresh } = useRefresh(async () => {
 *   await fetchConseils();
 *   await fetchMeteo();
 * });
 * 
 * return (
 *   <FlatList
 *     data={data}
 *     refreshControl={
 *       <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
 *     }
 *   />
 * );
 * 
 * @example
 * // Avec rafraîchissement automatique au focus
 * const { refreshing, onRefresh } = useRefresh(fetchData, {
 *   autoRefreshInterval: 30000, // Toutes les 30 secondes
 *   cacheExpiration: 60000, // Expire après 1 minute
 * });
 * 
 * @example
 * // Avec messages de succès/erreur
 * const { refreshing, onRefresh } = useRefresh(saveData, {
 *   showSuccessMessage: true,
 *   successMessage: 'Données sauvegardées',
 *   showErrorMessage: true,
 * });
 */
export const useRefresh = (
  refreshFunction: () => Promise<any>,
  options: RefreshOptions = {}
): UseRefreshReturn => {
  const { t } = useTranslation();
  
  // Fusion des options par défaut
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // États
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Refs
  const isRefreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cacheDataRef = useRef<CacheConfig>({ lastUpdated: null, data: null });
  
  /**
   * Met à jour le timestamp de dernière mise à jour
   */
  const updateLastUpdated = useCallback(() => {
    const now = Date.now();
    setLastUpdated(new Date(now));
    cacheDataRef.current.lastUpdated = now;
  }, []);
  
  /**
   * Vérifie si les données sont expirées
   * 
   * @param lastUpdateTime - Timestamp de dernière mise à jour (optionnel)
   * @returns true si les données sont expirées
   */
  const isDataExpired = useCallback((lastUpdateTime?: number): boolean => {
    const lastUpdate = lastUpdateTime || cacheDataRef.current.lastUpdated;
    
    if (!lastUpdate) return true;
    
    const now = Date.now();
    const elapsed = now - lastUpdate;
    
    return elapsed > opts.cacheExpiration;
  }, [opts.cacheExpiration]);
  
  /**
   * Vérifie si les données sont récentes
   * 
   * @param lastUpdateTime - Timestamp de dernière mise à jour (optionnel)
   * @returns true si les données sont récentes
   */
  const isDataRecent = useCallback((lastUpdateTime?: number): boolean => {
    const lastUpdate = lastUpdateTime || cacheDataRef.current.lastUpdated;
    
    if (!lastUpdate) return false;
    
    const now = Date.now();
    const elapsed = now - lastUpdate;
    
    return elapsed <= opts.recentThreshold;
  }, [opts.recentThreshold]);
  
  /**
   * Fonction de rafraîchissement principale
   * 
   * @param force - Force le rafraîchissement (ignore le debounce)
   * @param skipConditions - Ignore les conditions (skipIfRecent)
   * @returns Promise avec le résultat
   */
  const executeRefresh = useCallback(async (force: boolean = false, skipConditions: boolean = false): Promise<boolean> => {
    // Éviter les rafraîchissements multiples simultanés
    if (isRefreshingRef.current) {
      if (__DEV__) console.log('[useRefresh] Rafraîchissement déjà en cours');
      return false;
    }
    
    // Debounce
    const now = Date.now();
    if (!force && (now - lastRefreshTimeRef.current) < opts.debounceDelay) {
      if (__DEV__) console.log('[useRefresh] Debounce actif, rafraîchissement ignoré');
      return false;
    }
    
    // Vérifier si les données sont récentes
    if (!force && !skipConditions && opts.skipIfRecent && isDataRecent()) {
      if (__DEV__) console.log('[useRefresh] Données récentes, rafraîchissement ignoré');
      return false;
    }
    
    lastRefreshTimeRef.current = now;
    isRefreshingRef.current = true;
    setRefreshing(true);
    
    // Callback avant rafraîchissement
    if (opts.onBeforeRefresh) {
      opts.onBeforeRefresh();
    }
    
    try {
      // Exécuter la fonction de rafraîchissement
      const result = await refreshFunction();
      
      // Mettre à jour le cache
      updateLastUpdated();
      cacheDataRef.current.data = result;
      
      // Callback après rafraîchissement réussi
      if (opts.onAfterRefresh) {
        opts.onAfterRefresh();
      }
      
      // Message de succès
      if (opts.showSuccessMessage) {
        const message = opts.successMessage || t('refresh_success');
        showSuccessMessage(message);
      }
      
      if (__DEV__) console.log('[useRefresh] Rafraîchissement réussi');
      
      return true;
      
    } catch (error) {
      console.error('[useRefresh] Erreur lors du rafraîchissement:', error);
      
      // Message d'erreur
      if (opts.showErrorMessage) {
        const message = opts.errorMessage || t('refresh_error');
        showErrorMessage(message);
      }
      
      // Callback d'erreur
      if (opts.onError) {
        opts.onError(error);
      }
      
      return false;
      
    } finally {
      isRefreshingRef.current = false;
      setRefreshing(false);
    }
  }, [
    refreshFunction,
    opts,
    t,
    isDataRecent,
    updateLastUpdated,
  ]);
  
  /**
   * Rafraîchissement manuel (avec debounce)
   */
  const onRefresh = useCallback(async (): Promise<void> => {
    await executeRefresh(false, false);
  }, [executeRefresh]);
  
  /**
   * Force le rafraîchissement (ignore debounce et conditions)
   */
  const forceRefresh = useCallback(async (): Promise<void> => {
    await executeRefresh(true, true);
  }, [executeRefresh]);
  
  /**
   * Réinitialise l'état de rafraîchissement
   */
  const resetRefresh = useCallback(() => {
    isRefreshingRef.current = false;
    setRefreshing(false);
    lastRefreshTimeRef.current = 0;
  }, []);
  
  /**
   * Rafraîchissement automatique à intervalles
   */
  useEffect(() => {
    if (opts.autoRefreshInterval <= 0) return;
    
    const startAutoRefresh = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      intervalRef.current = setInterval(() => {
        // Vérifier si les données sont expirées avant de rafraîchir
        if (isDataExpired()) {
          if (__DEV__) console.log('[useRefresh] Rafraîchissement automatique déclenché');
          executeRefresh(false, false);
        }
      }, opts.autoRefreshInterval);
    };
    
    startAutoRefresh();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [opts.autoRefreshInterval, isDataExpired, executeRefresh]);
  
  /**
   * Rafraîchissement au focus de l'écran
   */
  useFocusEffect(
    useCallback(() => {
      if (!opts.disableAutoRefreshOnFocus && !refreshing) {
        // Vérifier si les données sont expirées
        if (isDataExpired()) {
          if (__DEV__) console.log('[useRefresh] Rafraîchissement au focus déclenché');
          executeRefresh(false, false);
        }
      }
    }, [opts.disableAutoRefreshOnFocus, refreshing, isDataExpired, executeRefresh])
  );
  
  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      resetRefresh();
    };
  }, [resetRefresh]);
  
  return {
    refreshing,
    onRefresh,
    forceRefresh,
    resetRefresh,
    updateLastUpdated,
    isDataExpired,
    lastUpdated,
  };
};

// ============================================
// HOOKS DÉRIVÉS
// ============================================

/**
 * Hook pour gérer plusieurs sources de données à rafraîchir
 * 
 * @param refreshFunctions - Objet contenant les fonctions de rafraîchissement
 * @param options - Options de configuration
 * @returns Object contenant l'état et les fonctions de rafraîchissement groupé
 * 
 * @example
 * const { refreshing, refreshAll, refreshIndividual } = useMultiRefresh({
 *   conseils: fetchConseils,
 *   meteo: fetchMeteo,
 *   techniques: fetchTechniques,
 * });
 * 
 * // Rafraîchir tout
 * <RefreshControl refreshing={refreshing} onRefresh={refreshAll} />
 * 
 * // Rafraîchir individuellement
 * onPress={() => refreshIndividual('conseils')}
 */
export const useMultiRefresh = <T extends Record<string, () => Promise<any>>>(
  refreshFunctions: T,
  options: RefreshOptions = {}
): {
  refreshing: boolean;
  refreshingKeys: (keyof T)[];
  refreshAll: () => Promise<Record<keyof T, boolean>>;
  refreshIndividual: (key: keyof T) => Promise<boolean>;
  isRefreshing: (key: keyof T) => boolean;
  resetAll: () => void;
} => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingKeys, setRefreshingKeys] = useState<(keyof T)[]>([]);
  
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const isRefreshingRef = useRef(false);
  
  /**
   * Rafraîchit une fonction individuelle
   */
  const refreshIndividual = useCallback(async (key: keyof T): Promise<boolean> => {
    if (refreshingKeys.includes(key)) return false;
    
    setRefreshingKeys(prev => [...prev, key]);
    
    try {
      await refreshFunctions[key]();
      
      if (opts.showSuccessMessage) {
        const message = opts.successMessage || `Actualisation de ${String(key)} réussie`;
        showSuccessMessage(message);
      }
      
      return true;
    } catch (error) {
      console.error(`[useMultiRefresh] Erreur rafraîchissement ${String(key)}:`, error);
      
      if (opts.showErrorMessage) {
        const message = opts.errorMessage || `Échec de l'actualisation de ${String(key)}`;
        showErrorMessage(message);
      }
      
      return false;
    } finally {
      setRefreshingKeys(prev => prev.filter(k => k !== key));
    }
  }, [refreshFunctions, refreshingKeys, opts]);
  
  /**
   * Rafraîchit toutes les fonctions
   */
  const refreshAll = useCallback(async (): Promise<Record<keyof T, boolean>> => {
    if (isRefreshingRef.current) return {} as Record<keyof T, boolean>;
    
    isRefreshingRef.current = true;
    setRefreshing(true);
    
    const results: Record<keyof T, boolean> = {} as Record<keyof T, boolean>;
    
    const promises = Object.entries(refreshFunctions).map(async ([key, fn]) => {
      try {
        await fn();
        results[key as keyof T] = true;
      } catch (error) {
        results[key as keyof T] = false;
        console.error(`[useMultiRefresh] Erreur ${key}:`, error);
      }
    });
    
    await Promise.all(promises);
    
    const allSuccess = Object.values(results).every(v => v === true);
    
    if (opts.showSuccessMessage && allSuccess) {
      showSuccessMessage(opts.successMessage || 'Toutes les données ont été actualisées');
    } else if (opts.showErrorMessage && !allSuccess) {
      showErrorMessage(opts.errorMessage || 'Certaines données n\'ont pas pu être actualisées');
    }
    
    isRefreshingRef.current = false;
    setRefreshing(false);
    
    return results;
  }, [refreshFunctions, opts]);
  
  /**
   * Vérifie si une clé spécifique est en cours de rafraîchissement
   */
  const isRefreshing = useCallback((key: keyof T): boolean => {
    return refreshingKeys.includes(key);
  }, [refreshingKeys]);
  
  /**
   * Réinitialise tous les états
   */
  const resetAll = useCallback(() => {
    isRefreshingRef.current = false;
    setRefreshing(false);
    setRefreshingKeys([]);
  }, []);
  
  return {
    refreshing,
    refreshingKeys,
    refreshAll,
    refreshIndividual,
    isRefreshing,
    resetAll,
  };
};

/**
 * Hook pour le rafraîchissement silencieux (sans indicateur visuel)
 * Utile pour les mises à jour en arrière-plan
 * 
 * @param refreshFunction - Fonction de rafraîchissement
 * @param interval - Intervalle en millisecondes
 * 
 * @example
 * useSilentRefresh(fetchData, 30000); // Rafraîchit toutes les 30 secondes
 */
export const useSilentRefresh = (
  refreshFunction: () => Promise<any>,
  interval: number = 30000
): void => {
  const isMountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    const executeSilentRefresh = async () => {
      try {
        await refreshFunction();
        if (__DEV__) console.log('[useSilentRefresh] Rafraîchissement silencieux réussi');
      } catch (error) {
        console.error('[useSilentRefresh] Erreur:', error);
      }
    };
    
    if (interval > 0) {
      intervalRef.current = setInterval(executeSilentRefresh, interval);
    }
    
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshFunction, interval]);
};

/**
 * Hook pour le rafraîchissement conditionnel
 * Ne rafraîchit que si une condition est remplie
 * 
 * @param refreshFunction - Fonction de rafraîchissement
 * @param shouldRefresh - Condition à vérifier
 * @param deps - Dépendances pour réévaluer la condition
 * 
 * @example
 * useConditionalRefresh(fetchData, () => isOnline && isAuthenticated, [isOnline, isAuthenticated]);
 */
export const useConditionalRefresh = (
  refreshFunction: () => Promise<any>,
  shouldRefresh: () => boolean,
  deps: any[] = []
): void => {
  const hasRefreshedRef = useRef(false);
  
  useEffect(() => {
    const execute = async () => {
      if (shouldRefresh() && !hasRefreshedRef.current) {
        hasRefreshedRef.current = true;
        await refreshFunction();
      }
    };
    
    execute();
  }, deps);
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default useRefresh;