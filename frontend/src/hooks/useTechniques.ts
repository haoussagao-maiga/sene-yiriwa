/**
 * Hook useTechniques - Sènè Yiriwa
 * 
 * Ce hook personnalisé gère toutes les opérations liées aux techniques
 * agricoles dans l'application. Il fournit une interface simple pour
 * récupérer, filtrer, et interagir avec les techniques de vulgarisation.
 * 
 * Fonctionnalités :
 * - Récupération des techniques avec pagination et filtres
 * - Récupération des détails d'une technique
 * - Gestion des favoris
 * - Suivi de progression (étapes complétées)
 * - Obtention de certificats
 * - Avis et évaluations
 * - Recherche avancée
 * - Cache intelligent
 * - Pull to refresh
 * 
 * @module hooks/useTechniques
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import * as TechniquesAPI from '../api/endpoints/techniques';
import type {
  TechniqueAgricole,
  TechniqueSearchParams,
  TechniquesPaginatedResponse,
  CategorieTechnique,
  CultureType,
  ProgressionTechnique,
  AvisTechnique,
  TechniquesStats,
} from '../api/endpoints/techniques';
import { useAuth } from './useAuth';
import { showErrorMessage, showSuccessMessage } from '../utils/notifications';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour l'état du hook useTechniques
 */
export interface UseTechniquesState {
  /** Liste des techniques */
  techniques: TechniqueAgricole[];
  
  /** Techniques recommandées pour l'utilisateur */
  techniquesRecommandees: TechniqueAgricole[];
  
  /** Détails de la technique actuellement consultée */
  techniqueDetail: TechniqueAgricole | null;
  
  /** Liste des favoris */
  favoris: TechniqueAgricole[];
  
  /** Progression sur la technique actuelle */
  progression: ProgressionTechnique | null;
  
  /** Avis sur la technique actuelle */
  avis: AvisTechnique[];
  
  /** Statistiques de l'utilisateur */
  stats: TechniquesStats | null;
  
  /** État de chargement général */
  loading: boolean;
  
  /** État de chargement des favoris */
  loadingFavoris: boolean;
  
  /** État de chargement des détails */
  loadingDetail: boolean;
  
  /** État de chargement de la progression */
  loadingProgression: boolean;
  
  /** État de chargement des avis */
  loadingAvis: boolean;
  
  /** État de rafraîchissement */
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
  filters: TechniqueSearchParams;
  
  /** Note moyenne des avis */
  noteMoyenne: number;
  
  /** Répartition des notes */
  repartitionNotes: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

/**
 * Interface pour les paramètres de chargement
 */
export interface LoadTechniquesOptions {
  /** Réinitialiser la liste */
  reset?: boolean;
  
  /** Utiliser les filtres actuels */
  useCurrentFilters?: boolean;
  
  /** Surcharge temporaire des filtres */
  tempFilters?: TechniqueSearchParams;
}

/**
 * Interface pour l'envoi d'un avis
 */
export interface SubmitAvisData {
  note: number;
  commentaire: string;
  photos?: string[];
}

// ============================================
// ÉTAT INITIAL
// ============================================

const initialState: UseTechniquesState = {
  techniques: [],
  techniquesRecommandees: [],
  techniqueDetail: null,
  favoris: [],
  progression: null,
  avis: [],
  stats: null,
  loading: false,
  loadingFavoris: false,
  loadingDetail: false,
  loadingProgression: false,
  loadingAvis: false,
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
  noteMoyenne: 0,
  repartitionNotes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

// ============================================
// HOOK PRINCIPAL
// ============================================

/**
 * Hook useTechniques - Gestion des techniques agricoles
 * 
 * @example
 * // Utilisation basique
 * const { techniques, loading, loadTechniques } = useTechniques();
 * 
 * @example
 * // Avec filtres
 * const { techniques, setFilters, loadTechniques } = useTechniques();
 * 
 * useEffect(() => {
 *   setFilters({ categories: ['irrigation'], cultures: ['mais'] });
 *   loadTechniques();
 * }, []);
 * 
 * @example
 * // Gestion de la progression
 * const { progression, updateProgression, completeTechnique } = useTechniques();
 */
export const useTechniques = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isAuthenticated, token } = useAuth();
  
  // État local
  const [state, setState] = useState<UseTechniquesState>(initialState);
  
  // Références
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Sélecteurs Redux (si utilisés)
  const userPreferences = useSelector((state: any) => state.user.preferences);

  // ============================================
  // FONCTIONS DE MISE À JOUR D'ÉTAT
  // ============================================

  /**
   * Met à jour partiellement l'état du hook
   */
  const updateState = useCallback((updates: Partial<UseTechniquesState>) => {
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
    const errorMessage = customMessage || error?.userMessage || error?.message || t('error_loading_techniques');
    
    updateState({
      error: errorMessage,
      loading: false,
      refreshing: false,
      loadingDetail: false,
      loadingProgression: false,
      loadingAvis: false,
    });
    
    if (__DEV__) {
      console.error('[useTechniques] Erreur:', error);
    }
    
    return { success: false, error: errorMessage };
  }, [t, updateState]);

  // ============================================
  // CHARGEMENT DES TECHNIQUES
  // ============================================

  /**
   * Charge la liste des techniques avec les filtres actuels
   * 
   * @param options - Options de chargement
   * @returns Promise avec la réponse paginée
   */
  const loadTechniques = useCallback(async (options: LoadTechniquesOptions = {}) => {
    const { reset = true, useCurrentFilters = true, tempFilters } = options;
    
    if (isLoadingRef.current) {
      return { success: false, error: 'Déjà en chargement' };
    }
    
    isLoadingRef.current = true;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      updateState({ loading: true, error: null });
      
      let currentFilters: TechniqueSearchParams;
      
      if (tempFilters) {
        currentFilters = tempFilters;
      } else if (useCurrentFilters) {
        currentFilters = state.filters;
      } else {
        currentFilters = { page: 1, limit: 20 };
      }
      
      if (reset) {
        currentFilters = { ...currentFilters, page: 1 };
      }
      
      const authToken = isAuthenticated && token ? token : undefined;
      
      const response = await TechniquesAPI.getTechniques(currentFilters, authToken);
      
      const newTechniques = reset 
        ? response.techniques 
        : [...state.techniques, ...response.techniques];
      
      updateState({
        techniques: newTechniques,
        pagination: response.pagination,
        loading: false,
        refreshing: false,
        filters: currentFilters,
      });
      
      return { success: true, data: response };
      
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return { success: false, error: 'Requête annulée' };
      }
      
      return handleError(error, t('error_loading_techniques'));
      
    } finally {
      isLoadingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [state.filters, isAuthenticated, token, t, updateState, handleError]);

  /**
   * Charge la page suivante des techniques
   */
  const loadMore = useCallback(async () => {
    if (!state.pagination.hasNext || state.loading) {
      return { success: false, error: 'Plus de pages ou déjà en chargement' };
    }
    
    const nextPage = state.pagination.page + 1;
    const tempFilters = { ...state.filters, page: nextPage };
    
    return await loadTechniques({ reset: false, tempFilters });
  }, [state.pagination.hasNext, state.pagination.page, state.filters, state.loading, loadTechniques]);

  /**
   * Charge les techniques recommandées pour l'utilisateur
   * 
   * @param limit - Nombre de techniques à récupérer
   */
  const loadTechniquesRecommandees = useCallback(async (limit: number = 10) => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      updateState({ loading: true, error: null });
      
      const techniques = await TechniquesAPI.getTechniquesRecommandees(token, limit);
      
      updateState({
        techniquesRecommandees: techniques,
        loading: false,
      });
      
      return { success: true, data: techniques };
      
    } catch (error) {
      return handleError(error, t('error_loading_recommendations'));
    }
  }, [isAuthenticated, token, t, updateState, handleError]);

  // ============================================
  // DÉTAILS D'UNE TECHNIQUE
  // ============================================

  /**
   * Charge les détails d'une technique spécifique
   * 
   * @param techniqueId - ID de la technique
   */
  const loadTechniqueDetail = useCallback(async (techniqueId: string) => {
    if (!techniqueId) {
      return { success: false, error: 'ID de la technique manquant' };
    }
    
    try {
      updateState({ loadingDetail: true, error: null });
      
      const technique = await TechniquesAPI.getTechniqueDetails(
        techniqueId,
        (isAuthenticated && token ? token : undefined) as string | undefined
      );
      
      updateState({
        techniqueDetail: technique,
        loadingDetail: false,
      });
      
      // Charger aussi la progression et les avis
      if (isAuthenticated && token) {
        await loadProgression(techniqueId);
      }
      await loadAvis(techniqueId);
      
      return { success: true, data: technique };
      
    } catch (error) {
      updateState({ loadingDetail: false });
      return handleError(error, t('error_loading_technique_detail'));
    }
  }, [isAuthenticated, token, t, updateState, handleError]);

  // ============================================
  // PROGRESSION
  // ============================================

  /**
   * Charge la progression de l'utilisateur sur une technique
   * 
   * @param techniqueId - ID de la technique
   */
  const loadProgression = useCallback(async (techniqueId: string) => {
    if (!isAuthenticated || !token) return null;
    
    try {
      updateState({ loadingProgression: true });
      
      const progression = await TechniquesAPI.getProgression(techniqueId, token);
      
      updateState({
        progression,
        loadingProgression: false,
      });
      
      return progression;
      
    } catch (error) {
      updateState({ loadingProgression: false });
      console.error('[useTechniques] Erreur chargement progression:', error);
      return null;
    }
  }, [isAuthenticated, token, updateState]);

  /**
   * Met à jour la progression sur une technique
   * 
   * @param techniqueId - ID de la technique
   * @param progression - Données de progression
   */
  const updateProgression = useCallback(async (
    techniqueId: string,
    progression: Partial<ProgressionTechnique>
  ) => {
    if (!isAuthenticated || !token) {
      showErrorMessage(t('login_required'));
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      updateState({ loadingProgression: true });
      
      const updatedProgression = await TechniquesAPI.updateProgression(
        techniqueId,
        progression,
        token
      );
      
      updateState({
        progression: updatedProgression,
        loadingProgression: false,
      });
      
      return { success: true, data: updatedProgression };
      
    } catch (error) {
      updateState({ loadingProgression: false });
      return handleError(error, t('error_updating_progression'));
    }
  }, [isAuthenticated, token, t, updateState, handleError]);

  /**
   * Marque une technique comme complétée
   * 
   * @param techniqueId - ID de la technique
   */
  const completeTechnique = useCallback(async (techniqueId: string) => {
    if (!isAuthenticated || !token) {
      showErrorMessage(t('login_required'));
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      updateState({ loadingProgression: true });
      
      const result = await TechniquesAPI.completeTechnique(techniqueId, token);
      
      // Recharger la progression
      await loadProgression(techniqueId);
      
      updateState({ loadingProgression: false });
      
      showSuccessMessage(t('technique_completed'));
      
      return { success: true, data: result };
      
    } catch (error) {
      updateState({ loadingProgression: false });
      return handleError(error, t('error_completing_technique'));
    }
  }, [isAuthenticated, token, t, updateState, handleError, loadProgression]);

  // ============================================
  // FAVORIS
  // ============================================

  /**
   * Charge les favoris de l'utilisateur
   * 
   * @param page - Numéro de page
   */
  const loadFavoris = useCallback(async (page: number = 1) => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      updateState({ loadingFavoris: true, error: null });
      
      const response = await TechniquesAPI.getFavorisTechniques(token, page);
      
      updateState({
        favoris: page === 1 ? response.data.techniques : [...state.favoris, ...response.data.techniques],
        loadingFavoris: false,
      });
      
      return { success: true, data: response };
      
    } catch (error) {
      updateState({ loadingFavoris: false });
      return handleError(error, t('error_loading_favorites'));
    }
  }, [isAuthenticated, token, t, state.favoris, updateState, handleError]);

  /**
   * Ajoute une technique aux favoris
   * 
   * @param techniqueId - ID de la technique
   */
  const addFavori = useCallback(async (techniqueId: string) => {
    if (!isAuthenticated || !token) {
      showErrorMessage(t('login_required'));
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      await TechniquesAPI.addFavoriTechnique(techniqueId, token);
      
      // Mettre à jour l'état local
      const techniqueToAdd = state.techniques.find(t => t.id === techniqueId) ||
                            state.techniquesRecommandees.find(t => t.id === techniqueId) ||
                            state.techniqueDetail;
      
      if (techniqueToAdd && !state.favoris.find(f => f.id === techniqueId)) {
        updateState({
          favoris: [...state.favoris, { ...techniqueToAdd, estFavori: true }],
        });
      }
      
      // Mettre à jour estFavori dans les listes
      const updateFavoriStatus = (list: TechniqueAgricole[]) =>
        list.map(t => t.id === techniqueId ? { ...t, estFavori: true } : t);
      
      updateState({
        techniques: updateFavoriStatus(state.techniques),
        techniquesRecommandees: updateFavoriStatus(state.techniquesRecommandees),
        techniqueDetail: state.techniqueDetail?.id === techniqueId
          ? { ...state.techniqueDetail, estFavori: true }
          : state.techniqueDetail,
      });
      
      showSuccessMessage(t('added_to_favorites'));
      return { success: true };
      
    } catch (error) {
      showErrorMessage(t('error_adding_favorite'));
      return handleError(error, t('error_adding_favorite'));
    }
  }, [isAuthenticated, token, t, state, updateState, handleError]);

  /**
   * Supprime une technique des favoris
   * 
   * @param techniqueId - ID de la technique
   */
  const removeFavori = useCallback(async (techniqueId: string) => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      await TechniquesAPI.removeFavoriTechnique(techniqueId, token);
      
      updateState({
        favoris: state.favoris.filter(f => f.id !== techniqueId),
      });
      
      const updateFavoriStatus = (list: TechniqueAgricole[]) =>
        list.map(t => t.id === techniqueId ? { ...t, estFavori: false } : t);
      
      updateState({
        techniques: updateFavoriStatus(state.techniques),
        techniquesRecommandees: updateFavoriStatus(state.techniquesRecommandees),
        techniqueDetail: state.techniqueDetail?.id === techniqueId
          ? { ...state.techniqueDetail, estFavori: false }
          : state.techniqueDetail,
      });
      
      showSuccessMessage(t('removed_from_favorites'));
      return { success: true };
      
    } catch (error) {
      showErrorMessage(t('error_removing_favorite'));
      return handleError(error, t('error_removing_favorite'));
    }
  }, [isAuthenticated, token, t, state, updateState, handleError]);

  /**
   * Vérifie si une technique est dans les favoris
   * 
   * @param techniqueId - ID de la technique
   */
  const isFavori = useCallback((techniqueId: string): boolean => {
    return state.favoris.some(f => f.id === techniqueId);
  }, [state.favoris]);

  // ============================================
  // AVIS ET ÉVALUATIONS
  // ============================================

  /**
   * Charge les avis pour une technique
   * 
   * @param techniqueId - ID de la technique
   * @param page - Numéro de page
   */
  const loadAvis = useCallback(async (techniqueId: string, page: number = 1) => {
    try {
      updateState({ loadingAvis: true });
      
      const response = await TechniquesAPI.getAvisTechnique(techniqueId, page);
      
      updateState({
        avis: response.data.avis,
        noteMoyenne: response.data.moyenne,
        repartitionNotes: response.data.repartition,
        loadingAvis: false,
      });
      
      return { success: true, data: response };
      
    } catch (error) {
      updateState({ loadingAvis: false });
      return handleError(error, t('error_loading_reviews'));
    }
  }, [t, updateState, handleError]);

  /**
   * Ajoute un avis sur une technique
   * 
   * @param techniqueId - ID de la technique
   * @param avis - Données de l'avis
   */
  const addAvis = useCallback(async (techniqueId: string, avis: SubmitAvisData) => {
    if (!isAuthenticated || !token) {
      showErrorMessage(t('login_required'));
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      updateState({ loadingAvis: true });
      
      const newAvis = await TechniquesAPI.addAvisTechnique(techniqueId, avis, token);
      
      // Recharger les avis
      await loadAvis(techniqueId);
      
      updateState({ loadingAvis: false });
      
      showSuccessMessage(t('review_submitted'));
      return { success: true, data: newAvis };
      
    } catch (error) {
      updateState({ loadingAvis: false });
      return handleError(error, t('error_submitting_review'));
    }
  }, [isAuthenticated, token, t, updateState, handleError, loadAvis]);

  // ============================================
  // STATISTIQUES
  // ============================================

  /**
   * Charge les statistiques de l'utilisateur
   */
  const loadStats = useCallback(async () => {
    if (!isAuthenticated || !token) {
      return null;
    }
    
    try {
      const stats = await TechniquesAPI.getTechniquesStats(token);
      
      updateState({ stats });
      
      return stats;
      
    } catch (error) {
      console.error('[useTechniques] Erreur chargement stats:', error);
      return null;
    }
  }, [isAuthenticated, token, updateState]);

  // ============================================
  // CERTIFICATS
  // ============================================

  /**
   * Télécharge le certificat pour une technique complétée
   * 
   * @param techniqueId - ID de la technique
   */
  const downloadCertificat = useCallback(async (techniqueId: string) => {
    if (!isAuthenticated || !token) {
      showErrorMessage(t('login_required'));
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      const pdfUrl = await TechniquesAPI.downloadCertificat(techniqueId, token);
      
      // Ouvrir le PDF (à implémenter avec une librairie)
      // await openPDF(pdfUrl);
      
      showSuccessMessage(t('certificate_downloaded'));
      return { success: true, url: pdfUrl };
      
    } catch (error) {
      return handleError(error, t('error_downloading_certificate'));
    }
  }, [isAuthenticated, token, t, handleError]);

  // ============================================
  // RECHERCHE ET FILTRES
  // ============================================

  /**
   * Recherche avancée de techniques
   * 
   * @param searchTerm - Terme de recherche
   * @param filters - Filtres supplémentaires
   */
  const searchTechniques = useCallback(async (searchTerm: string, filters?: TechniqueSearchParams) => {
    if (!searchTerm.trim()) {
      return { success: false, error: 'Terme de recherche vide' };
    }
    
    try {
      updateState({ loading: true, error: null });
      
      const searchFilters: TechniqueSearchParams = {
        search: searchTerm,
        page: 1,
        limit: 30,
        ...filters,
      };
      
      const response = await TechniquesAPI.getTechniques(
        searchFilters,
        isAuthenticated && token ? token : undefined
      );
      
      updateState({
        techniques: response.techniques,
        pagination: response.pagination,
        loading: false,
      });
      
      return { success: true, data: response };
      
    } catch (error) {
      return handleError(error, t('error_searching'));
    }
  }, [isAuthenticated, token, t, updateState, handleError]);

  /**
   * Met à jour les filtres et recharge les techniques
   * 
   * @param newFilters - Nouveaux filtres
   * @param resetPage - Réinitialiser la page
   */
  const setFilters = useCallback(async (newFilters: Partial<TechniqueSearchParams>, resetPage: boolean = true) => {
    const updatedFilters = {
      ...state.filters,
      ...newFilters,
      ...(resetPage && { page: 1 }),
    };
    
    updateState({ filters: updatedFilters });
    
    return await loadTechniques({ reset: resetPage, tempFilters: updatedFilters });
  }, [state.filters, loadTechniques, updateState]);

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = useCallback(async () => {
    const defaultFilters: TechniqueSearchParams = {
      page: 1,
      limit: 20,
      sortBy: 'date',
      sortOrder: 'desc',
    };
    
    updateState({ filters: defaultFilters });
    
    return await loadTechniques({ reset: true, tempFilters: defaultFilters });
  }, [loadTechniques, updateState]);

  // ============================================
  // PULL TO REFRESH
  // ============================================

  /**
   * Rafraîchit toutes les données
   */
  const onRefresh = useCallback(async () => {
    updateState({ refreshing: true });
    
    try {
      await loadTechniques({ reset: true });
      
      if (isAuthenticated) {
        await loadTechniquesRecommandees();
        await loadFavoris();
        await loadStats();
      }
      
      updateState({ refreshing: false });
    } catch (error) {
      updateState({ refreshing: false });
    }
  }, [isAuthenticated, loadTechniques, loadTechniquesRecommandees, loadFavoris, loadStats, updateState]);

  // ============================================
  // CHARGEMENT AUTOMATIQUE
  // ============================================

  // Chargement initial
  useEffect(() => {
    loadTechniques({ reset: true });
  }, []);

  // Chargement des données personnalisées si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      loadTechniquesRecommandees();
      loadFavoris();
      loadStats();
    }
  }, [isAuthenticated]);

  // ============================================
  // RETOUR DU HOOK
  // ============================================

  return {
    // État
    techniques: state.techniques,
    techniquesRecommandees: state.techniquesRecommandees,
    techniqueDetail: state.techniqueDetail,
    favoris: state.favoris,
    progression: state.progression,
    avis: state.avis,
    stats: state.stats,
    loading: state.loading,
    loadingFavoris: state.loadingFavoris,
    loadingDetail: state.loadingDetail,
    loadingProgression: state.loadingProgression,
    loadingAvis: state.loadingAvis,
    refreshing: state.refreshing,
    error: state.error,
    pagination: state.pagination,
    filters: state.filters,
    noteMoyenne: state.noteMoyenne,
    repartitionNotes: state.repartitionNotes,
    
    // Actions principales
    loadTechniques,
    loadMore,
    loadTechniqueDetail,
    loadTechniquesRecommandees,
    
    // Progression
    loadProgression,
    updateProgression,
    completeTechnique,
    
    // Favoris
    loadFavoris,
    addFavori,
    removeFavori,
    isFavori,
    
    // Avis
    loadAvis,
    addAvis,
    
    // Statistiques
    loadStats,
    
    // Certificats
    downloadCertificat,
    
    // Recherche et filtres
    searchTechniques,
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

export default useTechniques;