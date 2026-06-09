/**
 * ProfileScreen - Sènè Yiriwa
 * 
 * Écran de profil utilisateur permettant aux agriculteurs de gérer
 * leurs informations personnelles et les paramètres de l'application.
 * 
 * Fonctionnalités :
 * - Affichage des informations utilisateur
 * - Modification du profil
 * - Statistiques personnelles
 * - Gestion des préférences
 * - Changement de langue
 * - Déconnexion
 * - Suppression de compte
 * - Mode sombre/clair
 * 
 * @module screens/main/ProfileScreen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Switch,
  Platform,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../hooks/useAuth';
import { useConseils } from '../../../hooks/useConseils';
import { useTechniques } from '../../../hooks/useTechniques';
import { useNotifications } from '../../../hooks/useNotifications';
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

const { width } = Dimensions.get('window');

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Section du menu de navigation
 */
interface MenuSection {
  title: string;
  items: MenuItem[];
}

/**
 * Élément du menu
 */
interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
  danger?: boolean;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * ProfileScreen - Écran de profil utilisateur
 */
interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { conseilsPersonnalises } = useConseils();
  const { techniquesRecommandees } = useTechniques();
  const { unreadCount, preferences, updatePreferences } = useNotifications();

  // États locaux
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(preferences.enabled);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [conseilsStats, setConseilsStats] = useState<any>(null);
  const [techniquesStats, setTechniquesStats] = useState<any>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
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
  // STATISTIQUES
  // ============================================

  /**
   * Calcule le nombre total de conseils consultés
   */
  const getTotalConseilsConsultes = useCallback(() => {
    return conseilsStats?.totalConsultes || 0;
  }, [conseilsStats]);

  /**
   * Calcule le nombre total de techniques apprises
   */
  const getTotalTechniquesApprises = useCallback(() => {
    return techniquesStats?.techniquesCompletees || 0;
  }, [techniquesStats]);

  /**
   * Calcule le temps total d'apprentissage
   */
  const getTempsTotalApprentissage = useCallback(() => {
    const seconds = techniquesStats?.tempsTotalApprentissage || 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  }, [techniquesStats]);

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Déconnexion de l'utilisateur
   */
  const handleLogout = useCallback(() => {
    Alert.alert(
      t('logout'),
      t('logout_confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            await logout();
            setIsLoggingOut(false);
          },
        },
      ]
    );
  }, [t, logout]);

  /**
   * Suppression du compte
   */
  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      t('delete_account'),
      t('delete_account_confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('final_confirmation'),
              t('delete_account_final'),
              [
                { text: t('cancel'), style: 'cancel' },
                {
                  text: t('delete'),
                  style: 'destructive',
                  onPress: async () => {
                    // Appel API de suppression
                    // await deleteAccount();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [t]);

  /**
   * Navigation vers l'édition du profil
   */
  const navigateToEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  /**
   * Navigation vers les statistiques détaillées
   */
  const navigateToStats = useCallback(() => {
    navigation.navigate('Stats');
  }, [navigation]);

  /**
   * Navigation vers les favoris
   */
  const navigateToFavorites = useCallback(() => {
    navigation.navigate('Favorites');
  }, [navigation]);

  /**
   * Navigation vers les paramètres de notification
   */
  const navigateToNotificationSettings = useCallback(() => {
    navigation.navigate('NotificationSettings');
  }, [navigation]);

  /**
   * Navigation vers l'aide
   */
  const navigateToHelp = useCallback(() => {
    navigation.navigate('Help');
  }, [navigation]);

  /**
   * Navigation vers les informations
   */
  const navigateToAbout = useCallback(() => {
    navigation.navigate('About');
  }, [navigation]);

  /**
   * Bascule le mode sombre
   */
  const toggleDarkMode = useCallback((value: boolean) => {
    setIsDarkMode(value);
    // Appliquer le thème sombre globalement
  }, []);

  /**
   * Bascule les notifications
   */
  const toggleNotifications = useCallback(async (value: boolean) => {
    setNotificationsEnabled(value);
    await updatePreferences({ enabled: value });
  }, [updatePreferences]);

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  /**
   * Rendu de l'en-tête du profil
   */
  const renderHeader = () => {
    const initial = user?.prenom?.charAt(0) || user?.nom?.charAt(0) || 'U';
    
    return (
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ scale: headerScale }],
          }
        ]}
      >
        <View style={styles.avatarContainer}>
          {(user as any)?.photoProfil ? (
            <Image source={{ uri: (user as any).photoProfil }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{initial.toUpperCase()}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton} onPress={navigateToEditProfile}>
            <Icon name="camera" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userName}>
          {user?.prenom} {user?.nom}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userRole}>
          {user?.role === 'agriculteur' && t('farmer')}
          {user?.role === 'expert' && t('expert')}
          {user?.role === 'administrateur' && t('administrator')}
        </Text>
        
        <TouchableOpacity style={styles.editButton} onPress={navigateToEditProfile}>
          <Icon name="pencil" size={18} color={colors.white} />
          <Text style={styles.editButtonText}>{t('edit_profile')}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  /**
   * Rendu des statistiques
   */
  const renderStats = () => (
    <Animated.View 
      style={[
        styles.statsContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.statsHeader}>
        <Icon name="chart-line" size={20} color={colors.primary} />
        <Text style={styles.statsTitle}>{t('my_statistics')}</Text>
        <TouchableOpacity onPress={navigateToStats}>
          <Text style={styles.statsSeeAll}>{t('see_all')}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Icon name="leaf" size={28} color={colors.primary} />
          <Text style={styles.statValue}>{getTotalConseilsConsultes()}</Text>
          <Text style={styles.statLabel}>{t('advice_viewed')}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="school" size={28} color={colors.secondary} />
          <Text style={styles.statValue}>{getTotalTechniquesApprises()}</Text>
          <Text style={styles.statLabel}>{t('techniques_learned')}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="clock-outline" size={28} color={colors.info} />
          <Text style={styles.statValue}>{getTempsTotalApprentissage()}</Text>
          <Text style={styles.statLabel}>{t('learning_time')}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="heart" size={28} color={colors.error} />
          <Text style={styles.statValue}>
            {(conseilsStats?.totalFavoris || 0) + (techniquesStats?.totalFavoris || 0)}
          </Text>
          <Text style={styles.statLabel}>{t('favorites')}</Text>
        </View>
      </View>
    </Animated.View>
  );

  /**
   * Rendu d'une section du menu
   */
  const renderMenuSection = (section: MenuSection, index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.menuSection,
        { opacity: fadeAnim, transform: [{ translateY: Animated.multiply(slideAnim, index + 1) }] }
      ]}
    >
      <Text style={styles.menuSectionTitle}>{section.title}</Text>
      <View style={styles.menuItems}>
        {section.items.map((item, itemIndex) => (
          <TouchableOpacity
            key={itemIndex}
            style={[
              styles.menuItem,
              item.danger && styles.menuItemDanger,
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Icon 
                name={item.icon} 
                size={22} 
                color={item.danger ? colors.error : colors.gray[700]} 
              />
              <Text style={[
                styles.menuItemLabel,
                item.danger && styles.menuItemLabelDanger,
              ]}>
                {item.label}
              </Text>
            </View>
            <View style={styles.menuItemRight}>
              {item.badge !== undefined && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </Text>
                </View>
              )}
              <Icon name="chevron-right" size={20} color={colors.gray[400]} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  /**
   * Rendu des paramètres (mode sombre, notifications)
   */
  const renderSettings = () => (
    <Animated.View
      style={[
        styles.menuSection,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Text style={styles.menuSectionTitle}>{t('settings')}</Text>
      <View style={styles.menuItems}>
        {/* Mode sombre */}
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Icon name="theme-light-dark" size={22} color={colors.gray[700]} />
            <Text style={styles.settingItemLabel}>{t('dark_mode')}</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
            thumbColor={isDarkMode ? colors.primary : colors.white}
          />
        </View>
        
        {/* Notifications */}
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Icon name="bell-outline" size={22} color={colors.gray[700]} />
            <Text style={styles.settingItemLabel}>{t('notifications')}</Text>
            {unreadCount > 0 && (
              <View style={styles.settingBadge}>
                <Text style={styles.settingBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
            thumbColor={notificationsEnabled ? colors.primary : colors.white}
          />
        </View>
      </View>
    </Animated.View>
  );

  /**
   * Rendu de la version de l'application
   */
  const renderVersion = () => (
    <Animated.View
      style={[
        styles.versionContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Text style={styles.versionText}>
        {t('version')} 1.0.0
      </Text>
      <Text style={styles.copyrightText}>
        © 2025 Sènè Yiriwa - {t('all_rights_reserved')}
      </Text>
    </Animated.View>
  );

  // ============================================
  // CONSTRUCTION DU MENU
  // ============================================

  /**
   * Sections du menu
   */
  const menuSections: MenuSection[] = [
    {
      title: t('my_space'),
      items: [
        {
          icon: 'chart-line',
          label: t('my_statistics'),
          onPress: navigateToStats,
        },
        {
          icon: 'heart-outline',
          label: t('my_favorites'),
          onPress: navigateToFavorites,
          badge: (conseilsStats?.totalFavoris || 0) + (techniquesStats?.totalFavoris || 0),
        },
      ],
    },
    {
      title: t('preferences'),
      items: [
        {
          icon: 'bell-outline',
          label: t('notifications'),
          onPress: navigateToNotificationSettings,
          badge: unreadCount,
        },
        {
          icon: 'translate',
          label: t('language'),
          onPress: () => navigation.navigate('Language'),
        },
      ],
    },
    {
      title: t('support'),
      items: [
        {
          icon: 'help-circle-outline',
          label: t('help'),
          onPress: navigateToHelp,
        },
        {
          icon: 'information-outline',
          label: t('about'),
          onPress: navigateToAbout,
        },
      ],
    },
    {
      title: t('account'),
      items: [
        {
          icon: 'logout',
          label: t('logout'),
          onPress: handleLogout,
          danger: true,
        },
        {
          icon: 'delete',
          label: t('delete_account'),
          onPress: handleDeleteAccount,
          danger: true,
        },
      ],
    },
  ];

  // ============================================
  // RENDU PRINCIPAL
  // ============================================

  if (!isAuthenticated) {
    return (
      <View style={styles.notAuthenticatedContainer}>
        <Icon name="account-off" size={64} color={colors.gray[400]} />
        <Text style={styles.notAuthenticatedTitle}>{t('not_logged_in')}</Text>
        <Text style={styles.notAuthenticatedText}>{t('please_login_to_view_profile')}</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>{t('login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* En-tête du profil */}
      {renderHeader()}
      
      {/* Statistiques */}
      {renderStats()}
      
      {/* Sections du menu */}
      {menuSections.map((section, index) => renderMenuSection(section, index))}
      
      {/* Paramètres */}
      {renderSettings()}
      
      {/* Version */}
      {renderVersion()}
      
      {/* Espacement */}
      <View style={styles.bottomSpacer} />
      
      {/* Indicateur de déconnexion */}
      {isLoggingOut && (
        <View style={styles.logoutOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.logoutText}>{t('logging_out')}</Text>
        </View>
      )}
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
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  
  // En-tête
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.xs,
  },
  userRole: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
  },
  
  // Statistiques
  statsContainer: {
    backgroundColor: colors.white,
    margin: spacing.md,
    borderRadius: 20,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsTitle: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginLeft: spacing.sm,
  },
  statsSeeAll: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: ((width || 375) - spacing.md * 2 - spacing.sm * 2) / 2 - spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  
  // Menu
  menuSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  menuSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[500],
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  menuItems: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuItemDanger: {
    borderBottomColor: colors.gray[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemLabel: {
    fontSize: typography.fontSize.md,
    color: colors.gray[800],
  },
  menuItemLabelDanger: {
    color: colors.error,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  // Badge
  badge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  
  // Paramètres
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingItemLabel: {
    fontSize: typography.fontSize.md,
    color: colors.gray[800],
  },
  settingBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  settingBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  
  // Version
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  versionText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  copyrightText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
  },
  
  // Non authentifié
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  notAuthenticatedTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginTop: spacing.md,
  },
  notAuthenticatedText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  
  // Logout overlay
  logoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  logoutText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    marginTop: spacing.md,
  },
  
  // Espacement
  bottomSpacer: {
    height: spacing.xl,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default ProfileScreen;