/**
 * Types Météo - Sènè Yiriwa
 * 
 * Ce fichier contient tous les types, interfaces et énumérations
 * relatifs aux données météorologiques dans l'application.
 * 
 * Fonctionnalités :
 * - Types pour les données météo actuelles
 * - Types pour les prévisions (quotidiennes, horaires)
 * - Types pour les alertes météorologiques
 * - Types pour les indices agricoles
 * - Énumérations des conditions météo
 * - Types pour les réponses API
 * 
 * @module types/meteo.types
 */

// ============================================
// ENUMERATIONS
// ============================================

/**
 * Conditions météorologiques principales
 */
export type ConditionMeteo = 
  | 'clear_sky'        // Ciel dégagé
  | 'few_clouds'       // Peu nuageux (11-25%)
  | 'scattered_clouds' // Nuages épars (25-50%)
  | 'broken_clouds'    // Nuageux (51-84%)
  | 'overcast'         // Couvert (85-100%)
  | 'light_rain'       // Pluie légère
  | 'moderate_rain'    // Pluie modérée
  | 'heavy_rain'       // Fortes pluies
  | 'extreme_rain'     // Pluies torrentielles
  | 'thunderstorm'     // Orage
  | 'heavy_thunderstorm' // Orage violent
  | 'drizzle'          // Bruine
  | 'snow'             // Neige
  | 'mist'             // Brume
  | 'fog'              // Brouillard
  | 'haze'             // Brume sèche
  | 'dust'             // Poussière
  | 'sand'             // Sable (harmattan)
  | 'windy'            // Venteux
  | 'strong_wind'      // Vent fort
  | 'drought'          // Sécheresse
  | 'hot'              // Très chaud
  | 'cold';            // Froid

/**
 * Niveaux d'alerte météo
 */
export type AlerteNiveau = 
  | 'info'      // Information
  | 'warning'   // Avertissement
  | 'critical'  // Critique
  | 'extreme';  // Extrême

/**
 * Types d'alertes météo
 */
export type AlerteType = 
  | 'pluies_intenses'   // Pluies intenses
  | 'secheresse'        // Sécheresse
  | 'canicule'          // Canicule
  | 'gel'               // Gel
  | 'vent_fort'         // Vent fort
  | 'orage'             // Orage
  | 'inondation'        // Inondation
  | 'tempete';          // Tempête

/**
 * Sources des données météo
 */
export type SourceMeteo = 
  | 'openweather'   // OpenWeatherMap
  | 'meteoblue'     // Meteoblue
  | 'accuweather'   // AccuWeather
  | 'cache';        // Données en cache

/**
 * Risques agricoles
 */
export type RisqueNiveau = 
  | 'faible'      // Risque faible
  | 'moyen'       // Risque moyen
  | 'eleve'       // Risque élevé
  | 'tres_eleve'; // Risque très élevé

/**
 * Stress hydrique
 */
export type StressHydriqueNiveau = 
  | 'aucun'       // Aucun stress
  | 'faible'      // Stress faible
  | 'modere'      // Stress modéré
  | 'severe'      // Stress sévère
  | 'extreme';    // Stress extrême

// ============================================
// INTERFACES PRINCIPALES
// ============================================

/**
 * Interface pour les coordonnées géographiques
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Interface pour la localisation détaillée
 */
export interface LocationInfo {
  latitude: number;
  longitude: number;
  region?: string;      // Région du Mali (Sikasso, Koulikoro, etc.)
  cercle?: string;      // Cercle
  commune?: string;     // Commune
  village?: string;     // Village
  altitude?: number;    // Altitude en mètres
}

/**
 * Interface pour la météo actuelle
 */
export interface CurrentWeather {
  // Températures
  temperature: number;           // Température actuelle (°C)
  temperatureMin: number;        // Température minimale du jour (°C)
  temperatureMax: number;        // Température maximale du jour (°C)
  ressentie: number;             // Température ressentie (°C)
  
  // Humidité et précipitations
  humidite: number;              // Humidité relative (%)
  pression: number;              // Pression atmosphérique (hPa)
  precipitations: number;        // Précipitations actuelles (mm)
  precipitationsJour: number;    // Précipitations du jour (mm)
  probabilitePluie: number;      // Probabilité de pluie (%)
  
  // Vent
  ventVitesse: number;           // Vitesse du vent (km/h)
  ventDirection: number;         // Direction du vent (degrés)
  ventRafales: number;           // Rafales de vent (km/h)
  
  // Autres
  uv: number;                    // Indice UV
  visibilite: number;            // Visibilité (km)
  couvertureNuageuse: number;    // Couverture nuageuse (%)
  
  // Conditions
  conditionCode: ConditionMeteo; // Code de la condition
  conditionTexte: string;        // Description textuelle
  icone: string;                 // URL de l'icône
  
  // Soleil
  leverSoleil: Date;             // Lever du soleil
  coucherSoleil: Date;           // Coucher du soleil
  
  // Métadonnées
  timestamp: Date;               // Horodatage des données
  source: SourceMeteo;           // Source des données
  localisation: LocationInfo;    // Localisation associée
}

/**
 * Interface pour les prévisions météo quotidiennes
 */
export interface DailyForecast {
  date: Date;                    // Date de la prévision
  jourSemaine: string;           // Nom du jour (Lundi, Mardi...)
  
  // Températures
  temperatureMin: number;        // Température minimale
  temperatureMax: number;        // Température maximale
  temperatureMatin: number;      // Température le matin
  temperatureApresMidi: number;  // Température l'après-midi
  temperatureSoir: number;       // Température le soir
  
  // Précipitations
  precipitations: number;        // Total des précipitations (mm)
  probabilitePluie: number;      // Probabilité de pluie (%)
  typePrecipitation: 'pluie' | 'neige' | 'grele' | 'aucune';
  
  // Vent
  ventVitesseMoyenne: number;    // Vitesse moyenne du vent (km/h)
  ventRafalesMax: number;        // Rafales maximales (km/h)
  ventDirection: number;         // Direction dominante (degrés)
  
  // Autres
  humiditeMoyenne: number;       // Humidité moyenne (%)
  uvMax: number;                 // Indice UV maximal
  couvertureNuageuseMoyenne: number; // Couverture nuageuse moyenne (%)
  
  // Conditions
  conditionCode: ConditionMeteo; // Code de la condition
  conditionTexte: string;        // Description textuelle
  icone: string;                 // URL de l'icône
  
  // Soleil
  leverSoleil: Date;             // Lever du soleil
  coucherSoleil: Date;           // Coucher du soleil
  dureeJournee: number;          // Durée du jour en heures
  
  // Indices agricoles
  evapotranspiration: number;    // Évapotranspiration potentielle (mm)
  degreJoursCroissance: number;  // Degrés-jours de croissance
  risqueGel: boolean;            // Risque de gel
}

/**
 * Interface pour les prévisions horaires
 */
export interface HourlyForecast {
  heure: Date;                   // Heure de la prévision
  temperature: number;           // Température (°C)
  ressentie: number;             // Température ressentie (°C)
  humidite: number;              // Humidité (%)
  precipitations: number;        // Précipitations (mm)
  probabilitePluie: number;      // Probabilité de pluie (%)
  ventVitesse: number;           // Vitesse du vent (km/h)
  ventDirection: number;         // Direction du vent (degrés)
  couvertureNuageuse: number;    // Couverture nuageuse (%)
  conditionCode: ConditionMeteo; // Code de la condition
  conditionTexte: string;        // Description textuelle
  icone: string;                 // URL de l'icône
  uv: number;                    // Indice UV
}

/**
 * Interface pour les alertes météorologiques
 */
export interface WeatherAlert {
  id: string;                    // Identifiant unique
  titre: string;                 // Titre de l'alerte
  description: string;           // Description détaillée
  niveau: AlerteNiveau;          // Niveau de l'alerte
  type: AlerteType;              // Type d'alerte
  regions: string[];             // Régions concernées
  cultures: string[];            // Cultures concernées
  dateDebut: Date;               // Date de début
  dateFin: Date;                 // Date de fin
  instructions: string[];        // Instructions d'action
  conseilsAgricoles: string[];   // Recommandations agricoles
  source: string;                // Source de l'alerte
  estLue: boolean;               // Indique si l'alerte a été lue
  dateLecture?: Date;            // Date de lecture
}

/**
 * Interface pour les indices agricoles
 */
export interface AgriculturalIndices {
  // Indices de sol
  humiditeSol: number;           // Humidité du sol (%)
  temperatureSol: number;        // Température du sol (°C)
  capaciteRetention: number;     // Capacité de rétention d'eau (mm)
  
  // Indices climatiques
  evapotranspiration: number;    // Évapotranspiration potentielle (mm)
  deficitHydrique: number;       // Déficit hydrique (mm)
  stressHydrique: StressHydriqueNiveau; // Niveau de stress hydrique
  
  // Risques spécifiques
  risqueSecheresse: RisqueNiveau;     // Risque de sécheresse
  risqueMildiou: RisqueNiveau;        // Risque de mildiou (pour maïs, mil)
  risqueCercosporiose: RisqueNiveau;  // Risque de cercosporiose (coton)
  risqueFusariose: RisqueNiveau;      // Risque de fusariose (riz)
  
  // Recommandations
  recommandationsArrosage: string;    // Recommandations d'arrosage
  recommandationsTraitement: string;  // Recommandations de traitement
  periodeOptimaleSemis: {
    debut: Date;
    fin: Date;
    confiance: number;           // Niveau de confiance (%)
  };
  
  // Métadonnées
  dateCalcul: Date;              // Date de calcul
  methode: string;               // Méthode de calcul utilisée
  fiabilite: number;             // Niveau de fiabilité (%)
}

// ============================================
// INTERFACES POUR LES RÉPONSES API
// ============================================

/**
 * Réponse pour la météo actuelle
 */
export interface CurrentWeatherResponse {
  success: boolean;
  data: CurrentWeather;
  message?: string;
}

/**
 * Réponse pour les prévisions complètes
 */
export interface ForecastResponse {
  success: boolean;
  data: {
    actuel: CurrentWeather;
    quotidien: DailyForecast[];
    horaire: HourlyForecast[];
    indicesAgricoles?: AgriculturalIndices;
  };
  message?: string;
}

/**
 * Réponse pour les alertes météo
 */
export interface AlertsResponse {
  success: boolean;
  data: {
    alertes: WeatherAlert[];
    total: number;
    actives: number;
    niveauCritical: number;
  };
  message?: string;
}

// ============================================
// INTERFACES POUR LES PARAMÈTRES
// ============================================

/**
 * Paramètres de recherche météo
 */
export interface WeatherSearchParams {
  // Localisation
  latitude?: number;
  longitude?: number;
  region?: string;
  cercle?: string;
  commune?: string;
  
  // Période
  jours?: number;               // Nombre de jours de prévisions (1-7)
  heures?: number;              // Nombre d'heures (1-24)
  dateDebut?: Date;
  dateFin?: Date;
  
  // Options
  inclureAlertes?: boolean;
  inclureIndicesAgricoles?: boolean;
  inclureHoraires?: boolean;
  source?: SourceMeteo;
}

// ============================================
// TYPES UTILITAIRES
// ============================================

/**
 * Version simplifiée de la météo (pour affichage rapide)
 */
export type SimpleWeather = Pick<CurrentWeather, 
  'temperature' | 'conditionCode' | 'conditionTexte' | 'humidite' | 'ventVitesse'
>;

/**
 * Type pour l'historique météo
 */
export interface HistoricalWeather {
  date: Date;
  temperatureMoyenne: number;
  temperatureMin: number;
  temperatureMax: number;
  precipitationsTotales: number;
  humiditeMoyenne: number;
  ensoleillement: number;       // Heures d'ensoleillement
}

/**
 * Type pour les normales saisonnières
 */
export interface SeasonalNormals {
  mois: number;
  temperatureMoyenne: number;
  temperatureMinMoyenne: number;
  temperatureMaxMoyenne: number;
  precipitationsMoyennes: number;
  joursPluieMoyens: number;
}

// ============================================
// CONSTANTES ASSOCIÉES
// ============================================

/**
 * Libellés des conditions météo en français
 */
export const CONDITION_LABELS: Record<ConditionMeteo, string> = {
  clear_sky: 'Ciel dégagé',
  few_clouds: 'Peu nuageux',
  scattered_clouds: 'Nuages épars',
  broken_clouds: 'Nuageux',
  overcast: 'Couvert',
  light_rain: 'Pluie légère',
  moderate_rain: 'Pluie modérée',
  heavy_rain: 'Fortes pluies',
  extreme_rain: 'Pluies torrentielles',
  thunderstorm: 'Orage',
  heavy_thunderstorm: 'Orage violent',
  drizzle: 'Bruine',
  snow: 'Neige',
  mist: 'Brume',
  fog: 'Brouillard',
  haze: 'Brume sèche',
  dust: 'Poussière',
  sand: 'Sable',
  windy: 'Venteux',
  strong_wind: 'Vent fort',
  drought: 'Sécheresse',
  hot: 'Très chaud',
  cold: 'Froid',
};

/**
 * Icônes associées aux conditions météo (MaterialCommunityIcons)
 */
export const CONDITION_ICONS: Record<ConditionMeteo, string> = {
  clear_sky: 'weather-sunny',
  few_clouds: 'weather-partly-cloudy',
  scattered_clouds: 'weather-cloudy',
  broken_clouds: 'weather-cloudy',
  overcast: 'weather-cloudy',
  light_rain: 'weather-rainy',
  moderate_rain: 'weather-pouring',
  heavy_rain: 'weather-pouring',
  extreme_rain: 'weather-pouring',
  thunderstorm: 'weather-lightning',
  heavy_thunderstorm: 'weather-lightning-rainy',
  drizzle: 'weather-rainy',
  snow: 'weather-snowy',
  mist: 'weather-fog',
  fog: 'weather-fog',
  haze: 'weather-hazy',
  dust: 'weather-dust',
  sand: 'weather-sandstorm',
  windy: 'weather-windy',
  strong_wind: 'weather-windy-variant',
  drought: 'weather-sunny-alert',
  hot: 'thermometer-high',
  cold: 'thermometer-low',
};

/**
 * Couleurs associées aux niveaux d'alerte
 */
export const ALERTE_COLORS: Record<AlerteNiveau, string> = {
  info: '#2196F3',      // Bleu
  warning: '#FF9800',   // Orange
  critical: '#F44336',  // Rouge
  extreme: '#9C27B0',   // Violet
};

/**
 * Couleurs associées aux risques agricoles
 */
export const RISQUE_COLORS: Record<RisqueNiveau, string> = {
  faible: '#4CAF50',    // Vert
  moyen: '#FF9800',     // Orange
  eleve: '#F44336',     // Rouge
  tres_eleve: '#9C27B0', // Violet
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Obtient la direction du vent en texte
 * 
 * @param degrees - Direction en degrés (0-360)
 * @returns Direction cardinale
 */
export const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

/**
 * Obtient le libellé en français d'une condition météo
 * 
 * @param conditionCode - Code de la condition
 * @returns Libellé en français
 */
export const getConditionLabel = (conditionCode: ConditionMeteo): string => {
  return CONDITION_LABELS[conditionCode] || conditionCode;
};

/**
 * Obtient l'icône MaterialCommunityIcons pour une condition
 * 
 * @param conditionCode - Code de la condition
 * @returns Nom de l'icône
 */
export const getConditionIcon = (conditionCode: ConditionMeteo): string => {
  return CONDITION_ICONS[conditionCode] || 'weather-cloudy';
};

/**
 * Vérifie si une alerte est active
 * 
 * @param alert - L'alerte à vérifier
 * @returns true si l'alerte est active
 */
export const isAlerteActive = (alert: WeatherAlert): boolean => {
  const now = new Date();
  return now >= alert.dateDebut && now <= alert.dateFin;
};

/**
 * Obtient la couleur d'un niveau d'alerte
 * 
 * @param niveau - Niveau de l'alerte
 * @returns Code couleur hexadécimal
 */
export const getAlerteColor = (niveau: AlerteNiveau): string => {
  return ALERTE_COLORS[niveau];
};

/**
 * Obtient la couleur d'un niveau de risque
 * 
 * @param risque - Niveau de risque
 * @returns Code couleur hexadécimal
 */
export const getRisqueColor = (risque: RisqueNiveau): string => {
  return RISQUE_COLORS[risque];
};