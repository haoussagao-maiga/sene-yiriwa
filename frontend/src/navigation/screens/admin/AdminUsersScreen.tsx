/**
 * AdminUsersScreen - Sènè Yiriwa
 * 
 * Écran de gestion des utilisateurs pour les administrateurs.
 * Permet de lister, rechercher, filtrer et gérer les utilisateurs.
 * 
 * Fonctionnalités :
 * - Liste des utilisateurs avec pagination
 * - Recherche par nom, email, téléphone
 * - Filtrage par rôle (agriculteur, expert, administrateur)
 * - Filtrage par statut (actif, inactif)
 * - Actions rapides (éditer, suspendre, supprimer)
 * - Export des données
 * 
 * @module navigation/screens/admin/AdminUsersScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Chip, Searchbar, Menu, Divider } from 'react-native-paper';

// Import des styles
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

// ============================================
// TYPES ET INTERFACES
// ============================================

interface User {
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
}

interface UsersFilters {
  search: string;
  role: 'all' | 'agriculteur' | 'expert' | 'administrateur';
  status: 'all' | 'active' | 'inactive';
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const AdminUsersScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filters, setFilters] = useState<UsersFilters>({
    search: '',
    role: 'all',
    status: 'all',
  });
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  /**
   * Charge la liste des utilisateurs
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par les vrais appels API
      // const response = await AdminAPI.getUsers();
      
      // Simulation de données
      setTimeout(() => {
        const mockUsers: User[] = [
          {
            id: '1',
            nom: 'Diallo',
            prenom: 'Mamadou',
            email: 'mamadou.diallo@example.com',
            telephone: '771234567',
            role: 'agriculteur',
            isActive: true,
            isEmailVerified: true,
            createdAt: '2024-01-15',
            lastLogin: '2024-06-20',
          },
          {
            id: '2',
            nom: 'Touré',
            prenom: 'Aminata',
            email: 'aminata.toure@example.com',
            telephone: '762345678',
            role: 'expert',
            isActive: true,
            isEmailVerified: true,
            createdAt: '2024-02-10',
            lastLogin: '2024-06-19',
          },
          {
            id: '3',
            nom: 'Sangaré',
            prenom: 'Ibrahim',
            email: 'ibrahim.sangare@example.com',
            telephone: '783456789',
            role: 'agriculteur',
            isActive: false,
            isEmailVerified: false,
            createdAt: '2024-03-05',
          },
          {
            id: '4',
            nom: 'Koné',
            prenom: 'Fatoumata',
            email: 'fatoumata.kone@example.com',
            telephone: '794567890',
            role: 'administrateur',
            isActive: true,
            isEmailVerified: true,
            createdAt: '2024-01-01',
            lastLogin: '2024-06-25',
          },
        ];
        
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setLoading(false);
    }
  };

  /**
   * Applique les filtres
   */
  const applyFilters = () => {
    let result = [...users];
    
    // Filtre recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(user =>
        user.nom.toLowerCase().includes(searchLower) ||
        user.prenom.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.telephone.includes(searchLower)
      );
    }
    
    // Filtre rôle
    if (filters.role !== 'all') {
      result = result.filter(user => user.role === filters.role);
    }
    
    // Filtre statut
    if (filters.status !== 'all') {
      result = result.filter(user => 
        filters.status === 'active' ? user.isActive : !user.isActive
      );
    }
    
    setFilteredUsers(result);
  };

  /**
   * Rafraîchit les données
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  // ============================================
  // COMPOSANTS
  // ============================================

  const UserCard: React.FC<{ user: User }> = ({ user }) => {
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
      <Card style={styles.userCard}>
        <TouchableOpacity
          style={styles.userCardContent}
          onPress={() => {
            setSelectedUser(user);
            navigation.navigate('UserDetail', { userId: user.id });
          }}
        >
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user.prenom[0]}{user.nom[0]}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user.prenom} {user.nom}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userPhone}>{user.telephone}</Text>
            </View>
          </View>
          
          <View style={styles.userMeta}>
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
                size={16}
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
          
          <Icon name="chevron-right" size={24} color={colors.gray[400]} />
        </TouchableOpacity>
      </Card>
    );
  };

  const FilterChip: React.FC<{
    label: string;
    value: string;
    selected: boolean;
    onPress: () => void;
  }> = ({ label, value, selected, onPress }) => (
    <Chip
      selected={selected}
      onPress={onPress}
      style={styles.filterChip}
      selectedColor={colors.white}
      textStyle={selected ? styles.filterChipTextSelected : styles.filterChipText}
    >
      {label}
    </Chip>
  );

  // ============================================
  // RENDU
  // ============================================

  return (
    <View style={styles.container}>
      {/* Barre de recherche et filtres */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder={t('search_users')}
          value={filters.search}
          onChangeText={(text) => setFilters({ ...filters, search: text })}
          style={styles.searchbar}
        />
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>{t('role')}:</Text>
          <View style={styles.filterChips}>
            <FilterChip
              label={t('all')}
              value="all"
              selected={filters.role === 'all'}
              onPress={() => setFilters({ ...filters, role: 'all' })}
            />
            <FilterChip
              label={t('agriculteurs')}
              value="agriculteur"
              selected={filters.role === 'agriculteur'}
              onPress={() => setFilters({ ...filters, role: 'agriculteur' })}
            />
            <FilterChip
              label={t('experts')}
              value="expert"
              selected={filters.role === 'expert'}
              onPress={() => setFilters({ ...filters, role: 'expert' })}
            />
            <FilterChip
              label={t('administrateurs')}
              value="administrateur"
              selected={filters.role === 'administrateur'}
              onPress={() => setFilters({ ...filters, role: 'administrateur' })}
            />
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>{t('status')}:</Text>
          <View style={styles.filterChips}>
            <FilterChip
              label={t('all')}
              value="all"
              selected={filters.status === 'all'}
              onPress={() => setFilters({ ...filters, status: 'all' })}
            />
            <FilterChip
              label={t('active')}
              value="active"
              selected={filters.status === 'active'}
              onPress={() => setFilters({ ...filters, status: 'active' })}
            />
            <FilterChip
              label={t('inactive')}
              value="inactive"
              selected={filters.status === 'inactive'}
              onPress={() => setFilters({ ...filters, status: 'inactive' })}
            />
          </View>
        </View>
      </View>

      {/* Liste des utilisateurs */}
      <ScrollView
        style={styles.usersList}
        contentContainerStyle={styles.usersListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="account-search" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>{t('no_users_found')}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {filteredUsers.length} {t('users_found')}
            </Text>
            {filteredUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </>
        )}
      </ScrollView>
      
      {/* Bouton flottant pour ajouter un utilisateur */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="plus" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
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
  searchSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchbar: {
    elevation: 0,
    backgroundColor: colors.gray[100],
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    marginRight: spacing.sm,
    minWidth: 50,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    backgroundColor: colors.gray[100],
  },
  filterChipText: {
    color: colors.gray[700],
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  usersList: {
    flex: 1,
  },
  usersListContent: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    marginTop: spacing.md,
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  userCard: {
    marginBottom: spacing.md,
    elevation: 2,
    borderRadius: 12,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userAvatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: 2,
  },
  userPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: 2,
  },
  userMeta: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  roleChip: {
    marginBottom: spacing.xs,
  },
  roleChipText: {
    fontSize: typography.fontSize.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

// ============================================
// IMPORTS SUPPLÉMENTAIRES
// ============================================

import { useNavigation } from '@react-navigation/native';

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default AdminUsersScreen;
