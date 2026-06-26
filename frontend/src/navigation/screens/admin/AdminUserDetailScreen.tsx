/**
 * AdminUserDetailScreen - Sènè Yiriwa
 * 
 * Écran de détail d'un utilisateur pour les administrateurs.
 * Permet de voir et modifier les informations d'un utilisateur.
 * 
 * Fonctionnalités :
 * - Affichage des informations utilisateur
 * - Modification du profil
 * - Gestion du statut (actif/inactif)
 * - Gestion du rôle
 * - Historique d'activité
 * - Actions de modération
 * 
 * @module navigation/screens/admin/AdminUserDetailScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Avatar, Button, Divider, Chip } from 'react-native-paper';

// Import des styles
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

// ============================================
// TYPES ET INTERFACES
// ============================================

interface UserDetail {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'agriculteur' | 'expert' | 'administrateur';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  localisation?: string;
  cultureType?: string;
  superficie?: number;
  agricultureType?: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const AdminUserDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  
  const { userId } = route.params as { userId: string };
  
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Charge les détails de l'utilisateur
   */
  const loadUserDetail = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par les vrais appels API
      // const response = await AdminAPI.getUserDetail(userId);
      
      // Simulation de données
      setTimeout(() => {
        const mockUser: UserDetail = {
          id: userId,
          nom: 'Diallo',
          prenom: 'Mamadou',
          email: 'mamadou.diallo@example.com',
          telephone: '771234567',
          role: 'agriculteur',
          isActive: true,
          isEmailVerified: true,
          createdAt: '2024-01-15',
          lastLogin: '2024-06-25',
          localisation: 'Koulikoro',
          cultureType: 'Mil, Sorgho',
          superficie: 5,
          agricultureType: 'Traditionnelle',
        };
        
        setUser(mockUser);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      setLoading(false);
    }
  };

  /**
   * Bascule le statut de l'utilisateur
   */
  const toggleUserStatus = () => {
    if (!user) return;
    
    Alert.alert(
      t('confirm_action'),
      user.isActive 
        ? t('confirm_deactivate_user')
        : t('confirm_activate_user'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          onPress: () => {
            setUser({ ...user, isActive: !user.isActive });
            // TODO: Appel API
          },
        },
      ]
    );
  };

  /**
   * Change le rôle de l'utilisateur
   */
  const changeUserRole = () => {
    if (!user) return;
    
    Alert.alert(
      t('change_role'),
      t('select_new_role'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('agriculteur'),
          onPress: () => setUser({ ...user, role: 'agriculteur' }),
        },
        {
          text: t('expert'),
          onPress: () => setUser({ ...user, role: 'expert' }),
        },
        {
          text: t('administrateur'),
          onPress: () => setUser({ ...user, role: 'administrateur' }),
        },
      ]
    );
  };

  /**
   * Supprime l'utilisateur
   */
  const deleteUser = () => {
    Alert.alert(
      t('delete_user'),
      t('confirm_delete_user'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
            // TODO: Appel API
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadUserDetail();
  }, [userId]);

  // ============================================
  // RENDU
  // ============================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="account-off" size={64} color={colors.error} />
        <Text style={styles.errorText}>{t('user_not_found')}</Text>
      </View>
    );
  }

  const getRoleColor = () => {
    switch (user.role) {
      case 'agriculteur': return colors.primary;
      case 'expert': return colors.info;
      case 'administrateur': return colors.warning;
      default: return colors.gray[500];
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'agriculteur': return t('agriculteur');
      case 'expert': return t('expert');
      case 'administrateur': return t('administrateur');
      default: return user.role;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* En-tête avec avatar */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Avatar.Text
            size={80}
            label={`${user.prenom[0]}${user.nom[0]}`}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user.prenom} {user.nom}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.headerMeta}>
              <Chip
                style={[styles.roleChip, { backgroundColor: `${getRoleColor()}20` }]}
                textStyle={[styles.roleChipText, { color: getRoleColor() }]}
                compact
              >
                {getRoleLabel()}
              </Chip>
              <View style={styles.statusContainer}>
                <Icon
                  name={user.isActive ? 'check-circle' : 'close-circle'}
                  size={20}
                  color={user.isActive ? colors.success : colors.error}
                />
                <Text style={[
                  styles.statusText,
                  { color: user.isActive ? colors.success : colors.error }
                ]}>
                  {user.isActive ? t('active') : t('inactive')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>

      {/* Informations personnelles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('personal_info')}</Text>
        <Card style={styles.card}>
          <InfoRow label={t('email')} value={user.email} icon="email" />
          <Divider />
          <InfoRow label={t('phone')} value={user.telephone} icon="phone" />
          <Divider />
          <InfoRow label={t('created_at')} value={user.createdAt} icon="calendar" />
          {user.lastLogin && (
            <>
              <Divider />
              <InfoRow label={t('last_login')} value={user.lastLogin} icon="clock" />
            </>
          )}
        </Card>
      </View>

      {/* Informations agricoles (si agriculteur) */}
      {user.role === 'agriculteur' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('agricultural_info')}</Text>
          <Card style={styles.card}>
            {user.localisation && (
              <>
                <InfoRow label={t('location')} value={user.localisation} icon="map-marker" />
                <Divider />
              </>
            )}
            {user.cultureType && (
              <>
                <InfoRow label={t('culture_type')} value={user.cultureType} icon="leaf" />
                <Divider />
              </>
            )}
            {user.superficie && (
              <>
                <InfoRow label={t('surface_area')} value={`${user.superficie} ha`} icon="terrain" />
                <Divider />
              </>
            )}
            {user.agricultureType && (
              <InfoRow label={t('agriculture_type')} value={user.agricultureType} icon="tractor" />
            )}
          </Card>
        </View>
      )}

      {/* Actions rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
        <Card style={styles.card}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleUserStatus}>
            <Icon
              name={user.isActive ? 'account-off' : 'account-check'}
              size={24}
              color={user.isActive ? colors.warning : colors.success}
            />
            <Text style={styles.actionButtonText}>
              {user.isActive ? t('deactivate_user') : t('activate_user')}
            </Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.actionButton} onPress={changeUserRole}>
            <Icon name="account-switch" size={24} color={colors.info} />
            <Text style={styles.actionButtonText}>{t('change_role')}</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="email-edit" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>{t('send_email')}</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="lock-reset" size={24} color={colors.gray[600]} />
            <Text style={styles.actionButtonText}>{t('reset_password')}</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Actions dangereuses */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.error }]}>
          {t('danger_zone')}
        </Text>
        <Card style={[styles.card, styles.dangerCard]}>
          <TouchableOpacity style={styles.dangerButton} onPress={deleteUser}>
            <Icon name="delete-forever" size={24} color={colors.error} />
            <Text style={styles.dangerButtonText}>{t('delete_user')}</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
};

// ============================================
// COMPOSANTS AUXILIAIRES
// ============================================

const InfoRow: React.FC<{
  label: string;
  value: string;
  icon: string;
}> = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    <Icon name={icon} size={20} color={colors.gray[500]} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    marginTop: spacing.md,
  },
  headerCard: {
    marginBottom: spacing.xl,
    elevation: 2,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.primary,
    marginRight: spacing.lg,
  },
  avatarLabel: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  userEmail: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    marginTop: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  roleChip: {
    height: 28,
  },
  roleChipText: {
    fontSize: typography.fontSize.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: 4,
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
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  infoContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
    marginLeft: spacing.md,
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
});

// ============================================
// IMPORTS SUPPLÉMENTAIRES
// ============================================

import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default AdminUserDetailScreen;
