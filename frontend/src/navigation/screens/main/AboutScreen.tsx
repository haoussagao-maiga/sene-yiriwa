/**
 * AboutScreen - Sènè Yiriwa
 * 
 * Écran "À propos" présentant les informations sur l'application,
 * l'équipe, les partenaires et les mentions légales.
 * 
 * Fonctionnalités :
 * - Informations générales sur l'application
 * - Présentation de l'équipe
 * - Partenaires et sponsors
 * - Mentions légales et crédits
 * - Licences open source
 * - Version de l'application
 * - Liens utiles (site web, réseaux sociaux)
 * - Animations fluides
 * 
 * @module screens/main/AboutScreen
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';
import { showSuccessMessage, showErrorMessage } from '../../../utils/notifications';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour un membre de l'équipe
 */
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  initials: string;
  color: string;
}

/**
 * Interface pour un partenaire
 */
interface Partner {
  id: string;
  name: string;
  logo: string;
  url: string;
}

/**
 * Interface pour un lien social
 */
interface SocialLink {
  id: string;
  name: string;
  icon: string;
  url: string;
  color: string;
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Membres de l'équipe
 */
const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Haoussa Gao Mahamadou MAIGA',
    role: 'Chef de projet / Développeur',
    initials: 'HM',
    color: colors.primary,
  },
  {
    id: '2',
    name: 'Aissata BA',
    role: 'Développeuse interface',
    initials: 'AB',
    color: colors.secondary,
  },
  {
    id: '3',
    name: 'Tam Frederic COULIBALY',
    role: 'Développeur serveur',
    initials: 'TC',
    color: colors.info,
  },
  {
    id: '4',
    name: 'Aissata TRAORE',
    role: 'Concepteur interface',
    initials: 'AT',
    color: colors.warning,
  },
  {
    id: '5',
    name: 'Fafa DABITAO',
    role: 'Développeur Mobile',
    initials: 'FD',
    color: colors.success,
  },
];

/**
 * Partenaires
 */
const PARTNERS: Partner[] = [
  {
    id: '1',
    name: 'TechnoLAB-ISTA',
    logo: 'https://via.placeholder.com/80x80',
    url: 'https://technolab-ista.edu.ml',
  },
  {
    id: '2',
    name: 'Ministère de l\'Agriculture',
    logo: 'https://via.placeholder.com/80x80',
    url: 'https://agriculture.gouv.ml',
  },
  {
    id: '3',
    name: 'IER',
    logo: 'https://via.placeholder.com/80x80',
    url: 'https://ier.gouv.ml',
  },
];

/**
 * Liens sociaux
 */
const SOCIAL_LINKS: SocialLink[] = [
  {
    id: '1',
    name: 'Facebook',
    icon: 'facebook',
    url: 'https://facebook.com/seneyiriwa',
    color: '#1877F2',
  },
  {
    id: '2',
    name: 'Twitter',
    icon: 'twitter',
    url: 'https://twitter.com/seneyiriwa',
    color: '#1DA1F2',
  },
  {
    id: '3',
    name: 'LinkedIn',
    icon: 'linkedin',
    url: 'https://linkedin.com/company/seneyiriwa',
    color: '#0077B5',
  },
  {
    id: '4',
    name: 'WhatsApp',
    icon: 'whatsapp',
    url: 'https://wa.me/223XXXXXXXX',
    color: '#25D366',
  },
];

/**
 * Versions des dépendances principales
 */
const DEPENDENCIES = [
  { name: 'React Native', version: '0.73.0' },
  { name: 'Expo', version: '50.0.0' },
  { name: 'Redux Toolkit', version: '1.9.7' },
  { name: 'React Navigation', version: '6.1.9' },
  { name: 'React Native Paper', version: '5.10.0' },
  { name: 'Axios', version: '1.6.0' },
  { name: 'i18next', version: '23.7.0' },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * AboutScreen - Écran À propos
 */
const AboutScreen: React.FC = () => {
  const { t } = useTranslation();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;

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
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Ouvre un lien externe
   */
  const openLink = useCallback(async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        showErrorMessage(t('cannot_open_link'));
      }
    } catch (error) {
      showErrorMessage(t('error_opening_link'));
    }
  }, [t]);

  /**
   * Affiche les licences
   */
  const showLicenses = useCallback(() => {
    // Navigation vers l'écran des licences
    // navigation.navigate('Licenses');
  }, []);

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  /**
   * Rendu de l'en-tête avec logo
   */
  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ scale: logoScale }],
        },
      ]}
    >
      <Text style={styles.logoEmoji}>🌾</Text>
      <Text style={styles.appName}>Sènè Yiriwa</Text>
      <Text style={styles.appTagline}>{t('app_tagline')}</Text>
      <Text style={styles.versionText}>{t('version')} 1.0.0</Text>
    </Animated.View>
  );

  /**
   * Rendu de la description
   */
  const renderDescription = () => (
    <Animated.View
      style={[
        styles.descriptionContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.descriptionText}>
        {t('about_description')}
      </Text>
      <Text style={styles.descriptionSubtext}>
        {t('about_subdescription')}
      </Text>
    </Animated.View>
  );

  /**
   * Rendu de l'équipe
   */
  const renderTeam = () => (
    <Animated.View
      style={[
        styles.teamContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, 2) }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>{t('our_team')}</Text>
      <View style={styles.teamGrid}>
        {TEAM_MEMBERS.map((member) => (
          <View key={member.id} style={styles.teamCard}>
            <View
              style={[
                styles.teamAvatar,
                { backgroundColor: member.color + '20' },
              ]}
            >
              <Text style={[styles.teamInitials, { color: member.color }]}>
                {member.initials}
              </Text>
            </View>
            <Text style={styles.teamName}>{member.name}</Text>
            <Text style={styles.teamRole}>{member.role}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  /**
   * Rendu des partenaires
   */
  const renderPartners = () => (
    <Animated.View
      style={[
        styles.partnersContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, 3) }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>{t('partners')}</Text>
      <View style={styles.partnersGrid}>
        {PARTNERS.map((partner) => (
          <TouchableOpacity
            key={partner.id}
            style={styles.partnerCard}
            onPress={() => openLink(partner.url)}
          >
            <View style={styles.partnerLogo}>
              <Text style={styles.partnerLogoText}>{partner.name.charAt(0)}</Text>
            </View>
            <Text style={styles.partnerName}>{partner.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  /**
   * Rendu des liens sociaux
   */
  const renderSocialLinks = () => (
    <Animated.View
      style={[
        styles.socialContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, 4) }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>{t('follow_us')}</Text>
      <View style={styles.socialGrid}>
        {SOCIAL_LINKS.map((social) => (
          <TouchableOpacity
            key={social.id}
            style={[styles.socialCard, { backgroundColor: social.color + '10' }]}
            onPress={() => openLink(social.url)}
          >
            <Icon name={social.icon} size={28} color={social.color} />
            <Text style={styles.socialName}>{social.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  /**
   * Rendu des dépendances
   */
  const renderDependencies = () => (
    <Animated.View
      style={[
        styles.dependenciesContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, 5) }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>{t('technologies')}</Text>
      <View style={styles.dependenciesList}>
        {DEPENDENCIES.map((dep, index) => (
          <View key={index} style={styles.dependencyItem}>
            <Text style={styles.dependencyName}>{dep.name}</Text>
            <Text style={styles.dependencyVersion}>{dep.version}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  /**
   * Rendu des mentions légales
   */
  const renderLegal = () => (
    <Animated.View
      style={[
        styles.legalContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, 6) }],
        },
      ]}
    >
      <TouchableOpacity onPress={showLicenses}>
        <Text style={styles.legalLink}>{t('open_source_licenses')}</Text>
      </TouchableOpacity>
      <Text style={styles.copyright}>
        {t('copyright')} © 2025 Sènè Yiriwa
      </Text>
      <Text style={styles.rightsText}>
        {t('all_rights_reserved')}
      </Text>
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
      {renderHeader()}
      {renderDescription()}
      {renderTeam()}
      {renderPartners()}
      {renderSocialLinks()}
      {renderDependencies()}
      {renderLegal()}
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
    paddingBottom: spacing.xl,
  },
  
  // En-tête
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  appTagline: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  versionText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  
  // Description
  descriptionContainer: {
    padding: spacing.lg,
  },
  descriptionText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[700],
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  descriptionSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Sections
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  
  // Équipe
  teamContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  teamCard: {
    width: (Dimensions.get('window').width - spacing.lg * 2 - spacing.md * 2) / 3,
    alignItems: 'center',
    padding: spacing.sm,
  },
  teamAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  teamInitials: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  teamName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    textAlign: 'center',
    marginBottom: 2,
  },
  teamRole: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    textAlign: 'center',
  },
  
  // Partenaires
  partnersContainer: {
    padding: spacing.lg,
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  partnerCard: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  partnerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  partnerLogoText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  partnerName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
  },
  
  // Réseaux sociaux
  socialContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  socialName: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  
  // Dépendances
  dependenciesContainer: {
    padding: spacing.lg,
  },
  dependenciesList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dependencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  dependencyName: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  dependencyVersion: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  
  // Mentions légales
  legalContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  legalLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textDecorationLine: 'underline',
    marginBottom: spacing.md,
  },
  copyright: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  rightsText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default AboutScreen;