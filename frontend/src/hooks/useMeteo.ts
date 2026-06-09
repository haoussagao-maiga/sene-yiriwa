/**
 * Hook useMeteo - Sènè Yiriwa
 * 
 * Gère l'état et les actions liées à la météo de l'application.
 * Récupère les données météorologiques, gère les rafraîchissements
 * et maintient un cache local.
 * 
 * @module hooks/useMeteo
 */

import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';

// Types pour la météo
export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  feelsLike: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  rainfall: number;
  cloudCover: number;
  // Propriétés additionnelles pour compatibilité
  temperatureMin?: number;
  temperatureMax?: number;
  condition?: string;
  conditionCode?: string;
  humidite?: number;
  ventVitesse?: number;
  probabilitePluie?: number;
  uv?: number;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  description: string;
  icon: string;
  rainProbability: number;
  windSpeed: number;
  // Propriétés additionnelles pour compatibilité
  temperatureMax?: number;
  temperatureMin?: number;
  probabilitePluie?: number;
  conditionCode?: string;
  day?: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  description: string;
  icon: string;
}

export interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AgriculturalIndices {
  phytosanitaire: number;
  saintete: number;
  maturite: number;
  // Propriétés additionnelles pour compatibilité
  risqueSecheresse?: string;
  stressHydrique?: string;
  recommandationsArrosage?: string;
  periodeOptimaleSemis?: {
    debut: string;
    fin: string;
  };
}

/**
 * Hook pour gérer la météo
 * @returns Données et actions de météo
 */
export const useMeteo = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État local pour les données météorologiques
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [agriculturalIndices, setAgriculturalIndices] = useState<AgriculturalIndices | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<string>('API');
  const [currentLocation, setCurrentLocation] = useState<string>('');

  // Fonction pour rafraîchir la météo
  const refreshWeather = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      setLastUpdated(new Date());
      // TODO: Ajouter l'appel API réel pour récupérer la météo
      setIsRefreshing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur météo');
      setIsRefreshing(false);
    }
  }, []);

  // Fonction pour charger tous les données météorologiques
  const loadAllWeatherData = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Implémenter la logique de chargement complet
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur météo');
      setIsLoading(false);
    }
  }, []);

  // Fonction pour gérer les permissions de localisation
  const getLocationAndPermission = useCallback(async () => {
    try {
      // TODO: Implémenter la logique de localisation
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de localisation');
      return false;
    }
  }, []);

  // Fonction pour vérifier les permissions
  const hasLocationPermission = useCallback(async () => {
    try {
      // TODO: Vérifier les permissions de localisation
      return true;
    } catch (err) {
      return false;
    }
  }, []);

  // Effet pour charger la météo au montage du composant
  useEffect(() => {
    const loadWeather = async () => {
      setIsLoading(true);
      try {
        // TODO: Implémenter la logique de chargement initial
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur météo');
        setIsLoading(false);
      }
    };

    loadWeather();
  }, []);

  return {
    currentWeather,
    dailyForecast,
    hourlyForecast,
    location,
    currentLocation,
    alerts,
    agriculturalIndices,
    lastUpdated,
    dataSource,
    isLoading,
    isRefreshing,
    error,
    refreshWeather,
    loadAllWeatherData,
    getLocationAndPermission,
    hasLocationPermission,
    setLocation,
  };
};

export default useMeteo;
