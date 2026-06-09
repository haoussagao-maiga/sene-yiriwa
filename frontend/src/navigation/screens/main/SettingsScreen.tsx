/**
 * SettingsScreen - Sènè Yiriwa
 * 
 * Écran des paramètres de l'application permettant à l'utilisateur
 * de configurer ses préférences et gérer son compte.
 * 
 * Fonctionnalités :
 * - Gestion du thème (clair/sombre/système)
 * - Gestion de la langue (français/bambara)
 * - Gestion des notifications
 * - Mode économie de données
 * - Taille de police
 * - Cache et stockage
 * - À propos et mentions légales
 * - Support et aide
 * 
 * @module screens/main/SettingsScreen
 */

import React, { useState, useCallback, useRef ,useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../../hooks/useAuth';
import {
  selectTheme,
  setTheme,
  selectIsOfflineMode,
  setOfflineMode,} from '../../../store/slices/appSlice';
import {
  selectUserPreferences,
  updateUserPreferences,
} from '../../../store/slices/userSlice';
import  colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';
import { clearAll, getStorageStats } from '../../../utils/storage';
import { showSuccessMessage, showConfirmAlert } from '../../../utils/notifications';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Section du menu des paramètres
 */
interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

/**
 * Élément du menu des paramètres
 */
interface SettingsItem {
  id: string;
  title: string;
  icon: string;
  type: 'toggle' | 'select' | 'action' | 'info';
  value?: any;
  onPress?: () => void;
  onValueChange?: (value: any) => void;
  options?: { label: string; value: any }[];
  danger?: boolean;
  badge?: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * SettingsScreen - Écran des paramètres
 */
interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  
  // Sélecteurs Redux
  const theme = useSelector(selectTheme);
  const isOfflineMode = useSelector(selectIsOfflineMode);
  const preferences = useSelector(selectUserPreferences);
  
  // États
  const [storageStats, setStorageStats] = useState({ totalItems: 0, totalSize: 0 });
  const [isClearingCache, setIsClearingCache] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Charge les statistiques de stockage
   */
  const loadStorageStats = useCallback(async () => {
    const stats = await getStorageStats();
    setStorageStats(stats);
  }, [getStorageStats]);

  // ============================================
  // ANIMATIONS
  // ============================================

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    loadStorageStats();
  }, [loadStorageStats]);

  /**
   * Gère le changement de thème
   */
  const handleThemeChange = useCallback((value: string) => {
    dispatch(setTheme(value as any));
    showSuccessMessage(t('theme_changed'));
  }, [dispatch, t]);

  /**
   * Gère le changement de langue
   */
  const handleLanguageChange = useCallback(async (value: string) => {
    // Changer la langue dans i18n
    // i18n.changeLanguage(value);
    await dispatch(updateUserPreferences({ data: { langue: value } as any, token: '' }) as any);
    showSuccessMessage(t('language_changed'));
  }, [dispatch, t]);

  /**
   * Gère le changement du mode hors ligne
   */
  const handleOfflineModeChange = useCallback((value: boolean) => {
    dispatch(setOfflineMode(value));
    showSuccessMessage(value ? t('offline_mode_enabled') : t('offline_mode_disabled'));
  }, [dispatch, t]);

  /**
   * Gère le changement de la taille de police
   */
  const handleFontSizeChange = useCallback(async (value: string) => {
    await dispatch(updateUserPreferences({ data: { taillePolice: value } as any, token: '' }) as any);
    showSuccessMessage(t('font_size_changed'));
  }, [dispatch, t]);

  /**
   * Vide le cache de l'application
   */
  const handleClearCache = useCallback(() => {
    showConfirmAlert(
      t('clear_cache'),
      t('clear_cache_confirmation'),
      async () => {
        setIsClearingCache(true);
        await clearAll();
        await loadStorageStats();
        setIsClearingCache(false);
        showSuccessMessage(t('cache_cleared'));
      }
    );
  }, [t, loadStorageStats]);

  /**
   * Ouvre les liens externes
   */
  const openLink = useCallback(async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  }, []);

  /**
   * Affiche les informations de l'application
   */
  const showAboutInfo = useCallback(() => {
    Alert.alert(
      t('about'),
      `${t('app_name')} v1.0.0\n\n${t('about_description')}\n\n${t('copyright')} © 2025`,
      [{ text: t('ok') }]
    );
  }, [t]);

  // ============================================
  // CONFIGURATION DES SECTIONS
  // ============================================

  /**
   * Sections du menu des paramètres
   */
  const settingsSections: SettingsSection[] = [
    {
      title: t('appearance'),
      items: [
        {
          id: 'theme',
          title: t('theme'),
          icon: 'theme-light-dark',
          type: 'select',
          value: theme,
          options: [
            { label: t('light'), value: 'light' },
            { label: t('dark'), value: 'dark' },
            { label: t('system'), value: 'system' },
          ],
          onValueChange: handleThemeChange,
        },
        {
          id: 'language',
          title: t('language'),
          icon: 'translate',
          type: 'select',
          value: preferences?.langue || 'fr',
          options: [
            { label: 'Français', value: 'fr' },
            { label: 'Bambara', value: 'bm' },
          ],
          onValueChange: handleLanguageChange,
        },
        {
          id: 'fontSize',
          title: t('font_size'),
          icon: 'format-font',
          type: 'select',
          value: preferences?.taillePolice || 'moyen',
          options: [
            { label: t('small'), value: 'petit' },
            { label: t('medium'), value: 'moyen' },
            { label: t('large'), value: 'grand' },
          ],
          onValueChange: handleFontSizeChange,
        },
      ],
    },
    {
      title: t('preferences'),
      items: [
        {
          id: 'offlineMode',
          title: t('offline_mode'),
          icon: 'wifi-off',
          type: 'toggle',
          value: isOfflineMode,
          onValueChange: handleOfflineModeChange,
        },
        {
          id: 'dataSaver',
          title: t('data_saver'),
          icon: 'database',
          type: 'toggle',
          value: preferences?.modeEconomieDonnees || false,
          onValueChange: (value) => dispatch(updateUserPreferences({ data: { modeEconomieDonnees: value } as any, token: '' }) as any),
        },
        {
          id: 'autoPlay',
          title: t('auto_play_videos'),
          icon: 'play-circle',
          type: 'toggle',
          value: true,
          onValueChange: () => {},
        },
      ],
    },
    {
      title: t('storage'),
      items: [
        {
          id: 'cache',
          title: t('cache_size'),
          icon: 'database',
          type: 'info',
          badge: `${Math.round(storageStats.totalSize / 1024)} KB`,
          onPress: () => {},
        },
        {
          id: 'clearCache',
          title: t('clear_cache'),
          icon: 'delete-sweep',
          type: 'action',
          onPress: handleClearCache,
        },
      ],
    },
    {
      title: t('support'),
      items: [
        {
          id: 'help',
          title: t('help'),
          icon: 'help-circle',
          type: 'action',
          onPress: () => navigation.navigate('Help'),
        },
        {
          id: 'contact',
          title: t('contact_us'),
          icon: 'email',
          type: 'action',
          onPress: () => openLink('mailto:support@seneyiriwa.com'),
        },
        {
          id: 'privacy',
          title: t('privacy_policy'),
          icon: 'shield-account',
          type: 'action',
          onPress: () => openLink('https://seneyiriwa.com/privacy'),
        },
        {
          id: 'terms',
          title: t('terms_of_use'),
          icon: 'file-document',
          type: 'action',
          onPress: () => openLink('https://seneyiriwa.com/terms'),
        },
      ],
    },
    {
      title: t('about'),
      items: [
        {
          id: 'version',
          title: t('version'),
          icon: 'information',
          type: 'info',
          badge: '1.0.0',
          onPress: showAboutInfo,
        },
        {
          id: 'rate',
          title: t('rate_app'),
          icon: 'star',
          type: 'action',
          onPress: () => openLink('https://play.google.com/store/apps/details?id=com.seneyiriwa'),
        },
        {
          id: 'share',
          title: t('share_app'),
          icon: 'share',
          type: 'action',
          onPress: () => {
            // Partager l'application
          },
        },
      ],
    },
  ];

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  /**
   * Rendu d'un élément select
   */
  const renderSelectItem = (item: SettingsItem) => (
    <View style={styles.selectContainer}>
      {item.options?.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.selectOption,
            item.value === option.value && styles.selectOptionActive,
          ]}
          onPress={() => item.onValueChange?.(option.value)}
        >
          <Text
            style={[
              styles.selectOptionText,
              item.value === option.value && styles.selectOptionTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  /**
   * Rendu d'un élément toggle
   */
  const renderToggleItem = (item: SettingsItem) => (
    <Switch
      value={item.value}
      onValueChange={item.onValueChange}
      trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
      thumbColor={item.value ? colors.primary : colors.white}
    />
  );

  /**
   * Rendu d'un élément action
   */
  const renderActionItem = (item: SettingsItem) => (
    <TouchableOpacity onPress={item.onPress} style={styles.actionButton}>
      <Text style={[styles.actionText, item.danger && styles.dangerText]}>
        {item.title}
      </Text>
      <Icon name="chevron-right" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  /**
   * Rendu d'un élément info
   */
  const renderInfoItem = (item: SettingsItem) => (
    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>{item.title}</Text>
      {item.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}
    </View>
  );

  /**
   * Rendu d'un élément de paramètre
   */
  const renderSettingItem = (item: SettingsItem) => {
    let rightElement = null;
    
    switch (item.type) {
      case 'select':
        rightElement = renderSelectItem(item);
        break;
      case 'toggle':
        rightElement = renderToggleItem(item);
        break;
      case 'action':
        rightElement = renderActionItem(item);
        break;
      case 'info':
        rightElement = renderInfoItem(item);
        break;
    }
    
    return (
      <View key={item.id} style={styles.settingItem}>
        <View style={styles.settingItemLeft}>
          <Icon name={item.icon} size={22} color={colors.gray[700]} />
          <Text style={styles.settingItemLabel}>{item.title}</Text>
        </View>
        {rightElement}
      </View>
    );
  };

  /**
   * Rendu d'une section
   */
  const renderSection = (section: SettingsSection, index: number) => (
    <Animated.View
      key={section.title}
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, index + 1) }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingItem)}
      </View>
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
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View>
      
      {/* Sections des paramètres */}
      {settingsSections.map(renderSection)}
      
      {/* Bouton de déconnexion */}
      <Animated.View
        style={[
          styles.logoutSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            showConfirmAlert(
              t('logout'),
              t('logout_confirmation'),
              () => logout()
            );
          }}
        >
          <Icon name="logout" size={22} color={colors.error} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Version */}
      <Text style={styles.versionText}>
        {t('version')} 1.0.0
      </Text>
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
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  
  // Section
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[500],
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Élément de paramètre
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  
  // Select
  selectContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  selectOptionActive: {
    backgroundColor: colors.primary,
  },
  selectOptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  selectOptionTextActive: {
    color: colors.white,
  },
  
  // Action
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[800],
  },
  dangerText: {
    color: colors.error,
  },
  
  // Info
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
  },
  badge: {
    backgroundColor: colors.gray[200],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
  },
  
  // Déconnexion
  logoutSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
  },
  
  // Version
  versionText: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
    marginTop: spacing.xl,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default SettingsScreen;