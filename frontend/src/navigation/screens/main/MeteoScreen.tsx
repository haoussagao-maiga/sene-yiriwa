/**
 * MeteoScreen - Sènè Yiriwa
 * 
 * Écran météo détaillé pour les agriculteurs. Affiche les informations
 * météorologiques complètes avec des conseils agricoles adaptés.
 * 
 * Fonctionnalités :
 * - Météo actuelle avec icônes animées
 * - Prévisions sur 7 jours
 * - Prévisions horaires
 * - Alertes météorologiques
 * - Indices agricoles (sécheresse, stress hydrique)
 * - Recommandations pour l'agriculteur
 * - Cartographie avec localisation
 * - Géolocalisation automatique
 * - Mode hors ligne (cache)
 * - Pull to refresh
 * 
 * @module screens/main/MeteoScreen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useMeteo, Alert } from '../../../hooks/useMeteo';
import { useAuth } from '../../../hooks/useAuth';
import WeatherIcon from '../../../components/weather/WeatherIcon';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

const { width, height } = Dimensions.get('window');

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Type pour l'onglet actif (quotidien/horaire)
 */
type ForecastTab = 'daily' | 'hourly';

/**
 * Interface pour les prévisions horaires
 */
interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  conditionCode: string;
  precipitation: number;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * MeteoScreen - Écran météo détaillé
 */
const MeteoScreen: React.FC<any> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // États du hook useMeteo
  const {
    currentWeather,
    dailyForecast,
    hourlyForecast,
    alerts,
    agriculturalIndices,
    location,
    currentLocation,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    dataSource,
    loadAllWeatherData,
    refreshWeather,
    getLocationAndPermission,
    hasLocationPermission,
  } = useMeteo();

  // État local
  const [activeTab, setActiveTab] = useState<ForecastTab>('daily');
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [locationName, setLocationName] = useState<string>('Mali');
  const [isRefreshingLocal, setIsRefreshingLocal] = useState(false);
  const [mapRegion, setMapRegion] = useState<any>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // ============================================
  // ANIMATIONS
  // ============================================

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animation du header au scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // ============================================
  // LOCALISATION
  // ============================================

  /**
   * Initialise la localisation et charge les données météo
   */
  const initLocation = useCallback(async () => {
    const hasPermission = await getLocationAndPermission();
    if (hasPermission) {
      await loadAllWeatherData();
      
      // Obtenir la localisation actuelle
      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        
        // Mettre à jour le nom de la localisation (reverse geocoding)
        try {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
          if (reverseGeocode[0]) {
            const { city, region, country } = reverseGeocode[0];
            setLocationName(`${city || region || ''}, ${country || 'Mali'}`);
          }
        } catch (error) {
          console.error('Erreur reverse geocoding:', error);
        }
        
        // Mettre à jour la région de la carte
        setMapRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Erreur de localisation:', error);
      }
    }
  }, [getLocationAndPermission, loadAllWeatherData]);

  // Chargement initial
  useEffect(() => {
    initLocation();
  }, []);

  // Rafraîchissement au focus
  useFocusEffect(
    useCallback(() => {
      if (currentLocation) {
        refreshWeather();
      }
    }, [currentLocation])
  );

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Rafraîchit les données météo
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshingLocal(true);
    await refreshWeather();
    setIsRefreshingLocal(false);
  }, [refreshWeather]);

  /**
   * Ouvre l'application météo externe
   */
  const openExternalWeather = useCallback(() => {
    // Ouvrir l'application météo par défaut ou un site web
    Linking.openURL('https://www.accuweather.com');
  }, []);

  /**
   * Formate la date pour l'affichage
   */
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  }, []);

  /**
   * Formate l'heure pour l'affichage
   */
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }, []);

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  /**
   * Rendu de la carte météo avec localisation
   */
  const renderMap = () => {
    if (!location || !mapRegion) return null;
    
    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={locationName}
          >
            <View style={styles.markerContainer}>
              <Icon name="map-marker" size={32} color={colors.error} />
            </View>
          </Marker>
        </MapView>
        <TouchableOpacity style={styles.mapOverlay} onPress={() => {}}>
          <Text style={styles.mapLocation}>{locationName}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Rendu de la météo actuelle
   */
  const renderCurrentWeather = () => {
    if (!currentWeather) return null;
    
    return (
      <Animated.View style={[styles.currentWeatherCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.currentWeatherHeader}>
          <View>
            <Text style={styles.locationName}>{locationName}</Text>
            <Text style={styles.lastUpdate}>
              {t('last_update')}: {lastUpdated?.toLocaleTimeString() || '--:--'}
              {dataSource === 'cache' && ` (${t('cached')})`}
            </Text>
          </View>
          <TouchableOpacity onPress={openExternalWeather}>
            <Icon name="open-in-new" size={20} color={colors.gray[500]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.currentWeatherMain}>
          <WeatherIcon conditionCode={currentWeather.conditionCode || ''} size={80} animated />
          <View style={styles.temperatureContainer}>
            <Text style={styles.temperature}>{Math.round(currentWeather.temperature)}°</Text>
            <View style={styles.tempRange}>
              <Text style={styles.tempMax}>↑{Math.round(currentWeather.temperatureMax || currentWeather.temperature)}°</Text>
              <Text style={styles.tempMin}>↓{Math.round(currentWeather.temperatureMin || currentWeather.temperature)}°</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.condition}>{currentWeather.condition || currentWeather.description}</Text>
        
        <View style={styles.weatherDetails}>
          <View style={styles.weatherDetail}>
            <Icon name="water-percent" size={22} color={colors.info} />
            <Text style={styles.detailValue}>{currentWeather.humidity || currentWeather.humidite}%</Text>
            <Text style={styles.detailLabel}>{t('humidity')}</Text>
          </View>
          <View style={styles.weatherDetail}>
            <Icon name="weather-windy" size={22} color={colors.gray[600]} />
            <Text style={styles.detailValue}>{Math.round(currentWeather.windSpeed || currentWeather.ventVitesse || 0)} km/h</Text>
            <Text style={styles.detailLabel}>{t('wind')}</Text>
          </View>
          <View style={styles.weatherDetail}>
            <Icon name="water" size={22} color={colors.info} />
            <Text style={styles.detailValue}>{currentWeather.rainfall || currentWeather.probabilitePluie || 0}%</Text>
            <Text style={styles.detailLabel}>{t('rain_probability')}</Text>
          </View>
          <View style={styles.weatherDetail}>
            <Icon name="weather-sunny" size={22} color={colors.warning} />
            <Text style={styles.detailValue}>{currentWeather.uvIndex || currentWeather.uv || 0}</Text>
            <Text style={styles.detailLabel}>{t('uv_index')}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  /**
   * Rendu des alertes météo
   */
  const renderAlerts = () => {
    if (!alerts || alerts.length === 0) return null;
    
    return (
      <Animated.View style={[styles.alertsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.alertsHeader}>
          <Icon name="alert-circle" size={20} color={colors.error} />
          <Text style={styles.alertsTitle}>{t('weather_alerts')}</Text>
        </View>
        {alerts.map((alert: Alert) => (
          <View
            key={alert.id || `${alert.type}-${alert.severity}-${alert.title}`}
            style={[
              styles.alertItem,
              { backgroundColor: hexToRgba(getAlertColor(alert.severity), 0.08) },
            ]}
          >
            <Icon name={getAlertIcon(alert.type)} size={24} color={getAlertColor(alert.severity)} />
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: getAlertColor(alert.severity) }]}>
                {alert.title}
              </Text>
              <Text style={styles.alertMessage}>{alert.description}</Text>
            </View>
          </View>
        ))}
      </Animated.View>
    );
  };

  /**
   * Rendu des indices agricoles
   */
  const renderAgriculturalIndices = () => {
    if (!agriculturalIndices) return null;
    
    return (
      <Animated.View style={[styles.agriculturalCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.cardHeader}>
          <Icon name="leaf" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>{t('agricultural_indices')}</Text>
        </View>
        
        <View style={styles.indicesGrid}>
          {agriculturalIndices.risqueSecheresse && (
            <View style={styles.indexItem}>
              <Text style={styles.indexLabel}>{t('drought_risk')}</Text>
              <Text style={[styles.indexValue, { color: getRiskColor(agriculturalIndices.risqueSecheresse) }]}>
                {getRiskText(agriculturalIndices.risqueSecheresse)}
              </Text>
            </View>
          )}
          {agriculturalIndices.stressHydrique && (
            <View style={styles.indexItem}>
              <Text style={styles.indexLabel}>{t('water_stress')}</Text>
              <Text style={[styles.indexValue, { color: getStressColor(agriculturalIndices.stressHydrique) }]}>
                {getStressText(agriculturalIndices.stressHydrique)}
              </Text>
            </View>
          )}
        </View>
        
        {agriculturalIndices.recommandationsArrosage && (
          <View style={styles.recommendationContainer}>
            <Icon name="lightbulb" size={20} color={colors.warning} />
            <Text style={styles.recommendationText}>
              {agriculturalIndices.recommandationsArrosage}
            </Text>
          </View>
        )}
        
        {agriculturalIndices.periodeOptimaleSemis && (
          <View style={styles.sowingPeriod}>
            <Icon name="calendar" size={16} color={colors.primary} />
            <Text style={styles.sowingText}>
              {t('optimal_sowing_period')}: {agriculturalIndices.periodeOptimaleSemis.debut} - {agriculturalIndices.periodeOptimaleSemis.fin}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  /**
   * Rendu des onglets (quotidien/horaire)
   */
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'daily' && styles.tabActive]}
        onPress={() => setActiveTab('daily')}
      >
        <Text style={[styles.tabText, activeTab === 'daily' && styles.tabTextActive]}>
          {t('daily_forecast')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'hourly' && styles.tabActive]}
        onPress={() => setActiveTab('hourly')}
      >
        <Text style={[styles.tabText, activeTab === 'hourly' && styles.tabTextActive]}>
          {t('hourly_forecast')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Rendu des prévisions quotidiennes
   */
  const renderDailyForecast = () => {
    if (!dailyForecast || dailyForecast.length === 0) return null;
    
    return (
      <View style={styles.forecastList}>
        {dailyForecast.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.forecastItem, selectedDay === index && styles.forecastItemSelected]}
            onPress={() => setSelectedDay(index)}
          >
            <Text style={styles.forecastDay}>{typeof day.date === 'string' ? day.date : formatDate(new Date(day.date))}</Text>
            <WeatherIcon conditionCode={day.conditionCode || ''} size={32} />
            <Text style={styles.forecastTemp}>
              {Math.round(day.temperatureMax || day.maxTemp)}°
            </Text>
            <Text style={styles.forecastTempMin}>
              {Math.round(day.temperatureMin || day.minTemp)}°
            </Text>
            <View style={styles.forecastRain}>
              <Icon name="water" size={12} color={colors.info} />
              <Text style={styles.forecastRainText}>{day.probabilitePluie || day.rainProbability}%</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Rendu des prévisions horaires (simulées)
   */
  const renderHourlyForecast = () => {
    // Prévisions horaires simulées (à remplacer par les vraies données)
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
        {hours.map((hour, index) => (
          <View key={index} style={styles.hourlyItem}>
            <Text style={styles.hourlyTime}>{hour}</Text>
            <WeatherIcon conditionCode="few_clouds" size={32} />
            <Text style={styles.hourlyTemp}>32°</Text>
            <Text style={styles.hourlyRain}>20%</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================

  /**
   * Convertit une couleur hexadécimale en rgba avec opacité
   */
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getAlertColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return colors.error;
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.info;
      default: return colors.info;
    }
  };

  const getAlertIcon = (type: string): string => {
    switch (type) {
      case 'pluie': return 'weather-pouring';
      case 'secheresse': return 'weather-sunny-alert';
      case 'vent': return 'weather-windy-variant';
      case 'temperature': return 'thermometer-high';
      case 'orage': return 'weather-lightning';
      default: return 'alert';
    }
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'tres_eleve': return colors.error;
      case 'eleve': return colors.warning;
      case 'moyen': return colors.secondary;
      default: return colors.success;
    }
  };

  const getRiskText = (risk: string): string => {
    switch (risk) {
      case 'tres_eleve': return t('very_high');
      case 'eleve': return t('high');
      case 'moyen': return t('moderate');
      default: return t('low');
    }
  };

  const getStressColor = (stress: string): string => {
    switch (stress) {
      case 'severe': return colors.error;
      case 'modere': return colors.warning;
      case 'faible': return colors.secondary;
      default: return colors.success;
    }
  };

  const getStressText = (stress: string): string => {
    switch (stress) {
      case 'severe': return t('severe');
      case 'modere': return t('moderate');
      case 'faible': return t('light');
      default: return t('none');
    }
  };

  // ============================================
  // RENDU PRINCIPAL
  // ============================================

  if (isLoading && !currentWeather) {
    return <LoadingSpinner fullScreen text={t('loading_weather')} />;
  }

  return (
    <Animated.ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshingLocal || isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Header animé */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <Text style={styles.animatedHeaderTitle}>{t('weather')}</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Icon name="refresh" size={22} color={colors.gray[700]} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.content}>
        {/* Carte de localisation */}
        {renderMap()}
        
        {/* Météo actuelle */}
        {renderCurrentWeather()}
        
        {/* Alertes météo */}
        {renderAlerts()}
        
        {/* Indices agricoles */}
        {renderAgriculturalIndices()}
        
        {/* Onglets */}
        {renderTabs()}
        
        {/* Prévisions */}
        {activeTab === 'daily' ? renderDailyForecast() : renderHourlyForecast()}
        
        {/* Espace en bas */}
        <View style={styles.bottomSpacer} />
      </View>
    </Animated.ScrollView>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  
  // Header animé
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    zIndex: 10,
  },
  animatedHeaderTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  
  // Carte
  mapContainer: {
    margin: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
    height: 160,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  mapLocation: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
  },
  markerContainer: {
    alignItems: 'center',
  },
  
  // Météo actuelle
  currentWeatherCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentWeatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  locationName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  lastUpdate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  currentWeatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  temperatureContainer: {
    alignItems: 'flex-end',
  },
  temperature: {
    fontSize: 56,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  tempRange: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tempMax: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
  tempMin: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  condition: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  weatherDetail: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginTop: 4,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  
  // Alertes
  alertsContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  alertsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  
  // Indices agricoles
  agriculturalCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  indicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  indexItem: {
    flex: 1,
    alignItems: 'center',
  },
  indexLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: 4,
  },
  indexValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    padding: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  sowingPeriod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  sowingText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
  },
  
  // Onglets
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  
  // Prévisions quotidiennes
  forecastList: {
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  forecastItemSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  forecastDay: {
    width: 80,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[800],
  },
  forecastTemp: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  forecastTempMin: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  forecastRain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  forecastRainText: {
    fontSize: typography.fontSize.xs,
    color: colors.info,
  },
  
  // Prévisions horaires
  hourlyScroll: {
    marginHorizontal: spacing.md,
  },
  hourlyItem: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginRight: spacing.sm,
    minWidth: 80,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  hourlyTime: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  hourlyTemp: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginTop: spacing.xs,
  },
  hourlyRain: {
    fontSize: typography.fontSize.xs,
    color: colors.info,
    marginTop: 2,
  },
  
  // Espacement
  bottomSpacer: {
    height: spacing.xl,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default MeteoScreen;
