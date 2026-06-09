/**
 * NotificationsScreen - Sènè Yiriwa
 * 
 * Écran de gestion des notifications pour l'utilisateur. Permet de consulter,
 * filtrer et gérer toutes les notifications reçues.
 * 
 * Fonctionnalités :
 * - Liste paginée des notifications
 * - Marquage comme lu/non lu
 * - Suppression individuelle ou groupée
 * - Filtrage par type (météo, conseils, techniques, alertes)
 * - Pull to refresh
 * - Navigation vers le contenu associé
 * - Badge de compteur de notifications non lues
 * - Mode hors ligne (cache)
 * 
 * @module screens/main/NotificationsScreen
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
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNotifications, NOTIFICATION_COLORS } from '../../../hooks/useNotifications';
import { useAuth } from '../../../hooks/useAuth';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

const { width, height } = Dimensions.get('window');

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Type pour le filtre de notifications
 */
type NotificationFilter = 'all' | 'unread' | 'meteo' | 'conseil' | 'technique' | 'alerte';

/**
 * Interface pour les options de filtre
 */
interface FilterOption {
  id: NotificationFilter;
  label: string;
  icon: string;
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Options de filtrage des notifications
 */
const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'Toutes', icon: 'bell-outline' },
  { id: 'unread', label: 'Non lues', icon: 'bell-ring-outline' },
  { id: 'meteo', label: 'Météo', icon: 'weather-cloudy' },
  { id: 'conseil', label: 'Conseils', icon: 'leaf' },
  { id: 'technique', label: 'Techniques', icon: 'school' },
  { id: 'alerte', label: 'Alertes', icon: 'alert' },
];

/**
 * Icônes par type de notification
 */
const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    meteo: 'weather-cloudy',
    conseil: 'leaf',
    technique: 'school',
    rappel: 'calendar',
    alerte: 'alert',
    systeme: 'information',
  };
  return icons[type] || 'bell';
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * NotificationsScreen - Écran de gestion des notifications
 */
const NotificationsScreen: React.FC<any> = ({ navigation }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  
  // États du hook useNotifications
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications,
  } = useNotifications();

  // État local
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  // Références Swipeable
  const swipeableRefs = useRef<Map<string, any>>(new Map());

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

  // Animation du FAB en mode sélection
  useEffect(() => {
    Animated.timing(fabAnim, {
      toValue: isSelectionMode ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSelectionMode]);

  // ============================================
  // FILTRAGE DES NOTIFICATIONS
  // ============================================

  /**
   * Filtre les notifications selon le critère sélectionné
   */
  const getFilteredNotifications = useCallback(() => {
    let filtered = [...notifications];
    
    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'meteo':
        filtered = filtered.filter(n => n.type === 'meteo');
        break;
      case 'conseil':
        filtered = filtered.filter(n => n.type === 'conseil');
        break;
      case 'technique':
        filtered = filtered.filter(n => n.type === 'technique');
        break;
      case 'alerte':
        filtered = filtered.filter(n => n.type === 'alerte' || n.priority === 'critical');
        break;
      default:
        break;
    }
    
    return filtered;
  }, [notifications, selectedFilter]);

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Formatage de la date relative
   */
  const formatRelativeDate = useCallback((date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    
    if (diffMins < 1) return t('just_now');
    if (diffMins < 60) return `${diffMins} ${t('minutes_ago')}`;
    if (diffHours < 24) return `${diffHours} ${t('hours_ago')}`;
    if (diffDays < 7) return `${diffDays} ${t('days_ago')}`;
    if (diffWeeks < 4) return `${diffWeeks} ${t('weeks_ago')}`;
    
    return new Date(date).toLocaleDateString();
  }, [t]);

  /**
   * Gère le clic sur une notification
   */
  const handleNotificationPress = useCallback(async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigation vers l'écran approprié selon le type et les données
    if (notification.data?.screen) {
      navigation.navigate(notification.data.screen, notification.data);
    } else {
      switch (notification.type) {
        case 'conseil':
          if (notification.data?.conseilId) {
            navigation.navigate('ConseilDetail', { id: notification.data.conseilId });
          } else {
            navigation.navigate('Conseils');
          }
          break;
        case 'technique':
          if (notification.data?.techniqueId) {
            navigation.navigate('TechniqueDetail', { id: notification.data.techniqueId });
          } else {
            navigation.navigate('Techniques');
          }
          break;
        case 'meteo':
          navigation.navigate('Meteo');
          break;
        default:
          break;
      }
    }
  }, [markAsRead, navigation]);

  /**
   * Gère la sélection d'une notification
   */
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  }, []);

  /**
   * Supprime les notifications sélectionnées
   */
  const deleteSelected = useCallback(() => {
    Alert.alert(
      t('delete_notifications'),
      t('delete_selected_confirmation', { count: selectedIds.length }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedIds) {
              await deleteNotification(id);
            }
            setSelectedIds([]);
            setIsSelectionMode(false);
          },
        },
      ]
    );
  }, [selectedIds, deleteNotification, t]);

  /**
   * Marque toutes les notifications comme lues
   */
  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) return;
    
    Alert.alert(
      t('mark_all_as_read'),
      t('mark_all_read_confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('mark_read'),
          onPress: markAllAsRead,
        },
      ]
    );
  }, [unreadCount, markAllAsRead, t]);

  /**
   * Supprime toutes les notifications
   */
  const handleDeleteAll = useCallback(() => {
    if (notifications.length === 0) return;
    
    Alert.alert(
      t('delete_all_notifications'),
      t('delete_all_confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: deleteAllNotifications,
        },
      ]
    );
  }, [notifications.length, deleteAllNotifications, t]);

  /**
   * Ferme tous les swipeables ouverts
   */
  const closeAllSwipeables = useCallback(() => {
    swipeableRefs.current.forEach((ref) => {
      ref?.close();
    });
  }, []);

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  /**
   * Rendu des actions de suppression (swipe droit)
   */
  const renderRightActions = (notificationId: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => deleteNotification(notificationId)}
      >
        <Icon name="delete" size={24} color={colors.white} />
        <Text style={styles.deleteActionText}>{t('delete')}</Text>
      </TouchableOpacity>
    );
  };

  /**
   * Rendu des actions de sélection (swipe gauche)
   */
  const renderLeftActions = (notificationId: string, isSelected: boolean) => {
    return (
      <TouchableOpacity
        style={[styles.selectAction, isSelected && styles.selectActionActive]}
        onPress={() => toggleSelection(notificationId)}
      >
        <Icon 
          name={isSelected ? 'check-circle' : 'circle-outline'} 
          size={24} 
          color={colors.white} 
        />
        <Text style={styles.selectActionText}>
          {isSelected ? t('selected') : t('select')}
        </Text>
      </TouchableOpacity>
    );
  };

  /**
   * Rendu d'un élément de notification
   */
  const renderNotificationItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedIds.includes(item.id);
    const isExpanded = expandedItems.has(item.id);
    const typeIcon = getTypeIcon(item.type);
    const typeColor = NOTIFICATION_COLORS[item.type as keyof typeof NOTIFICATION_COLORS] || colors.primary;
    
    return (
      <Swipeable
        ref={(ref: any) => {
          if (ref) swipeableRefs.current.set(item.id, ref);
        }}
        renderRightActions={() => renderRightActions(item.id)}
        renderLeftActions={() => renderLeftActions(item.id, isSelected)}
        onSwipeableOpen={closeAllSwipeables}
      >
        <Animated.View
          style={[
            styles.notificationItem,
            !item.read && styles.unreadItem,
            isSelected && styles.selectedItem,
            {
              opacity: fadeAnim,
              transform: [{ translateX: Animated.multiply(slideAnim, (index % 5) + 1) }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.notificationContent}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
            onLongPress={() => {
              setIsSelectionMode(true);
              toggleSelection(item.id);
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
              <Icon name={typeIcon} size={24} color={typeColor} />
            </View>
            
            <View style={styles.textContainer}>
              <View style={styles.headerRow}>
                <Text style={[styles.title, !item.read && styles.titleUnread]}>
                  {item.title}
                </Text>
                <Text style={styles.date}>{formatRelativeDate(item.createdAt)}</Text>
              </View>
              
              <Text 
                style={[styles.body, !item.read && styles.bodyUnread]}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {item.body}
              </Text>
              
              {item.body.length > 100 && (
                <TouchableOpacity 
                  style={styles.expandButton}
                  onPress={() => {
                    setExpandedItems(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(item.id)) {
                        newSet.delete(item.id);
                      } else {
                        newSet.add(item.id);
                      }
                      return newSet;
                    });
                  }}
                >
                  <Text style={styles.expandButtonText}>
                    {isExpanded ? t('show_less') : t('show_more')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        </Animated.View>
      </Swipeable>
    );
  }, [selectedIds, expandedItems, handleNotificationPress, formatRelativeDate, toggleSelection, closeAllSwipeables, fadeAnim, slideAnim]);

  /**
   * Rendu de l'en-tête avec les filtres
   */
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Titre et actions */}
      <View style={styles.headerTop}>
        <Text style={styles.title}>{t('notifications')}</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.headerAction} onPress={handleMarkAllAsRead}>
              <Icon name="email-check-outline" size={22} color={colors.gray[600]} />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity style={styles.headerAction} onPress={handleDeleteAll}>
              <Icon name="delete-outline" size={22} color={colors.gray[600]} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerAction} onPress={refreshNotifications}>
            <Icon name="refresh" size={22} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Statistiques */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          {notifications.length} {t('total')} • {unreadCount} {t('unread')}
        </Text>
      </View>
      
      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={FILTER_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item.id && styles.filterChipActive,
              ]}
              onPress={() => {
                setSelectedFilter(item.id);
                closeAllSwipeables();
              }}
            >
              <Icon 
                name={item.icon} 
                size={16} 
                color={selectedFilter === item.id ? colors.white : colors.gray[600]} 
              />
              <Text style={[
                styles.filterChipText,
                selectedFilter === item.id && styles.filterChipTextActive,
              ]}>
                {t(item.label)}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
      
      {/* Mode sélection */}
      {isSelectionMode && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedIds.length} {t('selected')}
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={() => {
                setSelectedIds([]);
                setIsSelectionMode(false);
              }}
            >
              <Text style={styles.selectionActionText}>{t('cancel')}</Text>
            </TouchableOpacity>
            {selectedIds.length > 0 && (
              <TouchableOpacity 
                style={[styles.selectionAction, styles.selectionActionDelete]}
                onPress={deleteSelected}
              >
                <Text style={styles.selectionActionDeleteText}>{t('delete')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );

  /**
   * Rendu de l'état vide
   */
  const renderEmpty = () => {
    const getEmptyIcon = () => {
      switch (selectedFilter) {
        case 'unread': return 'bell-off-outline';
        case 'meteo': return 'weather-cloudy';
        case 'conseil': return 'leaf-off';
        case 'technique': return 'school-off';
        case 'alerte': return 'alert-off';
        default: return 'bell-off-outline';
      }
    };
    
    const getEmptyMessage = () => {
      switch (selectedFilter) {
        case 'unread': return t('no_unread_notifications');
        case 'meteo': return t('no_weather_notifications');
        case 'conseil': return t('no_conseil_notifications');
        case 'technique': return t('no_technique_notifications');
        case 'alerte': return t('no_alert_notifications');
        default: return t('no_notifications');
      }
    };
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name={getEmptyIcon()} size={64} color={colors.gray[400]} />
        <Text style={styles.emptyTitle}>{getEmptyMessage()}</Text>
        <Text style={styles.emptyText}>
          {selectedFilter === 'all' 
            ? t('notifications_will_appear_here') 
            : t('try_different_filter')}
        </Text>
      </View>
    );
  };

  /**
   * Rendu du FAB en mode sélection
   */
  const renderFab = () => {
    if (!isSelectionMode) return null;
    
    const fabTranslateY = fabAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    });
    
    return (
      <Animated.View
        style={[
          styles.fabContainer,
          { transform: [{ translateY: fabTranslateY }] },
        ]}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => {
            setSelectedIds([]);
            setIsSelectionMode(false);
          }}
        >
          <Icon name="close" size={24} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ============================================
  // RENDU PRINCIPAL
  // ============================================

  if (!isAuthenticated) {
    return (
      <View style={styles.notAuthenticatedContainer}>
        <Icon name="bell-off-outline" size={64} color={colors.gray[400]} />
        <Text style={styles.notAuthenticatedTitle}>{t('login_to_see_notifications')}</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>{t('login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  if (isLoading && notifications.length === 0) {
    return <LoadingSpinner fullScreen text={t('loading_notifications')} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshNotifications}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScrollBeginDrag={closeAllSwipeables}
        showsVerticalScrollIndicator={false}
      />
      
      {renderFab()}
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
    marginBottom: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    marginBottom: spacing.md,
  },
  statsText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  
  // Filtres
  filtersContainer: {
    marginTop: spacing.xs,
  },
  filtersList: {
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: spacing.sm,
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
  
  // Barre de sélection
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  selectionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectionAction: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectionActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  selectionActionDelete: {
    backgroundColor: colors.error + '15',
    borderRadius: 8,
  },
  selectionActionDeleteText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Élément de notification
  notificationItem: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadItem: {
    backgroundColor: colors.primaryLightest,
  },
  selectedItem: {
    backgroundColor: colors.primaryLight + '30',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.gray[700],
    marginRight: spacing.sm,
  },
  titleUnread: {
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
  },
  body: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  bodyUnread: {
    color: colors.gray[800],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignSelf: 'center',
  },
  expandButton: {
    marginTop: 4,
  },
  expandButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
  },
  
  // Actions swipe
  deleteAction: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: spacing.xs,
    marginRight: spacing.md,
    borderRadius: 16,
  },
  deleteActionText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    marginTop: 4,
  },
  selectAction: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: spacing.xs,
    marginLeft: spacing.md,
    borderRadius: 16,
  },
  selectActionActive: {
    backgroundColor: colors.success,
  },
  selectActionText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    marginTop: 4,
  },
  
  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
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
  
  // Non authentifié
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  notAuthenticatedTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginTop: spacing.md,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  loginButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default NotificationsScreen;