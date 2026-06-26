/**
 * AdminContentScreen - Sènè Yiriwa
 * 
 * Écran de gestion du contenu pour les administrateurs.
 * Permet de gérer les conseils et techniques agricoles.
 * 
 * Fonctionnalités :
 * - Liste des contenus (conseils, techniques)
 * - Filtrage par type et statut
 * - Recherche par titre, catégorie
 * - Actions (éditer, publier, archiver, supprimer)
 * - Modération du contenu
 * 
 * @module navigation/screens/admin/AdminContentScreen
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
import { Card, Chip, Searchbar } from 'react-native-paper';

// Import des styles
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

// ============================================
// TYPES ET INTERFACES
// ============================================

interface ContentItem {
  id: string;
  type: 'conseil' | 'technique';
  title: string;
  category: string;
  author: string;
  status: 'draft' | 'pending' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
}

interface ContentFilters {
  search: string;
  type: 'all' | 'conseil' | 'technique';
  status: 'all' | 'draft' | 'pending' | 'published' | 'archived';
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const AdminContentScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filters, setFilters] = useState<ContentFilters>({
    search: '',
    type: 'all',
    status: 'all',
  });

  /**
   * Charge la liste du contenu
   */
  const loadContent = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par les vrais appels API
      // const response = await AdminAPI.getContent();
      
      // Simulation de données
      setTimeout(() => {
        const mockContent: ContentItem[] = [
          {
            id: '1',
            type: 'conseil',
            title: 'Comment améliorer la culture du mil',
            category: 'Céréales',
            author: 'Dr. Touré',
            status: 'published',
            createdAt: '2024-01-15',
            updatedAt: '2024-06-10',
            views: 1234,
            likes: 89,
          },
          {
            id: '2',
            type: 'technique',
            title: 'Irrigation goutte à goutte',
            category: 'Irrigation',
            author: 'Ing. Koné',
            status: 'published',
            createdAt: '2024-02-20',
            updatedAt: '2024-05-15',
            views: 856,
            likes: 67,
          },
          {
            id: '3',
            type: 'conseil',
            title: 'Lutte contre les ravageurs du coton',
            category: 'Protection',
            author: 'Dr. Sangaré',
            status: 'pending',
            createdAt: '2024-06-18',
            updatedAt: '2024-06-18',
            views: 0,
            likes: 0,
          },
          {
            id: '4',
            type: 'technique',
            title: 'Rotation des cultures',
            category: 'Pratiques',
            author: 'Exp. Diallo',
            status: 'draft',
            createdAt: '2024-06-20',
            updatedAt: '2024-06-20',
            views: 0,
            likes: 0,
          },
          {
            id: '5',
            type: 'conseil',
            title: 'Choix des semences',
            category: 'Semences',
            author: 'Dr. Touré',
            status: 'published',
            createdAt: '2024-03-10',
            updatedAt: '2024-04-05',
            views: 2341,
            likes: 156,
          },
        ];
        
        setContent(mockContent);
        setFilteredContent(mockContent);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
      setLoading(false);
    }
  };

  /**
   * Applique les filtres
   */
  const applyFilters = () => {
    let result = [...content];
    
    // Filtre recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.author.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtre type
    if (filters.type !== 'all') {
      result = result.filter(item => item.type === filters.type);
    }
    
    // Filtre statut
    if (filters.status !== 'all') {
      result = result.filter(item => item.status === filters.status);
    }
    
    setFilteredContent(result);
  };

  /**
   * Rafraîchit les données
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  };

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, content]);

  // ============================================
  // COMPOSANTS
  // ============================================

  const ContentCard: React.FC<{ item: ContentItem }> = ({ item }) => {
    const getTypeColor = () => {
      return item.type === 'conseil' ? colors.primary : colors.info;
    };

    const getTypeLabel = () => {
      return item.type === 'conseil' ? t('conseil') : t('technique');
    };

    const getStatusColor = () => {
      switch (item.status) {
        case 'published': return colors.success;
        case 'pending': return colors.warning;
        case 'draft': return colors.gray[500];
        case 'archived': return colors.error;
        default: return colors.gray[500];
      }
    };

    const getStatusLabel = () => {
      switch (item.status) {
        case 'published': return t('published');
        case 'pending': return t('pending');
        case 'draft': return t('draft');
        case 'archived': return t('archived');
        default: return item.status;
      }
    };

    return (
      <Card style={styles.contentCard}>
        <TouchableOpacity
          style={styles.contentCardContent}
          onPress={() => {
            navigation.navigate('ContentDetail', { 
              contentId: item.id, 
              contentType: item.type 
            });
          }}
        >
          <View style={styles.contentHeader}>
            <View style={styles.contentTypeInfo}>
              <Chip
                style={[styles.typeChip, { backgroundColor: `${getTypeColor()}20` }]}
                textStyle={[styles.typeChipText, { color: getTypeColor() }]}
                compact
              >
                {getTypeLabel()}
              </Chip>
              <Chip
                style={[styles.statusChip, { backgroundColor: `${getStatusColor()}20` }]}
                textStyle={[styles.statusChipText, { color: getStatusColor() }]}
                compact
              >
                {getStatusLabel()}
              </Chip>
            </View>
            <Icon name="chevron-right" size={24} color={colors.gray[400]} />
          </View>
          
          <Text style={styles.contentTitle}>{item.title}</Text>
          <View style={styles.contentMeta}>
            <Text style={styles.contentCategory}>{item.category}</Text>
            <Text style={styles.contentAuthor}>• {item.author}</Text>
          </View>
          
          <View style={styles.contentStats}>
            <View style={styles.statItem}>
              <Icon name="eye" size={16} color={colors.gray[500]} />
              <Text style={styles.statText}>{item.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="heart" size={16} color={colors.gray[500]} />
              <Text style={styles.statText}>{item.likes}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="calendar" size={16} color={colors.gray[500]} />
              <Text style={styles.statText}>
                {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
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
          placeholder={t('search_content')}
          value={filters.search}
          onChangeText={(text) => setFilters({ ...filters, search: text })}
          style={styles.searchbar}
        />
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>{t('type')}:</Text>
          <View style={styles.filterChips}>
            <FilterChip
              label={t('all')}
              value="all"
              selected={filters.type === 'all'}
              onPress={() => setFilters({ ...filters, type: 'all' })}
            />
            <FilterChip
              label={t('conseils')}
              value="conseil"
              selected={filters.type === 'conseil'}
              onPress={() => setFilters({ ...filters, type: 'conseil' })}
            />
            <FilterChip
              label={t('techniques')}
              value="technique"
              selected={filters.type === 'technique'}
              onPress={() => setFilters({ ...filters, type: 'technique' })}
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
              label={t('published')}
              value="published"
              selected={filters.status === 'published'}
              onPress={() => setFilters({ ...filters, status: 'published' })}
            />
            <FilterChip
              label={t('pending')}
              value="pending"
              selected={filters.status === 'pending'}
              onPress={() => setFilters({ ...filters, status: 'pending' })}
            />
            <FilterChip
              label={t('draft')}
              value="draft"
              selected={filters.status === 'draft'}
              onPress={() => setFilters({ ...filters, status: 'draft' })}
            />
          </View>
        </View>
      </View>

      {/* Liste du contenu */}
      <ScrollView
        style={styles.contentList}
        contentContainerStyle={styles.contentListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : filteredContent.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="file-search" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>{t('no_content_found')}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {filteredContent.length} {t('items_found')}
            </Text>
            {filteredContent.map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </>
        )}
      </ScrollView>
      
      {/* Bouton flottant pour ajouter du contenu */}
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
  contentList: {
    flex: 1,
  },
  contentListContent: {
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
  contentCard: {
    marginBottom: spacing.md,
    elevation: 2,
    borderRadius: 12,
  },
  contentCardContent: {
    padding: spacing.lg,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contentTypeInfo: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  typeChip: {
    height: 24,
  },
  typeChipText: {
    fontSize: typography.fontSize.xs,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: typography.fontSize.xs,
  },
  contentTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contentCategory: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  contentAuthor: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginLeft: spacing.xs,
  },
  contentStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
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

export default AdminContentScreen;
