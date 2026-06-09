/**
 * Endpoints Météo - Sènè Yiriwa
 * 
 * Ce fichier contient toutes les fonctions d'appel API liées aux données
 * météorologiques et climatiques pour les agriculteurs maliens.
 * 
 * Fonctionnalités :
 * - Météo actuelle par localisation
 * - Prévisions journalières et horaires
 * - Alertes météorologiques (pluies, sécheresse, vents)
 * - Indices agricoles (évapotranspiration, humidité du sol)
 * - Données historiques pour analyse
 * - Recommandations basées sur la météo
 * 
 * @module api/endpoints/meteo
 */

import { apiClient } from '../clients';
import { API_CONFIG } from '../../config/api.config';

// ============================================
// TYPES ET INTERFACES
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
  
  // Codes et conditions
  conditionCode: string;         // Code météo (pour l'icône)
  conditionTexte: string;        // Description textuelle
  icone: string;                 // URL de l'icône
  
  // Lever/coucher du soleil
  leverSoleil: Date;
  coucherSoleil: Date;
  
  // Métadonnées
  timestamp: Date;
  source: string;                // Source des données
  localisation: LocationInfo;
}

/**
 * Interface pour les prévisions météo
 */
export interface WeatherForecast {
  date: Date;
  jourSemaine: string;           // Lundi, Mardi, etc.
  
  // Températures
  temperatureMin: number;
  temperatureMax: number;
  temperatureMatin: number;
  temperatureApresMidi: number;
  temperatureSoir: number;
  
  // Précipitations
  precipitations: number;        // Total des précipitations (mm)
  probabilitePluie: number;      // Probabilité de pluie (%)
  typePrecipitation: 'pluie' | 'neige' | 'grele' | 'aucune';
  
  // Autres
  humiditeMoyenne: number;
  ventVitesseMoyenne: number;
  uvMax: number;
  
  // Condition
  conditionCode: string;
  conditionTexte: string;
  icone: string;
  
  // Indices agricoles
  evapotranspiration: number;    // Évapotranspiration potentielle (mm)
  degreJoursCroissance: number;  // Degrés-jours de croissance
  
  // Lever/coucher du soleil
  leverSoleil: Date;
  coucherSoleil: Date;
  dureeJournee: number;          // Durée du jour en heures
}

/**
 * Interface pour les prévisions horaires
 */
export interface HourlyForecast {
  heure: Date;
  temperature: number;
  ressentie: number;
  humidite: number;
  precipitations: number;
  probabilitePluie: number;
  ventVitesse: number;
  ventDirection: number;
  couvertureNuageuse: number;
  conditionCode: string;
  conditionTexte: string;
  icone: string;
}

/**
 * Interface pour les alertes météorologiques
 */
export interface WeatherAlert {
  id: string;
  titre: string;
  description: string;
  niveau: 'info' | 'warning' | 'critical' | 'extreme';
  type: AlertType;
  regions: string[];             // Régions concernées
  dateDebut: Date;
  dateFin: Date;
  instructions: string[];        // Conseils d'action
  conseilsAgricoles: string[];   // Recommandations pour agriculteurs
  source: string;
}

/**
 * Types d'alertes météorologiques
 */
export type AlertType = 
  | 'pluies_intenses'
  | 'secheresse'
  | 'canicule'
  | 'gel'
  | 'vent_fort'
  | 'orage'
  | 'inondation'
  | 'tempete';

/**
 * Interface pour les indices agricoles
 */
export interface AgriculturalIndices {
  // Indices de sol
  humiditeSol: number;           // Humidité du sol (%)
  temperatureSol: number;        // Température du sol (°C)
  capaciteRétention: number;     // Capacité de rétention d'eau (mm)
  
  // Indices climatiques
  evapotranspiration: number;    // Évapotranspiration potentielle (mm)
  deficitHydrique: number;       // Déficit hydrique (mm)
  stressHydrique: 'aucun' | 'faible' | 'modere' | 'severe' | 'extreme';
  
  // Indices pour cultures
  risqueSecheresse: 'faible' | 'moyen' | 'eleve' | 'tres_eleve';
  risqueMildiou: 'faible' | 'moyen' | 'eleve';      // Pour maïs, mil
  risqueCercosporiose: 'faible' | 'moyen' | 'eleve';  // Pour coton
  risqueFusariose: 'faible' | 'moyen' | 'eleve';      // Pour riz
  
  // Recommandations
  recommandationsArrosage: string;
  recommandationsTraitement: string;
  periodeOptimaleSemis: {
    debut: Date;
    fin: Date;
    confiance: number;           // Niveau de confiance (%)
  };
  
  // Méta
  dateCalcul: Date;
  methode: string;               // Méthode de calcul utilisée
}

/**
 * Interface pour les données historiques
 */
export interface HistoricalWeather {
  date: Date;
  temperatureMoyenne: number;
  temperatureMin: number;
  temperatureMax: number;
  precipitationsTotales: number;
  humiditeMoyenne: number;
  ensoleillement: number;        // Heures d'ensoleillement
}

/**
 * Interface pour la réponse des prévisions
 */
export interface ForecastResponse {
  success: boolean;
  data: {
    actuel: CurrentWeather;
    quotidien: WeatherForecast[];
    horaire: HourlyForecast[];
    indicesAgricoles: AgriculturalIndices;
  };
  message?: string;
}

/**
 * Interface pour la réponse des alertes
 */
export interface AlertsResponse {
  success: boolean;
  data: {
    alertes: WeatherAlert[];
    total: number;
    actives: number;
    niveauCritical: number;
  };
}

/**
 * Interface pour les paramètres de recherche météo
 */
export interface WeatherSearchParams {
  // Localisation
  latitude?: number;
  longitude?: number;
  region?: string;
  cercle?: string;
  
  // Période
  jours?: number;               // Nombre de jours de prévisions (1-7)
  heures?: number;              // Nombre d'heures (1-24)
  dateDebut?: Date;
  dateFin?: Date;
  
  // Options
  inclureAlertes?: boolean;
  inclureIndicesAgricoles?: boolean;
  inclureHoraires?: boolean;
  source?: string;              // Source météo (openweather, meteoblue, etc.)
}

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Récupère la météo actuelle pour une localisation
 * 
 * @param params - Paramètres de localisation
 * @returns Promise avec la météo actuelle
 * 
 * @example
 * // Par coordonnées GPS
 * const meteo = await getCurrentWeather({
 *   latitude: 12.65,
 *   longitude: -8.00
 * });
 * 
 * // Par région
 * const meteoSikasso = await getCurrentWeather({
 *   region: 'Sikasso'
 * });
 */
export const getCurrentWeather = async (
  params: WeatherSearchParams
): Promise<CurrentWeather> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.latitude && params.longitude) {
      queryParams.append('lat', String(params.latitude));
      queryParams.append('lon', String(params.longitude));
    }
    if (params.region) queryParams.append('region', params.region);
    if (params.cercle) queryParams.append('cercle', params.cercle);
    if (params.source) queryParams.append('source', params.source);
    
    const url = `${API_CONFIG.ENDPOINTS.METEO.CURRENT}?${queryParams.toString()}`;
    
    const response = await apiClient.get<{ success: boolean; data: CurrentWeather }>(url);
    
    if (__DEV__) {
      console.log(`✅ [Météo] Météo actuelle récupérée: ${response.data.temperature}°C`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Météo] Erreur récupération météo actuelle:', error);
    throw error;
  }
};

/**
 * Récupère les prévisions météo
 * 
 * @param params - Paramètres de localisation et période
 * @returns Promise avec les prévisions (quotidiennes, horaires, indices)
 * 
 * @example
 * // Prévisions 7 jours avec indices agricoles
 * const previsions = await getWeatherForecast({
 *   latitude: 12.65,
 *   longitude: -8.00,
 *   jours: 7,
 *   inclureIndicesAgricoles: true,
 *   inclureHoraires: true
 * });
 * 
 * console.log(`Température max: ${previsions.quotidien[0].temperatureMax}°C`);
 * console.log(`Risque sécheresse: ${previsions.indicesAgricoles.risqueSecheresse}`);
 */
export const getWeatherForecast = async (
  params: WeatherSearchParams
): Promise<ForecastResponse['data']> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.latitude && params.longitude) {
      queryParams.append('lat', String(params.latitude));
      queryParams.append('lon', String(params.longitude));
    }
    if (params.region) queryParams.append('region', params.region);
    if (params.cercle) queryParams.append('cercle', params.cercle);
    if (params.jours) queryParams.append('jours', String(params.jours));
    if (params.heures) queryParams.append('heures', String(params.heures));
    if (params.inclureAlertes) queryParams.append('alertes', 'true');
    if (params.inclureIndicesAgricoles) queryParams.append('indices', 'true');
    if (params.inclureHoraires) queryParams.append('horaire', 'true');
    
    const url = `${API_CONFIG.ENDPOINTS.METEO.FORECAST}?${queryParams.toString()}`;
    
    const response = await apiClient.get<ForecastResponse>(url);
    
    if (__DEV__) {
      console.log(`✅ [Météo] Prévisions récupérées: ${response.data.quotidien.length} jours`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Météo] Erreur récupération prévisions:', error);
    throw error;
  }
};

/**
 * Récupère les prévisions simplifiées pour affichage rapide
 * Version légère sans indices agricoles détaillés
 * 
 * @param params - Paramètres de localisation
 * @returns Promise avec prévisions simplifiées
 * 
 * @example
 * const simple = await getSimpleForecast({
 *   region: 'Koulikoro',
 *   jours: 3
 * });
 */
export const getSimpleForecast = async (
  params: WeatherSearchParams
): Promise<WeatherForecast[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.latitude && params.longitude) {
      queryParams.append('lat', String(params.latitude));
      queryParams.append('lon', String(params.longitude));
    }
    if (params.region) queryParams.append('region', params.region);
    if (params.jours) queryParams.append('jours', String(Math.min(params.jours, 5)));
    
    const url = `${API_CONFIG.ENDPOINTS.METEO.SIMPLE_FORECAST}?${queryParams.toString()}`;
    
    const response = await apiClient.get<{ success: boolean; data: WeatherForecast[] }>(url);
    
    if (__DEV__) {
      console.log(`✅ [Météo] Prévisions simples récupérées: ${response.data.length} jours`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Météo] Erreur récupération prévisions simples:', error);
    throw error;
  }
};

/**
 * Récupère les prévisions horaires pour aujourd'hui
 * 
 * @param params - Paramètres de localisation
 * @returns Promise avec prévisions horaires
 * 
 * @example
 * const horaires = await getHourlyForecast({
 *   latitude: 12.65,
 *   longitude: -8.00
 * });
 * 
 * horaires.forEach(heure => {
 *   console.log(`${heure.heure}: ${heure.temperature}°C, ${heure.probabilitePluie}% pluie`);
 * });
 */
export const getHourlyForecast = async (
  params: WeatherSearchParams
): Promise<HourlyForecast[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.latitude && params.longitude) {
      queryParams.append('lat', String(params.latitude));
      queryParams.append('lon', String(params.longitude));
    }
    if (params.region) queryParams.append('region', params.region);
    if (params.heures) queryParams.append('heures', String(params.heures));
    
    const url = `${API_CONFIG.ENDPOINTS.METEO.HOURLY}?${queryParams.toString()}`;
    
    const response = await apiClient.get<{ success: boolean; data: HourlyForecast[] }>(url);
    
    if (__DEV__) {
      console.log(`✅ [Météo] ${response.data.length} prévisions horaires récupérées`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Météo] Erreur récupération prévisions horaires:', error);
    throw error;
  }
};

// ============================================
// ALERTES MÉTÉOROLOGIQUES
// ============================================

/**
 * Récupère les alertes météorologiques actives
 * 
 * @param params - Paramètres de localisation et filtres
 * @returns Promise avec les alertes
 * 
 * @example
 * // Toutes les alertes pour la région Sikasso
 * const alertes = await getWeatherAlerts({
 *   region: 'Sikasso'
 * });
 * 
 * // Afficher les alertes critiques
 * alertes.data.alertes
 *   .filter(a => a.niveau === 'critical')
 *   .forEach(alerte => {
 *     console.log(`⚠️ CRITIQUE: ${alerte.titre}`);
 *   });
 */
export const getWeatherAlerts = async (
  params: { region?: string; niveau?: WeatherAlert['niveau']; type?: AlertType }
): Promise<AlertsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.region) queryParams.append('region', params.region);
    if (params.niveau) queryParams.append('niveau', params.niveau);
    if (params.type) queryParams.append('type', params.type);
    
    const url = `${API_CONFIG.ENDPOINTS.METEO.ALERTS}?${queryParams.toString()}`;
    
    const response = await apiClient.get<AlertsResponse>(url);
    
    if (__DEV__) {
      console.log(`⚠️ [Météo] ${response.data.total} alertes récupérées (${response.data.niveauCritical} critiques)`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ [Météo] Erreur récupération alertes:', error);
    throw error;
  }
};

/**
 * Récupère les alertes actives pour une culture spécifique
 * 
 * @param culture - Type de culture
 * @param region - Région du Mali
 * @returns Promise avec les alertes pertinentes
 * 
 * @example
 * const alertesMais = await getAlertsByCulture('mais', 'Sikasso');
 * // Alertes sur le mildiou, sécheresse, etc.
 */
export const getAlertsByCulture = async (
  culture: string,
  region: string
): Promise<WeatherAlert[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: WeatherAlert[] }>(
      API_CONFIG.ENDPOINTS.METEO.ALERTS_BY_CULTURE,
      {
        params: { culture, region },
      }
    );
    
    if (__DEV__) {
      console.log(`⚠️ [Météo] ${response.data.length} alertes pour ${culture} à ${region}`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`❌ [Météo] Erreur récupération alertes pour ${culture}:`, error);
    throw error;
  }
};

// ============================================
// INDICES AGRICOLES
// ============================================

/**
 * Récupère les indices agricoles pour une localisation
 * 
 * @param params - Paramètres de localisation
 * @returns Promise avec les indices agricoles
 * 
 * @example
 * const indices = await getAgriculturalIndices({
 *   latitude: 12.65,
 *   longitude: -8.00
 * });
 * 
 * if (indices.risqueSecheresse === 'eleve') {
 *   console.log('Recommandation:', indices.recommandationsArrosage);
 * }
 */
export const getAgriculturalIndices = async (
  params: { latitude?: number; longitude?: number; region?: string; culture?: string }
): Promise<AgriculturalIndices> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.latitude && params.longitude) {
      queryParams.append('lat', String(params.latitude));
      queryParams.append('lon', String(params.longitude));
    }
    if (params.region) queryParams.append('region', params.region);
    if (params.culture) queryParams.append('culture', params.culture);
    
    const url = `${API_CONFIG.ENDPOINTS.METEO.INDICES}?${queryParams.toString()}`;
    
    const response = await apiClient.get<{ success: boolean; data: AgriculturalIndices }>(url);
    
    if (__DEV__) {
      console.log(`✅ [Météo] Indices agricoles récupérés: stress hydrique ${response.data.stressHydrique}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Météo] Erreur récupération indices agricoles:', error);
    throw error;
  }
};

/**
 * Récupère les indices agricoles pour plusieurs cultures
 * 
 * @param cultures - Liste des cultures
 * @param params - Paramètres de localisation
 * @returns Promise avec les indices par culture
 * 
 * @example
 * const indicesMulti = await getMultiCultureIndices(
 *   ['mais', 'mil', 'coton'],
 *   { region: 'Koulikoro' }
 * );
 */
export const getMultiCultureIndices = async (
  cultures: string[],
  params: { latitude?: number; longitude?: number; region?: string }
): Promise<Record<string, AgriculturalIndices>> => {
  try {
    const promises = cultures.map(culture => 
      getAgriculturalIndices({ ...params, culture })
    );
    
    const results = await Promise.all(promises);
    const indicesMap: Record<string, AgriculturalIndices> = {};
    
    cultures.forEach((culture, index) => {
      indicesMap[culture] = results[index];
    });
    
    if (__DEV__) {
      console.log(`✅ [Météo] Indices pour ${cultures.length} cultures récupérés`);
    }
    
    return indicesMap;
  } catch (error) {
    console.error('❌ [Météo] Erreur récupération indices multi-cultures:', error);
    throw error;
  }
};

// ============================================
// DONNÉES HISTORIQUES
// ============================================

/**
 * Récupère les données météo historiques
 * 
 * @param params - Paramètres de localisation et période
 * @returns Promise avec données historiques
 * 
 * @example
 * const historique = await getHistoricalWeather({
 *   region: 'Sikasso',
 *   dateDebut: new Date('2024-01-01'),
 *   dateFin: new Date('2024-12-31')
 * });
 */
export const getHistoricalWeather = async (
  params: {
    region: string;
    dateDebut: Date;
    dateFin: Date;
    aggregate?: 'daily' | 'monthly' | 'yearly';
  }
): Promise<HistoricalWeather[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: HistoricalWeather[] }>(
      API_CONFIG.ENDPOINTS.METEO.HISTORICAL,
      {
        params: {
          region: params.region,
          dateDebut: params.dateDebut.toISOString(),
          dateFin: params.dateFin.toISOString(),
          aggregate: params.aggregate || 'daily',
        },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Météo] ${response.data.length} enregistrements historiques récupérés`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Météo] Erreur récupération données historiques:', error);
    throw error;
  }
};

/**
 * Récupère les normales saisonnières (moyennes historiques)
 * 
 * @param region - Région du Mali
 * @param mois - Mois spécifique (1-12) ou 'all'
 * @returns Promise avec les normales saisonnières
 * 
 * @example
 * const normales = await getSeasonalNormals('Sikasso', 'all');
 * console.log(`Pluies moyennes en août: ${normales.aout.precipitations}mm`);
 */
export const getSeasonalNormals = async (
  region: string,
  mois?: number | 'all'
): Promise<Record<string, { temperatureMoyenne: number; precipitations: number; humidite: number }>> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      API_CONFIG.ENDPOINTS.METEO.NORMALS,
      {
        params: { region, mois: mois === 'all' ? 'all' : mois },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Météo] Normales saisonnières pour ${region} récupérées`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`❌ [Météo] Erreur récupération normales pour ${region}:`, error);
    throw error;
  }
};

// ============================================
// RECOMMANDATIONS BASÉES SUR LA MÉTÉO
// ============================================

/**
 * Récupère les recommandations agricoles basées sur la météo
 * 
 * @param params - Paramètres de localisation et culture
 * @returns Promise avec recommandations
 * 
 * @example
 * const reco = await getWeatherRecommendations({
 *   latitude: 12.65,
 *   longitude: -8.00,
 *   culture: 'mais'
 * });
 * 
 * console.log('Recommandations du jour:', reco);
 */
export const getWeatherRecommendations = async (
  params: { latitude?: number; longitude?: number; region?: string; culture?: string }
): Promise<{
  arrosage: string;
  traitement: string;
  recolte: string;
  semis: string;
  general: string[];
}> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.latitude && params.longitude) {
      queryParams.append('lat', String(params.latitude));
      queryParams.append('lon', String(params.longitude));
    }
    if (params.region) queryParams.append('region', params.region);
    if (params.culture) queryParams.append('culture', params.culture);
    
    const url = `${API_CONFIG.ENDPOINTS.METEO.RECOMMENDATIONS}?${queryParams.toString()}`;
    
    const response = await apiClient.get<{ success: boolean; data: any }>(url);
    
    if (__DEV__) {
      console.log(`✅ [Météo] Recommandations agricoles récupérées`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Météo] Erreur récupération recommandations:', error);
    throw error;
  }
};

// ============================================
// SATELLITE ET IMAGERIE
// ============================================

/**
 * Récupère l'image satellite pour une région
 * 
 * @param params - Paramètres de localisation
 * @returns Promise avec URL de l'image satellite
 * 
 * @example
 * const imageUrl = await getSatelliteImage({
 *   region: 'Sikasso',
 *   type: 'clouds'
 * });
 * // Afficher l'image dans l'application
 */
export const getSatelliteImage = async (
  params: { region: string; type?: 'clouds' | 'precipitation' | 'temperature' }
): Promise<string> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: { url: string } }>(
      API_CONFIG.ENDPOINTS.METEO.SATELLITE,
      {
        params: {
          region: params.region,
          type: params.type || 'clouds',
        },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Météo] Image satellite récupérée pour ${params.region}`);
    }
    
    return response.data.url;
  } catch (error) {
    console.error(`❌ [Météo] Erreur récupération image satellite pour ${params.region}:`, error);
    throw error;
  }
};

// ============================================
// RADAR DE PLUIE
// ============================================

/**
 * Récupère les données du radar de pluie
 * 
 * @param params - Paramètres de localisation
 * @returns Promise avec données radar
 * 
 * @example
 * const radar = await getRainRadar({
 *   latitude: 12.65,
 *   longitude: -8.00,
 *   rayon: 50 // 50 km
 * });
 */
export const getRainRadar = async (
  params: { latitude: number; longitude: number; rayon?: number }
): Promise<{
  imageUrl: string;
  intensity: number;
  movement: string;
  precipitationNow: number;
  precipitationNextHour: number;
}> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      API_CONFIG.ENDPOINTS.METEO.RADAR,
      {
        params: {
          lat: params.latitude,
          lon: params.longitude,
          rayon: params.rayon || 50,
        },
      }
    );
    
    if (__DEV__) {
      console.log(`✅ [Météo] Radar de pluie récupéré`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [Météo] Erreur récupération radar de pluie:', error);
    throw error;
  }
};

// ============================================
// UTILITAIRES
// ============================================

/**
 * Formate la condition météo en texte lisible
 * 
 * @param conditionCode - Code météo
 * @param lang - Langue ('fr' ou 'bm')
 * @returns Texte formaté
 * 
 * @example
 * const texte = formatWeatherCondition('clear_sky', 'fr');
 * // Retourne: 'Ciel dégagé'
 */
export const formatWeatherCondition = (conditionCode: string, lang: 'fr' | 'bm' = 'fr'): string => {
  const conditions: Record<string, Record<'fr' | 'bm', string>> = {
    clear_sky: {
      fr: 'Ciel dégagé',
      bm: 'Kabakunanun bɛ',
    },
    few_clouds: {
      fr: 'Peu nuageux',
      bm: 'Sankaba dɔɔnin',
    },
    scattered_clouds: {
      fr: 'Nuages épars',
      bm: 'Sankaba fɔlɔfɔlɔ',
    },
    broken_clouds: {
      fr: 'Nuageux',
      bm: 'Sankaba caman',
    },
    overcast: {
      fr: 'Couvert',
      bm: 'Sankaba bɛɛ',
    },
    light_rain: {
      fr: 'Pluie légère',
      bm: 'Sanji dɔɔnin',
    },
    moderate_rain: {
      fr: 'Pluie modérée',
      bm: 'Sanji cɛman',
    },
    heavy_rain: {
      fr: 'Fortes pluies',
      bm: 'Sanji baa',
    },
    thunderstorm: {
      fr: 'Orage',
      bm: 'Finyɛw ni sanji',
    },
    drought: {
      fr: 'Sécheresse',
      bm: 'Kɔmɔgɔn',
    },
  };
  
  return conditions[conditionCode]?.[lang] || conditionCode;
};

/**
 * Obtient l'icône météo appropriée
 * 
 * @param conditionCode - Code météo
 * @returns Nom de l'icône MaterialCommunityIcons
 * 
 * @example
 * const iconName = getWeatherIcon('heavy_rain');
 * // Retourne: 'weather-pouring'
 */
export const getWeatherIcon = (conditionCode: string): string => {
  const icons: Record<string, string> = {
    clear_sky: 'weather-sunny',
    few_clouds: 'weather-partly-cloudy',
    scattered_clouds: 'weather-cloudy',
    broken_clouds: 'weather-cloudy',
    overcast: 'weather-cloudy',
    light_rain: 'weather-rainy',
    moderate_rain: 'weather-pouring',
    heavy_rain: 'weather-pouring',
    thunderstorm: 'weather-lightning',
    drought: 'weather-sunny-alert',
  };
  
  return icons[conditionCode] || 'weather-cloudy';
};

/**
 * Convertit la direction du vent en texte
 * 
 * @param degrees - Direction en degrés (0-360)
 * @returns Direction cardinale
 * 
 * @example
 * const direction = getWindDirection(180); // Retourne 'Sud'
 */
export const getWindDirection = (degrees: number): string => {
  const directions = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

/**
 * Exporte toutes les fonctions sous un namespace pour une utilisation plus propre
 * 
 * @example
 * import MeteoAPI from './endpoints/meteo';
 * 
 * const meteo = await MeteoAPI.getCurrentWeather({ region: 'Sikasso' });
 * const alertes = await MeteoAPI.getWeatherAlerts({ region: 'Sikasso' });
 */
export default {
  // Météo actuelle et prévisions
  getCurrentWeather,
  getWeatherForecast,
  getSimpleForecast,
  getHourlyForecast,
  
  // Alertes
  getWeatherAlerts,
  getAlertsByCulture,
  
  // Indices agricoles
  getAgriculturalIndices,
  getMultiCultureIndices,
  
  // Données historiques
  getHistoricalWeather,
  getSeasonalNormals,
  
  // Recommandations
  getWeatherRecommendations,
  
  // Imagerie
  getSatelliteImage,
  getRainRadar,
  
  // Utilitaires
  formatWeatherCondition,
  getWeatherIcon,
  getWindDirection,
};