/**
 * Types des Conseils Agricoles - Sènè Yiriwa
 * 
 * Ce fichier contient tous les types, interfaces et énumérations
 * relatifs aux conseils agricoles dans l'application.
 * 
 * Fonctionnalités :
 * - Types pour les conseils agricoles
 * - Énumérations des catégories et statuts
 * - Interfaces pour les filtres et réponses API
 * - Types pour les avis et feedbacks
 * - Types pour les statistiques
 * 
 * @module types/conseil.types
 */

// ============================================
// ENUMERATIONS
// ============================================

/**
 * Catégories de conseils agricoles
 */
export type ConseilCategorie = 
  | 'semis'           // Conseils sur les semis
  | 'irrigation'      // Conseils sur l'irrigation
  | 'fertilisation'   // Conseils sur la fertilisation
  | 'lutte_parasitaire' // Conseils sur la lutte antiparasitaire
  | 'recolte'         // Conseils sur la récolte
  | 'stockage'        // Conseils sur le stockage
  | 'commercialisation' // Conseils sur la commercialisation
  | 'climat'          // Conseils climatiques
  | 'sol'             // Conseils sur le sol
  | 'general';        // Conseils généraux

/**
 * Types de cultures au Mali
 */
export type CultureType = 
  | 'mil'      // Mil
  | 'sorgho'   // Sorgho
  | 'mais'     // Maïs
  | 'riz'      // Riz
  | 'coton'    // Coton
  | 'arachide' // Arachide
  | 'niebe'    // Niébé
  | 'sésame'   // Sésame
  | 'manioc'   // Manioc
  | 'igname';  // Igname

/**
 * Saisons agricoles au Mali
 */
export type SaisonType = 
  | 'hivernage'      // Juin à Septembre
  | 'contre_saison'  // Octobre à Décembre
  | 'sèche'          // Janvier à Mai
  | 'toute_annee';   // Toute l'année

/**
 * Statut d'un conseil
 */
export type ConseilStatut = 
  | 'brouillon'   // En cours de rédaction
  | 'soumis'      // Soumis à validation
  | 'valide'      // Validé par un expert
  | 'publie'      // Publié et visible
  | 'archive';    // Archivé (non visible)

/**
 * Niveau d'urgence d'un conseil
 */
export type UrgenceNiveau = 
  | 'normal'      // Normal
  | 'urgent'      // Urgent
  | 'critique';   // Critique

/**
 * Type de feedback utilisateur
 */
export type FeedbackType = 
  | 'utile'       // Le conseil a été utile
  | 'pas_utile'   // Le conseil n'a pas été utile
  | 'signalement'; // Signalement de contenu inapproprié

// ============================================
// INTERFACES PRINCIPALES
// ============================================

/**
 * Interface pour un auteur de conseil
 */
export interface ConseilAuteur {
  id: string;
  nom: string;
  prenom: string;
  avatar?: string;
  specialite?: string;
  organisation?: string;
}

/**
 * Interface pour un conseil agricole
 */
export interface Conseil {
  /** Identifiant unique du conseil */
  id: string;
  
  /** Titre du conseil */
  titre: string;
  
  /** Description courte (résumé) */
  description: string;
  
  /** Contenu détaillé (peut contenir du HTML/markdown) */
  contenu: string;
  
  /** Catégorie du conseil */
  categorie: ConseilCategorie;
  
  /** Sous-catégorie (optionnelle) */
  sousCategorie?: string;
  
  /** Culture ciblée (peut être multiple) */
  culturesCiblees: CultureType[];
  
  /** Régions ciblées (régions du Mali) */
  regionsCiblees?: string[];
  
  /** Saison ciblée */
  saisonCiblee?: SaisonType;
  
  /** Période de début de validité */
  periodeDebut?: Date;
  
  /** Période de fin de validité */
  periodeFin?: Date;
  
  /** Auteur du conseil */
  auteur: ConseilAuteur;
  
  /** Date de publication */
  datePublication: Date;
  
  /** Date de dernière mise à jour */
  dateMiseAJour: Date;
  
  /** URL de l'image principale */
  imagePrincipale?: string;
  
  /** Galerie d'images */
  images?: string[];
  
  /** URL de la vidéo (optionnelle) */
  videoUrl?: string;
  
  /** Durée de la vidéo en secondes */
  videoDuree?: number;
  
  /** Tags pour la recherche */
  tags: string[];
  
  /** Niveau d'urgence */
  urgence: UrgenceNiveau;
  
  /** Statut du conseil */
  statut: ConseilStatut;
  
  /** Nombre de vues */
  vues: number;
  
  /** Nombre de favoris */
  favoris: number;
  
  /** Nombre de partages */
  partages: number;
  
  /** Note moyenne (sur 5) */
  noteMoyenne: number;
  
  /** Nombre d'avis */
  avisCount: number;
  
  /** Indique si le conseil est certifié par un expert */
  certifie: boolean;
  
  /** Indique si l'utilisateur connecté a mis en favori */
  estFavori?: boolean;
  
  /** Indique si l'utilisateur connecté a consulté */
  estConsulte?: boolean;
}

// ============================================
// INTERFACES POUR LES FILTRES ET RECHERCHE
// ============================================

/**
 * Paramètres de recherche des conseils
 */
export interface ConseilSearchParams {
  /** Terme de recherche textuelle */
  search?: string;
  
  /** Filtrage par catégories */
  categories?: ConseilCategorie[];
  
  /** Filtrage par cultures */
  cultures?: CultureType[];
  
  /** Filtrage par région */
  region?: string;
  
  /** Filtrage par saison */
  saison?: SaisonType;
  
  /** Filtrage par urgence */
  urgence?: UrgenceNiveau;
  
  /** Filtrage par statut (admin seulement) */
  statut?: ConseilStatut;
  
  /** Filtrage par certifié */
  certifie?: boolean;
  
  /** Filtrage par favoris (utilisateur connecté) */
  favoris?: boolean;
  
  /** Filtrage par consulté récemment */
  recents?: boolean;
  
  /** Date de début (pour les périodes) */
  dateDebut?: Date;
  
  /** Date de fin (pour les périodes) */
  dateFin?: Date;
  
  /** Pagination - page */
  page?: number;
  
  /** Pagination - limite par page */
  limit?: number;
  
  /** Tri */
  sortBy?: 'date' | 'vues' | 'favoris' | 'note' | 'pertinence';
  
  /** Ordre de tri */
  sortOrder?: 'asc' | 'desc';
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
      categoriesDisponibles: ConseilCategorie[];
      culturesDisponibles: CultureType[];
    };
  };
  message?: string;
}

// ============================================
// INTERFACES POUR LES AVIS ET FEEDBACK
// ============================================

/**
 * Interface pour un avis utilisateur
 */
export interface ConseilAvis {
  /** Identifiant unique */
  id: string;
  
  /** ID du conseil concerné */
  conseilId: string;
  
  /** Utilisateur ayant donné l'avis */
  utilisateur: {
    id: string;
    nom: string;
    prenom: string;
    avatar?: string;
  };
  
  /** Note (1-5) */
  note: number;
  
  /** Commentaire */
  commentaire: string;
  
  /** Photos jointes (optionnelles) */
  photos?: string[];
  
  /** Date de création */
  dateCreation: Date;
  
  /** Date de modification */
  dateModification?: Date;
  
  /** Nombre de "utile" */
  utiles: number;
  
  /** Réponse d'un expert (optionnelle) */
  reponseExpert?: {
    commentaire: string;
    date: Date;
    nomExpert: string;
  };
  
  /** Indique si l'utilisateur connecté a trouvé utile */
  estUtile?: boolean;
}

/**
 * Interface pour le feedback utilisateur
 */
export interface ConseilFeedback {
  id: string;
  conseilId: string;
  utilisateurId: string;
  type: FeedbackType;
  commentaire?: string;
  dateCreation: Date;
}

// ============================================
// INTERFACES POUR LES STATISTIQUES
// ============================================

/**
 * Statistiques des conseils pour un agriculteur
 */
export interface ConseilStatsAgriculteur {
  /** Nombre total de conseils consultés */
  totalConsultes: number;
  
  /** Nombre total de favoris */
  totalFavoris: number;
  
  /** Dernier conseil consulté */
  dernierConseil: {
    id: string;
    titre: string;
    date: Date;
  } | null;
  
  /** Catégories les plus consultées */
  categoriesPopulaires: {
    categorie: ConseilCategorie;
    nombre: number;
  }[];
  
  /** Cultures les plus suivies */
  culturesSuivies: {
    culture: CultureType;
    conseilsConsultes: number;
  }[];
  
  /** Recommandations personnalisées */
  recommandations: {
    baseSur: string;
    conseilId: string;
    titre: string;
    score: number;
  }[];
}

/**
 * Statistiques des conseils pour un expert
 */
export interface ConseilStatsExpert {
  /** Nombre total de conseils publiés */
  totalPublies: number;
  
  /** Nombre total de vues */
  totalVues: number;
  
  /** Nombre total de favoris */
  totalFavoris: number;
  
  /** Note moyenne des conseils */
  noteMoyenne: number;
  
  /** Conseils les plus populaires */
  conseilsPopulaires: {
    id: string;
    titre: string;
    vues: number;
    favoris: number;
  }[];
  
  /** Performance par catégorie */
  performanceParCategorie: {
    categorie: ConseilCategorie;
    vues: number;
    note: number;
  }[];
}

// ============================================
// INTERFACES POUR LES ALERTES
// ============================================

/**
 * Interface pour une alerte de conseil
 */
export interface ConseilAlerte {
  id: string;
  conseilId: string;
  titre: string;
  message: string;
  niveau: 'info' | 'warning' | 'critical';
  regions: string[];
  cultures: CultureType[];
  dateDebut: Date;
  dateFin: Date;
  estLue: boolean;
  dateLecture?: Date;
}

// ============================================
// INTERFACES POUR L'ADMINISTRATION
// ============================================

/**
 * Interface pour la création d'un conseil (admin/expert)
 */
export interface ConseilCreation {
  titre: string;
  description: string;
  contenu: string;
  categorie: ConseilCategorie;
  sousCategorie?: string;
  culturesCiblees: CultureType[];
  regionsCiblees?: string[];
  saisonCiblee?: SaisonType;
  periodeDebut?: Date;
  periodeFin?: Date;
  imagePrincipale?: string;
  images?: string[];
  videoUrl?: string;
  tags: string[];
  urgence: UrgenceNiveau;
}

/**
 * Interface pour la mise à jour d'un conseil
 */
export interface ConseilUpdate extends Partial<ConseilCreation> {
  statut?: ConseilStatut;
}

// ============================================
// TYPES UTILITAIRES
// ============================================

/**
 * Type pour les identifiants de conseil
 */
export type ConseilId = string;

/**
 * Type pour les options de tri
 */
export type ConseilSortOption = 'recent' | 'populaire' | 'note' | 'pertinent';

/**
 * Type pour les périodes de filtrage
 */
export type PeriodeFiltre = 'aujourdhui' | 'cette_semaine' | 'ce_mois' | 'cette_annee' | 'personnalise';

/**
 * Type pour le résumé d'un conseil (version allégée)
 */
export type ConseilResume = Pick<Conseil, 
  'id' | 'titre' | 'description' | 'categorie' | 'imagePrincipale' | 
  'datePublication' | 'vues' | 'favoris' | 'urgence' | 'estFavori'
>;

// ============================================
// CONSTANTES ASSOCIÉES
// ============================================

/**
 * Libellés des catégories pour l'affichage
 */
export const CATEGORIE_LABELS: Record<ConseilCategorie, string> = {
  semis: 'Semis',
  irrigation: 'Irrigation',
  fertilisation: 'Fertilisation',
  lutte_parasitaire: 'Lutte antiparasitaire',
  recolte: 'Récolte',
  stockage: 'Stockage',
  commercialisation: 'Commercialisation',
  climat: 'Climat',
  sol: 'Sol',
  general: 'Général',
};

/**
 * Libellés des cultures pour l'affichage
 */
export const CULTURE_LABELS: Record<CultureType, string> = {
  mil: 'Mil',
  sorgho: 'Sorgho',
  mais: 'Maïs',
  riz: 'Riz',
  coton: 'Coton',
  arachide: 'Arachide',
  niebe: 'Niébé',
  sésame: 'Sésame',
  manioc: 'Manioc',
  igname: 'Igname',
};

/**
 * Libellés des saisons pour l'affichage
 */
export const SAISON_LABELS: Record<SaisonType, string> = {
  hivernage: 'Hivernage (Juin-Sept)',
  contre_saison: 'Contre-saison (Oct-Déc)',
  sèche: 'Saison sèche (Jan-Mai)',
  toute_annee: 'Toute l\'année',
};

/**
 * Libellés des niveaux d'urgence
 */
export const URGENCE_LABELS: Record<UrgenceNiveau, string> = {
  normal: 'Normal',
  urgent: 'Urgent',
  critique: 'Critique',
};

/**
 * Couleurs associées aux niveaux d'urgence
 */
export const URGENCE_COLORS: Record<UrgenceNiveau, string> = {
  normal: '#4CAF50',
  urgent: '#FF9800',
  critique: '#F44336',
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Vérifie si un conseil est dans sa période de validité
 * 
 * @param conseil - Le conseil à vérifier
 * @returns true si le conseil est dans sa période de validité
 */
export const isConseilValide = (conseil: Conseil): boolean => {
  const now = new Date();
  
  if (conseil.periodeDebut && now < conseil.periodeDebut) {
    return false;
  }
  
  if (conseil.periodeFin && now > conseil.periodeFin) {
    return false;
  }
  
  return true;
};

/**
 * Vérifie si un conseil est urgent
 * 
 * @param conseil - Le conseil à vérifier
 * @returns true si le conseil est urgent ou critique
 */
export const isConseilUrgent = (conseil: Conseil): boolean => {
  return conseil.urgence === 'urgent' || conseil.urgence === 'critique';
};

/**
 * Formate la date de publication d'un conseil
 * 
 * @param conseil - Le conseil contenant la date
 * @returns Date formatée en français
 */
export const formatDatePublication = (conseil: Conseil): string => {
  return new Date(conseil.datePublication).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};