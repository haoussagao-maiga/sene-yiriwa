/**
 * Hook useNotifications - Sènè Yiriwa
 * 
 * Ce hook personnalisé gère toutes les notifications push et locales
 * dans l'application. Il fournit une interface simple pour recevoir,
 * afficher et gérer les notifications.
 * 
 * Fonctionnalités :
 * - Enregistrement pour les notifications push
 * - Réception de notifications (foreground/background)
 * - Gestion du badge de notification
 * - Stockage local des notifications reçues
 * - Marquage comme lues/non lues
 * - Suppression de notifications
 * - Filtrage par type (météo, conseils, alertes)
 * - Sons personnalisés par type
 * - Actions sur notification (navigation)
 * 
 * @module hooks/useNotifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Platform, Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showSuccessMessage, showErrorMessage } from '../utils/notifications';
import { useAuth } from './useAuth';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Types de notifications
 */
export type NotificationType = 
  | 'meteo'        // Alerte météo
  | 'conseil'      // Nouveau conseil
  | 'technique'    // Nouvelle technique
  | 'rappel'       // Rappel agricole
  | 'alerte'       // Alerte urgente
  | 'systeme';     // Notification système

/**
 * Priorité de notification
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

/**
 * Interface pour une notification
 */
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  data?: any;                    // Données supplémentaires (ex: conseilId)
  read: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Interface pour les préférences de notification
 */
export interface NotificationPreferences {
  enabled: boolean;
  types: {
    meteo: boolean;
    conseil: boolean;
    technique: boolean;
    rappel: boolean;
    alerte: boolean;
    systeme: boolean;
  };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badgeEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;               // Format: "22:00"
    end: string;                 // Format: "07:00"
  };
}

/**
 * Interface pour l'état du hook
 */
export interface UseNotificationsState {
  /** Liste des notifications */
  notifications: AppNotification[];
  
  /** Nombre de notifications non lues */
  unreadCount: number;
  
  /** Token d'enregistrement push */
  pushToken: string | null;
  
  /** Préférences de notification */
  preferences: NotificationPreferences;
  
  /** Indique si les notifications sont autorisées */
  isEnabled: boolean;
  
  /** État de chargement */
  isLoading: boolean;
  
  /** État de rafraîchissement */
  isRefreshing: boolean;
  
  /** Dernière notification reçue */
  lastNotification: AppNotification | null;
  
  /** Erreur éventuelle */
  error: string | null;
}

// ============================================
// CONSTANTES
// ============================================

// Clés pour AsyncStorage
const STORAGE_KEYS = {
  NOTIFICATIONS: '@notifications/list',
  PREFERENCES: '@notifications/preferences',
  TOKEN: '@notifications/token',
};

// Configuration par défaut des notifications Expo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Préférences par défaut
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  types: {
    meteo: true,
    conseil: true,
    technique: true,
    rappel: true,
    alerte: true,
    systeme: true,
  },
  soundEnabled: true,
  vibrationEnabled: true,
  badgeEnabled: true,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "07:00",
  },
};

// Son par type de notification
const NOTIFICATION_SOUNDS: Record<NotificationType, string> = {
  meteo: 'sound_weather.wav',
  conseil: 'sound_tips.wav',
  technique: 'sound_tech.wav',
  rappel: 'sound_reminder.wav',
  alerte: 'sound_alert.wav',
  systeme: 'sound_system.wav',
};

// Couleur par type (pour badge)
export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  meteo: '#2196F3',
  conseil: '#4CAF50',
  technique: '#FF9800',
  rappel: '#9C27B0',
  alerte: '#F44336',
  systeme: '#757575',
};

// ============================================
// ÉTAT INITIAL
// ============================================

const initialState: UseNotificationsState = {
  notifications: [],
  unreadCount: 0,
  pushToken: null,
  preferences: DEFAULT_PREFERENCES,
  isEnabled: false,
  isLoading: true,
  isRefreshing: false,
  lastNotification: null,
  error: null,
};

// ============================================
// HOOK PRINCIPAL
// ============================================

/**
 * Hook useNotifications - Gestion des notifications
 * 
 * @example
 * // Utilisation basique
 * const { notifications, unreadCount, markAsRead } = useNotifications();
 * 
 * @example
 * // Enregistrement des notifications
 * const { registerForPushNotifications, pushToken } = useNotifications();
 * 
 * useEffect(() => {
 *   registerForPushNotifications();
 * }, []);
 * 
 * @example
 * // Écran de liste des notifications
 * const { notifications, markAllAsRead, deleteNotification } = useNotifications();
 */
export const useNotifications = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useAuth();
  
  // État local
  const [state, setState] = useState<UseNotificationsState>(initialState);
  
  // Références
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const appStateListener = useRef<any>(null);
  const isLoadingRef = useRef(false);

  // ============================================
  // FONCTIONS DE MISE À JOUR D'ÉTAT
  // ============================================

  /**
   * Met à jour partiellement l'état du hook
   */
  const updateState = useCallback((updates: Partial<UseNotificationsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Sauvegarde les notifications dans le stockage local
   */
  const persistNotifications = useCallback(async (notifications: AppNotification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (error) {
      console.error('[useNotifications] Erreur sauvegarde notifications:', error);
    }
  }, []);

  /**
   * Sauvegarde les préférences
   */
  const persistPreferences = useCallback(async (preferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('[useNotifications] Erreur sauvegarde préférences:', error);
    }
  }, []);

  /**
   * Charge les données depuis le stockage local
   */
  const loadStoredData = useCallback(async () => {
    try {
      const [notificationsStr, preferencesStr, token] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      ]);
      
      const notifications = notificationsStr ? JSON.parse(notificationsStr) : [];
      const preferences = preferencesStr ? JSON.parse(preferencesStr) : DEFAULT_PREFERENCES;
      const unreadCount = notifications.filter((n: AppNotification) => !n.read).length;
      
      updateState({
        notifications,
        unreadCount,
        preferences,
        pushToken: token,
      });
    } catch (error) {
      console.error('[useNotifications] Erreur chargement données:', error);
    }
  }, [updateState]);

  // ============================================
  // GESTION DES NOTIFICATIONS PUSH
  // ============================================

  /**
   * Enregistre l'appareil pour les notifications push
   * 
   * @returns Promise avec le token ou null
   * 
   * @example
   * const token = await registerForPushNotifications();
   * if (token) {
   *   // Envoyer le token au backend
   *   await savePushToken(token);
   * }
   */
  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    if (!isAuthenticated) {
      console.log('[useNotifications] Utilisateur non authentifié');
      return null;
    }
    
    try {
      // Demander la permission
      const existing = await Notifications.getPermissionsAsync();
      let granted = !!(existing as any).granted;

      if (!granted) {
        const req = await Notifications.requestPermissionsAsync();
        granted = !!(req as any).granted;
      }

      if (!granted) {
        updateState({ isEnabled: false });
        console.log('[useNotifications] Permission non accordée');
        return null;
      }
      
      updateState({ isEnabled: true });
      
      // Obtenir le token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'votre-project-id', // À remplacer par votre projectId Expo
      });
      
      const token = tokenData.data;
      
      // Sauvegarder localement
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      updateState({ pushToken: token, isEnabled: true });
      
      if (__DEV__) {
        console.log('[useNotifications] Push token:', token);
      }
      
      return token;
      
    } catch (error) {
      console.error('[useNotifications] Erreur enregistrement push:', error);
      updateState({ isEnabled: false });
      return null;
    }
  }, [isAuthenticated, updateState]);

  /**
   * Envoie une notification locale
   * 
   * @param notification - Notification à afficher
   * @returns Promise avec l'ID de la notification
   * 
   * @example
   * await sendLocalNotification({
   *   title: 'Nouveau conseil',
   *   body: 'Découvrez les techniques d\'irrigation',
   *   type: 'conseil',
   *   priority: 'high'
   * });
   */
  const sendLocalNotification = useCallback(async (
    notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>
  ): Promise<string> => {
    // Vérifier les préférences
    if (!state.preferences.enabled) return '';
    if (!state.preferences.types[notification.type]) return '';
    
    // Vérifier les heures de silence
    if (state.preferences.quietHours.enabled) {
      const now = new Date();
      const currentHour = now.getHours();
      const [startHour] = state.preferences.quietHours.start.split(':').map(Number);
      const [endHour] = state.preferences.quietHours.end.split(':').map(Number);
      
      if (currentHour >= startHour || currentHour < endHour) {
        return '';
      }
    }
    
    const id = Date.now().toString();
    const newNotification: AppNotification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date(),
    };
    
    try {
      // Configurer le son
      const sound = state.preferences.soundEnabled ? NOTIFICATION_SOUNDS[notification.type] : undefined;
      
      // Afficher la notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound,
          priority: notification.priority === 'critical' ? 'high' : 'default',
        },
        trigger: null, // Immédiat
      });
      
      // Vibrer si activé et priorité élevée
      if (state.preferences.vibrationEnabled && notification.priority === 'critical') {
        Vibration.vibrate(500);
      }
      
      // Sauvegarder dans l'état local
      const updatedNotifications = [newNotification, ...state.notifications];
      await persistNotifications(updatedNotifications);
      
      updateState({
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
        lastNotification: newNotification,
      });
      
      return id;
      
    } catch (error) {
      console.error('[useNotifications] Erreur envoi notification:', error);
      return '';
    }
  }, [state.preferences, state.notifications, persistNotifications, updateState]);

  /**
   * Ajoute une notification reçue du serveur
   * 
   * @param notification - Notification reçue
   */
  const addRemoteNotification = useCallback(async (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    // Vérifier les préférences
    if (!state.preferences.enabled) return;
    if (!state.preferences.types[notification.type]) return;
    
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: AppNotification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date(),
    };
    
    const updatedNotifications = [newNotification, ...state.notifications];
    await persistNotifications(updatedNotifications);
    
    updateState({
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter(n => !n.read).length,
      lastNotification: newNotification,
    });
    
    // Mettre à jour le badge
    if (state.preferences.badgeEnabled) {
      await Notifications.setBadgeCountAsync(updatedNotifications.filter(n => !n.read).length);
    }
  }, [state.preferences, state.notifications, persistNotifications, updateState]);

  // ============================================
  // GESTION DES NOTIFICATIONS
  // ============================================

  /**
   * Marque une notification comme lue
   * 
   * @param notificationId - ID de la notification
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    const updatedNotifications = state.notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true, updatedAt: new Date() }
        : notification
    );
    
    await persistNotifications(updatedNotifications);
    
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    
    updateState({
      notifications: updatedNotifications,
      unreadCount,
    });
    
    // Mettre à jour le badge
    if (state.preferences.badgeEnabled) {
      await Notifications.setBadgeCountAsync(unreadCount);
    }
  }, [state.notifications, state.preferences.badgeEnabled, persistNotifications, updateState]);

  /**
   * Marque toutes les notifications comme lues
   */
  const markAllAsRead = useCallback(async () => {
    const updatedNotifications = state.notifications.map(notification => ({
      ...notification,
      read: true,
      updatedAt: new Date(),
    }));
    
    await persistNotifications(updatedNotifications);
    
    updateState({
      notifications: updatedNotifications,
      unreadCount: 0,
    });
    
    // Mettre à jour le badge
    if (state.preferences.badgeEnabled) {
      await Notifications.setBadgeCountAsync(0);
    }
    
    showSuccessMessage(t('all_notifications_marked_read'));
  }, [state.notifications, state.preferences.badgeEnabled, persistNotifications, updateState, t]);

  /**
   * Supprime une notification
   * 
   * @param notificationId - ID de la notification
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    const updatedNotifications = state.notifications.filter(
      notification => notification.id !== notificationId
    );
    
    await persistNotifications(updatedNotifications);
    
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    
    updateState({
      notifications: updatedNotifications,
      unreadCount,
    });
    
    // Mettre à jour le badge
    if (state.preferences.badgeEnabled) {
      await Notifications.setBadgeCountAsync(unreadCount);
    }
  }, [state.notifications, state.preferences.badgeEnabled, persistNotifications, updateState]);

  /**
   * Supprime toutes les notifications
   */
  const deleteAllNotifications = useCallback(async () => {
    await persistNotifications([]);
    
    updateState({
      notifications: [],
      unreadCount: 0,
    });
    
    // Mettre à jour le badge
    if (state.preferences.badgeEnabled) {
      await Notifications.setBadgeCountAsync(0);
    }
    
    showSuccessMessage(t('all_notifications_deleted'));
  }, [state.preferences.badgeEnabled, persistNotifications, updateState, t]);

  // ============================================
  // PRÉFÉRENCES
  // ============================================

  /**
   * Met à jour les préférences de notification
   * 
   * @param newPreferences - Nouvelles préférences
   */
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    const updatedPreferences = {
      ...state.preferences,
      ...newPreferences,
      types: {
        ...state.preferences.types,
        ...newPreferences.types,
      },
      quietHours: {
        ...state.preferences.quietHours,
        ...newPreferences.quietHours,
      },
    };
    
    await persistPreferences(updatedPreferences);
    
    updateState({ preferences: updatedPreferences });
    
    showSuccessMessage(t('notification_preferences_updated'));
  }, [state.preferences, persistPreferences, updateState, t]);

  /**
   * Active/désactive tous les types de notification
   * 
   * @param enabled - État activé/désactivé
   */
  const toggleAllNotifications = useCallback(async (enabled: boolean) => {
    const updatedPreferences = {
      ...state.preferences,
      enabled,
    };
    
    await persistPreferences(updatedPreferences);
    
    updateState({ preferences: updatedPreferences });
    
    showSuccessMessage(enabled ? t('notifications_enabled') : t('notifications_disabled'));
  }, [state.preferences, persistPreferences, updateState, t]);

  /**
   * Active/désactive un type de notification spécifique
   * 
   * @param type - Type de notification
   * @param enabled - État activé/désactivé
   */
  const toggleNotificationType = useCallback(async (type: keyof NotificationPreferences['types'], enabled: boolean) => {
    const updatedPreferences = {
      ...state.preferences,
      types: {
        ...state.preferences.types,
        [type]: enabled,
      },
    };
    
    await persistPreferences(updatedPreferences);
    
    updateState({ preferences: updatedPreferences });
  }, [state.preferences, persistPreferences, updateState]);

  /**
   * Définit les heures de silence
   * 
   * @param start - Heure de début (format "HH:MM")
   * @param end - Heure de fin (format "HH:MM")
   * @param enabled - Activer/désactiver
   */
  const setQuietHours = useCallback(async (start: string, end: string, enabled: boolean = true) => {
    const updatedPreferences = {
      ...state.preferences,
      quietHours: {
        enabled,
        start,
        end,
      },
    };
    
    await persistPreferences(updatedPreferences);
    
    updateState({ preferences: updatedPreferences });
    
    showSuccessMessage(t('quiet_hours_updated'));
  }, [state.preferences, persistPreferences, updateState, t]);

  // ============================================
  // NOTIFICATIONS SPÉCIFIQUES
  // ============================================

  /**
   * Envoie une notification météo
   */
  const sendWeatherAlert = useCallback(async (title: string, body: string, data?: any) => {
    return sendLocalNotification({
      title,
      body,
      type: 'meteo',
      priority: data?.critical ? 'critical' : 'normal',
      data,
    });
  }, [sendLocalNotification]);

  /**
   * Envoie une notification de conseil
   */
  const sendConseilNotification = useCallback(async (conseilId: string, title: string, body: string) => {
    return sendLocalNotification({
      title,
      body,
      type: 'conseil',
      priority: 'normal',
      data: { conseilId, screen: 'ConseilDetail' },
    });
  }, [sendLocalNotification]);

  /**
   * Envoie une notification de technique
   */
  const sendTechniqueNotification = useCallback(async (techniqueId: string, title: string, body: string) => {
    return sendLocalNotification({
      title,
      body,
      type: 'technique',
      priority: 'normal',
      data: { techniqueId, screen: 'TechniqueDetail' },
    });
  }, [sendLocalNotification]);

  /**
   * Envoie une alerte urgente
   */
  const sendCriticalAlert = useCallback(async (title: string, body: string, data?: any) => {
    return sendLocalNotification({
      title,
      body,
      type: 'alerte',
      priority: 'critical',
      data,
    });
  }, [sendLocalNotification]);

  // ============================================
  // ACTIONS SUR NOTIFICATION (NAVIGATION)
  // ============================================

  /**
   * Gère le clic sur une notification
   * 
   * @param notification - Notification cliquée
   */
  const handleNotificationPress = useCallback(async (notification: AppNotification) => {
    // Marquer comme lue
    await markAsRead(notification.id);
    
    // Navigation en fonction du type et des données
    if (notification.data?.screen) {
      navigation.navigate(notification.data.screen, notification.data);
    } else {
      switch (notification.type) {
        case 'conseil':
          navigation.navigate('Conseils' as never);
          break;
        case 'technique':
          navigation.navigate('Techniques' as never);
          break;
        case 'meteo':
          navigation.navigate('Meteo' as never);
          break;
        case 'alerte':
          navigation.navigate('Alertes' as never);
          break;
        default:
          navigation.navigate('Notifications' as never);
      }
    }
  }, [markAsRead, navigation]);

  // ============================================
  // RAFRAÎCHISSEMENT
  // ============================================

  /**
   * Rafraîchit les notifications
   */
  const refreshNotifications = useCallback(async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    updateState({ isRefreshing: true });
    
    // Ici, vous pouvez appeler votre API pour récupérer les notifications du serveur
    // const newNotifications = await fetchNotificationsFromServer();
    // if (newNotifications) {
    //   await addRemoteNotification(newNotifications);
    // }
    
    await loadStoredData();
    
    updateState({ isRefreshing: false });
    isLoadingRef.current = false;
  }, [loadStoredData, updateState]);

  // ============================================
  // INITIALISATION ET LISTENERS
  // ============================================

  // Chargement initial
  useEffect(() => {
    loadStoredData();
    
    // Enregistrement pour les notifications push
    registerForPushNotifications();
    
    // Listener pour les notifications reçues en foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const { title, body, data } = notification.request.content;

      const notifType = (data?.type as NotificationType) ?? 'systeme';
      const notifPriority = (data?.priority as NotificationPriority) ?? 'normal';

      addRemoteNotification({
        title: title || '',
        body: body || '',
        type: notifType,
        priority: notifPriority,
        data,
      });
    });
    
    // Listener pour le clic sur notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      const notificationId = data?.id as string | undefined;

      if (notificationId) {
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          handleNotificationPress(notification);
        }
      }
    });
    
    // Nettoyage
    return () => {
      if (notificationListener.current && typeof notificationListener.current.remove === 'function') {
        notificationListener.current.remove();
      }
      if (responseListener.current && typeof responseListener.current.remove === 'function') {
        responseListener.current.remove();
      }
      if (appStateListener.current && typeof appStateListener.current.remove === 'function') {
        appStateListener.current.remove();
      }
    };
  }, []);

  // Mise à jour du badge à la fermeture de l'app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background' && state.preferences.badgeEnabled) {
        await Notifications.setBadgeCountAsync(state.unreadCount);
      }
    });
    
    appStateListener.current = subscription;
    
    return () => {
      subscription.remove();
    };
  }, [state.unreadCount, state.preferences.badgeEnabled]);

  // ============================================
  // RETOUR DU HOOK
  // ============================================

  return {
    // État
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    pushToken: state.pushToken,
    preferences: state.preferences,
    isEnabled: state.isEnabled,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    lastNotification: state.lastNotification,
    error: state.error,
    
    // Gestion push
    registerForPushNotifications,
    sendLocalNotification,
    addRemoteNotification,
    
    // Gestion des notifications
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    handleNotificationPress,
    
    // Préférences
    updatePreferences,
    toggleAllNotifications,
    toggleNotificationType,
    setQuietHours,
    
    // Notifications spécifiques
    sendWeatherAlert,
    sendConseilNotification,
    sendTechniqueNotification,
    sendCriticalAlert,
    
    // Utilitaires
    refreshNotifications,
  };
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default useNotifications;