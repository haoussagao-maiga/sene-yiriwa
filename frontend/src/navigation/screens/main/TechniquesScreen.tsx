/**
 * 
 
 * TechniquesScreen - Sènè Yiriwa
 * 
 * Écran de liste des techniques agricoles. Permet aux agriculteurs de
 * parcourir, rechercher et filtrer les techniques de vulgarisation.
 * 
 * Fonctionnalités :
 * - Liste paginée des techniques
 * - Recherche textuelle
 * - Filtres par catégorie, niveau, difficulté
 * - Pull to refresh
 * - Chargement infini
 * - Affichage des favoris
 * - Mode hors ligne (cache)
 * - Design adapté aux agriculteurs
 * 
 * @module screens/main/TechniquesScreen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTechniques } from '../../../hooks/useTechniques';
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
 * Type pour les catégories de techniques
 */
type TechniqueCategorie = 
  | 'preparation_sol'
  | 'semis'
  | 'irrigation'
  | 'fertilisation'
  | 'lutte_parasitaire'
  | 'traitement_maladies'
  | 'recolte'
  | 'post_recolte'
  | 'stockage'
  | 'transformation'
  | 'agroecologie';

/**
 * Type pour le niveau de difficulté
 */
type NiveauDifficulte = 'debutant' | 'intermediaire' | 'avance';

/**
 * Interface pour les filtres
 */
interface Filters {
  categories: TechniqueCategorie[];
  niveau?: NiveauDifficulte;
  difficulte?: 'facile' | 'moyen' | 'difficile';
  search: string;
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Configuration des catégories avec icônes et couleurs
 */
const CATEGORIES: { id: TechniqueCategorie; label: string; icon: string; color: string }[] = [
  { id: 'preparation_sol', label: 'categories.preparation_sol', icon: 'tractor', color: colors.tertiary },
  { id: 'semis', label: 'categories.semis', icon: 'sprout', color: colors.primary },
  { id: 'irrigation', label: 'categories.irrigation', icon: 'water', color: colors.info },
  { id: 'fertilisation', label: 'categories.fertilisation', icon: 'flask', color: colors.success },
  { id: 'lutte_parasitaire', label: 'categories.lutte_parasitaire', icon: 'bug', color: colors.warning },
  { id: 'traitement_maladies', label: 'categories.traitement_maladies', icon: 'pill', color: colors.error },
  { id: 'recolte', label: 'categories.recolte', icon: 'basket', color: colors.secondary },
  { id: 'post_recolte', label: 'categories.post_recolte', icon: 'archive', color: colors.tertiary },
  { id: 'stockage', label: 'categories.stockage', icon: 'warehouse', color: colors.gray[700] },
  { id: 'transformation', label: 'categories.transformation', icon: 'cog', color: colors.info },
  { id: 'agroecologie', label: 'categories.agroecologie', icon: 'leaf', color: colors.success },
];

/**
 * Options de niveau
 */
const NIVEAUX: { id: NiveauDifficulte; label: string }[] = [
  { id: 'debutant', label: 'level.beginner' },
  { id: 'intermediaire', label: 'level.intermediate' },
  { id: 'avance', label: 'level.advanced' },
];

/**
 * Options de difficulté
 */
const DIFFICULTES: { id: 'facile' | 'moyen' | 'difficile'; label: string }[] = [
  { id: 'facile', label: 'difficulty.easy' },
  { id: 'moyen', label: 'difficulty.medium' },
  { id: 'difficile', label: 'difficulty.hard' },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * Interface pour les props du composant
 */
interface TechniquesScreenProps {
  navigation: any;
}

/**
 * TechniquesScreen - Écran de liste des techniques
 */
const TechniquesScreen: React.FC<TechniquesScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  
  // États du hook useTechniques
  const {
    techniques,
    loading,
    refreshing,
    pagination,
    filters,
    loadTechniques,
    loadMore,
    onRefresh,
    setFilters,
    searchTechniques,
    addFavori,
    removeFavori,
    isFavori,
  } = useTechniques();

  // État local
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<TechniqueCategorie[]>([]);
  const [selectedNiveau, setSelectedNiveau] = useState<NiveauDifficulte | null>(null);
  const [selectedDifficulte, setSelectedDifficulte] = useState<'facile' | 'moyen' | 'difficile' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

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
      niveau: selectedNiveau || undefined,
      difficulte: selectedDifficulte || undefined,
      search: searchText,
    });
    setShowFilters(false);
  }, [selectedCategories, selectedNiveau, selectedDifficulte, searchText, setFilters]);

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedNiveau(null);
    setSelectedDifficulte(null);
    setSearchText('');
    setFilters({ categories: [], search: '' });
    setShowFilters(false);
  }, [setFilters]);

  /**
   * Bascule la sélection d'une catégorie
   */
  const toggleCategory = useCallback((categoryId: TechniqueCategorie) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  /**
   * Sélectionne un niveau
   */
  const selectNiveau = useCallback((niveau: NiveauDifficulte) => {
    setSelectedNiveau(prev => prev === niveau ? null : niveau);
  }, []);

  /**
   * Sélectionne une difficulté
   */
  const selectDifficulte = useCallback((difficulte: 'facile' | 'moyen' | 'difficile') => {
    setSelectedDifficulte(prev => prev === difficulte ? null : difficulte);
  }, []);

  /**
   * Gère la recherche textuelle
   */
  const handleSearch = useCallback(() => {
    if (searchText.trim()) {
      setIsSearching(true);
      searchTechniques(searchText);
      setIsSearching(false);
    } else {
      loadTechniques({ reset: true });
    }
  }, [searchText, searchTechniques, loadTechniques]);

  /**
   * Gère l'annulation de la recherche
   */
  const handleCancelSearch = useCallback(() => {
    setSearchText('');
    loadTechniques({ reset: true });
  }, [loadTechniques]);

  /**
   * Gère le clic sur le bouton favori
   */
  const handleFavorite = useCallback(async (techniqueId: string, isFav: boolean) => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    
    if (isFav) {
      await removeFavori(techniqueId);
    } else {
      await addFavori(techniqueId);
    }
  }, [isAuthenticated, addFavori, removeFavori, navigation]);

  /**
   * Navigation vers les détails d'une technique
   */
  const navigateToDetail = useCallback((techniqueId: string) => {
    navigation.navigate('TechniqueDetail', { id: techniqueId });
  }, [navigation]);

  /**
   * Obtient le texte de la difficulté
   */
  const getDifficulteText = useCallback((difficulte: string): string => {
    const map: Record<string, string> = {
      facile: t('easy'),
      moyen: t('medium'),
      difficile: t('hard'),
    };
    return map[difficulte] || difficulte;
  }, [t]);

  /**
   * Obtient le type de badge pour la difficulté
   */
  const getDifficulteType = useCallback((difficulte: string): 'success' | 'warning' | 'error' | 'info' => {
    const map: Record<string, 'success' | 'warning' | 'error'> = {
      facile: 'success',
      moyen: 'warning',
      difficile: 'error',
    };
    return map[difficulte] || 'info';
  }, []);

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  /**
   * Rendu d'un élément de technique (mode liste)
   */
  const renderTechniqueItem = useCallback(({ item, index }: { item: any; index: number }) => {
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
          subtitle={`${t(item.categorie)} • ${item.dureeEstimee} ${t('minutes')}`}
          description={item.resume}
          imageUrl={item.imagePrincipale}
          variant="elevation"
          badges={[
            { text: t(item.niveau), type: 'info' },
            { 
              text: getDifficulteText(item.difficulte), 
              type: getDifficulteType(item.difficulte) 
            },
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
  }, [isFavori, handleFavorite, navigateToDetail, t, getDifficulteText, getDifficulteType, fadeAnim, slideAnim]);

  /**
   * Rendu d'un élément de technique (mode grille)
   */
  const renderTechniqueGridItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isFav = isFavori(item.id);
    
    return (
      <Animated.View
        style={[
          styles.gridItem,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, (index % 3) + 1) }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => navigateToDetail(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.gridImageContainer}>
            <Icon name="image" size={40} color={colors.gray[400]} />
          </View>
          <View style={styles.gridContent}>
            <Text style={styles.gridTitle} numberOfLines={2}>{item.titre}</Text>
            <View style={styles.gridBadges}>
              <Text style={styles.gridBadge}>{t(item.niveau)}</Text>
              <Text style={[styles.gridBadge, { backgroundColor: getDifficulteType(item.difficulte) === 'success' ? colors.success + '20' : colors.warning + '20' }]}>
                {getDifficulteText(item.difficulte)}
              </Text>
            </View>
            <Text style={styles.gridDuration}>{item.dureeEstimee} {t('minutes')}</Text>
          </View>
          <TouchableOpacity
            style={styles.gridFavorite}
            onPress={() => handleFavorite(item.id, isFav)}
          >
            <Icon name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? colors.error : colors.gray[400]} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [isFavori, handleFavorite, navigateToDetail, t, getDifficulteText, getDifficulteType, fadeAnim, slideAnim]);

  /**
   * Rendu de l'en-tête (barre de recherche et filtres)
   */
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Titre */}
      <Text style={styles.title}>{t('modern_techniques')}</Text>
      
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <SearchInput
          ref={searchBarRef}
          placeholder={t('search_techniques')}
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
        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          activeOpacity={0.7}
        >
          <Icon name={viewMode === 'list' ? 'view-grid' : 'view-list'} size={22} color={colors.gray[700]} />
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
        {/* Filtre par catégorie */}
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
                size={18} 
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

        {/* Filtre par niveau */}
        <Text style={styles.filterSectionTitle}>{t('level')}</Text>
        <View style={styles.filtersRow}>
          {NIVEAUX.map((niveau) => (
            <TouchableOpacity
              key={niveau.id}
              style={[
                styles.filterChip,
                selectedNiveau === niveau.id && styles.filterChipActive,
              ]}
              onPress={() => selectNiveau(niveau.id)}
            >
              <Text style={[
                styles.filterChipText,
                selectedNiveau === niveau.id && styles.filterChipTextActive,
              ]}>
                {t(niveau.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filtre par difficulté */}
        <Text style={styles.filterSectionTitle}>{t('difficulty')}</Text>
        <View style={styles.filtersRow}>
          {DIFFICULTES.map((difficulte) => (
            <TouchableOpacity
              key={difficulte.id}
              style={[
                styles.filterChip,
                selectedDifficulte === difficulte.id && styles.filterChipActive,
              ]}
              onPress={() => selectDifficulte(difficulte.id)}
            >
              <Text style={[
                styles.filterChipText,
                selectedDifficulte === difficulte.id && styles.filterChipTextActive,
              ]}>
                {t(difficulte.label)}
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
        <Icon name="school-off" size={64} color={colors.gray[400]} />
        <Text style={styles.emptyTitle}>{t('no_techniques_found')}</Text>
        <Text style={styles.emptyText}>
          {searchText || selectedCategories.length > 0 || selectedNiveau || selectedDifficulte
            ? t('try_different_filters') 
            : t('check_back_later')}
        </Text>
        {(searchText || selectedCategories.length > 0 || selectedNiveau || selectedDifficulte) && (
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

  if (loading && techniques.length === 0) {
    return <LoadingSpinner fullScreen text={t('loading_techniques')} />;
  }

  return (
    <View style={styles.container}>
      {/* Liste des techniques */}
      <FlatList
        data={techniques}
        renderItem={viewMode === 'list' ? renderTechniqueItem : renderTechniqueGridItem}
        keyExtractor={(item) => item.id}
        key={viewMode} // Force le re-rendu lors du changement de mode
        numColumns={viewMode === 'grid' ? 2 : 1}
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
  viewModeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
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
  
  // Mode grille
  gridItem: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  gridCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  gridImageContainer: {
    height: 120,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    padding: spacing.sm,
  },
  gridTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  gridBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  gridBadge: {
    fontSize: typography.fontSize.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.gray[200],
    color: colors.gray[600],
    overflow: 'hidden',
  },
  gridDuration: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  gridFavorite: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: spacing.md,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filtersRow: {
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

export default TechniquesScreen;