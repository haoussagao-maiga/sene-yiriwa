/**
 * Utilitaires Notifications - Sènè Yiriwa
 * 
 * Ce fichier contient toutes les fonctions utilitaires pour la gestion
 * des notifications dans l'application. Il fournit des helpers pour
 * afficher des notifications locales, des alertes, des toasts,
 * et gérer les permissions.
 * 
 * Fonctionnalités :
 * - Affichage de toasts de succès/erreur/info/avertissement
 * - Notifications locales avec Expo
 * - Gestion des permissions de notification
 * - Gestion des sons et vibrations
 * - Notifications programmées
 * - Utilitaires pour les badges
 * 
 * @module utils/notifications
 */

import { Platform, Alert, Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import { showMessage, hideMessage } from 'react-native-flash-message';
import  colors  from '../styles/colors';
import i18n from '../i18n';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Type de message pour les toasts
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Options pour l'affichage d'un toast
 */
export interface ToastOptions {
  /** Message à afficher */
  message: string;
  
  /** Description/secondaire (optionnel) */
  description?: string;
  
  /** Type de message */
  type?: ToastType;
  
  /** Durée d'affichage en millisecondes */
  duration?: number;
  
  /** Position à l'écran */
  position?: 'top' | 'bottom' | 'center';
  
  /** Icône personnalisée */
  icon?: React.ReactNode;
  
  /** Fonction de rappel à la fermeture */
  onHide?: () => void;
}

/**
 * Options pour les notifications push
 */
export interface PushNotificationOptions {
  /** Titre de la notification */
  title: string;
  
  /** Corps de la notification */
  body: string;
  
  /** Données supplémentaires */
  data?: Record<string, any>;
  
  /** Son à jouer */
  sound?: string;
  
  /** Badge (nombre) */
  badge?: number;
  
  /** Priorité de la notification */
  priority?: 'default' | 'high';
}

// ============================================
// TOASTS (MESSAGES FLOTTANTS)
// ============================================

/**
 * Affiche un message de succès
 * 
 * @param message - Message principal
 * @param description - Description optionnelle
 * @param duration - Durée d'affichage (ms)
 * 
 * @example
 * showSuccessMessage('Profil mis à jour', 'Vos modifications ont été enregistrées');
 */
export const showSuccessMessage = (
  message: string,
  description?: string,
  duration: number = 3000
): void => {
  showMessage({
    message,
    description,
    type: 'success',
    duration,
    backgroundColor: colors.success,
    icon: 'success',
    position: 'top',
    floating: true,
    style: { borderRadius: 12, marginHorizontal: 16, marginTop: Platform.OS === 'ios' ? 50 : 40 },
    titleStyle: { fontSize: 16, fontWeight: 'bold' },
    textStyle: { fontSize: 14 },
  });
};

/**
 * Affiche un message d'erreur
 * 
 * @param message - Message principal
 * @param description - Description optionnelle
 * @param duration - Durée d'affichage (ms)
 * 
 * @example
 * showErrorMessage('Connexion échouée', 'Vérifiez votre email et mot de passe');
 */
export const showErrorMessage = (
  message: string,
  description?: string,
  duration: number = 4000
): void => {
  showMessage({
    message,
    description,
    type: 'danger',
    duration,
    backgroundColor: colors.error,
    icon: 'danger',
    position: 'top',
    floating: true,
    style: { borderRadius: 12, marginHorizontal: 16, marginTop: Platform.OS === 'ios' ? 50 : 40 },
    titleStyle: { fontSize: 16, fontWeight: 'bold' },
    textStyle: { fontSize: 14 },
  });
};

/**
 * Affiche un message d'avertissement
 * 
 * @param message - Message principal
 * @param description - Description optionnelle
 * @param duration - Durée d'affichage (ms)
 * 
 * @example
 * showWarningMessage('Attention', 'Votre session expire dans 5 minutes');
 */
export const showWarningMessage = (
  message: string,
  description?: string,
  duration: number = 4000
): void => {
  showMessage({
    message,
    description,
    type: 'warning',
    duration,
    backgroundColor: colors.warning,
    icon: 'warning',
    position: 'top',
    floating: true,
    style: { borderRadius: 12, marginHorizontal: 16, marginTop: Platform.OS === 'ios' ? 50 : 40 },
    titleStyle: { fontSize: 16, fontWeight: 'bold' },
    textStyle: { fontSize: 14 },
  });
};

/**
 * Affiche un message d'information
 * 
 * @param message - Message principal
 * @param description - Description optionnelle
 * @param duration - Durée d'affichage (ms)
 * 
 * @example
 * showInfoMessage('Nouvelle version', 'L'application a été mise à jour');
 */
export const showInfoMessage = (
  message: string,
  description?: string,
  duration: number = 3000
): void => {
  showMessage({
    message,
    description,
    type: 'info',
    duration,
    backgroundColor: colors.info,
    icon: 'info',
    position: 'top',
    floating: true,
    style: { borderRadius: 12, marginHorizontal: 16, marginTop: Platform.OS === 'ios' ? 50 : 40 },
    titleStyle: { fontSize: 16, fontWeight: 'bold' },
    textStyle: { fontSize: 14 },
  });
};

/**
 * Affiche un message personnalisé
 * 
 * @param options - Options du toast
 * 
 * @example
 * showCustomMessage({
 *   message: 'Message personnalisé',
 *   type: 'info',
 *   duration: 2000
 * });
 */
export const showCustomMessage = (options: ToastOptions): void => {
  const { message, description, type = 'info', duration = 3000, position = 'top', onHide } = options;
  
  let backgroundColor = colors.info;
  let icon: 'success' | 'danger' | 'warning' | 'info' = 'info';
  
  switch (type) {
    case 'success':
      backgroundColor = colors.success;
      icon = 'success';
      break;
    case 'error':
      backgroundColor = colors.error;
      icon = 'danger';
      break;
    case 'warning':
      backgroundColor = colors.warning;
      icon = 'warning';
      break;
    default:
      backgroundColor = colors.info;
      icon = 'info';
  }
  
  showMessage({
    message,
    description,
    type: type === 'error' ? 'danger' : type,
    duration,
    backgroundColor,
    icon,
    position: position === 'bottom' ? 'bottom' : 'top',
    floating: true,
    style: { borderRadius: 12, marginHorizontal: 16 },
    titleStyle: { fontSize: 16, fontWeight: 'bold' },
    textStyle: { fontSize: 14 },
    onHide,
  });
};

/**
 * Cache le message actuel
 */
export const hideCurrentMessage = (): void => {
  hideMessage();
};

// ============================================
// ALERTES NATIVES (Alert.alert)
// ============================================

/**
 * Affiche une alerte de confirmation
 * 
 * @param title - Titre de l'alerte
 * @param message - Message de l'alerte
 * @param onConfirm - Fonction appelée lors de la confirmation
 * @param onCancel - Fonction appelée lors de l'annulation
 * 
 * @example
 * showConfirmAlert(
 *   'Supprimer',
 *   'Êtes-vous sûr de vouloir supprimer ce conseil ?',
 *   () => deleteConseil(),
 *   () => console.log('Annulé')
 * );
 */
export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Annuler',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirmer',
        style: 'destructive',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
};

/**
 * Affiche une alerte simple
 * 
 * @param title - Titre de l'alerte
 * @param message - Message de l'alerte
 * @param onOk - Fonction appelée à la fermeture
 * 
 * @example
 * showSimpleAlert('Information', 'Votre profil a été mis à jour');
 */
export const showSimpleAlert = (title: string, message: string, onOk?: () => void): void => {
  Alert.alert(
    title,
    message,
    [
      {
        text: i18n.t('ok'),
        onPress: onOk,
      },
    ],
    { cancelable: true }
  );
};

/**
 * Affiche une alerte avec options multiples
 * 
 * @param title - Titre de l'alerte
 * @param message - Message de l'alerte
 * @param options - Options de l'alerte
 * 
 * @example
 * showChoiceAlert(
 *   'Choisissez une option',
 *   'Que souhaitez-vous faire ?',
 *   [
 *     { text: 'Modifier', onPress: () => edit() },
 *     { text: 'Partager', onPress: () => share() },
 *     { text: 'Annuler', style: 'cancel' }
 *   ]
 * );
 */
export const showChoiceAlert = (
  title: string,
  message: string,
  options: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[]
): void => {
  Alert.alert(title, message, options, { cancelable: true });
};

// ============================================
// VIBRATION
// ============================================

/**
 * Déclenche une vibration
 * 
 * @param duration - Durée de la vibration (ms)
 * @param pattern - Pattern de vibration (alternance vibration/pause)
 * 
 * @example
 * vibrate() // Vibration courte par défaut
 * vibrate(1000) // Vibration d'1 seconde
 * vibrate(undefined, [500, 200, 500]) // Vibration en pattern
 */
export const vibrate = (duration?: number, pattern?: number[]): void => {
  if (pattern) {
    Vibration.vibrate(pattern);
  } else if (duration) {
    Vibration.vibrate(duration);
  } else {
    Vibration.vibrate(200); // Vibration par défaut
  }
};
/**
 * Demande la permission pour les notifications push
 * 
 * @returns Promise avec le statut de la permission
 * 
 * @example
 * const granted = await requestPushNotificationPermission();
 * if (granted) {
 *   console.log('Notifications autorisées');
 * }
 */
export const requestPushNotificationPermission = async (): Promise<boolean> => {
  try {
    const existing = await Notifications.getPermissionsAsync();
    let granted = !!(existing as any).granted;

    if (!granted) {
      const req = await Notifications.requestPermissionsAsync();
      granted = !!(req as any).granted;
    }

    if (!granted) {
      console.log('Permission de notification non accordée');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
    return false;
  }
};

/**
 * Obtient le token Expo push
 * 
 * @returns Token Expo push ou null
 * 
 * @example
 * const token = await getExpoPushToken();
 * if (token) {
 *   await savePushToken(token);
 * }
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'votre-project-id', // À remplacer par votre projectId Expo
    });
    return token.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
};

/**
 * Envoie une notification locale immédiate
 * 
 * @param options - Options de la notification
 * @returns ID de la notification
 * 
 * @example
 * await sendLocalNotification({
 *   title: 'Rappel',
 *   body: 'N'oubliez pas d'arroser vos plants',
 *   data: { screen: 'ConseilDetail', id: '123' }
 * });
 */
export const sendLocalNotification = async (
  options: PushNotificationOptions
): Promise<string> => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        data: options.data,
        sound: options.sound || 'default',
        badge: options.badge,
        priority: options.priority === 'high' ? 'high' : 'default',
      },
      trigger: null, // Immédiat
    });
    
    // Vibration pour les notifications importantes
    if (options.priority === 'high') {
      vibrate(500);
    }
    
    return notificationId;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return '';
  }
};

/**
 * Programme une notification pour plus tard
 * 
 * @param options - Options de la notification
 * @param delaySeconds - Délai avant l'envoi (secondes)
 * @returns ID de la notification programmée
 * 
 * @example
 * await scheduleNotification(
 *   { title: 'Rappel', body: 'Période de semis' },
 *   3600 // Dans 1 heure
 * );
 */
export const scheduleNotification = async (
  options: PushNotificationOptions,
  delaySeconds: number
): Promise<string> => {
  try {
    const trigger = new Date(Date.now() + delaySeconds * 1000) as any;
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        data: options.data,
        sound: options.sound || 'default',
        badge: options.badge,
      },
      trigger,
    });
    
    return notificationId;
  } catch (error) {
    console.error('Erreur lors de la programmation de la notification:', error);
    return '';
  }
};

/**
 * Programme une notification récurrente
 * 
 * @param options - Options de la notification
 * @param intervalSeconds - Intervalle entre les notifications (secondes)
 * @returns ID de la notification programmée
 * 
 * @example
 * await scheduleRecurringNotification(
 *   { title: 'Conseil du jour', body: 'Découvrez nos nouveaux conseils' },
 *   86400 // Tous les jours
 * );
 */
export const scheduleRecurringNotification = async (
  options: PushNotificationOptions,
  intervalSeconds: number
): Promise<string> => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        data: options.data,
        sound: options.sound || 'default',
        badge: options.badge,
      },
      trigger: ({
        seconds: Math.max(1, Math.floor(intervalSeconds)),
        repeats: true,
      } as any),
    });
    
    return notificationId;
  } catch (error) {
    console.error('Erreur lors de la programmation récurrente:', error);
    return '';
  }
};

/**
 * Annule une notification programmée
 * 
 * @param notificationId - ID de la notification
 * 
 * @example
 * await cancelNotification('notification-123');
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la notification:', error);
  }
};

/**
 * Annule toutes les notifications programmées
 * 
 * @example
 * await cancelAllNotifications();
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Erreur lors de l\'annulation des notifications:', error);
  }
};

/**
 * Met à jour le badge de l'application
 * 
 * @param count - Nombre à afficher sur le badge
 * 
 * @example
 * await setBadgeCount(5);
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du badge:', error);
  }
};

/**
 * Obtient le compte du badge actuel
 * 
 * @returns Nombre de badges
 * 
 * @example
 * const count = await getBadgeCount();
 */
export const getBadgeCount = async (): Promise<number> => {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Erreur lors de la récupération du badge:', error);
    return 0;
  }
};

/**
 * Ajoute des écouteurs de notifications
 * 
 * @param onNotification - Callback pour les notifications reçues
 * @param onResponse - Callback pour les réponses aux notifications
 * 
 * @example
 * addNotificationListeners(
 *   (notification) => console.log('Reçu:', notification),
 *   (response) => console.log('Réponse:', response)
 * );
 */
export const addNotificationListeners = (
  onNotification?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void
): { removeNotificationListener: () => void; removeResponseListener: () => void } => {
  let notificationListener: Notifications.Subscription | null = null;
  let responseListener: Notifications.Subscription | null = null;
  
  if (onNotification) {
    notificationListener = Notifications.addNotificationReceivedListener(onNotification);
  }
  
  if (onResponse) {
    responseListener = Notifications.addNotificationResponseReceivedListener(onResponse);
  }
  
  return {
    removeNotificationListener: () => notificationListener?.remove(),
    removeResponseListener: () => responseListener?.remove(),
  };
};

/**
 * Configure le handler de notifications (foreground)
 */
export const configureNotificationHandler = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

// ============================================
// NOTIFICATIONS SPÉCIFIQUES À L'APPLICATION
// ============================================

/**
 * Envoie une notification de rappel d'arrosage
 * 
 * @param cultureName - Nom de la culture
 * 
 * @example
 * await sendWateringReminder('maïs');
 */
export const sendWateringReminder = async (cultureName: string): Promise<void> => {
  await sendLocalNotification({
    title: '💧 Rappel d\'arrosage',
    body: `N'oubliez pas d'arroser votre ${cultureName} aujourd'hui`,
    data: { type: 'reminder', action: 'watering' },
    priority: 'high',
  });
};

/**
 * Envoie une notification de conseil du jour
 * 
 * @param conseilTitle - Titre du conseil
 * @param conseilId - ID du conseil
 * 
 * @example
 * await sendDailyTipNotification('Préparation du sol', '123');
 */
export const sendDailyTipNotification = async (conseilTitle: string, conseilId: string): Promise<void> => {
  await sendLocalNotification({
    title: '🌾 Conseil du jour',
    body: conseilTitle,
    data: { screen: 'ConseilDetail', id: conseilId, type: 'daily_tip' },
  });
};

/**
 * Envoie une notification d'alerte météo
 * 
 * @param alertType - Type d'alerte (pluie, sécheresse, etc.)
 * @param message - Message d'alerte
 * 
 * @example
 * await sendWeatherAlert('Pluies intenses', 'Attention aux fortes pluies attendues');
 */
export const sendWeatherAlert = async (alertType: string, message: string): Promise<void> => {
  await sendLocalNotification({
    title: `⚠️ Alerte météo - ${alertType}`,
    body: message,
    data: { screen: 'Meteo', type: 'weather_alert' },
    priority: 'high',
    sound: 'alert',
  });
};

/**
 * Annule la vibration en cours
 */
export const cancelVibration = (): void => {
  Vibration.cancel();
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default {
  // Toasts
  showSuccessMessage,
  showErrorMessage,
  showWarningMessage,
  showInfoMessage,
  showCustomMessage,
  hideCurrentMessage,
  
  // Alertes natives
  showConfirmAlert,
  showSimpleAlert,
  showChoiceAlert,
  
  // Vibration
  vibrate,
  cancelVibration,
  
  // Notifications push
  requestPushNotificationPermission,
  getExpoPushToken,
  sendLocalNotification,
  scheduleNotification,
  scheduleRecurringNotification,
  cancelNotification,
  cancelAllNotifications,
  setBadgeCount,
  getBadgeCount,
  addNotificationListeners,
  configureNotificationHandler,
  
  // Notifications spécifiques
  sendWateringReminder,
  sendDailyTipNotification,
  sendWeatherAlert,
};