/**
 * HomeScreen - Sènè Yiriwa
 * 
 * Écran d'accueil principal de l'application. Affiche un résumé personnalisé
 * des informations importantes pour l'agriculteur : météo, conseils agricoles,
 * techniques recommandées et alertes.
 * 
 * Fonctionnalités :
 * - Message de bienvenue personnalisé selon l'heure
 * - Affichage de la météo actuelle
 * - Liste des conseils agricoles personnalisés
 * - Techniques recommandées
 * - Alertes importantes
 * - Pull to refresh
 * - Navigation rapide vers les détails
 * - Animations fluides
 * - Design adapté aux agriculteurs
 * 
 * @module screens/main/HomeScreen
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../hooks/useAuth';
import { useConseils } from '../../../hooks/useConseils';
import useMeteo from '../../../hooks/useMeteo';
import { useTechniques } from '../../../hooks/useTechniques';
import { useNotifications } from '../../../hooks/useNotifications';
import WeatherCard from '../../../components/weather/WeatherCard';
import CustomCard from '../../../components/common/CustomCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

const { width } = Dimensions.get('window');

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Type pour les messages de bienvenue selon l'heure
 */
type GreetingType = 'morning' | 'afternoon' | 'evening';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * HomeScreen - Écran d'accueil
 * 
 * @example
 * // Navigation standard
 * <HomeScreen navigation={navigation} />
 */
const HomeScreen: React.FC<any> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  
  // Hooks métier
  const { 
    conseilsPersonnalises, 
    loading: conseilsLoading, 
    refreshing: conseilsRefreshing,
    onRefresh: refreshConseils,
  } = useConseils();
  
  const { 
    currentWeather, 
    dailyForecast,
    isLoading: meteoLoading,
    refreshWeather,
    isRefreshing: meteoRefreshing,
  } = useMeteo();
  
  const { 
    techniquesRecommandees,
    loading: techniquesLoading,
    refreshing: techniquesRefreshing,
    onRefresh: refreshTechniques,
  } = useTechniques();

  // État local
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const headerScale = useRef(new Animated.Value(0.9)).current;

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
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ============================================
  // MESSAGES DE BIENVENUE
  // ============================================

  /**
   * Détermine le message de bienvenue selon l'heure
   */
  const getGreeting = useCallback((): { text: string; icon: string; color: string } => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return { 
        text: t('good_morning'), 
        icon: 'weather-sunny', 
        color: colors.warning 
      };
    } else if (hour < 18) {
      return { 
        text: t('good_afternoon'), 
        icon: 'white-balance-sunny', 
        color: colors.secondary 
      };
    } else {
      return { 
        text: t('good_evening'), 
        icon: 'weather-night', 
        color: colors.skyDark 
      };
    }
  }, [t]);

  /**
   * Récupère le nom complet de l'utilisateur
   */
  const getUserName = useCallback((): string => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom} ${user.nom}`;
    }
    if (user?.prenom) return user.prenom;
    if (user?.nom) return user.nom;
    return t('farmer');
  }, [user, t]);

  // ============================================
  // RAFRAÎCHISSEMENT
  // ============================================

  /**
   * Rafraîchit toutes les données de l'écran d'accueil
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      await Promise.all([
        refreshConseils(),
        refreshWeather(),
        refreshTechniques(),
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshConseils, refreshWeather, refreshTechniques]);

  /**
   * Recharge les données quand l'écran devient actif
   */
  useFocusEffect(
    useCallback(() => {
      // Rechargement en arrière-plan sans indicateur
      const loadData = async () => {
        await Promise.all([
          refreshConseils(),
          refreshWeather(),
          refreshTechniques(),
        ]);
      };
      
      loadData();
    }, [refreshConseils, refreshWeather, refreshTechniques])
  );

  // ============================================
  // NAVIGATION
  // ============================================

  const navigateToConseilDetail = useCallback((id: string) => {
    navigation.navigate('ConseilDetail', { id });
  }, [navigation]);

  const navigateToTechniqueDetail = useCallback((id: string) => {
    navigation.navigate('TechniqueDetail', { id });
  }, [navigation]);

  const navigateToMeteo = useCallback(() => {
    navigation.navigate('Meteo');
  }, [navigation]);

  const navigateToConseils = useCallback(() => {
    navigation.navigate('Conseils');
  }, [navigation]);

  const navigateToTechniques = useCallback(() => {
    navigation.navigate('Techniques');
  }, [navigation]);

  const navigateToNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const navigateToSearch = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  const greetingConfig = getGreeting();
  const userName = getUserName();
  const isLoading = conseilsLoading || meteoLoading || techniquesLoading;

  // Transformation des données météo pour correspondre à l'interface WeatherCard
  const transformedWeather = currentWeather ? {
    temperature: currentWeather.temperature,
    temperatureMin: currentWeather.temperatureMin ?? currentWeather.temperatureMin ?? 0,
    temperatureMax: currentWeather.temperatureMax ?? currentWeather.temperatureMax ?? 0,
    condition: currentWeather.condition ?? currentWeather.description ?? '',
    conditionCode: currentWeather.conditionCode ?? currentWeather.icon ?? '',
    humidite: currentWeather.humidite ?? currentWeather.humidity ?? 0,
    ventVitesse: currentWeather.ventVitesse ?? currentWeather.windSpeed ?? 0,
    ventDirection: 0,
    precipitations: currentWeather.rainfall ?? 0,
    probabilitePluie: currentWeather.probabilitePluie ?? 0,
    uv: currentWeather.uv ?? currentWeather.uvIndex ?? 0,
  } : undefined;

  const transformedForecast = dailyForecast?.map(day => ({
    day: day.day ?? new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
    date: new Date(day.date),
    temperatureMin: day.temperatureMin ?? day.minTemp ?? 0,
    temperatureMax: day.temperatureMax ?? day.maxTemp ?? 0,
    conditionCode: day.conditionCode ?? day.icon ?? '',
    condition: day.description,
    probabilitePluie: day.probabilitePluie ?? day.rainProbability ?? 0,
    precipitations: 0,
  } as const)) || [];

  // Écran de chargement initial
  if (isLoading && !currentWeather && conseilsPersonnalises.length === 0) {
    return <LoadingSpinner fullScreen text={t('loading')} />;
  }

  return (
    <Animated.ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={styles.scrollContent}
    >
      {/* ============================================ */}
      {/* EN-TÊTE AVEC MESSAGE DE BIENVENUE */}
      {/* ============================================ */}
      
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ scale: headerScale }],
          }
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {greetingConfig.text}
          </Text>
          <Text style={styles.userName}>
            {userName}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          {/* Bouton notifications */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={navigateToNotifications}
            activeOpacity={0.7}
          >
            <Icon name="bell-outline" size={24} color={colors.gray[700]} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* Bouton recherche */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={navigateToSearch}
            activeOpacity={0.7}
          >
            <Icon name="magnify" size={24} color={colors.gray[700]} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ============================================ */}
      {/* SECTION MÉTÉO */}
      {/* ============================================ */}
      
      <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <WeatherCard
          currentWeather={transformedWeather}
          forecast={transformedForecast.slice(0, 3)}
          variant="compact"
          location="Mali"
          onPress={navigateToMeteo}
        />
      </Animated.View>

      {/* ============================================ */}
      {/* RACCOURCIS RAPIDES */}
      {/* ============================================ */}
      
      <Animated.View 
        style={[styles.quickActions, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <TouchableOpacity
          style={styles.quickAction}
          onPress={navigateToConseils}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryLight + '20' }]}>
            <Icon name="leaf" size={28} color={colors.primary} />
          </View>
          <Text style={styles.quickActionLabel}>{t('advice')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAction}
          onPress={navigateToTechniques}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.secondaryLight + '20' }]}>
            <Icon name="school" size={28} color={colors.secondary} />
          </View>
          <Text style={styles.quickActionLabel}>{t('techniques')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAction}
          onPress={navigateToMeteo}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.skyLight + '20' }]}>
            <Icon name="weather-cloudy" size={28} color={colors.skyDark} />
          </View>
          <Text style={styles.quickActionLabel}>{t('weather')}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ============================================ */}
      {/* CONSEILS PERSONNALISÉS */}
      {/* ============================================ */}
      
      <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="leaf" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('personalized_advice')}</Text>
          </View>
          <TouchableOpacity onPress={navigateToConseils}>
            <Text style={styles.seeAll}>{t('see_all')}</Text>
          </TouchableOpacity>
        </View>
        
        {conseilsPersonnalises.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="leaf-off" size={40} color={colors.gray[400]} />
            <Text style={styles.emptyStateText}>{t('no_advice')}</Text>
          </View>
        ) : (
          conseilsPersonnalises.slice(0, 3).map((conseil, index) => (
            <Animated.View
              key={conseil.id}
              style={{
                opacity: fadeAnim,
                transform: [{ translateX: Animated.multiply(slideAnim, index + 1) }],
              }}
            >
              <CustomCard
                title={conseil.titre}
                description={conseil.resume}
                variant="elevation"
                badges={conseil.estUrgent ? [{ text: t('urgent'), type: 'error' }] : undefined}
                clickable
                onPress={() => navigateToConseilDetail(conseil.id)}
              />
            </Animated.View>
          ))
        )}
      </Animated.View>

      {/* ============================================ */}
      {/* TECHNIQUES RECOMMANDÉES */}
      {/* ============================================ */}
      
      <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="school" size={20} color={colors.secondary} />
            <Text style={styles.sectionTitle}>{t('recommended_techniques')}</Text>
          </View>
          <TouchableOpacity onPress={navigateToTechniques}>
            <Text style={styles.seeAll}>{t('see_all')}</Text>
          </TouchableOpacity>
        </View>
        
        {techniquesRecommandees.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="school-off" size={40} color={colors.gray[400]} />
            <Text style={styles.emptyStateText}>{t('no_techniques')}</Text>
          </View>
        ) : (
          techniquesRecommandees.slice(0, 2).map((technique) => (
            <CustomCard
              key={technique.id}
              title={technique.titre}
              description={technique.resume}
              variant="outline"
              badges={[
                { text: technique.niveau, type: 'info' },
                { 
                  text: technique.difficulte, 
                  type: technique.difficulte === 'facile' ? 'success' : 'warning' 
                },
              ]}
              clickable
              onPress={() => navigateToTechniqueDetail(technique.id)}
            />
          ))
        )}
      </Animated.View>

      {/* ============================================ */}
      {/* CITATION DU JOUR */}
      {/* ============================================ */}
      
      <Animated.View 
        style={[styles.quoteContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <Icon name="format-quote-open" size={24} color={colors.primaryLight} />
        <Text style={styles.quoteText}>
          {t('quote_of_the_day')}
        </Text>
        <Text style={styles.quoteAuthor}>- {t('proverb')}</Text>
      </Animated.View>

      {/* Espace en bas */}
      <View style={styles.bottomSpacer} />
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
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  
  // En-tête
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  
  // Sections
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  seeAll: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Raccourcis rapides
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    fontWeight: typography.fontWeight.medium,
  },
  
  // État vide
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.gray[50],
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.sm,
  },
  
  // Citation
  quoteContainer: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primaryLightest,
    borderRadius: 16,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: typography.fontSize.md,
    fontStyle: 'italic',
    color: colors.gray[700],
    textAlign: 'center',
    marginVertical: spacing.sm,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  
  // Espacement
  bottomSpacer: {
    height: spacing.xl,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default HomeScreen;