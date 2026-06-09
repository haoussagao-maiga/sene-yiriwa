/**
 * MainNavigator - Sènè Yiriwa
 * 
 * Ce fichier configure la navigation principale de l'application après
 * authentification. Il gère la navigation par onglets (Tab Navigator)
 * et les écrans de détail (Stack Navigator).
 * 
 * Fonctionnalités :
 * - Navigation par onglets (accueil, météo, conseils, techniques, profil)
 * - Écrans de détail avec bouton de retour
 * - Animations de transition personnalisées
 * - Badges de notification sur les onglets
 * - Types TypeScript pour la sécurité
 * - Gestion du thème (couleurs)
 * - Navigation programmatique
 * 
 * @module navigation/MainNavigator
 */

import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import des écrans principaux (onglets)
import HomeScreen from './screens/main/HomeScreen';
import MeteoScreen from './screens/main/MeteoScreen';
import ConseilsScreen from './screens/main/ConseilsScreen';
import TechniquesScreen from './screens/main/TechniquesScreen';
import ProfileScreen from './screens/main/ProfileScreen';

// Import des écrans de détail (stack)
import ConseilDetailScreen from './screens/main/ConseilDetailScreen';
import TechniqueDetailScreen from './screens/main/TechniqueDetailScreen';
import NotificationsScreen from './screens/main/NotificationsScreen';
import SearchScreen from './screens/main/SearchScreen';
import SettingsScreen from './screens/main/SettingsScreen';
import HelpScreen from './screens/main/HelpScreen';
import AboutScreen from './screens/main/AboutScreen';
import EditProfileScreen from './screens/main/EditProfileScreen';
import ChangePasswordScreen from './screens/main/ChangePasswordScreen';

// Import des types
import { MainStackParamList, TabParamList } from './types';

// Import des styles et couleurs
import colors from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

// Import des hooks
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

// Création des navigateurs
const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Props du composant MainNavigator
 */
export interface MainNavigatorProps {
  /** Désactiver les animations */
  disableAnimations?: boolean;
  
  /** Écran initial (par défaut: 'Home') */
  initialRouteName?: keyof TabParamList;
}

// ============================================
// COMPOSANTS D'ICÔNES D'ONGLETS
// ============================================

/**
 * Icône pour l'onglet Accueil
 */
const HomeIcon: React.FC<{ focused: boolean; color: string; size: number }> = ({ 
  focused, 
  color, 
  size 
}) => (
  <Icon 
    name={focused ? 'home' : 'home-outline'} 
    size={size} 
    color={color} 
  />
);

/**
 * Icône pour l'onglet Météo
 */
const WeatherIcon: React.FC<{ focused: boolean; color: string; size: number }> = ({ 
  focused, 
  color, 
  size 
}) => (
  <Icon 
    name={focused ? 'weather-cloudy' : 'weather-partly-cloudy'} 
    size={size} 
    color={color} 
  />
);

/**
 * Icône pour l'onglet Conseils
 */
const ConseilsIcon: React.FC<{ focused: boolean; color: string; size: number }> = ({ 
  focused, 
  color, 
  size 
}) => (
  <Icon 
    name={focused ? 'leaf' : 'leaf-outline'} 
    size={size} 
    color={color} 
  />
);

/**
 * Icône pour l'onglet Techniques
 */
const TechniquesIcon: React.FC<{ focused: boolean; color: string; size: number }> = ({ 
  focused, 
  color, 
  size 
}) => (
  <Icon 
    name={focused ? 'school' : 'school-outline'} 
    size={size} 
    color={color} 
  />
);

/**
 * Icône pour l'onglet Profil
 */
const ProfileIcon: React.FC<{ focused: boolean; color: string; size: number }> = ({ 
  focused, 
  color, 
  size 
}) => (
  <Icon 
    name={focused ? 'account' : 'account-outline'} 
    size={size} 
    color={color} 
  />
);

// ============================================
// COMPOSANT D'ONGLET AVEC BADGE
// ============================================

/**
 * Label d'onglet avec badge de notification
 */
const TabLabelWithBadge: React.FC<{ 
  label: string; 
  focused: boolean; 
  badgeCount?: number 
}> = ({ label, focused, badgeCount = 0 }) => (
  <View style={styles.tabLabelContainer}>
    <Text style={[
      styles.tabLabel,
      focused && styles.tabLabelFocused
    ]}>
      {label}
    </Text>
    {badgeCount > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </Text>
      </View>
    )}
  </View>
);

// ============================================
// OPTIONS DE NAVIGATION
// ============================================

/**
 * Options par défaut pour le Tab Navigator
 */
const defaultTabOptions = ({ route }: { route: any }) => {
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();
  
  const getIcon = () => {
    switch (route.name) {
      case 'Home':
        return HomeIcon;
      case 'Meteo':
        return WeatherIcon;
      case 'Conseils':
        return ConseilsIcon;
      case 'Techniques':
        return TechniquesIcon;
      case 'Profile':
        return ProfileIcon;
      default:
        return HomeIcon;
    }
  };
  
  const getLabel = () => {
    switch (route.name) {
      case 'Home':
        return t('home');
      case 'Meteo':
        return t('weather');
      case 'Conseils':
        return t('advice');
      case 'Techniques':
        return t('techniques');
      case 'Profile':
        return t('profile');
      default:
        return '';
    }
  };
  
  const getBadgeCount = () => {
    switch (route.name) {
      case 'Notifications':
        return unreadCount;
      default:
        return 0;
    }
  };
  
  const IconComponent = getIcon();
  const label = getLabel();
  const badgeCount = getBadgeCount();
  
  return {
    tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
      <IconComponent focused={focused} color={color} size={size} />
    ),
    tabBarLabel: ({ focused }: { focused: boolean }) => (
      <TabLabelWithBadge 
        label={label} 
        focused={focused} 
        badgeCount={badgeCount} 
      />
    ),
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.gray[500],
    tabBarStyle: styles.tabBar,
    tabBarLabelStyle: styles.tabBarLabel,
    headerShown: false,
  };
};

/**
 * Options par défaut pour le Stack Navigator
 */
const defaultStackOptions = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerTitleAlign: 'center' as const,
  headerStyle: {
    backgroundColor: colors.white,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.gray[900],
  },
  headerBackImage: () => (
    <Icon name="chevron-left" size={24} color={colors.gray[800]} style={styles.backIcon} />
  ),
  cardStyle: {
    backgroundColor: colors.background,
  },
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
};

// ============================================
// TAB NAVIGATOR
// ============================================

/**
 * TabNavigator - Navigation par onglets
 * 
 * @example
 * <TabNavigator />
 */
const TabNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={defaultTabOptions}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
        }}
      />
      <Tab.Screen 
        name="Meteo" 
        component={MeteoScreen}
        options={{
          tabBarLabel: t('weather'),
        }}
      />
      <Tab.Screen 
        name="Conseils" 
        component={ConseilsScreen}
        options={{
          tabBarLabel: t('advice'),
        }}
      />
      <Tab.Screen 
        name="Techniques" 
        component={TechniquesScreen}
        options={{
          tabBarLabel: t('techniques'),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile'),
        }}
      />
    </Tab.Navigator>
  );
};

// ============================================
// STACK NAVIGATOR PRINCIPAL
// ============================================

/**
 * MainNavigator - Navigateur principal (stack + tabs)
 * 
 * @example
 * // Utilisation basique
 * <MainNavigator />
 * 
 * @example
 * // Avec écran initial personnalisé
 * <MainNavigator initialRouteName="Techniques" />
 * 
 * @example
 * // Désactiver les animations
 * <MainNavigator disableAnimations={true} />
 */
const MainNavigator: React.FC<MainNavigatorProps> = ({
  disableAnimations = false,
  initialRouteName = 'Home',
}) => {
  const { user } = useAuth();
  
  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackOptions,
      }}
    >
      {/* Onglets principaux */}
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Écrans de détail */}
      <Stack.Screen
        name="ConseilDetail"
        component={ConseilDetailScreen}
        options={({ route }) => ({
          title: 'Détail du conseil',
          headerShown: true,
        })}
      />
      
      <Stack.Screen
        name="TechniqueDetail"
        component={TechniqueDetailScreen}
        options={({ route }) => ({
          title: 'Détail de la technique',
          headerShown: true,
        })}
      />
      
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          headerShown: true,
        }}
      />
      
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Recherche',
          headerShown: true,
        }}
      />
      
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Paramètres',
          headerShown: true,
        }}
      />
      
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          title: 'Aide',
          headerShown: true,
        }}
      />
      
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'À propos',
          headerShown: true,
        }}
      />
      
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Modifier le profil',
          headerShown: true,
        }}
      />
      
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: 'Changer le mot de passe',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: 4,
  },
  tabLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[600],
  },
  tabLabelFocused: {
    color: colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  backIcon: {
    marginLeft: spacing.md,
  },
});

// ============================================
// COMPOSANTS DÉRIVÉS
// ============================================

/**
 * Navigateur sans onglets (pour écrans en plein écran)
 * 
 * @example
 * <FullScreenNavigator />
 */
export const FullScreenNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={defaultStackOptions}>
    <Stack.Screen
      name="MeteoDetail"
      component={MeteoScreen}
      options={{
        title: 'Météo détaillée',
        headerShown: true,
      }}
    />
  </Stack.Navigator>
);

/**
 * Navigateur de recherche
 * 
 * @example
 * <SearchNavigator />
 */
export const SearchNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={defaultStackOptions}>
    <Stack.Screen
      name="Search"
      component={SearchScreen}
      options={{
        title: 'Recherche',
        headerShown: true,
      }}
    />
    <Stack.Screen
      name="ConseilDetail"
      component={ConseilDetailScreen}
      options={{
        title: 'Détail du conseil',
        headerShown: true,
      }}
    />
    <Stack.Screen
      name="TechniqueDetail"
      component={TechniqueDetailScreen}
      options={{
        title: 'Détail de la technique',
        headerShown: true,
      }}
    />
  </Stack.Navigator>
);

// ============================================
// HOOK PERSONNALISÉ POUR LA NAVIGATION
// ============================================

/**
 * Hook personnalisé pour la navigation dans MainNavigator
 * 
 * @example
 * const { navigateToConseilDetail, navigateToTechniqueDetail, navigateToNotifications } = useMainNavigation();
 */
export const useMainNavigation = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  
  const navigateToConseilDetail = useCallback((id: string) => {
    navigation.navigate('ConseilDetail', { id });
  }, [navigation]);
  
  const navigateToTechniqueDetail = useCallback((id: string) => {
    navigation.navigate('TechniqueDetail', { id });
  }, [navigation]);
  
  const navigateToNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);
  
  const navigateToSearch = useCallback((initialQuery?: string) => {
    navigation.navigate('Search', { initialQuery });
  }, [navigation]);
  
  const navigateToSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);
  
  const navigateToHelp = useCallback(() => {
    navigation.navigate('Help');
  }, [navigation]);
  
  const navigateToAbout = useCallback(() => {
    navigation.navigate('About');
  }, [navigation]);
  
  const navigateToEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);
  
  const navigateToChangePassword = useCallback(() => {
    navigation.navigate('ChangePassword');
  }, [navigation]);
  
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  return {
    navigateToConseilDetail,
    navigateToTechniqueDetail,
    navigateToNotifications,
    navigateToSearch,
    navigateToSettings,
    navigateToHelp,
    navigateToAbout,
    navigateToEditProfile,
    navigateToChangePassword,
    goBack,
  };
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default MainNavigator;

// Imports supplémentaires
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback } from 'react';