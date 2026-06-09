/**
 * Hook useConseils - Sènè Yiriwa
 * 
 * Ce hook personnalisé gère toutes les opérations liées aux conseils agricoles
 * dans l'application. Il fournit une interface simple pour récupérer, filtrer,
 * et interagir avec les conseils.
 * 
 * Fonctionnalités :
 * - Récupération des conseils avec pagination et filtres
 * - Récupération des conseils personnalisés (basés sur profil agriculteur)
 * - Gestion des favoris
 * - Récupération des détails d'un conseil
 * - Recherche avancée
 * - État de chargement et gestion d'erreurs
 * - Cache intelligent des données
 * - Pull to refresh
 * 
 * @module hooks/useConseils
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as ConseilsAPI from '../api/endpoints/conseils';
import type {
  Conseil,
  ConseilSearchParams,
  ConseilsPaginatedResponse,
  CategorieConseil,
  CultureType,
} from '../api/endpoints/conseils';
import { useAuth } from './useAuth';
import { showErrorMessage, showSuccessMessage } from '../utils/notifications';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour l'état du hook useConseils
 */
export interface UseConseilsState {
  /** Liste des conseils */
  conseils: Conseil[];
  
  /** Conseils personnalisés pour l'utilisateur */
  conseilsPersonnalises: Conseil[];
  
  /** Conseils urgents/alertes */
  conseilsUrgents: Conseil[];
  
  /** Détails du conseil actuellement consulté */
  conseilDetail: Conseil | null;
  
  /** Liste des favoris */
  favoris: Conseil[];
  
  /** État de chargement */
  loading: boolean;
  
  /** État de chargement des favoris */
  loadingFavoris: boolean;
  
  /** État de chargement des détails */
  loadingDetail: boolean;
  
  /** État de rafraîchissement (pull to refresh) */
  refreshing: boolean;
  
  /** Message d'erreur */
  error: string | null;
  
  /** Pagination */
  pagination: {
    page: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  /** Filtres actifs */
  filters: ConseilSearchParams;
}

/**
 * Interface pour les paramètres de chargement
 */
export interface LoadConseilsOptions {
  /** Réinitialiser la liste (vs charger plus) */
  reset?: boolean;
  
  /** Utiliser les filtres actuels */
  useCurrentFilters?: boolean;
  
  /** Surcharge temporaire des filtres */
  tempFilters?: ConseilSearchParams;
}

// ============================================
// ÉTAT INITIAL
// ============================================

const initialState: UseConseilsState = {
  conseils: [],
  conseilsPersonnalises: [],
  conseilsUrgents: [],
  conseilDetail: null,
  favoris: [],
  loading: false,
  loadingFavoris: false,
  loadingDetail: false,
  refreshing: false,
  error: null,
  pagination: {
    page: 1,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc',
  },
};

// ============================================
// HOOK PRINCIPAL
// ============================================

/**
 * Hook useConseils - Gestion des conseils agricoles
 * 
 * @example
 * // Utilisation basique
 * const { conseils, loading, loadConseils } = useConseils();
 * 
 * @example
 * // Avec filtres personnalisés
 * const { conseils, loading, setFilters, loadConseils } = useConseils();
 * 
 * useEffect(() => {
 *   setFilters({ cultures: ['mais'], region: 'Sikasso' });
 *   loadConseils();
 * }, []);
 * 
 * @example
 * // Récupération des conseils personnalisés
 * const { conseilsPersonnalises, loadConseilsPersonnalises } = useConseils();
 * 
 * @example
 * // Gestion des favoris
 * const { favoris, addFavori, removeFavori, loadFavoris } = useConseils();
 */
export const useConseils = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isAuthenticated, token } = useAuth();
  
  // État local
  const [state, setState] = useState<UseConseilsState>(initialState);
  
  // Référence pour éviter les appels multiples
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Sélecteurs Redux (si utilisés)
  const userProfile = useSelector((state: any) => state.user.profile);
  const userPreferences = useSelector((state: any) => state.user.preferences);

  // ============================================
  // FONCTIONS DE MISE À JOUR D'ÉTAT
  // ============================================

  /**
   * Met à jour partiellement l'état du hook
   */
  const updateState = useCallback((updates: Partial<UseConseilsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Réinitialise l'état
   */
  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Gère les erreurs de manière centralisée
   */
  const handleError = useCallback((error: any, customMessage?: string) => {
    const errorMessage = customMessage || error?.userMessage || error?.message || t('error_loading_conseils');
    
    updateState({
      error: errorMessage,
      loading: false,
      refreshing: false,
    });
    
    // Afficher une notification d'erreur (optionnel)
    if (__DEV__) {
      console.error('[useConseils] Erreur:', error);
    }
    
    return { success: false, error: errorMessage };
  }, [t, updateState]);

  // ============================================
  // CHARGEMENT DES CONSEILS
  // ============================================

  /**
   * Charge la liste des conseils avec les filtres actuels
   * 
   * @param options - Options de chargement
   * @returns Promise avec la réponse paginée
   * 
   * @example
   * // Chargement initial
   * await loadConseils();
   * 
   * @example
   * // Chargement de la page suivante
   * await loadConseils({ reset: false });
   * 
   * @example
   * // Réinitialisation avec nouveaux filtres
   * await loadConseils({ reset: true, tempFilters: { categories: ['irrigation'] } });
   */
  const loadConseils = useCallback(async (options: LoadConseilsOptions = {}) => {
    const { reset = true, useCurrentFilters = true, tempFilters } = options;
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      return { success: false, error: 'Déjà en chargement' };
    }
    
    isLoadingRef.current = true;
    
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      updateState({ loading: true, error: null });
      
      // Déterminer les filtres à utiliser
      let currentFilters: ConseilSearchParams;
      
      if (tempFilters) {
        currentFilters = tempFilters;
      } else if (useCurrentFilters) {
        currentFilters = state.filters;
      } else {
        currentFilters = { page: 1, limit: 20 };
      }
      
      // Réinitialiser la page si demandé
      if (reset) {
        currentFilters = { ...currentFilters, page: 1 };
      }
      
      // Ajouter le token (ou undefined) — éviter de passer null
      const authToken = token ?? undefined;

      // Appel API
      const response = await ConseilsAPI.getConseils(currentFilters, authToken);
      
      // Mettre à jour l'état
      const newConseils = reset 
        ? response.data.conseils 
        : [...state.conseils, ...response.data.conseils];
      
      updateState({
        conseils: newConseils,
        pagination: response.data.pagination,
        loading: false,
        refreshing: false,
        filters: currentFilters,
      });
      
      return { success: true, data: response };
      
    } catch (error: any) {
      // Ignorer les erreurs d'annulation
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return { success: false, error: 'Requête annulée' };
      }
      
      return handleError(error, t('error_loading_conseils'));
      
    } finally {
      isLoadingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [state.filters, isAuthenticated, token, t, updateState, handleError]);

  /**
   * Charge la page suivante des conseils
   * 
   * @returns Promise avec le résultat du chargement
   * 
   * @example
   * const { loadMore } = useConseils();
   * // Dans un FlatList, onScroll
   * onEndReached={loadMore}
   */
  const loadMore = useCallback(async () => {
    if (!state.pagination.hasNext || state.loading) {
      return { success: false, error: 'Plus de pages ou déjà en chargement' };
    }
    
    const nextPage = state.pagination.page + 1;
    const tempFilters = { ...state.filters, page: nextPage };
    
    return await loadConseils({ reset: false, tempFilters });
  }, [state.pagination.hasNext, state.pagination.page, state.filters, state.loading, loadConseils]);

  // ============================================
  // CONSEILS PERSONNALISÉS
  // ============================================

  /**
   * Charge les conseils personnalisés pour l'agriculteur
   * Basé sur son profil (culture, localisation, historique)
   * 
   * @param limit - Nombre de conseils à récupérer
   * @returns Promise avec la liste des conseils
   * 
   * @example
   * const { conseilsPersonnalises, loadConseilsPersonnalises } = useConseils();
   * 
   * useEffect(() => {
   *   if (isAuthenticated) {
   *     loadConseilsPersonnalises(10);
   *   }
   * }, [isAuthenticated]);
   */
  const loadConseilsPersonnalises = useCallback(async (limit: number = 10) => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      updateState({ loading: true, error: null });
      
      const conseils = await ConseilsAPI.getConseilsPersonnalises(token ?? undefined, limit);
      
      updateState({
        conseilsPersonnalises: conseils,
        loading: false,
      });
      
      return { success: true, data: conseils };
      
    } catch (error) {
      return handleError(error, t('error_loading_personalized'));
    }
  }, [isAuthenticated, token, t, updateState, handleError]);

  // ============================================
  // CONSEILS URGENTS
  // ============================================

  /**
   * Charge les conseils urgents (alertes)
   * 
   * @returns Promise avec la liste des conseils urgents
   * 
   * @example
   * const { conseilsUrgents, loadConseilsUrgents } = useConseils();
   * 
   * useEffect(() => {
   *   loadConseilsUrgents();
   * }, []);
   */
  const loadConseilsUrgents = useCallback(async () => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      updateState({ loading: true, error: null });
      
      const conseils = await ConseilsAPI.getConseilsUrgents(token ?? undefined);
      
      updateState({
        conseilsUrgents: conseils,
        loading: false,
      });
      
      return { success: true, data: conseils };
      
    } catch (error) {
      return handleError(error, t('error_loading_urgents'));
    }
  }, [isAuthenticated, token, t, updateState, handleError]);

  // ============================================
  // DÉTAILS D'UN CONSEIL
  // ============================================

  /**
   * Charge les détails d'un conseil spécifique
   * 
   * @param conseilId - ID du conseil
   * @returns Promise avec les détails du conseil
   * 
   * @example
   * const { conseilDetail, loadConseilDetail, loadingDetail } = useConseils();
   * 
   * useEffect(() => {
   *   loadConseilDetail(conseilId);
   * }, [conseilId]);
   */
  const loadConseilDetail = useCallback(async (conseilId: string) => {
    if (!conseilId) {
      return { success: false, error: 'ID du conseil manquant' };
    }
    
    try {
      updateState({ loadingDetail: true, error: null });
      
      const conseil = await ConseilsAPI.getConseilDetails(conseilId, token ?? undefined);
      
      updateState({
        conseilDetail: conseil,
        loadingDetail: false,
      });
      
      return { success: true, data: conseil };
      
    } catch (error) {
      updateState({ loadingDetail: false });
      return handleError(error, t('error_loading_conseil_detail'));
    }
  }, [isAuthenticated, token, t, updateState, handleError]);

  // ============================================
  // FAVORIS
  // ============================================

  /**
   * Charge la liste des favoris de l'utilisateur
   * 
   * @param page - Numéro de page
   * @returns Promise avec la liste des favoris
   * 
   * @example
   * const { favoris, loadFavoris, loadingFavoris } = useConseils();
   * 
   * useEffect(() => {
   *   if (isAuthenticated) {
   *     loadFavoris();
   *   }
   * }, [isAuthenticated]);
   */
  const loadFavoris = useCallback(async (page: number = 1) => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      updateState({ loadingFavoris: true, error: null });
      
      const response = await ConseilsAPI.getFavoris(token ?? undefined, page);
      
      updateState({
        favoris: page === 1 ? response.data.conseils : [...state.favoris, ...response.data.conseils],
        loadingFavoris: false,
      });
      
      return { success: true, data: response };
      
    } catch (error) {
      updateState({ loadingFavoris: false });
      return handleError(error, t('error_loading_favorites'));
    }
  }, [isAuthenticated, token, t, state.favoris, updateState, handleError]);

  /**
   * Ajoute un conseil aux favoris
   * 
   * @param conseilId - ID du conseil
   * @returns Promise avec le résultat
   * 
   * @example
   * const { addFavori } = useConseils();
   * 
   * const handleFavorite = async (conseilId) => {
   *   const result = await addFavori(conseilId);
   *   if (result.success) {
   *     showSuccessMessage('Ajouté aux favoris');
   *   }
   * };
   */
  const addFavori = useCallback(async (conseilId: string) => {
    if (!isAuthenticated || !token) {
      showErrorMessage(t('login_required'));
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      await ConseilsAPI.addFavori(conseilId, token ?? undefined);
      
      // Mettre à jour l'état local
      const conseilToAdd = state.conseils.find(c => c.id === conseilId) ||
                          state.conseilsPersonnalises.find(c => c.id === conseilId) ||
                          state.conseilDetail;
      
      if (conseilToAdd && !state.favoris.find(f => f.id === conseilId)) {
        updateState({
          favoris: [...state.favoris, { ...conseilToAdd, estFavori: true }],
        });
      }
      
      // Mettre à jour estFavori dans les listes
      const updateFavoriStatus = (list: Conseil[]) =>
        list.map(c => c.id === conseilId ? { ...c, estFavori: true } : c);
      
      updateState({
        conseils: updateFavoriStatus(state.conseils),
        conseilsPersonnalises: updateFavoriStatus(state.conseilsPersonnalises),
        conseilDetail: state.conseilDetail?.id === conseilId
          ? { ...state.conseilDetail, estFavori: true }
          : state.conseilDetail,
      });
      
      showSuccessMessage(t('added_to_favorites'));
      return { success: true };
      
    } catch (error) {
      showErrorMessage(t('error_adding_favorite'));
      return handleError(error, t('error_adding_favorite'));
    }
  }, [isAuthenticated, token, t, state, updateState, handleError]);

  /**
   * Supprime un conseil des favoris
   * 
   * @param conseilId - ID du conseil
   * @returns Promise avec le résultat
   * 
   * @example
   * const { removeFavori } = useConseils();
   * 
   * const handleRemoveFavorite = async (conseilId) => {
   *   const result = await removeFavori(conseilId);
   *   if (result.success) {
   *     showSuccessMessage('Retiré des favoris');
   *   }
   * };
   */
  const removeFavori = useCallback(async (conseilId: string) => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      await ConseilsAPI.removeFavori(conseilId, token ?? undefined);
      
      // Mettre à jour l'état local
      updateState({
        favoris: state.favoris.filter(f => f.id !== conseilId),
      });
      
      // Mettre à jour estFavori dans les listes
      const updateFavoriStatus = (list: Conseil[]) =>
        list.map(c => c.id === conseilId ? { ...c, estFavori: false } : c);
      
      updateState({
        conseils: updateFavoriStatus(state.conseils),
        conseilsPersonnalises: updateFavoriStatus(state.conseilsPersonnalises),
        conseilDetail: state.conseilDetail?.id === conseilId
          ? { ...state.conseilDetail, estFavori: false }
          : state.conseilDetail,
      });
      
      showSuccessMessage(t('removed_from_favorites'));
      return { success: true };
      
    } catch (error) {
      showErrorMessage(t('error_removing_favorite'));
      return handleError(error, t('error_removing_favorite'));
    }
  }, [isAuthenticated, token, t, state, updateState, handleError]);

  /**
   * Vérifie si un conseil est dans les favoris
   * 
   * @param conseilId - ID du conseil
   * @returns true si le conseil est favori
   * 
   * @example
   * const { isFavori } = useConseils();
   * 
   * <Icon 
   *   name={isFavori(conseilId) ? 'heart' : 'heart-outline'} 
   * />
   */
  const isFavori = useCallback((conseilId: string): boolean => {
    return state.favoris.some(f => f.id === conseilId);
  }, [state.favoris]);

  // ============================================
  // RECHERCHE
  // ============================================

  /**
   * Recherche avancée de conseils
   * 
   * @param searchTerm - Terme de recherche
   * @param filters - Filtres supplémentaires (optionnel)
   * @returns Promise avec les résultats
   * 
   * @example
   * const { searchConseils } = useConseils();
   * 
   * const handleSearch = async (text) => {
   *   const results = await searchConseils(text);
   *   setSearchResults(results.data?.conseils || []);
   * };
   */
  const searchConseils = useCallback(async (searchTerm: string, filters?: ConseilSearchParams) => {
    if (!searchTerm.trim()) {
      return { success: false, error: 'Terme de recherche vide' };
    }
    
    try {
      updateState({ loading: true, error: null });
      
      const searchFilters: ConseilSearchParams = {
        search: searchTerm,
        page: 1,
        limit: 30,
        ...filters,
      };
      
      const response = await ConseilsAPI.getConseils(searchFilters, token ?? undefined);
      
      updateState({
        conseils: response.data.conseils,
        pagination: response.data.pagination,
        loading: false,
      });
      
      return { success: true, data: response };
      
    } catch (error) {
      return handleError(error, t('error_searching'));
    }
  }, [isAuthenticated, token, t, updateState, handleError]);

  // ============================================
  // FILTRES
  // ============================================

  /**
   * Met à jour les filtres et recharge les conseils
   * 
   * @param newFilters - Nouveaux filtres
   * @param resetPage - Réinitialiser la page à 1
   * @returns Promise avec le résultat
   * 
   * @example
   * const { setFilters } = useConseils();
   * 
   * // Filtrer par catégorie
   * setFilters({ categories: ['irrigation'] });
   * 
   * // Filtrer par culture
   * setFilters({ cultures: ['mais'], region: 'Sikasso' });
   */
  const setFilters = useCallback(async (newFilters: Partial<ConseilSearchParams>, resetPage: boolean = true) => {
    const updatedFilters = {
      ...state.filters,
      ...newFilters,
      ...(resetPage && { page: 1 }),
    };
    
    updateState({ filters: updatedFilters });
    
    return await loadConseils({ reset: resetPage, tempFilters: updatedFilters });
  }, [state.filters, loadConseils, updateState]);

  /**
   * Réinitialise tous les filtres
   * 
   * @returns Promise avec le résultat
   * 
   * @example
   * const { resetFilters } = useConseils();
   * 
   * const handleReset = () => {
   *   resetFilters();
   * };
   */
  const resetFilters = useCallback(async () => {
    const defaultFilters: ConseilSearchParams = {
      page: 1,
      limit: 20,
      sortBy: 'date',
      sortOrder: 'desc',
    };
    
    updateState({ filters: defaultFilters });
    
    return await loadConseils({ reset: true, tempFilters: defaultFilters });
  }, [loadConseils, updateState]);

  // ============================================
  // PULL TO REFRESH
  // ============================================

  /**
   * Rafraîchit toutes les données
   * 
   * @returns Promise avec le résultat
   * 
   * @example
   * const { onRefresh, refreshing } = useConseils();
   * 
   * <FlatList
   *   refreshControl={
   *     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
   *   }
   * />
   */
  const onRefresh = useCallback(async () => {
    updateState({ refreshing: true });
    
    try {
      // Rafraîchir les conseils
      await loadConseils({ reset: true });
      
      // Rafraîchir les conseils personnalisés si authentifié
      if (isAuthenticated) {
        await loadConseilsPersonnalises();
        await loadConseilsUrgents();
        await loadFavoris();
      }
      
      updateState({ refreshing: false });
    } catch (error) {
      updateState({ refreshing: false });
    }
  }, [isAuthenticated, loadConseils, loadConseilsPersonnalises, loadConseilsUrgents, loadFavoris, updateState]);

  // ============================================
  // CHARGEMENT AUTOMATIQUE INITIAL
  // ============================================

  // Chargement initial des conseils
  useEffect(() => {
    loadConseils({ reset: true });
  }, []);

  // Chargement des conseils personnalisés si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      loadConseilsPersonnalises();
      loadConseilsUrgents();
      loadFavoris();
    }
  }, [isAuthenticated]);

  // ============================================
  // RETOUR DU HOOK
  // ============================================

  return {
    // État
    conseils: state.conseils,
    conseilsPersonnalises: state.conseilsPersonnalises,
    conseilsUrgents: state.conseilsUrgents,
    conseilDetail: state.conseilDetail,
    favoris: state.favoris,
    loading: state.loading,
    loadingFavoris: state.loadingFavoris,
    loadingDetail: state.loadingDetail,
    refreshing: state.refreshing,
    error: state.error,
    pagination: state.pagination,
    filters: state.filters,
    
    // Actions principales
    loadConseils,
    loadMore,
    loadConseilDetail,
    loadConseilsPersonnalises,
    loadConseilsUrgents,
    
    // Favoris
    loadFavoris,
    addFavori,
    removeFavori,
    isFavori,
    
    // Recherche et filtres
    searchConseils,
    setFilters,
    resetFilters,
    
    // Utilitaires
    onRefresh,
    resetState,
  };
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default useConseils;