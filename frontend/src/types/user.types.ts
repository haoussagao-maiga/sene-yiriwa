/**
 * Types Utilisateur - Sènè Yiriwa
 * 
 * Ce fichier contient tous les types, interfaces et énumérations
 * relatifs aux utilisateurs dans l'application.
 * 
 * Fonctionnalités :
 * - Types pour les profils utilisateur (agriculteur, expert, admin)
 * - Types pour les préférences et paramètres
 * - Types pour les champs agricoles et exploitations
 * - Types pour les statistiques utilisateur
 * - Types pour les abonnements et certifications
 * - Énumérations des rôles et statuts
 * 
 * @module types/user.types
 */

// ============================================
// ENUMERATIONS
// ============================================

/**
 * Rôles utilisateur dans l'application
 */
export type UserRole = 
  | 'agriculteur'   // Agriculteur (utilisateur standard)
  | 'expert'        // Expert agricole (crée du contenu)
  | 'administrateur'; // Administrateur (gère la plateforme)

/**
 * Statut d'un compte utilisateur
 */
export type UserStatut = 
  | 'actif'      // Compte actif
  | 'inactif'    // Compte inactif
  | 'suspendu'   // Compte suspendu (sanction)
  | 'en_attente'; // Compte en attente de validation

/**
 * Genre de l'utilisateur
 */
export type UserGenre = 
  | 'homme'   // Homme
  | 'femme'   // Femme
  | 'autre';  // Autre

/**
 * Type d'agriculture pratiqué
 */
export type AgricultureType = 
  | 'pluvial'   // Agriculture pluviale (dépend de la pluie)
  | 'irrigue'   // Agriculture irriguée
  | 'mixte';    // Mixte (pluvial + irrigué)

/**
 * Type d'abonnement
 */
export type AbonnementType = 
  | 'gratuit'   // Version gratuite
  | 'premium'   // Version premium
  | 'pro';      // Version professionnelle

/**
 * Type d'équipement agricole
 */
export type EquipementType = 
  | 'tracteur'     // Tracteur
  | 'moissonneuse' // Moissonneuse
  | 'brouette'     // Brouette
  | 'pulverisateur' // Pulvérisateur
  | 'irrigation'   // Système d'irrigation
  | 'autre';       // Autre équipement

/**
 * État d'un équipement
 */
export type EquipementEtat = 
  | 'bon'       // Bon état
  | 'moyen'     // État moyen
  | 'mauvais';  // Mauvais état

// ============================================
// INTERFACES DE BASE
// ============================================

/**
 * Interface de base pour un utilisateur
 */
export interface BaseUser {
  /** Identifiant unique */
  id: string;
  
  /** Nom de famille */
  nom: string;
  
  /** Prénom */
  prenom: string;
  
  /** Adresse email */
  email: string;
  
  /** Numéro de téléphone */
  telephone: string;
  
  /** Rôle de l'utilisateur */
  role: UserRole;
  
  /** Statut du compte */
  statut: UserStatut;
  
  /** Date de naissance */
  dateNaissance?: Date;
  
  /** Genre */
  genre?: UserGenre;
  
  /** Photo de profil */
  photoProfil?: string;
  
  /** Biographie / description */
  bio?: string;
  
  /** Adresse postale */
  adresse?: string;
  
  /** Date d'inscription */
  dateInscription: Date;
  
  /** Dernière connexion */
  derniereConnexion: Date;
  
  /** Indique si l'email est vérifié */
  estEmailVerifie: boolean;
  
  /** Indique si le téléphone est vérifié */
  estTelephoneVerifie: boolean;
  
  /** Date de création */
  createdAt: Date;
  
  /** Date de dernière modification */
  updatedAt: Date;
}

// ============================================
// LOCALISATION
// ============================================

/**
 * Interface pour la localisation
 */
export interface Localisation {
  /** Région du Mali */
  region: string;
  
  /** Cercle */
  cercle?: string;
  
  /** Commune */
  commune?: string;
  
  /** Village */
  village?: string;
  
  /** Latitude */
  latitude?: number;
  
  /** Longitude */
  longitude?: number;
}

// ============================================
// PRÉFÉRENCES
// ============================================

/**
 * Préférences de notifications
 */
export interface NotificationPreferences {
  /** Notifications météo */
  meteo: boolean;
  
  /** Alertes météo */
  alertes: boolean;
  
  /** Nouveaux conseils */
  conseils: boolean;
  
  /** Nouvelles techniques */
  nouvellesTechniques: boolean;
  
  /** Rappels agricoles */
  rappelsAgricoles: boolean;
  
  /** Événements */
  evenements: boolean;
  
  /** Notifications par email */
  email: boolean;
  
  /** Notifications push */
  push: boolean;
  
  /** Notifications par SMS */
  sms: boolean;
}

/**
 * Préférences utilisateur
 */
export interface UserPreferences {
  /** Langue (fr: français, bm: bambara) */
  langue: 'fr' | 'bm';
  
  /** Thème (clair, sombre, système) */
  theme: 'clair' | 'sombre' | 'systeme';
  
  /** Taille de police */
  taillePolice: 'petit' | 'moyen' | 'grand';
  
  /** Afficher les images */
  afficherImages: boolean;
  
  /** Mode économie de données */
  modeEconomieDonnees: boolean;
  
  /** Cultures suivies */
  culturesSuivies: string[];
  
  /** Régions suivies */
  regionsSuivies: string[];
  
  /** Catégories d'intérêt */
  categoriesInteret: string[];
  
  /** Fréquence des notifications météo */
  frequenceMeteo: 'quotidien' | 'hebdomadaire' | 'alerte_seulement';
  
  /** Fréquence des conseils */
  frequenceConseils: 'quotidien' | 'hebdomadaire' | 'mensuel';
  
  /** Préférences de notifications */
  notifications: NotificationPreferences;
}

// ============================================
// EXPLOITATION AGRICOLE
// ============================================

/**
 * Équipement agricole
 */
export interface Equipement {
  /** Identifiant unique */
  id: string;
  
  /** Nom de l'équipement */
  nom: string;
  
  /** Type d'équipement */
  type: EquipementType;
  
  /** Quantité */
  quantite: number;
  
  /** État de l'équipement */
  etat: EquipementEtat;
  
  /** Date d'achat */
  dateAchat?: Date;
  
  /** Valeur estimée (FCFA) */
  valeurEstimee?: number;
}

/**
 * Champ agricole
 */
export interface ChampAgricole {
  /** Identifiant unique */
  id: string;
  
  /** Nom du champ */
  nom: string;
  
  /** Superficie en hectares */
  superficie: number;
  
  /** Localisation */
  localisation: Localisation;
  
  /** Type de sol */
  solType: string;
  
  /** pH du sol (0-14) */
  pH?: number;
  
  /** Culture actuelle */
  cultureActuelle?: string;
  
  /** Date du dernier semis */
  dateDernierSemis?: Date;
  
  /** Date de dernière récolte */
  dateDerniereRecolte?: Date;
  
  /** Historique des cultures */
  historiqueCultures: HistoriqueCulture[];
  
  /** Notes supplémentaires */
  notes?: string;
}

/**
 * Historique des cultures d'un champ
 */
export interface HistoriqueCulture {
  /** Culture pratiquée */
  culture: string;
  
  /** Saison */
  saison: string;
  
  /** Année */
  annee: number;
  
  /** Superficie cultivée (ha) */
  superficie: number;
  
  /** Rendement (tonnes/hectare) */
  rendement: number;
  
  /** Date des semis */
  dateSemis: Date;
  
  /** Date de récolte */
  dateRecolte: Date;
  
  /** Notes */
  notes?: string;
}

/**
 * Culture pratiquée actuellement
 */
export interface CulturePratique {
  /** Type de culture */
  culture: string;
  
  /** Superficie (ha) */
  superficie: number;
  
  /** Saison */
  saison: string;
  
  /** Date des semis */
  dateSemis?: Date;
  
  /** Date de récolte prévue */
  dateRecoltePrevue?: Date;
  
  /** Rendement moyen attendu (t/ha) */
  rendementMoyen?: number;
  
  /** Variété cultivée */
  variete: string;
}

/**
 * Exploitation agricole complète
 */
export interface ExploitationAgricole {
  /** Identifiant unique */
  id: string;
  
  /** Nom de l'exploitation */
  nom: string;
  
  /** Superficie totale (ha) */
  superficieTotale: number;
  
  /** Superficie cultivable (ha) */
  superficieCultivable: number;
  
  /** Type d'agriculture */
  typeAgriculture: AgricultureType;
  
  /** Sources d'eau disponibles */
  sourcesEau: string[];
  
  /** Équipements disponibles */
  equipements: Equipement[];
  
  /** Nombre d'employés */
  employes?: number;
  
  /** Statut juridique */
  statutJuridique?: string;
  
  /** Champs de l'exploitation */
  champs: ChampAgricole[];
}

// ============================================
// PROFIL AGRICULTEUR
// ============================================

/**
 * Statistiques de l'agriculteur
 */
export interface AgriculteurStats {
  /** Nombre total de champs */
  totalChamps: number;
  
  /** Superficie totale cultivée (ha) */
  totalSuperficie: number;
  
  /** Cultures pratiquées */
  culturesPratiquees: string[];
  
  /** Rendement moyen par culture (t/ha) */
  rendementMoyenParCulture: Record<string, number>;
  
  /** Production annuelle par culture (tonnes) */
  productionAnnuelle: Record<string, number>;
  
  /** Nombre de conseils consultés */
  conseilsConsultes: number;
  
  /** Nombre de techniques apprises */
  techniquesApprises: number;
  
  /** Temps total d'apprentissage (secondes) */
  tempsTotalApprentissage: number;
  
  /** Date du dernier conseil consulté */
  dernierConseilConsulte?: Date;
  
  /** Date du dernier rapport généré */
  dernierRapportGenere?: Date;
  
  /** Jours actifs sur l'application */
  joursActifs: number;
  
  /** Progression annuelle (%) */
  progressionAnnuelle: number;
  
  /** Objectifs atteints */
  objectifsAtteints: number;
}

/**
 * Abonnement d'un agriculteur
 */
export interface Abonnement {
  /** Type d'abonnement */
  type: AbonnementType;
  
  /** Date de début */
  dateDebut: Date;
  
  /** Date de fin */
  dateFin?: Date;
  
  /** Abonnement actif */
  actif: boolean;
  
  /** Mode de paiement */
  modePaiement?: string;
  
  /** Référence de paiement */
  referencePaiement?: string;
}

/**
 * Certification obtenue
 */
export interface Certification {
  /** Nom de la certification */
  nom: string;
  
  /** Organisme certificateur */
  organisme: string;
  
  /** Date d'obtention */
  dateObtention: Date;
  
  /** Date d'expiration */
  dateExpiration?: Date;
  
  /** Certifiant (expert) */
  certifiant?: string;
  
  /** URL du certificat */
  certificatUrl?: string;
}

/**
 * Profil complet d'un agriculteur
 */
export interface Agriculteur extends BaseUser {
  role: 'agriculteur';
  
  /** Localisation */
  localisation: Localisation;
  
  /** Exploitation agricole */
  exploitation: ExploitationAgricole;
  
  /** Champs de l'agriculteur */
  champs: ChampAgricole[];
  
  /** Cultures pratiquées */
  cultures: CulturePratique[];
  
  /** Statistiques */
  statistiques: AgriculteurStats;
  
  /** Abonnements */
  abonnements: Abonnement[];
  
  /** Certifications */
  certifications: Certification[];
  
  /** Préférences */
  preferences: UserPreferences;
}

// ============================================
// PROFIL EXPERT
// ============================================

/**
 * Diplôme d'un expert
 */
export interface Diplome {
  /** Intitulé du diplôme */
  intitule: string;
  
  /** Établissement */
  etablissement: string;
  
  /** Année d'obtention */
  anneeObtention: number;
  
  /** Mention */
  mention?: string;
}

/**
 * Statistiques de l'expert
 */
export interface ExpertStats {
  /** Nombre de conseils publiés */
  conseilsPublies: number;
  
  /** Nombre de techniques publiées */
  techniquesPubliees: number;
  
  /** Nombre total de vues */
  totalVues: number;
  
  /** Nombre total de favoris */
  totalFavoris: number;
  
  /** Note moyenne des contenus (1-5) */
  noteMoyenne: number;
  
  /** Nombre d'agriculteurs aidés */
  agriculteursAides: number;
  
  /** Retours positifs */
  retoursPositifs: number;
  
  /** Date du dernier conseil publié */
  dernierConseilPublie?: Date;
  
  /** Temps moyen de réponse (heures) */
  tempsMoyenReponse?: number;
}

/**
 * Profil complet d'un expert
 */
export interface ExpertAgricole extends BaseUser {
  role: 'expert';
  
  /** Spécialités de l'expert */
  specialite: string[];
  
  /** Titre professionnel */
  titre: string;
  
  /** Organisation / institution */
  organisation?: string;
  
  /** Années d'expérience */
  anneesExperience: number;
  
  /** Diplômes */
  diplomes: Diplome[];
  
  /** Certifications */
  certifications: Certification[];
  
  /** Statistiques */
  statistiques: ExpertStats;
  
  /** Disponibilité pour consultation */
  disponible: boolean;
  
  /** Tarif de consultation (FCFA) */
  tarifConsultation?: number;
  
  /** Préférences */
  preferences: UserPreferences;
}

// ============================================
// PROFIL ADMINISTRATEUR
// ============================================

/**
 * Action d'un administrateur (log)
 */
export interface ActionAdmin {
  /** Type d'action */
  action: string;
  
  /** Utilisateur ciblé */
  utilisateurCible?: string;
  
  /** Détails de l'action */
  details: any;
  
  /** Date de l'action */
  date: Date;
  
  /** Adresse IP */
  ip?: string;
}

/**
 * Niveau d'administrateur
 */
export type AdminNiveau = 
  | 'super_admin'  // Super administrateur (tous droits)
  | 'admin'        // Administrateur standard
  | 'moderateur';  // Modérateur (droits limités)

/**
 * Profil complet d'un administrateur
 */
export interface Administrateur extends BaseUser {
  role: 'administrateur';
  
  /** Niveau d'administration */
  niveau: AdminNiveau;
  
  /** Permissions spécifiques */
  permissions: string[];
  
  /** Dernières actions */
  dernieresActions: ActionAdmin[];
  
  /** Préférences */
  preferences: UserPreferences;
}

// ============================================
// TYPES UTILITAIRES
// ============================================

/**
 * Type union pour tous les profils utilisateur
 */
export type UserProfile = Agriculteur | ExpertAgricole | Administrateur;

/**
 * Version simplifiée d'un utilisateur (pour affichage rapide)
 */
export type UserResume = Pick<BaseUser, 
  'id' | 'nom' | 'prenom' | 'email' | 'role' | 'photoProfil'
>;

/**
 * Paramètres de recherche d'utilisateurs
 */
export interface UserSearchParams {
  /** Terme de recherche */
  search?: string;
  
  /** Rôle utilisateur */
  role?: UserRole;
  
  /** Statut du compte */
  statut?: UserStatut;
  
  /** Région */
  region?: string;
  
  /** Pagination - page */
  page?: number;
  
  /** Pagination - limite */
  limit?: number;
  
  /** Tri */
  sortBy?: 'date' | 'nom' | 'derniereConnexion';
  
  /** Ordre de tri */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Données pour la mise à jour du profil
 */
export interface ProfileUpdateData {
  nom?: string;
  prenom?: string;
  telephone?: string;
  dateNaissance?: Date;
  genre?: UserGenre;
  bio?: string;
  adresse?: string;
  localisation?: Partial<Localisation>;
  photoProfil?: string;
}

// ============================================
// CONSTANTES ASSOCIÉES
// ============================================

/**
 * Libellés des rôles utilisateur
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  agriculteur: 'Agriculteur',
  expert: 'Expert agricole',
  administrateur: 'Administrateur',
};

/**
 * Libellés des statuts utilisateur
 */
export const STATUT_LABELS: Record<UserStatut, string> = {
  actif: 'Actif',
  inactif: 'Inactif',
  suspendu: 'Suspendu',
  en_attente: 'En attente',
};

/**
 * Libellés des types d'agriculture
 */
export const AGRICULTURE_TYPE_LABELS: Record<AgricultureType, string> = {
  pluvial: 'Pluvial',
  irrigue: 'Irrigué',
  mixte: 'Mixte',
};

/**
 * Couleurs associées aux rôles
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  agriculteur: '#4CAF50',    // Vert
  expert: '#FF9800',         // Orange
  administrateur: '#F44336', // Rouge
};

/**
 * Couleurs associées aux statuts
 */
export const STATUT_COLORS: Record<UserStatut, string> = {
  actif: '#4CAF50',     // Vert
  inactif: '#9E9E9E',   // Gris
  suspendu: '#F44336',  // Rouge
  en_attente: '#FF9800', // Orange
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Vérifie si un utilisateur est un agriculteur
 * 
 * @param user - Utilisateur à vérifier
 * @returns true si l'utilisateur est un agriculteur
 */
export const isAgriculteur = (user: BaseUser): user is Agriculteur => {
  return user.role === 'agriculteur';
};

/**
 * Vérifie si un utilisateur est un expert
 * 
 * @param user - Utilisateur à vérifier
 * @returns true si l'utilisateur est un expert
 */
export const isExpert = (user: BaseUser): user is ExpertAgricole => {
  return user.role === 'expert';
};

/**
 * Vérifie si un utilisateur est un administrateur
 * 
 * @param user - Utilisateur à vérifier
 * @returns true si l'utilisateur est un administrateur
 */
export const isAdmin = (user: BaseUser): user is Administrateur => {
  return user.role === 'administrateur';
};

/**
 * Vérifie si un compte utilisateur est actif
 * 
 * @param user - Utilisateur à vérifier
 * @returns true si le compte est actif
 */
export const isAccountActive = (user: BaseUser): boolean => {
  return user.statut === 'actif';
};

/**
 * Obtient le nom complet de l'utilisateur
 * 
 * @param user - Utilisateur
 * @returns Nom complet formaté
 */
export const getFullName = (user: BaseUser): string => {
  return `${user.prenom} ${user.nom}`;
};

/**
 * Obtient l'initiale de l'utilisateur pour l'avatar
 * 
 * @param user - Utilisateur
 * @returns Initiale (première lettre du prénom)
 */
export const getUserInitial = (user: BaseUser): string => {
  return user.prenom.charAt(0).toUpperCase();
};