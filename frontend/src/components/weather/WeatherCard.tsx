/**
 * Composant WeatherCard - Sènè Yiriwa
 * 
 * Ce composant affiche les informations météorologiques de manière
 * claire et attrayante pour les agriculteurs maliens.
 * 
 * Fonctionnalités :
 * - Affichage de la météo actuelle (température, conditions, humidité, vent)
 * - Prévisions sur plusieurs jours
 * - Alertes météorologiques
 * - Indices agricoles (risque sécheresse, stress hydrique)
 * - Recommandations pour l'agriculteur
 * - Animation au chargement
 * - Mode compact pour listes
 * - Mode détaillé pour écran principal
 * 
 * @module components/weather/WeatherCard
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../styles/colors';
import { typography } from '../../styles/typography';
import WeatherIcon from './WeatherIcon';

const { width: screenWidth } = Dimensions.get('window');

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour les données météo actuelles
 */
export interface CurrentWeatherData {
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  condition: string;
  conditionCode: string;
  humidite: number;
  ventVitesse: number;
  ventDirection: number;
  precipitations: number;
  probabilitePluie: number;
  uv: number;
  leverSoleil?: string;
  coucherSoleil?: string;
}

/**
 * Interface pour les prévisions journalières
 */
export interface DailyForecast {
  day: string;
  date: Date;
  temperatureMin: number;
  temperatureMax: number;
  conditionCode: string;
  condition: string;
  probabilitePluie: number;
  precipitations: number;
}

/**
 * Interface pour les alertes météo
 */
export interface WeatherAlert {
  id: string;
  type: 'pluie' | 'secheresse' | 'vent' | 'temperature' | 'orage';
  niveau: 'info' | 'warning' | 'critical';
  message: string;
}

/**
 * Interface pour les indices agricoles
 */
export interface AgriculturalIndex {
  risqueSecheresse: 'faible' | 'moyen' | 'eleve' | 'tres_eleve';
  stressHydrique: 'aucun' | 'faible' | 'modere' | 'severe';
  recommandationArrosage: string;
  periodeOptimaleSemis?: {
    debut: string;
    fin: string;
  };
}

/**
 * Props du composant WeatherCard
 */
export interface WeatherCardProps {
  /** Données météo actuelles */
  currentWeather?: CurrentWeatherData;
  
  /** Prévisions sur plusieurs jours */
  forecast?: DailyForecast[];
  
  /** Alertes météo */
  alerts?: WeatherAlert[];
  
  /** Indices agricoles */
  agriculturalIndex?: AgriculturalIndex;
  
  /** Indique si les données sont en chargement */
  loading?: boolean;
  
  /** Mode d'affichage (compact ou détaillé) */
  variant?: 'compact' | 'detailed';
  
  /** Afficher les indices agricoles */
  showAgriculturalIndices?: boolean;
  
  /** Afficher les alertes */
  showAlerts?: boolean;
  
  /** Fonction de rappel au clic sur la carte */
  onPress?: () => void;
  
  /** Fonction de rappel au clic sur les alertes */
  onAlertPress?: (alert: WeatherAlert) => void;
  
  /** Fonction de rappel pour rafraîchir */
  onRefresh?: () => void;
  
  /** Style personnalisé */
  containerStyle?: any;
  
  /** Titre personnalisé */
  title?: string;
  
  /** Localisation */
  location?: string;
}

// ============================================
// SOUS-COMPOSANTS
// ============================================

/**
 * Affiche la météo actuelle (température et condition)
 */
const CurrentWeatherSection: React.FC<{
  data: CurrentWeatherData;
  location?: string;
}> = ({ data, location }) => {
  return (
    <View style={styles.currentWeatherContainer}>
      {/* Localisation */}
      {location && (
        <View style={styles.locationContainer}>
          <Icon name="map-marker" size={16} color={colors.gray[600]} />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      )}
      
      {/* Température et icône */}
      <View style={styles.temperatureContainer}>
        <WeatherIcon conditionCode={data.conditionCode} size={64} />
        <Text style={styles.temperature}>
          {Math.round(data.temperature)}°
        </Text>
        <Text style={styles.feelsLike}>
          Ressenti {Math.round(data.temperature)}°
        </Text>
      </View>
      
      {/* Condition météo */}
      <Text style={styles.condition}>{data.condition}</Text>
      
      {/* Températures min/max */}
      <View style={styles.tempRangeContainer}>
        <View style={styles.tempRangeItem}>
          <Icon name="arrow-up" size={16} color={colors.error} />
          <Text style={styles.tempRangeText}>
            {Math.round(data.temperatureMax)}°
          </Text>
        </View>
        <View style={styles.tempRangeItem}>
          <Icon name="arrow-down" size={16} color={colors.primary} />
          <Text style={styles.tempRangeText}>
            {Math.round(data.temperatureMin)}°
          </Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Affiche les détails météo (humidité, vent, précipitations)
 */
const WeatherDetailsSection: React.FC<{
  data: CurrentWeatherData;
}> = ({ data }) => {
  const details = [
    {
      icon: 'water-percent',
      label: 'Humidité',
      value: `${data.humidite}%`,
      color: colors.info,
    },
    {
      icon: 'weather-windy',
      label: 'Vent',
      value: `${Math.round(data.ventVitesse)} km/h`,
      color: colors.gray[600],
    },
    {
      icon: 'water',
      label: 'Pluie',
      value: `${data.probabilitePluie}%`,
      color: colors.info,
    },
    {
      icon: 'weather-sunny',
      label: 'UV',
      value: `${data.uv}`,
      color: colors.warning,
    },
  ];

  return (
    <View style={styles.detailsContainer}>
      {details.map((detail, index) => (
        <View key={index} style={styles.detailItem}>
          <Icon name={detail.icon} size={24} color={detail.color} />
          <Text style={styles.detailValue}>{detail.value}</Text>
          <Text style={styles.detailLabel}>{detail.label}</Text>
        </View>
      ))}
    </View>
  );
};

/**
 * Affiche les prévisions sur plusieurs jours
 */
const ForecastSection: React.FC<{
  forecast: DailyForecast[];
}> = ({ forecast }) => {
  const daysToShow = forecast.slice(0, 5);
  
  return (
    <View style={styles.forecastContainer}>
      <Text style={styles.sectionTitle}>Prévisions 5 jours</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.forecastScroll}
      >
        {daysToShow.map((day, index) => (
          <View key={index} style={styles.forecastDay}>
            <Text style={styles.forecastDayName}>{day.day}</Text>
            <WeatherIcon conditionCode={day.conditionCode} size={32} />
            <Text style={styles.forecastTemp}>
              {Math.round(day.temperatureMax)}°
            </Text>
            <Text style={styles.forecastTempMin}>
              {Math.round(day.temperatureMin)}°
            </Text>
            <View style={styles.forecastRain}>
              <Icon name="water" size={12} color={colors.info} />
              <Text style={styles.forecastRainText}>
                {day.probabilitePluie}%
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

/**
 * Affiche les alertes météo
 */
const AlertsSection: React.FC<{
  alerts: WeatherAlert[];
  onAlertPress?: (alert: WeatherAlert) => void;
}> = ({ alerts, onAlertPress }) => {
  const getAlertColor = (niveau: string) => {
    switch (niveau) {
      case 'critical':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.info;
    }
  };
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'pluie':
        return 'weather-pouring';
      case 'secheresse':
        return 'weather-sunny-alert';
      case 'vent':
        return 'weather-windy-variant';
      case 'temperature':
        return 'thermometer-high';
      case 'orage':
        return 'weather-lightning';
      default:
        return 'alert';
    }
  };
  
  if (alerts.length === 0) return null;
  
  return (
    <View style={styles.alertsContainer}>
      <Text style={styles.sectionTitle}>Alertes météo</Text>
      {alerts.map((alert) => (
        <TouchableOpacity
          key={alert.id}
          style={[
            styles.alertItem,
            { backgroundColor: getAlertColor(alert.niveau) + '10' },
          ]}
          onPress={() => onAlertPress?.(alert)}
          activeOpacity={0.7}
        >
          <Icon
            name={getAlertIcon(alert.type)}
            size={24}
            color={getAlertColor(alert.niveau)}
          />
          <View style={styles.alertContent}>
            <Text style={[styles.alertMessage, { color: getAlertColor(alert.niveau) }]}>
              {alert.message}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={getAlertColor(alert.niveau)} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Affiche les indices agricoles et recommandations
 */
const AgriculturalSection: React.FC<{
  index: AgriculturalIndex;
}> = ({ index }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'tres_eleve':
        return colors.error;
      case 'eleve':
        return colors.warning;
      case 'moyen':
        return colors.secondary;
      default:
        return colors.success;
    }
  };
  
  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'tres_eleve':
        return 'Très élevé';
      case 'eleve':
        return 'Élevé';
      case 'moyen':
        return 'Moyen';
      default:
        return 'Faible';
    }
  };
  
  const getStressColor = (stress: string) => {
    switch (stress) {
      case 'severe':
        return colors.error;
      case 'modere':
        return colors.warning;
      case 'faible':
        return colors.secondary;
      default:
        return colors.success;
    }
  };
  
  const getStressText = (stress: string) => {
    switch (stress) {
      case 'severe':
        return 'Sévère';
      case 'modere':
        return 'Modéré';
      case 'faible':
        return 'Faible';
      default:
        return 'Aucun';
    }
  };
  
  return (
    <View style={styles.agriculturalContainer}>
      <Text style={styles.sectionTitle}>Indices agricoles</Text>
      
      {/* Risque sécheresse */}
      <View style={styles.indexItem}>
        <View style={styles.indexHeader}>
          <Icon name="weather-sunny-alert" size={20} color={getRiskColor(index.risqueSecheresse)} />
          <Text style={styles.indexLabel}>Risque sécheresse</Text>
        </View>
        <Text style={[styles.indexValue, { color: getRiskColor(index.risqueSecheresse) }]}>
          {getRiskText(index.risqueSecheresse)}
        </Text>
      </View>
      
      {/* Stress hydrique */}
      <View style={styles.indexItem}>
        <View style={styles.indexHeader}>
          <Icon name="water-alert" size={20} color={getStressColor(index.stressHydrique)} />
          <Text style={styles.indexLabel}>Stress hydrique</Text>
        </View>
        <Text style={[styles.indexValue, { color: getStressColor(index.stressHydrique) }]}>
          {getStressText(index.stressHydrique)}
        </Text>
      </View>
      
      {/* Recommandation */}
      <View style={styles.recommandationContainer}>
        <Icon name="lightbulb" size={20} color={colors.warning} />
        <Text style={styles.recommandationText}>
          {index.recommandationArrosage}
        </Text>
      </View>
      
      {/* Période optimale de semis */}
      {index.periodeOptimaleSemis && (
        <View style={styles.semisContainer}>
          <Icon name="calendar" size={16} color={colors.primary} />
          <Text style={styles.semisText}>
            Période optimale de semis: {index.periodeOptimaleSemis.debut} - {index.periodeOptimaleSemis.fin}
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Version compacte de la carte météo (pour listes)
 */
const CompactWeatherCard: React.FC<{
  currentWeather: CurrentWeatherData;
  location?: string;
  onPress?: () => void;
}> = ({ currentWeather, location, onPress }) => {
  return (
    <TouchableOpacity style={styles.compactContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.compactLeft}>
        <WeatherIcon conditionCode={currentWeather.conditionCode} size={48} />
        <View style={styles.compactInfo}>
          <Text style={styles.compactTemp}>{Math.round(currentWeather.temperature)}°</Text>
          <Text style={styles.compactCondition}>{currentWeather.condition}</Text>
        </View>
      </View>
      
      <View style={styles.compactRight}>
        {location && (
          <View style={styles.compactLocation}>
            <Icon name="map-marker" size={12} color={colors.gray[500]} />
            <Text style={styles.compactLocationText}>{location}</Text>
          </View>
        )}
        <View style={styles.compactDetails}>
          <View style={styles.compactDetail}>
            <Icon name="water-percent" size={14} color={colors.gray[500]} />
            <Text style={styles.compactDetailText}>{currentWeather.humidite}%</Text>
          </View>
          <View style={styles.compactDetail}>
            <Icon name="weather-windy" size={14} color={colors.gray[500]} />
            <Text style={styles.compactDetailText}>{Math.round(currentWeather.ventVitesse)} km/h</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * WeatherCard - Carte météo complète
 * 
 * @example
 * // Carte météo détaillée
 * <WeatherCard
 *   currentWeather={weatherData}
 *   forecast={forecastData}
 *   alerts={alerts}
 *   agriculturalIndex={agriIndex}
 *   location="Sikasso, Mali"
 *   onPress={() => navigation.navigate('Meteo')}
 * />
 * 
 * @example
 * // Version compacte
 * <WeatherCard
 *   currentWeather={weatherData}
 *   variant="compact"
 *   location="Sikasso"
 *   onPress={() => navigation.navigate('Meteo')}
 * />
 * 
 * @example
 * // En chargement
 * <WeatherCard loading />
 */
const WeatherCard: React.FC<WeatherCardProps> = ({
  currentWeather,
  forecast = [],
  alerts = [],
  agriculturalIndex,
  loading = false,
  variant = 'detailed',
  showAgriculturalIndices = true,
  showAlerts = true,
  onPress,
  onAlertPress,
  onRefresh,
  containerStyle,
  title = "Météo",
  location,
}) => {
  // Animation d'entrée
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Gestion du refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };
  
  // Affichage du chargement
  if (loading) {
    return (
      <View style={[styles.loadingContainer, containerStyle]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement météo...</Text>
      </View>
    );
  }
  
  // Pas de données
  if (!currentWeather) {
    return (
      <TouchableOpacity style={[styles.errorContainer, containerStyle]} onPress={onRefresh}>
        <Icon name="weather-cloudy-alert" size={48} color={colors.gray[400]} />
        <Text style={styles.errorText}>Données météo indisponibles</Text>
        <Text style={styles.errorSubtext}>Appuyez pour réessayer</Text>
      </TouchableOpacity>
    );
  }
  
  // Version compacte
  if (variant === 'compact') {
    return (
      <CompactWeatherCard
        currentWeather={currentWeather}
        location={location}
        onPress={onPress}
      />
    );
  }
  
  // Version détaillée
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }, containerStyle]}>
      {/* En-tête avec titre et refresh */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="weather-cloudy" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {onRefresh && (
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Icon 
              name="refresh" 
              size={20} 
              color={colors.gray[500]} 
              style={refreshing && styles.refreshingIcon}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Météo actuelle */}
      <CurrentWeatherSection data={currentWeather} location={location} />
      
      {/* Détails météo */}
      <WeatherDetailsSection data={currentWeather} />
      
      {/* Alertes météo */}
      {showAlerts && alerts.length > 0 && (
        <AlertsSection alerts={alerts} onAlertPress={onAlertPress} />
      )}
      
      {/* Prévisions */}
      {forecast.length > 0 && <ForecastSection forecast={forecast} />}
      
      {/* Indices agricoles */}
      {showAgriculturalIndices && agriculturalIndex && (
        <AgriculturalSection index={agriculturalIndex} />
      )}
      
      {/* Bouton voir plus */}
      {onPress && (
        <TouchableOpacity style={styles.moreButton} onPress={onPress}>
          <Text style={styles.moreButtonText}>Voir les détails complets</Text>
          <Icon name="chevron-right" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ============================================
// COMPOSANT POUR INTÉGRATION AVEC API
// ============================================

/**
 * WeatherCardWithData - Version qui gère son propre chargement
 * Utile pour une intégration simple
 * 
 * @example
 * <WeatherCardWithData
 *   latitude={12.65}
 *   longitude={-8.00}
 *   onPress={() => navigation.navigate('Meteo')}
 * />
 */
export const WeatherCardWithData: React.FC<{
  latitude: number;
  longitude: number;
  onPress?: () => void;
  variant?: 'compact' | 'detailed';
}> = ({ latitude, longitude, onPress, variant = 'detailed' }) => {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  
  // Simulation de chargement des données
  // Dans une vraie application, appelez votre API météo ici
  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      try {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données simulées
        setWeather({
          temperature: 32,
          temperatureMin: 24,
          temperatureMax: 38,
          condition: 'Partiellement nuageux',
          conditionCode: 'few_clouds',
          humidite: 65,
          ventVitesse: 12,
          ventDirection: 180,
          precipitations: 0,
          probabilitePluie: 20,
          uv: 8,
        });
        
        setForecast([
          { day: 'Lun', date: new Date(), temperatureMin: 24, temperatureMax: 36, conditionCode: 'sunny', condition: 'Ensoleillé', probabilitePluie: 10, precipitations: 0 },
          { day: 'Mar', date: new Date(), temperatureMin: 25, temperatureMax: 37, conditionCode: 'few_clouds', condition: 'Peu nuageux', probabilitePluie: 15, precipitations: 0 },
          { day: 'Mer', date: new Date(), temperatureMin: 26, temperatureMax: 38, conditionCode: 'cloudy', condition: 'Nuageux', probabilitePluie: 30, precipitations: 2 },
          { day: 'Jeu', date: new Date(), temperatureMin: 25, temperatureMax: 35, conditionCode: 'rain', condition: 'Pluie', probabilitePluie: 70, precipitations: 15 },
          { day: 'Ven', date: new Date(), temperatureMin: 24, temperatureMax: 34, conditionCode: 'rain', condition: 'Pluie', probabilitePluie: 60, precipitations: 10 },
        ]);
      } catch (error) {
        console.error('Erreur chargement météo:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadWeather();
  }, [latitude, longitude]);
  
  return (
    <WeatherCard
      currentWeather={weather || undefined}
      forecast={forecast}
      loading={loading}
      variant={variant}
      onPress={onPress}
      location="Mali"
    />
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  
  refreshingIcon: {
    transform: [{ rotate: '45deg' }],
  },
  
  currentWeatherContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  
  locationText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  
  temperatureContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  
  temperature: {
    fontSize: 64,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginTop: 8,
  },
  
  feelsLike: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: 4,
  },
  
  condition: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[700],
    marginBottom: 12,
  },
  
  tempRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  
  tempRangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  tempRangeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
  },
  
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    marginBottom: 16,
  },
  
  detailItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  
  detailValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginTop: 8,
  },
  
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: 4,
  },
  
  forecastContainer: {
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[800],
    marginBottom: 12,
  },
  
  forecastScroll: {
    gap: 12,
  },
  
  forecastDay: {
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 12,
    minWidth: 70,
  },
  
  forecastDayName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    marginBottom: 8,
  },
  
  forecastTemp: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginTop: 8,
  },
  
  forecastTempMin: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  
  forecastRain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  
  forecastRainText: {
    fontSize: typography.fontSize.xs,
    color: colors.info,
  },
  
  alertsContainer: {
    marginBottom: 16,
  },
  
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  
  alertContent: {
    flex: 1,
  },
  
  alertMessage: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  agriculturalContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  
  indexItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  indexHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  indexLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  
  indexValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  
  recommandationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warning + '15',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  
  recommandationText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  
  semisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  
  semisText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
  },
  
  moreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  
  moreButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  
  loadingContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: 12,
  },
  
  errorContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    marginTop: 12,
  },
  
  errorSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[400],
    marginTop: 4,
  },
  
  // Styles pour version compacte
  compactContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  compactInfo: {
    alignItems: 'flex-start',
  },
  
  compactTemp: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  
  compactCondition: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  
  compactRight: {
    alignItems: 'flex-end',
  },
  
  compactLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  
  compactLocationText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  
  compactDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  
  compactDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  compactDetailText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default WeatherCard;