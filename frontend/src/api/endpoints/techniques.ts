/**
 * Endpoints des techniques agricoles - Sènè Yiriwa
 * 
 * Ce fichier contient toutes les fonctions d'appel API liées à la vulgarisation
 * et aux techniques agricoles modernes pour les agriculteurs maliens.
 * 
 * Fonctionnalités :
 * - Gestion des techniques agricoles (CRUD complet)
 * - Tutoriels vidéo et articles éducatifs
 * - Pas à pas illustrés pour chaque technique
 * - Système de progression et de complétion
 * - Favoris et historique de consultation
 * - Évaluations et commentaires
 * - Catégorisation par culture et par type de technique
 * 
 * @module api/endpoints/techniques
 */

import { apiClient } from '../clients';
import { API_CONFIG } from '../../config/api.config';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour une technique agricole
 */
export interface TechniqueAgricole {
  id: string;
  titre: string;
  sousTitre?: string;
  description: string;
  contenu: string;              // Contenu détaillé en HTML/markdown
  resume: string;               // Version courte pour les cartes
  
  // Classification
  categorie: CategorieTechnique;
  sousCategorie?: string;
  niveau: 'debutant' | 'intermediaire' | 'avance';
  
  // Ciblage
  culturesCiblees: CultureType[];
  regionsCiblees?: string[];    // Régions du Mali
  
  // Durée et difficulté
  dureeEstimee: number;         // En minutes
  difficulte: 'facile' | 'moyen' | 'difficile';
  coutEstime: 'faible' | 'moyen' | 'eleve';
  
  // Contenu multimédia
  imagePrincipale: string;
  images: string[];
  videoUrl?: string;
  videoDuree?: number;          // En secondes
  
  // Pas à pas
  etapes: EtapeTechnique[];
  materielRequis: MaterielRequis[];
  precautions: string[];
  
  // Métadonnées
  auteur: {
    id: string;
    nom: string;
    prenom: string;
    titre?: string;
    avatar?: string;
  };
  datePublication: Date;
  dateMiseAJour: Date;
  
  // Statistiques
  vues: number;
  favoris: number;
  completions: number;          // Nombre d'agriculteurs ayant complété
  noteMoyenne: number;          // Note sur 5
  avisCount: number;
  
  // Statut
  statut: 'brouillon' | 'publie' | 'archive';
  certifie: boolean;            // Technique certifiée par expert
  
  // Pour utilisateur connecté
  estFavori?: boolean;
  estComplete?: boolean;
  progression?: number;         // Progression en %
  
  // Tags pour recherche
  tags: string[];
  motsCles: string[];
}

/**
 * Catégories de techniques agricoles
 */
export type CategorieTechnique = 
  | 'preparation_sol'
  | 'semis'
  | 'irrigation'
  | 'fertilisation'
  | 'lutte_parasitaire'
  | 'traitement_maladies'
  | 'recolte'
  | 'post_recolte'
  | 'stockage'
  | 'transformation'
  | 'commercialisation'
  | 'gestion_exploitation'
  | 'agroecologie'
  | 'agriculture_intelligente';

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
  | 'igname'
  | 'oignon'
  | 'tomate'
  | 'gombo'
  | 'aubergine';

/**
 * Étape d'une technique (pas à pas)
 */
export interface EtapeTechnique {
  numero: number;
  titre: string;
  description: string;
  image?: string;
  videoUrl?: string;
  dureeEstimee?: number;        // En minutes
  conseils: string[];
  astuces?: string[];
  pointsAttention?: string[];
}

/**
 * Matériel requis pour une technique
 */
export interface MaterielRequis {
  nom: string;
  quantite?: string;
  prixEstime?: number;
  image?: string;
  peutEtreFabrique?: boolean;    // Fabrication locale possible
  ouTrouver?: string;            // Suggestions d'approvisionnement
}

/**
 * Commentaire/avis sur une technique
 */
export interface AvisTechnique {
  id: string;
  techniqueId: string;
  utilisateur: {
    id: string;
    nom: string;
    prenom: string;
    avatar?: string;
    culture?: string;
    region?: string;
  };
  note: number;                  // 1-5
  commentaire: string;
  photos?: string[];             // Photos du résultat
  dateCreation: Date;
  dateModification?: Date;
  utile: boolean;                // Indique si l'avis est utile
  reponseExpert?: {
    commentaire: string;
    date: Date;
    nomExpert: string;
  };
}

/**
 * Progression utilisateur sur une technique
 */
export interface ProgressionTechnique {
  techniqueId: string;
  utilisateurId: string;
  statut: 'pas_commence' | 'en_cours' | 'complete';
  progression: number;           // Pourcentage 0-100
  dernieresEtapesCompletes: number[];  // Numéros des étapes complétées
  tempsTotalPasse: number;       // En secondes
  dateDebut: Date;
  dateDerniereActivite: Date;
  dateCompletion?: Date;
  notes?: string;                // Notes personnelles de l'agriculteur
  favori: boolean;
}

/**
 * Paramètres de recherche des techniques
 */
export interface TechniqueSearchParams {
  // Recherche textuelle
  search?: string;
  motsCles?: string[];
  tags?: string[];
  
  // Filtres
  categories?: CategorieTechnique[];
  cultures?: CultureType[];
  niveau?: 'debutant' | 'intermediaire' | 'avance';
  difficulte?: 'facile' | 'moyen' | 'difficile';
  cout?: 'faible' | 'moyen' | 'eleve';
  dureeMax?: number;             // En minutes
  certifie?: boolean;
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Tri
  sortBy?: 'date' | 'vues' | 'favoris' | 'note' | 'pertinence';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Réponse paginée pour les listes de techniques
 */
export interface TechniquesPaginatedResponse {
  success: boolean;
  data: {
    techniques: TechniqueAgricole[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters?: {
      categoriesDisponibles: CategorieTechnique[];
      culturesDisponibles: CultureType[];
    };
  };
}

/**
 * Statistiques des techniques pour un agriculteur
 */
export interface TechniquesStats {
  totalVues: number;
  totalFavoris: number;
  techniquesCompletees: number;
  tempsTotalApprentissage: number;  // En secondes
  categoriesPopulaires: {
    categorie: CategorieTechnique;
    nombre: number;
  }[];
  dernieresTechniques: {
    techniqueId: string;
    titre: string;
    date: Date;
    progression: number;
  }[];
  certificatsObtenus: {
    techniqueId: string;
    titre: string;
    dateObtention: Date;
  }[];
}

// ============================================
// FONCTIONS PRINCIPALES - LECTURE
// ============================================

/**
 * Récupère la liste des techniques avec filtres
 * 
 * @param params - Paramètres de recherche et filtres
 * @param token - Token JWT (optionnel pour personnalisation)
 * @returns Promise avec la liste paginée des techniques
 * 
 * @example
 * // Techniques d'irrigation pour le maïs
 * const techniques = await getTechniques({
 *   categories: ['irrigation'],
 *   cultures: ['mais'],
 *   niveau: 'debutant',
 *   page: 1,
 *   limit: 20
 * }, authToken);
 */
export const getTechniques = async (
  params: TechniqueSearchParams = {},
  token?: string
): Promise<{
  techniques: TechniqueAgricole[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    categoriesDisponibles: CategorieTechnique[];
    culturesDisponibles: CultureType[];
  };
}> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.motsCles?.length) queryParams.append('motsCles', params.motsCles.join(','));
    if (params.tags?.length) queryParams.append('tags', params.tags.join(','));
    if (params.categories?.length) queryParams.append('categories', params.categories.join(','));
    if (params.cultures?.length) queryParams.append('cultures', params.cultures.join(','));
    if (params.niveau) queryParams.append('niveau', params.niveau);
    if (params.difficulte) queryParams.append('difficulte', params.difficulte);
    if (params.cout) queryParams.append('cout', params.cout);
    if (params.dureeMax) queryParams.append('dureeMax', String(params.dureeMax));
    if (params.certifie !== undefined) queryParams.append('certifie', String(params.certifie));
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `${API_CONFIG.ENDPOINTS.TECHNIQUES.LIST}?${queryParams.toString()}`;
    
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    
    const techniques = await apiClient.get<{
      techniques: TechniqueAgricole[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
      filters?: {
        categoriesDisponibles: CategorieTechnique[];
        culturesDisponibles: CultureType[];
      };
    }>(url, { headers });
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] ${techniques.techniques?.length ?? 0} techniques récupérées`);
    }
    
    return techniques;
  } catch (error) {
    console.error('❌ [Techniques] Erreur récupération techniques:', error);
    throw error;
  }
};

/**
 * Récupère les détails d'une technique spécifique
 * Incrémente automatiquement le compteur de vues
 * 
 * @param techniqueId - ID de la technique
 * @param token - Token JWT (optionnel pour progression)
 * @returns Promise avec les détails complets
 * 
 * @example
 * const technique = await getTechniqueDetails('t12345', authToken);
 * console.log(technique.titre, technique.etapes);
 */
export const getTechniqueDetails = async (
  techniqueId: string,
  token?: string
): Promise<TechniqueAgricole> => {
  try {
    const url = API_CONFIG.ENDPOINTS.TECHNIQUES.DETAIL(techniqueId);
    
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    
    const technique = await apiClient.get<TechniqueAgricole>(url, { headers });
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Détails technique ${techniqueId} récupérés`);
    }
    
    return technique;
  } catch (error) {
    console.error(`❌ [Techniques] Erreur récupération technique ${techniqueId}:`, error);
    throw error;
  }
};

/**
 * Récupère les techniques par catégorie
 * 
 * @param categorie - Catégorie de technique
 * @param token - Token JWT (optionnel)
 * @param page - Numéro de page
 * @returns Promise avec la liste paginée
 * 
 * @example
 * const irrigation = await getTechniquesParCategorie('irrigation', authToken, 1);
 */
export const getTechniquesParCategorie = async (
  categorie: CategorieTechnique,
  token?: string,
  page: number = 1
): Promise<{
  techniques: TechniqueAgricole[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    categoriesDisponibles: CategorieTechnique[];
    culturesDisponibles: CultureType[];
  };
}> => {
  try {
    const params: TechniqueSearchParams = {
      categories: [categorie],
      page,
      limit: 20,
    };
    
    return await getTechniques(params, token);
  } catch (error) {
    console.error(`❌ [Techniques] Erreur récupération catégorie ${categorie}:`, error);
    throw error;
  }
};

/**
 * Récupère les techniques par culture
 * 
 * @param culture - Type de culture
 * @param token - Token JWT (optionnel)
 * @param page - Numéro de page
 * @returns Promise avec la liste paginée
 * 
 * @example
 * const techniquesMais = await getTechniquesParCulture('mais', authToken, 1);
 */
export const getTechniquesParCulture = async (
  culture: CultureType,
  token?: string,
  page: number = 1
): Promise<{
  techniques: TechniqueAgricole[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    categoriesDisponibles: CategorieTechnique[];
    culturesDisponibles: CultureType[];
  };
}> => {
  try {
    const params: TechniqueSearchParams = {
      cultures: [culture],
      page,
      limit: 20,
    };
    
    return await getTechniques(params, token);
  } catch (error) {
    console.error(`❌ [Techniques] Erreur récupération techniques pour ${culture}:`, error);
    throw error;
  }
};

/**
 * Récupère les techniques recommandées pour un agriculteur
 * Basé sur son profil, historique et la saison
 * 
 * @param token - Token JWT de l'agriculteur
 * @param limit - Nombre de recommandations
 * @returns Promise avec la liste des techniques recommandées
 * 
 * @example
 * const recommandations = await getTechniquesRecommandees(authToken, 10);
 */
export const getTechniquesRecommandees = async (
  token: string,
  limit: number = 10
): Promise<TechniqueAgricole[]> => {
  try {
    const techniques = await apiClient.get<TechniqueAgricole[]>(
      API_CONFIG.ENDPOINTS.TECHNIQUES.RECOMMANDEES,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] ${techniques.length ?? 0} techniques recommandées`);
    }
    
    return techniques;
  } catch (error) {
    console.error('❌ [Techniques] Erreur récupération recommandations:', error);
    throw error;
  }
};

/**
 * Recherche avancée de techniques
 * 
 * @param searchTerm - Terme de recherche
 * @param token - Token JWT (optionnel)
 * @returns Promise avec les résultats de recherche
 * 
 * @example
 * const results = await searchTechniques('irrigation goutte à goutte', authToken);
 */
export const searchTechniques = async (
  searchTerm: string,
  token?: string
): Promise<{
  techniques: TechniqueAgricole[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    categoriesDisponibles: CategorieTechnique[];
    culturesDisponibles: CultureType[];
  };
}> => {
  try {
    const params: TechniqueSearchParams = {
      search: searchTerm,
      page: 1,
      limit: 30,
      sortBy: 'pertinence',
    };
    
    return await getTechniques(params, token);
  } catch (error) {
    console.error(`❌ [Techniques] Erreur recherche "${searchTerm}":`, error);
    throw error;
  }
};

// ============================================
// PROGRESSION ET FAVORIS
// ============================================

/**
 * Enregistre la progression sur une technique
 * 
 * @param techniqueId - ID de la technique
 * @param progression - Données de progression
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec progression mise à jour
 * 
 * @example
 * // Marquer l'étape 3 comme complétée
 * await updateProgression('t12345', {
 *   progression: 60,
 *   dernieresEtapesCompletes: [1, 2, 3],
 *   tempsTotalPasse: 1200 // 20 minutes
 * }, authToken);
 */
export const updateProgression = async (
  techniqueId: string,
  progression: Partial<ProgressionTechnique>,
  token: string
): Promise<ProgressionTechnique> => {
  try {
    const progressionData = await apiClient.post<ProgressionTechnique>(
      `${API_CONFIG.ENDPOINTS.TECHNIQUES.DETAIL(techniqueId)}/progression`,
      progression,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Progression mise à jour: ${progression.progression}%`);
    }
    
    return progressionData;
  } catch (error) {
    console.error(`❌ [Techniques] Erreur mise à jour progression ${techniqueId}:`, error);
    throw error;
  }
};

/**
 * Marque une technique comme complétée
 * 
 * @param techniqueId - ID de la technique
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec confirmation
 * 
 * @example
 * await completeTechnique('t12345', authToken);
 * // Peut débloquer un certificat
 */
export const completeTechnique = async (
  techniqueId: string,
  token: string
): Promise<{ success: boolean; message: string; certificatUrl?: string }> => {
  try {
    const result = await apiClient.post<{ success: boolean; message: string; certificatUrl?: string }>(
      `${API_CONFIG.ENDPOINTS.TECHNIQUES.DETAIL(techniqueId)}/complete`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Technique ${techniqueId} complétée!`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ [Techniques] Erreur complétion technique ${techniqueId}:`, error);
    throw error;
  }
};

/**
 * Récupère la progression de l'utilisateur sur une technique
 * 
 * @param techniqueId - ID de la technique
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec la progression
 * 
 * @example
 * const progression = await getProgression('t12345', authToken);
 * console.log(`Progression: ${progression.progression}%`);
 */
export const getProgression = async (
  techniqueId: string,
  token: string
): Promise<ProgressionTechnique | null> => {
  try {
    const progression = await apiClient.get<ProgressionTechnique>(
      `${API_CONFIG.ENDPOINTS.TECHNIQUES.DETAIL(techniqueId)}/progression`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    return progression;
  } catch (error: any) {
    if (error.statusCode === 404) {
      // Pas de progression enregistrée
      return null;
    }
    console.error(`❌ [Techniques] Erreur récupération progression ${techniqueId}:`, error);
    throw error;
  }
};

/**
 * Ajoute une technique aux favoris
 * 
 * @param techniqueId - ID de la technique
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec confirmation
 * 
 * @example
 * await addFavoriTechnique('t12345', authToken);
 */
export const addFavoriTechnique = async (
  techniqueId: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await apiClient.post<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.TECHNIQUES.FAVORIS,
      { techniqueId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Technique ${techniqueId} ajoutée aux favoris`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ [Techniques] Erreur ajout favori ${techniqueId}:`, error);
    throw error;
  }
};

/**
 * Supprime une technique des favoris
 * 
 * @param techniqueId - ID de la technique
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec confirmation
 * 
 * @example
 * await removeFavoriTechnique('t12345', authToken);
 */
export const removeFavoriTechnique = async (
  techniqueId: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await apiClient.delete<{ success: boolean; message: string }>(
      `${API_CONFIG.ENDPOINTS.TECHNIQUES.FAVORIS}/${techniqueId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Technique ${techniqueId} retirée des favoris`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ [Techniques] Erreur suppression favori ${techniqueId}:`, error);
    throw error;
  }
};

/**
 * Récupère les techniques favorites de l'utilisateur
 * 
 * @param token - Token JWT de l'utilisateur
 * @param page - Numéro de page
 * @returns Promise avec la liste des favoris
 * 
 * @example
 * const mesFavoris = await getFavorisTechniques(authToken, 1);
 */
export const getFavorisTechniques = async (
  token: string,
  page: number = 1
): Promise<TechniquesPaginatedResponse> => {
  try {
    const favoris = await apiClient.get<{
      techniques: TechniqueAgricole[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
      filters?: {
        categoriesDisponibles: CategorieTechnique[];
        culturesDisponibles: CultureType[];
      };
    }>(
      API_CONFIG.ENDPOINTS.TECHNIQUES.FAVORIS,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 20 },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] ${favoris.techniques?.length ?? 0} favoris récupérés`);
    }
    
    return favoris as unknown as TechniquesPaginatedResponse;
  } catch (error) {
    console.error('❌ [Techniques] Erreur récupération favoris:', error);
    throw error;
  }
};

// ============================================
// AVIS ET ÉVALUATIONS
// ============================================

/**
 * Récupère les avis pour une technique
 * 
 * @param techniqueId - ID de la technique
 * @param page - Numéro de page
 * @returns Promise avec la liste des avis
 * 
 * @example
 * const avis = await getAvisTechnique('t12345', 1);
 * console.log(`Note moyenne: ${avis.moyenne}`);
 */
export const getAvisTechnique = async (
  techniqueId: string,
  page: number = 1
): Promise<{
  success: boolean;
  data: {
    avis: AvisTechnique[];
    moyenne: number;
    total: number;
    repartition: { 1: number; 2: number; 3: number; 4: number; 5: number };
  };
}> => {
  try {
    const avisData = await apiClient.get<{
      avis: AvisTechnique[];
      moyenne: number;
      total: number;
      repartition: { 1: number; 2: number; 3: number; 4: number; 5: number };
    }>(
      `${API_CONFIG.ENDPOINTS.TECHNIQUES.DETAIL(techniqueId)}/avis`,
      {
        params: { page, limit: 20 },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] ${avisData.avis?.length ?? 0} avis récupérés`);
    }
    
    return {
      success: true,
      data: avisData,
    };
  } catch (error) {
    console.error(`❌ [Techniques] Erreur récupération avis pour ${techniqueId}:`, error);
    throw error;
  }
};

/**
 * Ajoute un avis sur une technique
 * 
 * @param techniqueId - ID de la technique
 * @param avis - Données de l'avis
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec l'avis créé
 * 
 * @example
 * const nouvelAvis = await addAvisTechnique('t12345', {
 *   note: 5,
 *   commentaire: 'Très utile! Mon rendement a augmenté de 30%',
 *   photos: ['image1.jpg', 'image2.jpg']
 * }, authToken);
 */
export const addAvisTechnique = async (
  techniqueId: string,
  avis: { note: number; commentaire: string; photos?: string[] },
  token: string
): Promise<AvisTechnique> => {
  try {
    const avisTechnique = await apiClient.post<AvisTechnique>(
      `${API_CONFIG.ENDPOINTS.TECHNIQUES.DETAIL(techniqueId)}/avis`,
      avis,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Avis ajouté pour technique ${techniqueId}`);
    }
    
    return avisTechnique;
  } catch (error) {
    console.error(`❌ [Techniques] Erreur ajout avis pour ${techniqueId}:`, error);
    throw error;
  }
};

/**
 * Signale un avis inapproprié
 * 
 * @param avisId - ID de l'avis
 * @param raison - Raison du signalement
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec confirmation
 * 
 * @example
 * await reportAvis('a12345', 'Contenu inapproprié', authToken);
 */
export const reportAvis = async (
  avisId: string,
  raison: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await apiClient.post<{ success: boolean; message: string }>(
      `${API_CONFIG.ENDPOINTS.TECHNIQUES.AVIS}/${avisId}/report`,
      { raison },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Avis ${avisId} signalé`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ [Techniques] Erreur signalement avis ${avisId}:`, error);
    throw error;
  }
};

// ============================================
// STATISTIQUES
// ============================================

/**
 * Récupère les statistiques de l'utilisateur sur les techniques
 * 
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec les statistiques
 * 
 * @example
 * const stats = await getTechniquesStats(authToken);
 * console.log(`Techniques complétées: ${stats.techniquesCompletees}`);
 */
export const getTechniquesStats = async (token: string): Promise<TechniquesStats> => {
  try {
    const stats = await apiClient.get<TechniquesStats>(
      API_CONFIG.ENDPOINTS.TECHNIQUES.STATS,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Statistiques utilisateur récupérées`);
    }
    
    return stats;
  } catch (error) {
    console.error('❌ [Techniques] Erreur récupération statistiques:', error);
    throw error;
  }
};

// ============================================
// CRUD POUR EXPERTS
// ============================================

/**
 * Crée une nouvelle technique (expert seulement)
 * 
 * @param data - Données de la technique
 * @param token - Token JWT de l'expert
 * @returns Promise avec la technique créée
 * 
 * @example
 * const nouvelleTechnique = await createTechnique({
 *   titre: 'Irrigation goutte à goutte',
 *   description: 'Apprenez à installer un système d\'irrigation économique',
 *   categorie: 'irrigation',
 *   culturesCiblees: ['mais', 'riz'],
 *   etapes: [...],
 *   materielRequis: [...]
 * }, expertToken);
 */
export const createTechnique = async (
  data: Partial<TechniqueAgricole>,
  token: string
): Promise<TechniqueAgricole> => {
  try {
    const technique = await apiClient.post<TechniqueAgricole>(
      API_CONFIG.ENDPOINTS.TECHNIQUES.LIST,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Nouvelle technique créée: ${technique?.titre}`);
    }
    
    return technique;
  } catch (error) {
    console.error('❌ [Techniques] Erreur création technique:', error);
    throw error;
  }
};

/**
 * Met à jour une technique existante (expert seulement)
 * 
 * @param techniqueId - ID de la technique
 * @param data - Données à mettre à jour
 * @param token - Token JWT de l'expert
 * @returns Promise avec la technique mise à jour
 * 
 * @example
 * const updated = await updateTechnique('t12345', {
 *   titre: 'Nouveau titre',
 *   contenu: 'Contenu mis à jour...'
 * }, expertToken);
 */
export const updateTechnique = async (
  techniqueId: string,
  data: Partial<TechniqueAgricole>,
  token: string
): Promise<TechniqueAgricole> => {
  try {
    const technique = await apiClient.put<TechniqueAgricole>(
      API_CONFIG.ENDPOINTS.TECHNIQUES.DETAIL(techniqueId),
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Technique ${techniqueId} mise à jour`);
    }
    
    return technique;
  } catch (error) {
    console.error(`❌ [Techniques] Erreur mise à jour technique ${techniqueId}:`, error);
    throw error;
  }
};

/**
 * Supprime une technique (expert/administrateur seulement)
 * 
 * @param techniqueId - ID de la technique
 * @param token - Token JWT
 * @returns Promise avec confirmation
 * 
 * @example
 * await deleteTechnique('t12345', adminToken);
 */
export const deleteTechnique = async (
  techniqueId: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await apiClient.delete<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.TECHNIQUES.DETAIL(techniqueId),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Technique ${techniqueId} supprimée`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ [Techniques] Erreur suppression technique ${techniqueId}:`, error);
    throw error;
  }
};

// ============================================
// CERTIFICATS
// ============================================

/**
 * Récupère les certificats obtenus par l'utilisateur
 * 
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec la liste des certificats
 * 
 * @example
 * const certificats = await getMesCertificats(authToken);
 */
export const getMesCertificats = async (
  token: string
): Promise<{
  techniqueId: string;
  titre: string;
  dateObtention: Date;
  pdfUrl: string;
  imageUrl: string;
}[]> => {
  try {
    const certificats = await apiClient.get<{
      techniqueId: string;
      titre: string;
      dateObtention: Date;
      pdfUrl: string;
      imageUrl: string;
    }[]>(
      API_CONFIG.ENDPOINTS.TECHNIQUES.CERTIFICATS,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] ${certificats?.length ?? 0} certificats récupérés`);
    }
    
    return certificats;
  } catch (error) {
    console.error('❌ [Techniques] Erreur récupération certificats:', error);
    throw error;
  }
};

/**
 * Télécharge le PDF d'un certificat
 * 
 * @param techniqueId - ID de la technique
 * @param token - Token JWT de l'utilisateur
 * @returns Promise avec l'URL du PDF
 * 
 * @example
 * const pdfUrl = await downloadCertificat('t12345', authToken);
 * // Ouvrir le PDF
 */
export const downloadCertificat = async (
  techniqueId: string,
  token: string
): Promise<string> => {
  try {
    const certData = await apiClient.get<{ url: string }>(
      `${API_CONFIG.ENDPOINTS.TECHNIQUES.CERTIFICATS}/${techniqueId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log(`✅ [Techniques] Certificat PDF récupéré pour ${techniqueId}`);
    }
    
    return certData.url;
  } catch (error) {
    console.error(`❌ [Techniques] Erreur téléchargement certificat ${techniqueId}:`, error);
    throw error;
  }
};

// ============================================
// UTILITAIRES
// ============================================

/**
 * Formate la durée en texte lisible
 * 
 * @param minutes - Durée en minutes
 * @returns Texte formaté
 * 
 * @example
 * const texte = formatDuree(90); // "1h30"
 */
export const formatDuree = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const heures = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${heures}h`;
  }
  return `${heures}h${mins}`;
};

/**
 * Formate le niveau en texte lisible
 * 
 * @param niveau - Niveau de la technique
 * @param lang - Langue ('fr' ou 'bm')
 * @returns Texte formaté
 */
export const formatNiveau = (niveau: string, lang: 'fr' | 'bm' = 'fr'): string => {
  const niveaux: Record<string, Record<'fr' | 'bm', string>> = {
    debutant: {
      fr: 'Débutant',
      bm: 'Daminɛrɛ',
    },
    intermediaire: {
      fr: 'Intermédiaire',
      bm: 'Cɛman',
    },
    avance: {
      fr: 'Avancé',
      bm: 'Cekorobaw',
    },
  };
  
  return niveaux[niveau]?.[lang] || niveau;
};

/**
 * Formate la difficulté en texte lisible
 * 
 * @param difficulte - Niveau de difficulté
 * @param lang - Langue ('fr' ou 'bm')
 * @returns Texte formaté
 */
export const formatDifficulte = (difficulte: string, lang: 'fr' | 'bm' = 'fr'): string => {
  const difficultes: Record<string, Record<'fr' | 'bm', string>> = {
    facile: {
      fr: 'Facile',
      bm: 'Nɔrɔman',
    },
    moyen: {
      fr: 'Moyen',
      bm: 'Cɛman',
    },
    difficile: {
      fr: 'Difficile',
      bm: 'Gɛlɛn',
    },
  };
  
  return difficultes[difficulte]?.[lang] || difficulte;
};

/**
 * Obtient la couleur associée au niveau
 * 
 * @param niveau - Niveau de la technique
 * @returns Code couleur
 */
export const getNiveauColor = (niveau: string): string => {
  const colors = {
    debutant: '#4CAF50',     // Vert
    intermediaire: '#FF9800', // Orange
    avance: '#F44336',        // Rouge
  };
  return colors[niveau as keyof typeof colors] || '#757575';
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

/**
 * Exporte toutes les fonctions sous un namespace
 * 
 * @example
 * import TechniquesAPI from './endpoints/techniques';
 * 
 * const techniques = await TechniquesAPI.getTechniques({ categories: ['irrigation'] });
 * const progression = await TechniquesAPI.getProgression('t12345', authToken);
 */
export default {
  // Lecture
  getTechniques,
  getTechniqueDetails,
  getTechniquesParCategorie,
  getTechniquesParCulture,
  getTechniquesRecommandees,
  searchTechniques,
  
  // Progression
  updateProgression,
  completeTechnique,
  getProgression,
  
  // Favoris
  addFavoriTechnique,
  removeFavoriTechnique,
  getFavorisTechniques,
  
  // Avis
  getAvisTechnique,
  addAvisTechnique,
  reportAvis,
  
  // Statistiques
  getTechniquesStats,
  
  // Certificats
  getMesCertificats,
  downloadCertificat,
  
  // CRUD (Experts)
  createTechnique,
  updateTechnique,
  deleteTechnique,
  
  // Utilitaires
  formatDuree,
  formatNiveau,
  formatDifficulte,
  getNiveauColor,
};