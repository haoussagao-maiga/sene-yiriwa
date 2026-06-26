/**
 * AdminSettingsScreen - Sènè Yiriwa
 * 
 * Écran des paramètres administrateur.
 * Permet de configurer les paramètres globaux de l'application.
 * 
 * Fonctionnalités :
 * - Configuration de l'application
 * - Gestion des notifications
 * - Paramètres de sécurité
 * - Paramètres de modération
 * - Logs et audits
 * - Informations système
 * 
 * @module navigation/screens/admin/AdminSettingsScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, List, Divider } from 'react-native-paper';

// Import des styles
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const AdminSettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    
    // Modération
    autoModeration: false,
    requireApproval: true,
    
    // Sécurité
    twoFactorAuth: false,
    sessionTimeout: 30,
    
    // Application
    maintenanceMode: false,
    debugMode: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  // ============================================
  // COMPOSANTS
  // ============================================

  const SettingSection: React.FC<{
    title: string;
    icon: string;
    children: React.ReactNode;
  }> = ({ title, icon, children }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name={icon} size={24} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Card style={styles.card}>{children}</Card>
    </View>
  );

  const SettingItem: React.FC<{
    label: string;
    value: boolean;
    onToggle: () => void;
    description?: string;
  }> = ({ label, value, onToggle, description }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.gray[300], true: colors.primary }}
        thumbColor={value ? colors.primary : colors.gray[400]}
      />
    </View>
  );

  const NavigationItem: React.FC<{
    label: string;
    icon: string;
    onPress: () => void;
    badge?: number;
  }> = ({ label, icon, onPress, badge }) => (
    <TouchableOpacity style={styles.navigationItem} onPress={onPress}>
      <View style={styles.navigationItemContent}>
        <Icon name={icon} size={24} color={colors.gray[600]} />
        <Text style={styles.navigationItemLabel}>{label}</Text>
      </View>
      <View style={styles.navigationItemRight}>
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Icon name="chevron-right" size={24} color={colors.gray[400]} />
      </View>
    </TouchableOpacity>
  );

  // ============================================
  // RENDU
  // ============================================

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Paramètres de notification */}
      <SettingSection title={t('notifications')} icon="bell">
        <SettingItem
          label={t('email_notifications')}
          value={settings.emailNotifications}
          onToggle={() => toggleSetting('emailNotifications')}
          description={t('email_notifications_desc')}
        />
        <Divider />
        <SettingItem
          label={t('push_notifications')}
          value={settings.pushNotifications}
          onToggle={() => toggleSetting('pushNotifications')}
          description={t('push_notifications_desc')}
        />
        <Divider />
        <SettingItem
          label={t('weekly_report')}
          value={settings.weeklyReport}
          onToggle={() => toggleSetting('weeklyReport')}
          description={t('weekly_report_desc')}
        />
      </SettingSection>

      {/* Paramètres de modération */}
      <SettingSection title={t('moderation')} icon="shield-check">
        <SettingItem
          label={t('auto_moderation')}
          value={settings.autoModeration}
          onToggle={() => toggleSetting('autoModeration')}
          description={t('auto_moderation_desc')}
        />
        <Divider />
        <SettingItem
          label={t('require_approval')}
          value={settings.requireApproval}
          onToggle={() => toggleSetting('requireApproval')}
          description={t('require_approval_desc')}
        />
      </SettingSection>

      {/* Paramètres de sécurité */}
      <SettingSection title={t('security')} icon="lock">
        <SettingItem
          label={t('two_factor_auth')}
          value={settings.twoFactorAuth}
          onToggle={() => toggleSetting('twoFactorAuth')}
          description={t('two_factor_auth_desc')}
        />
        <Divider />
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('session_timeout')}</Text>
            <Text style={styles.settingDescription}>
              {t('session_timeout_desc')}
            </Text>
          </View>
          <View style={styles.timeoutValue}>
            <Text style={styles.timeoutText}>{settings.sessionTimeout} min</Text>
          </View>
        </View>
      </SettingSection>

      {/* Paramètres de l'application */}
      <SettingSection title={t('application_settings')} icon="cog">
        <SettingItem
          label={t('maintenance_mode')}
          value={settings.maintenanceMode}
          onToggle={() => toggleSetting('maintenanceMode')}
          description={t('maintenance_mode_desc')}
        />
        <Divider />
        <SettingItem
          label={t('debug_mode')}
          value={settings.debugMode}
          onToggle={() => toggleSetting('debugMode')}
          description={t('debug_mode_desc')}
        />
      </SettingSection>

      {/* Actions de gestion */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="wrench" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t('management')}</Text>
        </View>
        <Card style={styles.card}>
          <NavigationItem
            label={t('manage_roles')}
            icon="account-key"
            onPress={() => {}}
          />
          <Divider />
          <NavigationItem
            label={t('system_logs')}
            icon="file-document"
            onPress={() => {}}
          />
          <Divider />
          <NavigationItem
            label={t('audit_logs')}
            icon="clipboard-list"
            onPress={() => {}}
            badge={3}
          />
          <Divider />
          <NavigationItem
            label={t('data_export')}
            icon="download"
            onPress={() => {}}
          />
          <Divider />
          <NavigationItem
            label={t('cache_management')}
            icon="cached"
            onPress={() => {}}
          />
        </Card>
      </View>

      {/* Informations système */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="information" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t('system_info')}</Text>
        </View>
        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('app_version')}</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <Divider />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('api_version')}</Text>
            <Text style={styles.infoValue}>v2.1</Text>
          </View>
          <Divider />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('database')}</Text>
            <Text style={styles.infoValue}>PostgreSQL 14</Text>
          </View>
          <Divider />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('last_backup')}</Text>
            <Text style={styles.infoValue}>2024-06-25 02:00</Text>
          </View>
        </Card>
      </View>

      {/* Actions dangereuses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="alert-circle" size={24} color={colors.error} />
          <Text style={[styles.sectionTitle, { color: colors.error }]}>
            {t('danger_zone')}
          </Text>
        </View>
        <Card style={[styles.card, styles.dangerCard]}>
          <TouchableOpacity style={styles.dangerButton}>
            <Icon name="database-refresh" size={24} color={colors.error} />
            <Text style={styles.dangerButtonText}>{t('reset_database')}</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.dangerButton}>
            <Icon name="delete-forever" size={24} color={colors.error} />
            <Text style={styles.dangerButtonText}>{t('delete_all_data')}</Text>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Sènè Yiriwa © 2024
        </Text>
        <Text style={styles.footerSubtext}>
          {t('admin_panel')}
        </Text>
      </View>
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
  contentContainer: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginLeft: spacing.sm,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: 2,
  },
  timeoutValue: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  timeoutText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  navigationItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navigationItemLabel: {
    fontSize: typography.fontSize.md,
    color: colors.gray[900],
    marginLeft: spacing.md,
  },
  navigationItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: spacing.sm,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  infoLabel: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  dangerCard: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dangerButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
    marginLeft: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  footerSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
    marginTop: 4,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default AdminSettingsScreen;
