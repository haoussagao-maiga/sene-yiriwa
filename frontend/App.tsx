/**
 * App.tsx - Sènè Yiriwa
 * 
 * Point d'entrée principal de l'application Sènè Yiriwa.
 * Configure les providers nécessaires (Redux, Navigation, Thème, Notifications)
 * et initialise les services essentiels.
 * 
 * Fonctionnalités :
 * - Configuration Redux avec persistance
 * - Configuration de la navigation
 * - Gestion du thème (clair/sombre/système)
 * - Initialisation des notifications push
 * - Gestion des erreurs globales
 * - Journalisation des performances
 * - Support multilingue (Français/Bambara)
 * 
 * @module App
 */

import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, LogBox, Platform } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import des configurations
import { store, persistor } from './src/store';
import { lightTheme, darkTheme, navigationTheme } from './src/config/theme.config';
import AppNavigator from './src/navigation/AppNavigator';
import i18n from './src/i18n';

// Import des utilitaires
import { configureNotificationHandler, addNotificationListeners } from './src/utils/notifications';
import { initializeApp } from './src/store/slices/appSlice';

// Import des styles
import colors from './src/styles/colors';
import { typography } from './src/styles/typography';

// ============================================
// CONFIGURATION INITIALE
// ============================================

// Ignorer les avertissements spécifiques en développement
if (__DEV__) {
  LogBox.ignoreLogs([
    'Remote debugger',
    'AsyncStorage has been extracted',
    'Require cycle:',
  ]);
}

// Empêcher la fermeture automatique du splash screen
SplashScreen.preventAutoHideAsync();

// Configuration du handler de notifications via utilitaire
configureNotificationHandler();

// ============================================
// COMPOSANT ERROR BOUNDARY
// ============================================

/**
 * ErrorBoundary - Capture les erreurs non gérées dans l'application
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erreur non capturée:', error, errorInfo);
    // Ici, vous pouvez envoyer l'erreur à un service de monitoring
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Une erreur est survenue</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Erreur inattendue'}
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={this.handleReset}>
            <Text style={styles.resetButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * App - Composant racine de l'application
 */
const App: React.FC = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  /**
   * Initialise l'application
   * Charge les ressources et configure les services
   */
  const initialize = useCallback(async () => {
    try {
      // Initialiser les services en parallèle
      await Promise.all([
        // Configurer les notifications
        configureNotifications(),
        
        // Initialiser le store avec les données persistées
        initializeStore(),
        
        // Simuler le chargement d'autres ressources
        loadResources(),
      ]);
      
      // Attendre un peu pour que l'utilisateur voie le splash screen
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    } finally {
      setAppIsReady(true);
      await SplashScreen.hideAsync();
    }
  }, []);

  /**
   * Configure les notifications push
   */
  const configureNotifications = async (): Promise<void> => {
    try {
      // Demander la permission pour les notifications
      const existing = await Notifications.getPermissionsAsync();
      let granted = !!(existing as any).granted;

      if (!granted) {
        const req = await Notifications.requestPermissionsAsync();
        granted = !!(req as any).granted;
      }

      if (!granted) {
        console.log('Permission de notification non accordée');
        return;
      }
      
      // Configurer le handler de notifications
      configureNotificationHandler();
      
      // Configuration spécifique à Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: colors.primary,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
    }
  };

  /**
   * Initialise le store Redux
   */
  const initializeStore = async (): Promise<void> => {
    try {
      // Dispatch de l'action d'initialisation
      await store.dispatch(initializeApp());
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du store:', error);
    }
  };

  /**
   * Charge les ressources de l'application
   */
  const loadResources = async (): Promise<void> => {
    try {
      // Simuler le chargement de polices, images, etc.
      // await loadFonts();
      // await preloadImages();
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error);
    }
  };

  // Effet d'initialisation
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Configuration de la barre de statut
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor(colors.background);
  }, []);

  // Afficher un écran de chargement si l'app n'est pas prête
  if (!appIsReady) {
    return null; // Le splash screen est géré nativement
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <PaperProvider theme={lightTheme}>
              <SafeAreaProvider>
                <I18nextProvider i18n={i18n}>
                  <NavigationContainer theme={navigationTheme}>
                    <StatusBar
                      barStyle="dark-content"
                      backgroundColor={colors.background}
                      translucent={false}
                    />
                    <AppNavigator />
                    <FlashMessage
                      position="top"
                      floating
                      duration={3000}
                      icon="auto"
                      style={{
                        borderRadius: 12,
                        marginHorizontal: 16,
                        marginTop: Platform.OS === 'ios' ? 50 : 40,
                      }}
                      titleStyle={{
                        fontSize: typography.fontSize.md,
                        fontWeight: typography.fontWeight.bold,
                      }}
                      textStyle={{
                        fontSize: typography.fontSize.sm,
                      }}
                    />
                  </NavigationContainer>
                </I18nextProvider>
              </SafeAreaProvider>
            </PaperProvider>
          </PersistGate>
        </ReduxProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

// ============================================
// STYLES POUR ERROR BOUNDARY
// ============================================

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[800],
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default App;