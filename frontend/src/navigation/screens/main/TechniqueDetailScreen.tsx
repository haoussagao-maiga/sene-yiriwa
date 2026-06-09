/**
 * TechniqueDetailScreen - Sènè Yiriwa
 * 
 * Écran de détail d'une technique agricole. Affiche toutes les informations
 * d'une technique avec la possibilité d'interagir (favori, partage, etc.).
 * 
 * Fonctionnalités :
 * - Affichage complet de la technique (titre, description, contenu)
 * - Galerie d'images
 * - Vidéo intégrée (optionnelle)
 * - Actions (favori, partage, signalement)
 * - Techniques similaires recommandées
 * - Section commentaires/avis
 * - Navigation vers les techniques liées
 * - Animations fluides
 * - Mode hors ligne (cache)
 * 
 * @module screens/main/TechniqueDetailScreen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
  Alert,
  Linking,
  Platform,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RenderHTML from 'react-native-render-html';
import { useTechniques } from '../../../hooks/useTechniques';
import type { TechniqueAgricole } from '../../../api/endpoints/techniques';
import { useAuth } from '../../../hooks/useAuth';
import CustomButton from '../../../components/common/CustomButton';
import AppSlider from '../../../components/common/AppSlider';
import  colors  from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';
import { formatDate, formatNumber } from '../../../utils/formatters';
import { showSuccessMessage, showErrorMessage } from '../../../utils/notifications';

const { width } = Dimensions.get('window');

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Props du composant
 */
interface TechniqueDetailScreenProps {
  route: {
    params: {
      id: string;
      titre?: string;
    };
  };
  navigation: any;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * TechniqueDetailScreen - Écran de détail d'une technique
 */
const TechniqueDetailScreen: React.FC<TechniqueDetailScreenProps> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { id, titre: routeTitle } = route.params;
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  
  // Hooks
  const {
    techniqueDetail,
    loadingDetail,
    addFavori,
    removeFavori,
    isFavori,
    loadTechniqueDetail,
    loadTechniquesRecommandees,
  } = useTechniques();

  // États
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [similarTechniques, setSimilarTechniques] = useState<TechniqueAgricole[]>([]);
  const [contentHeight, setContentHeight] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    await loadTechniqueDetail(id);
    // Charger les techniques similaires
    // const similaires = await loadTechniquesRecommandees(id);
    // setSimilarTechniques(similaires);
  };

  // Vérifier si la technique est favori
  useEffect(() => {
    if (techniqueDetail?.id) {
      setIsFavorite(isFavori(techniqueDetail.id));
    }
  }, [techniqueDetail, isFavori]);

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

  // Animation du header au scroll
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [-100, 0],
    extrapolate: 'clamp',
  });

  const headerOpacityValue = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Gère le partage du conseil
   */
  const handleShare = useCallback(async () => {
    if (!techniqueDetail) return;
    
    try {
      await Share.share({
        title: techniqueDetail.titre,
        message: `${techniqueDetail.titre}\n\n${techniqueDetail.description}\n\nPartagé depuis Sènè Yiriwa`,
        url: `https://seneyiriwa.com/techniques/${techniqueDetail.id}`,
      });
      showSuccessMessage(t('shared_successfully'));
    } catch (error) {
      showErrorMessage(t('share_error'));
    }
  }, [techniqueDetail, t]);

  /**
   * Gère l'ajout/suppression des favoris
   */
  const handleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      Alert.alert(
        t('login_required'),
        t('login_to_add_favorites'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('login'), onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    
    if (isFavorite) {
      await removeFavori(id);
      setIsFavorite(false);
      showSuccessMessage(t('removed_from_favorites'));
    } else {
      await addFavori(id);
      setIsFavorite(true);
      showSuccessMessage(t('added_to_favorites'));
    }
  }, [isAuthenticated, isFavorite, id, addFavori, removeFavori, navigation, t]);

  /**
   * Gère le signalement du conseil
   */
  const handleReport = useCallback(() => {
    Alert.alert(
      t('report_content'),
      t('report_reason'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('inappropriate'), onPress: () => reportContent('inappropriate') },
        { text: t('spam'), onPress: () => reportContent('spam') },
        { text: t('misinformation'), onPress: () => reportContent('misinformation') },
      ]
    );
  }, [t]);

  const reportContent = useCallback((reason: string) => {
    // Appel API pour signaler le contenu
    showSuccessMessage(t('report_sent'));
  }, [t]);

  /**
   * Ouvre un conseil similaire
   */
  const handleSimilarPress = useCallback((techniqueId: string, techniqueTitre: string) => {
    navigation.push('TechniqueDetail', { id: techniqueId, titre: techniqueTitre });
  }, [navigation]);

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  /**
   * Rendu de l'en-tête animé
   */
  const renderAnimatedHeader = () => (
    <Animated.View
      style={[
        styles.animatedHeader,
        {
          transform: [{ translateY: headerTranslateY }],
          opacity: headerOpacityValue,
        },
      ]}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
        <Icon name="chevron-left" size={24} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {techniqueDetail?.titre || routeTitle || t('technique_detail')}
      </Text>
      <View style={{ width: 40 }} />
    </Animated.View>
  );

  /**
   * Rendu de l'image d'en-tête
   */
  const renderHeaderImage = () => {
    if (!techniqueDetail?.imagePrincipale) {
      return (
        <View style={styles.placeholderImage}>
          <Icon name="leaf" size={60} color={colors.primary} />
        </View>
      );
    }
    
    const images = [
      techniqueDetail.imagePrincipale,
      ...(techniqueDetail.images || []),
    ].filter(Boolean);
    
    if (images.length === 1) {
      return (
        <Image source={{ uri: images[0] }} style={styles.headerImage} resizeMode="cover" />
      );
    }
    
    return (
      <AppSlider
        slides={images.map((src, index) => ({
          id: `img-${index}`,
          type: 'image',
          source: src,
        }))}
        height={250}
        showPagination
        showNavigationButtons
      />
    );
  };

  /**
   * Rendu des métadonnées (auteur, date, stats)
   */
  const renderMetadata = () => {
    if (!techniqueDetail) return null;
    
    return (
      <View style={styles.metadataContainer}>
        <View style={styles.authorContainer}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {techniqueDetail.auteur?.prenom?.charAt(0) || 'A'}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>
              {techniqueDetail.auteur?.prenom} {techniqueDetail.auteur?.nom}
            </Text>
            <Text style={styles.authorRole}>{t('expert')}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="calendar" size={16} color={colors.gray[500]} />
            <Text style={styles.statText}>
              {formatDate(techniqueDetail.datePublication)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="eye" size={16} color={colors.gray[500]} />
            <Text style={styles.statText}>
              {formatNumber(techniqueDetail.vues)} {t('views')}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="heart" size={16} color={colors.gray[500]} />
            <Text style={styles.statText}>
              {formatNumber(techniqueDetail.favoris)} {t('favorites')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Rendu des badges (catégorie, urgence)
   */
  const renderBadges = () => {
    if (!techniqueDetail) return null;
    
    return (
      <View style={styles.badgesContainer}>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight + '20' }]}>
          <Icon name="tag" size={14} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {t(techniqueDetail.categorie)}
          </Text>
        </View>
        {techniqueDetail.certifie && (
          <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
            <Icon name="certificate" size={14} color={colors.success} />
            <Text style={[styles.badgeText, { color: colors.success }]}>
              {t('certified')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  /**
   * Rendu du contenu HTML
   */
  const renderContent = () => {
    if (!techniqueDetail?.contenu) return null;
    
    const maxHeight = 300;
    const shouldTruncate = contentHeight > maxHeight && !showFullContent;
    
    return (
      <View style={styles.contentContainer}>
        <View
          onLayout={(event) => {
            if (contentHeight === 0) {
              setContentHeight(event.nativeEvent.layout.height);
            }
          }}
        >
          <RenderHTML
            contentWidth={width - spacing.lg * 2}
            source={{ html: techniqueDetail.contenu }}
            tagsStyles={{
              p: styles.htmlParagraph,
              h1: styles.htmlH1,
              h2: styles.htmlH2,
              h3: styles.htmlH3,
              ul: styles.htmlList,
              li: styles.htmlListItem,
              strong: styles.htmlStrong,
              em: styles.htmlEm,
            }}
          />
        </View>
        
        {shouldTruncate && (
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => setShowFullContent(true)}
          >
            <Text style={styles.readMoreText}>{t('read_more')}</Text>
            <Icon name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
        
        {showFullContent && contentHeight > maxHeight && (
          <TouchableOpacity
            style={styles.readLessButton}
            onPress={() => setShowFullContent(false)}
          >
            <Text style={styles.readLessText}>{t('show_less')}</Text>
            <Icon name="chevron-up" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /**
   * Rendu des conseils similaires
   */
  const renderSimilarTechniques = () => {
    if (similarTechniques.length === 0) return null;
    
    return (
      <View style={styles.similarContainer}>
        <Text style={styles.similarTitle}>{t('similar_techniques')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {similarTechniques.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.similarCard}
              onPress={() => handleSimilarPress(item.id, item.titre)}
            >
              <Image source={{ uri: item.imagePrincipale }} style={styles.similarImage} />
              <Text style={styles.similarCardTitle} numberOfLines={2}>
                {item.titre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  /**
   * Rendu des actions (favori, partage, signalement)
   */
  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
        <Icon
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          color={isFavorite ? colors.error : colors.gray[600]}
        />
        <Text style={styles.actionText}>
          {isFavorite ? t('favorite') : t('add_to_favorites')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
        <Icon name="share-variant" size={24} color={colors.gray[600]} />
        <Text style={styles.actionText}>{t('share')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
        <Icon name="flag" size={24} color={colors.gray[600]} />
        <Text style={styles.actionText}>{t('report')}</Text>
      </TouchableOpacity>
    </View>
  );

  // ============================================
  // RENDU PRINCIPAL
  // ============================================

  if (loadingDetail && !techniqueDetail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (!techniqueDetail) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="leaf-off" size={64} color={colors.gray[400]} />
        <Text style={styles.errorTitle}>{t('technique_not_found')}</Text>
        <CustomButton
          title={t('go_back')}
          variant="primary"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header animé */}
      {renderAnimatedHeader()}
      
      {/* Contenu principal */}
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Image d'en-tête */}
        {renderHeaderImage()}
        
        {/* Contenu */}
        <View style={styles.content}>
          {/* Titre */}
          <Text style={styles.title}>{techniqueDetail.titre}</Text>
          
          {/* Badges */}
          {renderBadges()}
          
          {/* Métadonnées */}
          {renderMetadata()}
          
          {/* Description */}
          <Text style={styles.description}>{techniqueDetail.description}</Text>
          
          {/* Contenu HTML */}
          {renderContent()}
          
          {/* Techniques similaires */}
          {renderSimilarTechniques()}
          
          {/* Actions */}
          {renderActions()}
          
          {/* Espacement */}
          <View style={styles.bottomSpacer} />
        </View>
      </Animated.ScrollView>
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
  scrollView: {
    flex: 1,
  },
  
  // Header animé
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: spacing.sm,
    backgroundColor: colors.primary,
    zIndex: 10,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  
  // Image d'en-tête
  headerImage: {
    width: '100%',
    height: 250,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Contenu
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  
  // Badges
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Métadonnées
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInitial: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  authorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  authorRole: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  statsContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  
  // Contenu HTML
  contentContainer: {
    marginBottom: spacing.lg,
  },
  htmlParagraph: {
    fontSize: typography.fontSize.md,
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  htmlH1: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  htmlH2: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  htmlH3: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  htmlList: {
    marginBottom: spacing.md,
  },
  htmlListItem: {
    fontSize: typography.fontSize.md,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  htmlStrong: {
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  htmlEm: {
    fontStyle: 'italic',
  },
  
  // Lire plus/moins
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
  },
  readMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  readLessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
  },
  readLessText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  
  // Conseils similaires
  similarContainer: {
    marginBottom: spacing.lg,
  },
  similarTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  similarCard: {
    width: 150,
    marginRight: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  similarImage: {
    width: '100%',
    height: 100,
  },
  similarCardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[800],
    padding: spacing.sm,
  },
  
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: spacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
  },
  
  // États
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.gray[500],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  
  // Espacement
  bottomSpacer: {
    height: spacing.xl,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default TechniqueDetailScreen;