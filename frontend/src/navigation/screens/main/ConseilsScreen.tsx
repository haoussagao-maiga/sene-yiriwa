/**
 * ConseilsScreen - Sènè Yiriwa
 * 
 * Écran de liste des conseils agricoles. Permet aux agriculteurs de
 * parcourir, rechercher et filtrer les conseils disponibles.
 * 
 * Fonctionnalités :
 * - Liste paginée des conseils
 * - Recherche textuelle
 * - Filtres par catégorie, culture, région
 * - Pull to refresh
 * - Chargement infini
 * - Affichage des favoris
 * - Mode hors ligne (cache)
 * - Design adapté aux agriculteurs
 * 
 * @module screens/main/ConseilsScreen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useConseils } from '../../../hooks/useConseils';
import { useAuth } from '../../../hooks/useAuth';
import CustomCard from '../../../components/common/CustomCard';
import SearchInput from '../../../components/common/CustomInput';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

const { width, height } = Dimensions.get('window');

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Type pour les catégories de conseils
 */
type ConseilCategorie = 
  | 'semis'
  | 'irrigation'
  | 'fertilisation'
  | 'lutte_parasitaire'
  | 'recolte'
  | 'stockage'
  | 'climat'
  | 'general';

/**
 * Interface pour les filtres
 */
interface Filters {
  categories: ConseilCategorie[];
  search: string;
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Configuration des catégories avec icônes et couleurs
 */
const CATEGORIES: { id: ConseilCategorie; label: string; icon: string; color: string }[] = [
  { id: 'semis', label: 'Semis', icon: 'seed', color: colors.primary },
  { id: 'irrigation', label: 'Irrigation', icon: 'water', color: colors.info },
  { id: 'fertilisation', label: 'Fertilisation', icon: 'flask', color: colors.success },
  { id: 'lutte_parasitaire', label: 'Lutte antiparasitaire', icon: 'bug', color: colors.warning },
  { id: 'recolte', label: 'Récolte', icon: 'harvest', color: colors.secondary },
  { id: 'stockage', label: 'Stockage', icon: 'warehouse', color: colors.tertiary },
  { id: 'climat', label: 'Climat', icon: 'weather-cloudy', color: colors.sky },
  { id: 'general', label: 'Général', icon: 'information', color: colors.gray[600] },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * ConseilsScreen - Écran de liste des conseils
 */
const ConseilsScreen: React.FC<any> = ({ navigation }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  
  // États du hook useConseils
  const {
    conseils,
    loading,
    refreshing,
    pagination,
    filters,
    loadConseils,
    loadMore,
    onRefresh,
    setFilters,
    searchConseils,
    addFavori,
    removeFavori,
    isFavori,
  } = useConseils();

  // État local
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ConseilCategorie[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const filterAnim = useRef(new Animated.Value(height)).current;
  const searchBarRef = useRef<any>(null);

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
  }, []);

  // Animation du panneau de filtres
  useEffect(() => {
    if (showFilters) {
      Animated.spring(filterAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(filterAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showFilters]);

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Applique les filtres sélectionnés
   */
  const applyFilters = useCallback(() => {
    setFilters({ 
      categories: selectedCategories,
      search: searchText,
    });
    setShowFilters(false);
  }, [selectedCategories, searchText, setFilters]);

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = useCallback(() => {
    setSelectedCategories([]);
    setSearchText('');
    setFilters({ categories: [], search: '' });
    setShowFilters(false);
  }, [setFilters]);

  /**
   * Bascule la sélection d'une catégorie
   */
  const toggleCategory = useCallback((categoryId: ConseilCategorie) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  /**
   * Gère la recherche textuelle
   */
  const handleSearch = useCallback(() => {
    if (searchText.trim()) {
      setIsSearching(true);
      searchConseils(searchText);
      setIsSearching(false);
    } else {
      loadConseils({ reset: true });
    }
  }, [searchText, searchConseils, loadConseils]);

  /**
   * Gère l'annulation de la recherche
   */
  const handleCancelSearch = useCallback(() => {
    setSearchText('');
    loadConseils({ reset: true });
  }, [loadConseils]);

  /**
   * Gère le clic sur le bouton favori
   */
  const handleFavorite = useCallback(async (conseilId: string, isFav: boolean) => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    
    if (isFav) {
      await removeFavori(conseilId);
    } else {
      await addFavori(conseilId);
    }
  }, [isAuthenticated, addFavori, removeFavori, navigation]);

  /**
   * Navigation vers les détails d'un conseil
   */
  const navigateToDetail = useCallback((conseilId: string) => {
    navigation.navigate('ConseilDetail', { id: conseilId });
  }, [navigation]);

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  /**
   * Rendu d'un élément de conseil
   */
  const renderConseilItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isFav = isFavori(item.id);
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateX: Animated.multiply(slideAnim, (index % 3) + 1) }],
        }}
      >
        <CustomCard
          title={item.titre}
          subtitle={t(item.categorie)}
          description={item.resume}
          imageUrl={item.imagePrincipale}
          variant="elevation"
          badges={[
            { text: t(item.categorie), type: 'info' as const },
            ...(item.estUrgent ? [{ text: t('urgent'), type: 'error' as const }] : []),
          ]}
          actions={[
            {
              icon: isFav ? 'heart' : 'heart-outline',
              onPress: () => handleFavorite(item.id, isFav),
              color: isFav ? colors.error : undefined,
            },
            {
              icon: 'share-variant',
              onPress: () => console.log('Share', item.id),
            },
          ]}
          clickable
          onPress={() => navigateToDetail(item.id)}
        />
      </Animated.View>
    );
  }, [isFavori, handleFavorite, navigateToDetail, t, fadeAnim, slideAnim]);

  /**
   * Rendu de l'en-tête (barre de recherche et filtres)
   */
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Titre */}
      <Text style={styles.title}>{t('agricultural_advice')}</Text>
      
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <SearchInput
          ref={searchBarRef}
          placeholder={t('search_advice')}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          leftIcon="magnify"
        />
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.7}
        >
          <Icon name="filter" size={22} color={showFilters ? colors.white : colors.gray[700]} />
        </TouchableOpacity>
      </View>
      
      {/* Catégories rapides (scroll horizontal) */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.categoriesLabel}>{t('quick_categories')}</Text>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategories.includes(item.id) && styles.categoryChipActive,
              ]}
              onPress={() => toggleCategory(item.id)}
              activeOpacity={0.7}
            >
              <Icon 
                name={item.icon} 
                size={16} 
                color={selectedCategories.includes(item.id) ? colors.white : item.color} 
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategories.includes(item.id) && styles.categoryChipTextActive,
              ]}>
                {t(item.label)}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );

  /**
   * Rendu du panneau de filtres (modal)
   */
  const renderFiltersPanel = () => (
    <Animated.View style={[styles.filtersPanel, { transform: [{ translateY: filterAnim }] }]}>
      <View style={styles.filtersHeader}>
        <Text style={styles.filtersTitle}>{t('filter_by')}</Text>
        <TouchableOpacity onPress={() => setShowFilters(false)}>
          <Icon name="close" size={24} color={colors.gray[600]} />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.filterSectionTitle}>{t('categories')}</Text>
        <View style={styles.filtersGrid}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterChip,
                selectedCategories.includes(category.id) && styles.filterChipActive,
              ]}
              onPress={() => toggleCategory(category.id)}
            >
              <Icon 
                name={category.icon} 
                size={20} 
                color={selectedCategories.includes(category.id) ? colors.white : category.color} 
              />
              <Text style={[
                styles.filterChipText,
                selectedCategories.includes(category.id) && styles.filterChipTextActive,
              ]}>
                {t(category.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.filtersFooter}>
        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <Text style={styles.resetButtonText}>{t('reset')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>{t('apply')}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  /**
   * Rendu du footer de chargement
   */
  const renderFooter = () => {
    if (!loading || !pagination.hasNext) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.footerLoaderText}>{t('loading_more')}</Text>
      </View>
    );
  };

  /**
   * Rendu de l'état vide
   */
  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name="leaf-off" size={64} color={colors.gray[400]} />
        <Text style={styles.emptyTitle}>{t('no_advice_found')}</Text>
        <Text style={styles.emptyText}>
          {searchText || selectedCategories.length > 0 
            ? t('try_different_filters') 
            : t('check_back_later')}
        </Text>
        {(searchText || selectedCategories.length > 0) && (
          <TouchableOpacity style={styles.resetButtonEmpty} onPress={resetFilters}>
            <Text style={styles.resetButtonEmptyText}>{t('reset_filters')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ============================================
  // RENDU PRINCIPAL
  // ============================================

  if (loading && conseils.length === 0) {
    return <LoadingSpinner fullScreen text={t('loading_advice')} />;
  }

  return (
    <View style={styles.container}>
      {/* Liste des conseils */}
      <FlatList
        data={conseils}
        renderItem={renderConseilItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
      />

      {/* Panneau de filtres */}
      {showFilters && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
        >
          {renderFiltersPanel()}
        </TouchableOpacity>
      )}
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
  listContent: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  
  // En-tête
  headerContainer: {
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  
  // Catégories
  categoriesContainer: {
    marginTop: spacing.xs,
  },
  categoriesLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  categoriesList: {
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  
  // Panneau de filtres
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  filtersPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
    padding: spacing.lg,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  filtersTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  filterSectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  filterChipTextActive: {
    color: colors.white,
  },
  filtersFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  resetButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
  },
  applyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  
  // Footer
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  footerLoaderText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  
  // État vide
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[700],
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  resetButtonEmpty: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  resetButtonEmptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default ConseilsScreen;