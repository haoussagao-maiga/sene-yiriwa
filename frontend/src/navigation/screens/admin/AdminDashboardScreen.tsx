/**
 * AdminDashboardScreen - Sènè Yiriwa
 * 
 * Écran principal du tableau de bord administrateur.
 * Affiche les statistiques clés et les métriques de l'application.
 * 
 * Fonctionnalités :
 * - Statistiques utilisateurs (total, actifs, par rôle)
 * - Statistiques contenu (conseils, techniques)
 * - Statistiques d'engagement
 * - Graphiques et visualisations
 * - Actions rapides
 * 
 * @module navigation/screens/admin/AdminDashboardScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from 'react-native-paper';

// Import des styles
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

// ============================================
// TYPES ET INTERFACES
// ============================================

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalConseils: number;
  totalTechniques: number;
  pendingReviews: number;
  reportedContent: number;
}

interface RoleStats {
  agriculteur: number;
  expert: number;
  administrateur: number;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const AdminDashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalConseils: 0,
    totalTechniques: 0,
    pendingReviews: 0,
    reportedContent: 0,
  });
  const [roleStats, setRoleStats] = useState<RoleStats>({
    agriculteur: 0,
    expert: 0,
    administrateur: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Charge les statistiques du dashboard
   */
  const loadStats = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par les vrais appels API
      // const response = await AdminAPI.getDashboardStats();
      
      // Simulation de données
      setTimeout(() => {
        setStats({
          totalUsers: 1234,
          activeUsers: 856,
          totalConseils: 45,
          totalTechniques: 32,
          pendingReviews: 8,
          reportedContent: 3,
        });
        setRoleStats({
          agriculteur: 1100,
          expert: 130,
          administrateur: 4,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setLoading(false);
    }
  };

  /**
   * Rafraîchit les données
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  // ============================================
  // COMPOSANTS DE CARTES
  // ============================================

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: string;
    color: string;
    trend?: number;
  }> = ({ title, value, icon, color, trend }) => (
    <Card style={styles.statCard}>
      <View style={styles.statCardContent}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
          <Icon name={icon} size={32} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value.toLocaleString()}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {trend !== undefined && (
            <View style={styles.trendContainer}>
              <Icon 
                name={trend >= 0 ? 'trending-up' : 'trending-down'} 
                size={16} 
                color={trend >= 0 ? colors.success : colors.error} 
              />
              <Text style={[
                styles.trendText,
                { color: trend >= 0 ? colors.success : colors.error }
              ]}>
                {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  const QuickActionCard: React.FC<{
    title: string;
    icon: string;
    color: string;
    onPress: () => void;
  }> = ({ title, icon, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.quickActionCard, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <Icon name={icon} size={28} color={color} />
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Icon name="chevron-right" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  // ============================================
  // RENDU
  // ============================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('admin_dashboard')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('welcome_admin')}
        </Text>
      </View>

      {/* Statistiques principales */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>{t('overview')}</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title={t('total_users')}
            value={stats.totalUsers}
            icon="account-group"
            color={colors.primary}
            trend={12}
          />
          <StatCard
            title={t('active_users')}
            value={stats.activeUsers}
            icon="account-check"
            color={colors.success}
            trend={8}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title={t('total_conseils')}
            value={stats.totalConseils}
            icon="leaf"
            color={colors.info}
            trend={15}
          />
          <StatCard
            title={t('total_techniques')}
            value={stats.totalTechniques}
            icon="school"
            color={colors.warning}
            trend={5}
          />
        </View>
      </View>

      {/* Statistiques par rôle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('users_by_role')}</Text>
        <Card style={styles.card}>
          <View style={styles.roleStatsContainer}>
            <View style={styles.roleStatItem}>
              <View style={[styles.roleDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.roleLabel}>{t('agriculteurs')}</Text>
              <Text style={styles.roleValue}>{roleStats.agriculteur}</Text>
            </View>
            <View style={styles.roleStatItem}>
              <View style={[styles.roleDot, { backgroundColor: colors.info }]} />
              <Text style={styles.roleLabel}>{t('experts')}</Text>
              <Text style={styles.roleValue}>{roleStats.expert}</Text>
            </View>
            <View style={styles.roleStatItem}>
              <View style={[styles.roleDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.roleLabel}>{t('administrateurs')}</Text>
              <Text style={styles.roleValue}>{roleStats.administrateur}</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Actions rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
        
        <QuickActionCard
          title={t('manage_users')}
          icon="account-group"
          color={colors.primary}
          onPress={() => {/* Navigation vers Users */}}
        />
        
        <QuickActionCard
          title={t('manage_content')}
          icon="file-document-multiple"
          color={colors.info}
          onPress={() => {/* Navigation vers Content */}}
        />
        
        <QuickActionCard
          title={t('pending_reviews')}
          icon="clock-outline"
          color={colors.warning}
          onPress={() => {/* Navigation vers Reviews */}}
        />
        
        {stats.reportedContent > 0 && (
          <QuickActionCard
            title={`${t('reported_content')} (${stats.reportedContent})`}
            icon="alert-circle"
            color={colors.error}
            onPress={() => {/* Navigation vers Reported */}}
          />
        )}
      </View>

      {/* Alertes et notifications */}
      {(stats.pendingReviews > 0 || stats.reportedContent > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('alerts')}</Text>
          
          {stats.pendingReviews > 0 && (
            <Card style={[styles.alertCard, { backgroundColor: `${colors.warning}10` }]}>
              <View style={styles.alertContent}>
                <Icon name="clock-outline" size={24} color={colors.warning} />
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle}>{t('pending_reviews')}</Text>
                  <Text style={styles.alertMessage}>
                    {stats.pendingReviews} {t('items_waiting_review')}
                  </Text>
                </View>
              </View>
            </Card>
          )}
          
          {stats.reportedContent > 0 && (
            <Card style={[styles.alertCard, { backgroundColor: `${colors.error}10` }]}>
              <View style={styles.alertContent}>
                <Icon name="alert-circle" size={24} color={colors.error} />
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle}>{t('reported_content')}</Text>
                  <Text style={styles.alertMessage}>
                    {stats.reportedContent} {t('items_reported')}
                  </Text>
                </View>
              </View>
            </Card>
          )}
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
  contentContainer: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    elevation: 2,
    borderRadius: 12,
  },
  statCardContent: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  statTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  trendText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginLeft: 4,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  roleStatsContainer: {
    padding: spacing.lg,
  },
  roleStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  roleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  roleLabel: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.gray[700],
  },
  roleValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    elevation: 2,
  },
  quickActionTitle: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
    marginLeft: spacing.md,
  },
  alertCard: {
    marginBottom: spacing.md,
    elevation: 2,
    borderRadius: 12,
  },
  alertContent: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'center',
  },
  alertText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  alertTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  alertMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: 2,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default AdminDashboardScreen;
