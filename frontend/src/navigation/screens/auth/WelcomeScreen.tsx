/**
 * WelcomeScreen - Sènè Yiriwa
 * 
 * Écran de bienvenue présenté aux nouveaux utilisateurs après l'installation
 * de l'application. Présente les fonctionnalités principales et invite
 * à s'inscrire ou se connecter.
 * 
 * Fonctionnalités :
 * - Présentation animée de l'application
 * - Statistiques d'impact
 * - Témoignages d'agriculteurs
 * - Boutons d'action (connexion/inscription)
 * - Carrousel des fonctionnalités
 * - Design adapté aux agriculteurs
 * 
 * @module screens/auth/WelcomeScreen
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import  colors  from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

const { width, height } = Dimensions.get('window');

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour une fonctionnalité mise en avant
 */
interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

/**
 * Interface pour un témoignage d'agriculteur
 */
interface Testimonial {
  id: string;
  name: string;
  region: string;
  text: string;
  rating: number;
  avatar?: string;
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Statistiques de l'application
 */
const STATS = [
  { value: '50k+', label: 'Agriculteurs', icon: 'account-group' },
  { value: '500+', label: 'Conseils', icon: 'leaf' },
  { value: '200+', label: 'Techniques', icon: 'school' },
  { value: '4.8', label: 'Note moyenne', icon: 'star' },
];

/**
 * Fonctionnalités mises en avant
 */
const FEATURES: Feature[] = [
  {
    id: '1',
    icon: 'weather-cloudy',
    title: 'Météo précise',
    description: 'Prévisions météo localisées pour mieux planifier vos cultures',
    color: colors.sky,
  },
  {
    id: '2',
    icon: 'leaf',
    title: 'Conseils personnalisés',
    description: 'Recommandations adaptées à votre culture et votre région',
    color: colors.primary,
  },
  {
    id: '3',
    icon: 'school',
    title: 'Techniques modernes',
    description: 'Apprenez les meilleures pratiques agricoles',
    color: colors.secondary,
  },
  {
    id: '4',
    icon: 'bell',
    title: 'Alertes en temps réel',
    description: 'Soyez informé des changements climatiques et des risques',
    color: colors.error,
  },
];

/**
 * Témoignages d'agriculteurs
 */
const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Mamadou Diallo',
    region: 'Sikasso',
    text: 'Grâce à Sènè Yiriwa, j\'ai augmenté mon rendement de maïs de 30% cette année. Les conseils météo sont très précis !',
    rating: 5,
  },
  {
    id: '2',
    name: 'Aissata Traoré',
    region: 'Koulikoro',
    text: 'Les techniques d\'irrigation proposées m\'ont permis d\'économiser l\'eau et d\'améliorer ma production.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Ibrahim Keita',
    region: 'Ségou',
    text: 'Application facile à utiliser, même pour nous les agriculteurs. Je la recommande à tous !',
    rating: 4,
  },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * WelcomeScreen - Écran de bienvenue
 */
const WelcomeScreen: React.FC<any> = ({ navigation }: any) => {
  const { t } = useTranslation();
  
  // Références pour les animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  
  // État pour le carrousel de témoignages
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonialInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================
  // ANIMATIONS
  // ============================================

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(statsAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
        delay: 300,
      }),
    ]).start();

    // Rotation automatique des témoignages
    testimonialInterval.current = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => {
      if (testimonialInterval.current) {
        clearInterval(testimonialInterval.current);
      }
    };
  }, []);

  // ============================================
  // NAVIGATION
  // ============================================

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  /**
   * Rendu du logo animé
   */
  const renderLogo = () => (
    <Animated.View
      style={[
        styles.logoContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.logoEmoji}>🌾</Text>
      <Text style={styles.logoText}>Sènè Yiriwa</Text>
      <Text style={styles.logoSlogan}>
        {t('app_slogan')}
      </Text>
    </Animated.View>
  );

  /**
   * Rendu des statistiques
   */
  const renderStats = () => (
    <Animated.View
      style={[
        styles.statsContainer,
        {
          opacity: statsAnim,
          transform: [{ translateY: statsAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }) }],
        },
      ]}
    >
      {STATS.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          <Icon name={stat.icon} size={24} color={colors.primary} />
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </Animated.View>
  );

  /**
   * Rendu des fonctionnalités
   */
  const renderFeatures = () => (
    <View style={styles.featuresContainer}>
      <Text style={styles.sectionTitle}>{t('why_choose_us')}</Text>
      <View style={styles.featuresGrid}>
        {FEATURES.map((feature, index) => (
          <Animated.View
            key={feature.id}
            style={[
              styles.featureCard,
              {
                opacity: fadeAnim,
                transform: [{
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50 * (index % 2 === 0 ? -1 : 1), 0],
                  }),
                }],
              },
            ]}
          >
            <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
              <Icon name={feature.icon} size={32} color={feature.color} />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  /**
   * Rendu des témoignages
   */
  const renderTestimonials = () => {
    const testimonial = TESTIMONIALS[currentTestimonial];
    
    return (
      <View style={styles.testimonialsContainer}>
        <Text style={styles.sectionTitle}>{t('what_farmers_say')}</Text>
        <Animated.View
          style={[
            styles.testimonialCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }) }],
            },
          ]}
        >
          <View style={styles.testimonialHeader}>
            <View style={styles.testimonialAvatar}>
              <Text style={styles.testimonialAvatarText}>
                {testimonial.name.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.testimonialName}>{testimonial.name}</Text>
              <Text style={styles.testimonialRegion}>
                <Icon name="map-marker" size={12} color={colors.gray[500]} />
                {' '}{testimonial.region}
              </Text>
            </View>
          </View>
          
          <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
          
          <View style={styles.testimonialRating}>
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                name={i < testimonial.rating ? 'star' : 'star-outline'}
                size={16}
                color={colors.warning}
              />
            ))}
          </View>
        </Animated.View>
        
        {/* Indicateurs de pagination */}
        <View style={styles.paginationDots}>
          {TESTIMONIALS.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                currentTestimonial === index && styles.paginationDotActive,
              ]}
              onPress={() => setCurrentTestimonial(index)}
            />
          ))}
        </View>
      </View>
    );
  };

  /**
   * Rendu des boutons d'action
   */
  const renderButtons = () => (
    <Animated.View
      style={[
        styles.buttonsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegister}
        activeOpacity={0.8}
      >
        <Text style={styles.registerButtonText}>{t('create_account')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        activeOpacity={0.8}
      >
        <Text style={styles.loginButtonText}>{t('already_account')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // ============================================
  // RENDU PRINCIPAL
  // ============================================

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {renderLogo()}
      {renderStats()}
      {renderFeatures()}
      {renderTestimonials()}
      {renderButtons()}
      
      {/* Version de l'application */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  
  // Logo
  logoContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.xl,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: spacing.sm,
  },
  logoText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  logoSlogan: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  
  // Statistiques
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
    marginVertical: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
    marginTop: 2,
  },
  
  // Fonctionnalités
  featuresContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
    textAlign: 'center',
  },
  
  // Témoignages
  testimonialsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  testimonialCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  testimonialAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  testimonialAvatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  testimonialName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  testimonialRegion: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  testimonialText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  testimonialRating: {
    flexDirection: 'row',
    gap: 4,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  
  // Boutons
  buttonsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  loginButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  loginButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  
  // Version
  versionText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
    textAlign: 'center',
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default WelcomeScreen;