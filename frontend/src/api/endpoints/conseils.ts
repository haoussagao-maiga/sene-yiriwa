/**
 * Endpoints des conseils agricoles - Sènè Yiriwa
 * 
 * Ce fichier contient toutes les fonctions d'appel API liées à la gestion
 * des conseils agricoles personnalisés pour les agriculteurs maliens.
 * 
 * Fonctionnalités :
 * - Récupération des conseils personnalisés (basés sur culture, localisation, météo)
 * - Gestion des favoris
 * - Recherche et filtrage avancés
 * - Calendrier cultural (semis, traitement, récolte)
 * - Gestion des alertes et notifications liées aux conseils
 * 
 * @module api/endpoints/conseils
 */

import { apiClient } from '../clients';
import { API_CONFIG } from '../../config/api.config';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour un conseil agricole
 */
export interface Conseil {
  id: string;
  titre: string;
  description: string;
  contenu: string;          // Contenu détaillé en HTML ou markdown
  resume: string;           // Version courte pour les cartes
  categorie: CategorieConseil;
  sousCategorie?: string;
  
  // Ciblage du conseil
  cultureCiblee?: CultureType[];
  regionCiblee?: string[];   // Régions du Mali (Sikasso, Koulikoro, etc.)
  saisonCiblee?: Saison[];
  
  // Période de validité
  periodeDebut?: Date;
  periodeFin?: Date;
  momentIdeal?: MomentSaison;
  
  // Métadonnées
  auteur: {
    id: string;
    nom: string;
    prenom: string;
    specialite?: string;
  };
  datePublication: Date;
  dateMiseAJour: Date;
  
  // Statistiques
  vues: number;
  favoris: number;
  partages: number;
  
  // Statut
  statut: 'brouillon' | 'soumis' | 'valide' | 'publie' | 'archive';
  estUrgent: boolean;
  estFavori?: boolean;      // Pour l'utilisateur connecté
  estCertifie?: boolean;    // Conseil certifié par des experts
  
  // Médias
  imagePrincipale?: string;
  images?: string[];
  video?: string;
  
  // Tags pour recherche
  tags: string[];
  
  // Conseils pratiques
  conseilPratique?: {
    materiel?: string[];
    duree?: string;
    difficulte?: 'facile' | 'moyen' | 'difficile';
    cout?: 'faible' | 'moyen' | 'eleve';
  };
}

/**
 * Catégories de conseils agricoles
 */
export type CategorieConseil = 
  | 'semis'
  | 'irrigation'
  | 'fertilisation'
  | 'lutte_parasitaire'
  | 'recolte'
  | 'stockage'
  | 'commercialisation'
  | 'climat'
  | 'sol'
  | 'general';

/**
 * Types de cultures au Mali
 */
export type CultureType = 
  | 'mil'
  | 'sorgho'
  | 'mais'
  | 'riz'
  | 'coton'
  | 'arachide'
  | 'niebe'
  | 'sésame'
  | 'manioc'
  | 'igname';

/**
 * Saisons agricoles
 */
export type Saison = 
  | 'hivernage'      // Juin à Septembre
  | 'contre_saison'  // Octobre à Décembre
  | 'sèche'          // Janvier à Mai
  | 'toute_annee';

/**
 * Moment dans la saison
 */
export type MomentSaison = 
  | 'debut'
  | 'plein'
  | 'fin'
  | 'avant_semis'
  | 'apres_recolte';

/**
 * Paramètres de recherche des conseils
 */
export interface ConseilSearchParams {
  // Recherche textuelle
  search?: string;
  tags?: string[];
  
  // Filtres
  categories?: CategorieConseil[];
  cultures?: CultureType[];
  region?: string;
  saison?: Saison;
  estUrgent?: boolean;
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Tri
  sortBy?: 'date' | 'vues' | 'favoris' | 'pertinence';
  sortOrder?: 'asc' | 'desc';
  
  // Personnalisation (basée sur profil agriculteur)
  personnalise?: boolean;
}

/**
 * Réponse paginée pour les listes de conseils
 */
export interface ConseilsPaginatedResponse {
  success: boolean;
  data: {
    conseils: Conseil[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters?: {
      categoriesDisponibles: CategorieConseil[];
      culturesDisponibles: CultureType[];
    };
  };
}

/**
 * Calendrier cultural - Périodes importantes par culture
 */
export interface CalendrierCultural {
  culture: CultureType;
  region: string;
  annee: number;
  periodes: {
    semis: {
      debut: Date;
      fin: Date;
      conseils?: string[];
      estPeriodeIdeal?: boolean;
    };
    traitement: {
      debut: Date;
      fin: Date;
      traitements?: Traitement[];
      conseils?: string[];
    };
    recolte: {
      debut: Date;
      fin: Date;
      conseils?: string[];
      rendementPrevisionnel?: string;
    };
  };
  meteoPrevision?: {
    pluiesAttendues: number;
    temperatureMoyenne: number;
    risques: string[];
  };
}

/**
 * Traitements pour les cultures
 */
export interface Traitement {
  type: 'insecticide' | 'fongicide' | 'herbicide' | 'engrais';
  nom: string;
  periode: {
    debut: Date;
    fin: Date;
  };
  dosage: string;
  precautions: string[];
}

/**
 * Alerte agricole
 */
export interface AlerteAgricole {
  id: string;
  titre: string;
  message: string;
  niveau: 'info' | 'warning' | 'critical';
  type: 'climat' | 'parasites' | 'maladies' | 'conseil_urgence';
  regions: string[];
  cultures: CultureType[];
  dateDebut: Date;
  dateFin: Date;
  conseilsAssocies?: string[];
  vu: boolean;              // Pour l'utilisateur connecté
}

/**
 * Statistiques des conseils pour un agriculteur
 */
export interface ConseilsStats {
  totalConsultes: number;
  totalFavoris: number;
  dernierConseil: Date;
  categoriesPopulaires: {
    categorie: CategorieConseil;
    nombre: number;
  }[];
  culturesSuivies: {
    culture: CultureType;
    conseilsConsulte: number;
  }[];
  recommandations: {
    baséSur: string;
    conseilId: string;
    titre: string;
    score: number;
  }[];
}

/**
 * Feedback utilisateur sur un conseil
 */
export interface ConseilFeedback {
  conseilId: string;
  utile: boolean;
  commentaire?: string;
  dateCreation: Date;
}

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Récupère la liste des conseils avec filtres
 * 
 * @param params - Paramètres de recherche et filtres
 * @param token - Token JWT (optionnel pour conseils personnalisés)
 * @returns Promise avec la liste paginée des conseils
 * 
 * @example
 * // Récupérer les conseils pour la culture du maïs en région Sikasso
 * const result = await getConseils({
 *   cultures: ['mais'],
 *   region: 'Sikasso',
 *   page: 1,
 *   limit: 20,
 *   personnalise: true
 * }, authToken);
 */
export const getConseils = async (
  params: ConseilSearchParams = {},
  token?: string
): Promise<ConseilsPaginatedResponse> => {
  try {
    // Construction de la requête avec les paramètres
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.tags?.length) queryParams.append('tags', params.tags.join(','));
    if (params.categories?.length) queryParams.append('categories', params.categories.join(','));
    if (params.cultures?.length) queryParams.append('cultures', params.cultures.join(','));
    if (params.region) queryParams.append('region', params.region);
    if (params.saison) queryParams.append('saison', params.saison);
    if (params.estUrgent !== undefined) queryParams.append('estUrgent', String(params.estUrgent));
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.personnalise !== undefined) queryParams.append('personnalise', String(params.personnalise));
    
    const url = `${API_CONFIG.ENDPOINTS.CONSEILS.LIST}?${queryParams.toString()}`;
    
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await apiClient.get<ConseilsPaginatedResponse>(url, { headers });
    
    if (__DEV__) {
      console.log(`✅ [Conseils] ${response.data.conseils.length} conseils récupérés`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ [Conseils] Erreur récupération conseils:', error);
    throw error;
  }
};

/**
 * Récupère les conseils personnalisés pour un agriculteur
 * Basé sur son profil (culture, localisation, historique)
 * 
 * @param token - Token JWT de l'agriculteur
 * @param limit - Nombre de conseils à récupérer (défaut: 10)
 * @returns Promise avec la liste des conseils personnalisés
 * 
 * @example
 * const recommandations = await getConseilsPersonnalises(authToken, 15);
 */
export const getConseilsPersonnalises = async (
  token: string,
  limit: number = 10
): Promise<Conseil[]> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: { conseils: Conseil[]; raisonnement?: string[] };
    }>(API_CONFIG.ENDPOINTS.CONSEILS.PERSONNALISES, {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit },
    });
    
    if (__DEV__) {
      console.log(`✅ [Conseils] ${response.data.conseils.length} conseils personnalisés générés`);
      if (response.data.raisonnement) {
        console.log('📝 [Conseils] Raisonnement:', response.data.raisonnement);
      }
    }
    
    return response.data.conseils;
  } catch (error) {
    console.error('❌ [Conseils] Erreur récupération conseils personnalisés:', error);
    throw error;
  }
};

/**
 * Récupère les détails d'un conseil spécifique
 * Incrémente automatiquement le compteur de vues
 * 
 * @param conseilId - ID du conseil
 * @param token - Token JWT (optionnel pour marquer comme lu)
 * @returns Promise avec les détails complets du conseil
 * 
 * @example
 * const conseil = await getConseilDetails('c12345', authToken);
 * console.log(conseil.titre, conseil.contenu);
 */
export const getConseilDetails = async (
  conseilId: string,
  token?: string
): Promise<Conseil> => {
  try {
    const url = API_CONFIG.ENDPOINTS.CONSEILS.DETAIL(conseilId);
    
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await apiClient.get<{ success: boolean; data: Conseil }>(url, { headers });
    
    if (__DEV__) {
      console.log(`✅ [Conseils] Détails du conseil ${conseilId} récupérés`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`❌ [Conseils] Erreur récupération conseil ${conseilId}:`, error);
    throw error;
  }
};

/**
 * Récupère les conseils urgents (alertes)
 * 
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec la liste des conseils urgents
 * 
 * @example
 * const alertes = await getConseilsUrgents(authToken);
 * // Afficher les alertes en priorité
 */
export const getConseilsUrgents = async (token: string): Promise<Conseil[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Conseil[] }>(
      API_CONFIG.ENDPOINTS.CONSEILS.URGENTS,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (__DEV__) {
      console.log(`⚠️ [Conseils] ${response.data.length} conseils urgents récupérés`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Conseils] Erreur récupération conseils urgents:', error);
    throw error;
  }
};

/**
 * Récupère les conseils pour une culture spécifique
 * 
 * @param culture - Type de culture
 * @param token - Token JWT (optionnel)
 * @param options - Options supplémentaires (page, limit, etc.)
 * @returns Promise avec la liste paginée des conseils
 * 
 * @example
 * const conseilsMais = await getConseilsParCulture('mais', authToken, {
 *   page: 1,
 *   limit: 20,
 *   sortBy: 'date'
 * });
 */
export const getConseilsParCulture = async (
  culture: CultureType,
  token?: string,
  options?: { page?: number; limit?: number; sortBy?: ConseilSearchParams['sortBy'] }
): Promise<ConseilsPaginatedResponse> => {
  try {
    const params: ConseilSearchParams = {
      cultures: [culture],
      page: options?.page || 1,
      limit: options?.limit || 20,
      sortBy: options?.sortBy || 'date',
    };
    
    return await getConseils(params, token);
  } catch (error) {
    console.error(`❌ [Conseils] Erreur récupération conseils pour ${culture}:`, error);
    throw error;
  }
};

/**
 * Récupère les conseils par catégorie
 * 
 * @param categorie - Catégorie de conseil
 * @param token - Token JWT (optionnel)
 * @param page - Numéro de page
 * @returns Promise avec la liste paginée des conseils
 * 
 * @example
 * const fertilisation = await getConseilsParCategorie('fertilisation', authToken, 1);
 */
export const getConseilsParCategorie = async (
  categorie: CategorieConseil,
  token?: string,
  page: number = 1
): Promise<ConseilsPaginatedResponse> => {
  try {
    const params: ConseilSearchParams = {
      categories: [categorie],
      page,
      limit: 20,
    };
    
    return await getConseils(params, token);
  } catch (error) {
    console.error(`❌ [Conseils] Erreur récupération conseils catégorie ${categorie}:`, error);
    throw error;
  }
};

/**
 * Recherche avancée de conseils
 * 
 * @param searchTerm - Terme de recherche
 * @param token - Token JWT (optionnel)
 * @returns Promise avec les résultats de recherche
 * 
 * @example
 * const results = await searchConseils('irrigation goutte à goutte', authToken);
 */
export const searchConseils = async (
  searchTerm: string,
  token?: string
): Promise<ConseilsPaginatedResponse> => {
  try {
    const params: ConseilSearchParams = {
      search: searchTerm,
      page: 1,
      limit: 30,
      sortBy: 'pertinence',
    };
    
    return await getConseils(params, token);
  } catch (error) {
    console.error(`❌ [Conseils] Erreur recherche "${searchTerm}":`, error);
    throw error;
  }
};

// ============================================
// GESTION DES FAVORIS
// ============================================

/**
 * Ajoute un conseil aux favoris
 * 
 * @param conseilId - ID du conseil à ajouter
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec confirmation
 * 
 * @example
 * await addFavori('c12345', authToken);
 */
export const addFavori = async (
  conseilId: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.CONSEILS.FAVORIS,
      { conseilId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] Conseil ${conseilId} ajouté aux favoris`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ [Conseils] Erreur ajout favori ${conseilId}:`, error);
    throw error;
  }
};

/**
 * Supprime un conseil des favoris
 * 
 * @param conseilId - ID du conseil à supprimer
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec confirmation
 * 
 * @example
 * await removeFavori('c12345', authToken);
 */
export const removeFavori = async (
  conseilId: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `${API_CONFIG.ENDPOINTS.CONSEILS.FAVORIS}/${conseilId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] Conseil ${conseilId} retiré des favoris`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ [Conseils] Erreur suppression favori ${conseilId}:`, error);
    throw error;
  }
};

/**
 * Récupère les conseils favoris de l'utilisateur
 * 
 * @param token - Token JWT de l'utilisateur
 * @param page - Numéro de page
 * @returns Promise avec la liste des favoris
 * 
 * @example
 * const mesFavoris = await getFavoris(authToken, 1);
 */
export const getFavoris = async (
  token: string,
  page: number = 1
): Promise<ConseilsPaginatedResponse> => {
  try {
    const response = await apiClient.get<ConseilsPaginatedResponse>(
      API_CONFIG.ENDPOINTS.CONSEILS.FAVORIS,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 20 },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] ${response.data.conseils.length} favoris récupérés`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ [Conseils] Erreur récupération favoris:', error);
    throw error;
  }
};

// ============================================
// CALENDRIER CULTURAL
// ============================================

/**
 * Récupère le calendrier cultural pour une culture et région
 * 
 * @param culture - Type de culture
 * @param region - Région du Mali
 * @param annee - Année (optionnelle, défaut: année courante)
 * @returns Promise avec le calendrier cultural
 * 
 * @example
 * const calendrier = await getCalendrierCultural('mais', 'Sikasso', 2025);
 * console.log(`Période de semis: ${calendrier.periodes.semis.debut} - ${calendrier.periodes.semis.fin}`);
 */
export const getCalendrierCultural = async (
  culture: CultureType,
  region: string,
  annee?: number
): Promise<CalendrierCultural> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: CalendrierCultural }>(
      API_CONFIG.ENDPOINTS.CONSEILS.CALENDRIER_CULTURAL,
      {
        params: {
          culture,
          region,
          annee: annee || new Date().getFullYear(),
        },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] Calendrier cultural pour ${culture} (${region}) récupéré`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`❌ [Conseils] Erreur récupération calendrier pour ${culture}:`, error);
    throw error;
  }
};

/**
 * Récupère le calendrier cultural pour plusieurs cultures
 * 
 * @param cultures - Liste des cultures
 * @param region - Région du Mali
 * @param annee - Année
 * @returns Promise avec les calendriers
 * 
 * @example
 * const calendriers = await getCalendrierMultiCultures(['mais', 'mil'], 'Koulikoro');
 */
export const getCalendrierMultiCultures = async (
  cultures: CultureType[],
  region: string,
  annee?: number
): Promise<CalendrierCultural[]> => {
  try {
    const promises = cultures.map(culture => 
      getCalendrierCultural(culture, region, annee)
    );
    
    const results = await Promise.all(promises);
    
    if (__DEV__) {
      console.log(`✅ [Conseils] ${results.length} calendriers culturels récupérés`);
    }
    
    return results;
  } catch (error) {
    console.error('❌ [Conseils] Erreur récupération calendriers multi-cultures:', error);
    throw error;
  }
};

// ============================================
// ALERTES AGRICOLES
// ============================================

/**
 * Récupère les alertes agricoles actives
 * 
 * @param token - Token JWT de l'utilisateur
 * @param region - Région spécifique (optionnelle)
 * @returns Promise avec la liste des alertes
 * 
 * @example
 * const alertes = await getAlertesAgricoles(authToken, 'Sikasso');
 * alertes.forEach(alerte => {
 *   if (alerte.niveau === 'critical') {
 *     showCriticalAlert(alerte);
 *   }
 * });
 */
export const getAlertesAgricoles = async (
  token: string,
  region?: string
): Promise<AlerteAgricole[]> => {
  try {
    const params: any = {};
    if (region) params.region = region;
    
    const response = await apiClient.get<{ success: boolean; data: AlerteAgricole[] }>(
      API_CONFIG.ENDPOINTS.CONSEILS.ALERTES,
      {
        headers: { Authorization: `Bearer ${token}` },
        params,
      }
    );
    
    if (__DEV__) {
      const alertesCritiques = response.data.filter(a => a.niveau === 'critical').length;
      console.log(`⚠️ [Conseils] ${response.data.length} alertes récupérées (${alertesCritiques} critiques)`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Conseils] Erreur récupération alertes:', error);
    throw error;
  }
};

/**
 * Marque une alerte comme lue
 * 
 * @param alerteId - ID de l'alerte
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec confirmation
 * 
 * @example
 * await markAlerteAsRead('a12345', authToken);
 */
export const markAlerteAsRead = async (
  alerteId: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `${API_CONFIG.ENDPOINTS.CONSEILS.ALERTES}/${alerteId}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] Alerte ${alerteId} marquée comme lue`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ [Conseils] Erreur marquage alerte ${alerteId}:`, error);
    throw error;
  }
};

// ============================================
// STATISTIQUES ET FEEDBACK
// ============================================

/**
 * Récupère les statistiques des conseils pour l'utilisateur
 * 
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec les statistiques
 * 
 * @example
 * const stats = await getConseilsStats(authToken);
 * console.log(`Vous avez consulté ${stats.totalConsultes} conseils`);
 */
export const getConseilsStats = async (token: string): Promise<ConseilsStats> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: ConseilsStats }>(
      API_CONFIG.ENDPOINTS.CONSEILS.STATS,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] Statistiques utilisateur récupérées`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Conseils] Erreur récupération statistiques:', error);
    throw error;
  }
};

/**
 * Envoie un feedback sur un conseil
 * 
 * @param feedback - Feedback utilisateur
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec confirmation
 * 
 * @example
 * await sendConseilFeedback({
 *   conseilId: 'c12345',
 *   utile: true,
 *   commentaire: 'Très utile pour mon champ de maïs'
 * }, authToken);
 */
export const sendConseilFeedback = async (
  feedback: ConseilFeedback,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `${API_CONFIG.ENDPOINTS.CONSEILS.DETAIL(feedback.conseilId)}/feedback`,
      {
        utile: feedback.utile,
        commentaire: feedback.commentaire,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] Feedback envoyé pour conseil ${feedback.conseilId}`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ [Conseils] Erreur envoi feedback pour ${feedback.conseilId}:`, error);
    throw error;
  }
};

// ============================================
// CONSEILS SIMILAIRES ET RECOMMANDATIONS
// ============================================

/**
 * Récupère des conseils similaires à un conseil donné
 * 
 * @param conseilId - ID du conseil de référence
 * @param token - Token JWT (optionnel)
 * @param limit - Nombre de conseils à récupérer
 * @returns Promise avec la liste des conseils similaires
 * 
 * @example
 * const similaires = await getConseilsSimilaires('c12345', authToken, 5);
 */
export const getConseilsSimilaires = async (
  conseilId: string,
  token?: string,
  limit: number = 5
): Promise<Conseil[]> => {
  try {
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    
    const response = await apiClient.get<{ success: boolean; data: Conseil[] }>(
      `${API_CONFIG.ENDPOINTS.CONSEILS.DETAIL(conseilId)}/similaires`,
      {
        headers,
        params: { limit },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] ${response.data.length} conseils similaires à ${conseilId}`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`❌ [Conseils] Erreur récupération conseils similaires pour ${conseilId}:`, error);
    throw error;
  }
};

/**
 * Récupère les recommandations basées sur l'historique de consultation
 * 
 * @param token - Token JWT de l'utilisateur
 * @param limit - Nombre de recommandations
 * @returns Promise avec la liste des conseils recommandés
 * 
 * @example
 * const recommandations = await getRecommandationsHistorique(authToken, 10);
 */
export const getRecommandationsHistorique = async (
  token: string,
  limit: number = 10
): Promise<Conseil[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Conseil[] }>(
      API_CONFIG.ENDPOINTS.CONSEILS.RECOMMANDATIONS,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit, type: 'historique' },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] ${response.data.length} recommandations basées sur historique`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Conseils] Erreur récupération recommandations historique:', error);
    throw error;
  }
};

// ============================================
// FONCTIONS POUR EXPERTS (CRUD)
// ============================================

/**
 * Crée un nouveau conseil (expert seulement)
 * 
 * @param data - Données du conseil à créer
 * @param token - Token JWT de l'expert
 * @returns Promise avec le conseil créé
 * 
 * @example
 * const nouveauConseil = await createConseil({
 *   titre: 'Technique d\'irrigation goutte à goutte',
 *   description: 'Apprenez à installer un système d\'irrigation efficace',
 *   contenu: '# Irrigation...',
 *   categorie: 'irrigation',
 *   cultureCiblee: ['mais', 'riz']
 * }, expertToken);
 */
export const createConseil = async (
  data: Partial<Conseil>,
  token: string
): Promise<Conseil> => {
  try {
    const response = await apiClient.post<{ success: boolean; data: Conseil }>(
      API_CONFIG.ENDPOINTS.CONSEILS.LIST,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] Nouveau conseil créé: ${response.data.titre}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Conseils] Erreur création conseil:', error);
    throw error;
  }
};

/**
 * Met à jour un conseil existant (expert seulement)
 * 
 * @param conseilId - ID du conseil à modifier
 * @param data - Données à mettre à jour
 * @param token - Token JWT de l'expert
 * @returns Promise avec le conseil mis à jour
 * 
 * @example
 * const updated = await updateConseil('c12345', {
 *   titre: 'Nouveau titre',
 *   contenu: 'Contenu mis à jour...'
 * }, expertToken);
 */
export const updateConseil = async (
  conseilId: string,
  data: Partial<Conseil>,
  token: string
): Promise<Conseil> => {
  try {
    const response = await apiClient.put<{ success: boolean; data: Conseil }>(
      API_CONFIG.ENDPOINTS.CONSEILS.DETAIL(conseilId),
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] Conseil ${conseilId} mis à jour`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`❌ [Conseils] Erreur mise à jour conseil ${conseilId}:`, error);
    throw error;
  }
};

/**
 * Supprime un conseil (expert/administrateur seulement)
 * 
 * @param conseilId - ID du conseil à supprimer
 * @param token - Token JWT
 * @returns Promise avec confirmation
 * 
 * @example
 * await deleteConseil('c12345', adminToken);
 */
export const deleteConseil = async (
  conseilId: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.CONSEILS.DETAIL(conseilId),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Conseils] Conseil ${conseilId} supprimé`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ [Conseils] Erreur suppression conseil ${conseilId}:`, error);
    throw error;
  }
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

/**
 * Exporte toutes les fonctions sous un namespace pour une utilisation plus propre
 * 
 * @example
 * import ConseilsAPI from './endpoints/conseils';
 * 
 * const conseils = await ConseilsAPI.getConseils({ cultures: ['mais'] });
 */
export default {
  // Lecture
  getConseils,
  getConseilsPersonnalises,
  getConseilDetails,
  getConseilsUrgents,
  getConseilsParCulture,
  getConseilsParCategorie,
  searchConseils,
  
  // Favoris
  addFavori,
  removeFavori,
  getFavoris,
  
  // Calendrier
  getCalendrierCultural,
  getCalendrierMultiCultures,
  
  // Alertes
  getAlertesAgricoles,
  markAlerteAsRead,
  
  // Stats & Feedback
  getConseilsStats,
  sendConseilFeedback,
  
  // Recommandations
  getConseilsSimilaires,
  getRecommandationsHistorique,
  
  // CRUD (Experts)
  createConseil,
  updateConseil,
  deleteConseil,
};