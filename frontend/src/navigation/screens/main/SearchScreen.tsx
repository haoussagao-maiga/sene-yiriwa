/**
 * SearchScreen - Sènè Yiriwa
 * 
 * Écran de recherche unifiée permettant de rechercher des conseils,
 * des techniques agricoles et d'autres contenus dans l'application.
 * 
 * Fonctionnalités :
 * - Recherche en temps réel avec debounce
 * - Filtrage par type (conseils, techniques, tout)
 * - Historique des recherches récentes
 * - Suggestions de recherche populaires
 * - Résultats paginés
 * - Pull to refresh
 * - Navigation vers les détails
 * - Design adapté aux agriculteurs
 * 
 * @module screens/main/SearchScreen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  Platform,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useConseils } from '../../../hooks/useConseils';
import { useTechniques } from '../../../hooks/useTechniques';
import CustomInput from '../../../components/common/CustomInput';
import CustomCard from '../../../components/common/CustomCard';
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';
import { saveSearchHistory, getSearchHistory, clearSearchHistory } from '../../../utils/storage';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Type de recherche
 */
type SearchType = 'all' | 'conseils' | 'techniques';

/**
 * Interface pour les suggestions populaires
 */
interface PopularSearch {
  id: string;
  query: string;
  count: number;
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Suggestions de recherche populaires
 */
const POPULAR_SEARCHES: PopularSearch[] = [
  { id: '1', query: 'irrigation', count: 1234 },
  { id: '2', query: 'engrais naturels', count: 892 },
  { id: '3', query: 'lutte contre les chenilles', count: 756 },
  { id: '4', query: 'période de semis', count: 654 },
  { id: '5', query: 'récolte maïs', count: 543 },
  { id: '6', query: 'stockage des récoltes', count: 432 },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * SearchScreen - Écran de recherche
 */
const SearchScreen: React.FC<any> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { initialQuery = '', type: initialType = 'all' } = route.params || {};
  
  // Hooks
  const { 
    conseils, 
    loading: conseilsLoading, 
    searchConseils,
    loadConseils,
  } = useConseils();
  
  const { 
    techniques, 
    loading: techniquesLoading, 
    searchTechniques,
    loadTechniques,
  } = useTechniques();

  // États
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>(initialType);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // Timer pour le debounce
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================
  // ANIMATIONS
  // ============================================

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ============================================
  // HISTORIQUE DE RECHERCHE
  // ============================================

  /**
   * Charge l'historique de recherche
   */
  const loadSearchHistory = useCallback(async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  }, []);

  /**
   * Sauvegarde une recherche dans l'historique
   */
  const saveToHistory = useCallback(async (query: string) => {
    if (query.trim()) {
      await saveSearchHistory(query);
      await loadSearchHistory();
    }
  }, [loadSearchHistory]);

  /**
   * Efface l'historique de recherche
   */
  const clearHistory = useCallback(async () => {
    await clearSearchHistory();
    setSearchHistory([]);
  }, []);

  // ============================================
  // RECHERCHE
  // ============================================

  /**
   * Effectue la recherche avec debounce
   */
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      if (debouncedQuery.trim()) {
        performSearch();
      } else if (debouncedQuery === '') {
        resetSearch();
      }
    }, 500);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedQuery]);

  /**
   * Effectue la recherche
   */
  const performSearch = useCallback(async () => {
    if (!debouncedQuery.trim()) return;
    
    setIsSearching(true);
    Keyboard.dismiss();
    
    // Sauvegarder dans l'historique
    await saveToHistory(debouncedQuery);
    
    // Effectuer la recherche selon le type
    if (searchType === 'conseils' || searchType === 'all') {
      await searchConseils(debouncedQuery);
    }
    
    if (searchType === 'techniques' || searchType === 'all') {
      await searchTechniques(debouncedQuery);
    }
    
    setIsSearching(false);
  }, [debouncedQuery, searchType, searchConseils, searchTechniques, saveToHistory]);

  /**
   * Réinitialise la recherche
   */
  const resetSearch = useCallback(async () => {
    if (searchType === 'conseils' || searchType === 'all') {
      await loadConseils({ reset: true });
    }
    
    if (searchType === 'techniques' || searchType === 'all') {
      await loadTechniques({ reset: true });
    }
  }, [searchType, loadConseils, loadTechniques]);

  /**
   * Gère le changement de texte
   */
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setDebouncedQuery(text);
  }, []);

  /**
   * Gère la soumission de la recherche
   */
  const handleSearchSubmit = useCallback(() => {
    setDebouncedQuery(searchQuery);
  }, [searchQuery]);

  /**
   * Gère le clic sur une suggestion
   */
  const handleSuggestionPress = useCallback((query: string) => {
    setSearchQuery(query);
    setDebouncedQuery(query);
  }, []);

  /**
   * Gère le changement de type de recherche
   */
  const handleTypeChange = useCallback((type: SearchType) => {
    setSearchType(type);
    if (debouncedQuery.trim()) {
      performSearch();
    }
  }, [debouncedQuery, performSearch]);

  /**
   * Rafraîchit les résultats
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (debouncedQuery.trim()) {
      await performSearch();
    }
    setRefreshing(false);
  }, [debouncedQuery, performSearch]);

  // ============================================
  // RENDU DES RÉSULTATS
  // ============================================

  /**
   * Rendu des conseils
   */
  const renderConseils = () => {
    if (searchType !== 'conseils' && searchType !== 'all') return null;
    
    if (conseilsLoading && conseils.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>{t('searching')}</Text>
        </View>
      );
    }
    
    if (conseils.length === 0 && debouncedQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="leaf-off" size={48} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>{t('no_results')}</Text>
          <Text style={styles.emptyText}>{t('try_different_search')}</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.resultsSection}>
        {(searchType === 'all' || searchType === 'conseils') && conseils.length > 0 && (
          <Text style={styles.sectionTitle}>
            {t('conseils')} ({conseils.length})
          </Text>
        )}
        {conseils.map((item, index) => (
          <Animated.View
            key={item.id}
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
              badges={item.estUrgent ? [{ text: t('urgent'), type: 'error' }] : undefined}
              clickable
              onPress={() => navigation.navigate('ConseilDetail', { id: item.id, titre: item.titre })}
            />
          </Animated.View>
        ))}
      </View>
    );
  };

  /**
   * Rendu des techniques
   */
  const renderTechniques = () => {
    if (searchType !== 'techniques' && searchType !== 'all') return null;
    
    if (techniquesLoading && techniques.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>{t('searching')}</Text>
        </View>
      );
    }
    
    if (techniques.length === 0 && debouncedQuery) {
      return null; // Déjà géré par renderConseils
    }
    
    return (
      <View style={styles.resultsSection}>
        {(searchType === 'all' || searchType === 'techniques') && techniques.length > 0 && (
          <Text style={styles.sectionTitle}>
            {t('techniques')} ({techniques.length})
          </Text>
        )}
        {techniques.map((item, index) => (
          <Animated.View
            key={item.id}
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
                { text: t(item.difficulte), type: item.difficulte === 'facile' ? 'success' : 'warning' },
              ]}
              clickable
              onPress={() => navigation.navigate('TechniqueDetail', { id: item.id, titre: item.titre })}
            />
          </Animated.View>
        ))}
      </View>
    );
  };

  /**
   * Rendu de l'historique de recherche
   */
  const renderSearchHistory = () => {
    if (debouncedQuery || searchHistory.length === 0) return null;
    
    return (
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>{t('recent_searches')}</Text>
          <TouchableOpacity onPress={clearHistory}>
            <Text style={styles.clearHistoryText}>{t('clear')}</Text>
          </TouchableOpacity>
        </View>
        {searchHistory.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.historyItem}
            onPress={() => handleSuggestionPress(item)}
          >
            <Icon name="history" size={18} color={colors.gray[500]} />
            <Text style={styles.historyText}>{item}</Text>
            <Icon name="chevron-right" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Rendu des suggestions populaires
   */
  const renderPopularSearches = () => {
    if (debouncedQuery || searchHistory.length > 0) return null;
    
    return (
      <View style={styles.popularContainer}>
        <Text style={styles.popularTitle}>{t('popular_searches')}</Text>
        <View style={styles.popularGrid}>
          {POPULAR_SEARCHES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.popularItem}
              onPress={() => handleSuggestionPress(item.query)}
            >
              <Icon name="fire" size={16} color={colors.warning} />
              <Text style={styles.popularText}>{item.query}</Text>
              <Text style={styles.popularCount}>{item.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // ============================================
  // RENDU PRINCIPAL
  // ============================================

  // Charger l'historique au focus
  useFocusEffect(
    useCallback(() => {
      loadSearchHistory();
    }, [])
  );

  // Résultats combinés pour FlatList
  const hasResults = (conseils.length > 0 || techniques.length > 0) && debouncedQuery;
  
  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchHeader}>
        <CustomInput
          placeholder={t('search_placeholder')}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearchSubmit}
          leftIcon="magnify"
          autoFocus={true}
        />
        
        {/* Filtres par type */}
        <View style={styles.typeFilters}>
          <TouchableOpacity
            style={[styles.typeFilter, searchType === 'all' && styles.typeFilterActive]}
            onPress={() => handleTypeChange('all')}
          >
            <Text style={[styles.typeFilterText, searchType === 'all' && styles.typeFilterTextActive]}>
              {t('all')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeFilter, searchType === 'conseils' && styles.typeFilterActive]}
            onPress={() => handleTypeChange('conseils')}
          >
            <Text style={[styles.typeFilterText, searchType === 'conseils' && styles.typeFilterTextActive]}>
              {t('conseils')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeFilter, searchType === 'techniques' && styles.typeFilterActive]}
            onPress={() => handleTypeChange('techniques')}
          >
            <Text style={[styles.typeFilterText, searchType === 'techniques' && styles.typeFilterTextActive]}>
              {t('techniques')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Résultats ou suggestions */}
      <FlatList
        data={hasResults ? [{ id: 'results' }] : []}
        renderItem={() => (
          <>
            {renderConseils()}
            {renderTechniques()}
          </>
        )}
        ListHeaderComponent={
          !hasResults ? (
            <>
              {renderSearchHistory()}
              {renderPopularSearches()}
            </>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
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
  searchHeader: {
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  
  // Filtres
  typeFilters: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  typeFilter: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  typeFilterActive: {
    backgroundColor: colors.primary,
  },
  typeFilterText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  typeFilterTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Résultats
  resultsSection: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  
  // Historique
  historyContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  historyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  clearHistoryText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: spacing.md,
  },
  historyText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  
  // Suggestions populaires
  popularContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  popularTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  popularText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  popularCount: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  
  // États vides
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.sm,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default SearchScreen;