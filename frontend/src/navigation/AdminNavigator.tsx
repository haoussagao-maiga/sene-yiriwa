/**
 * AdminNavigator - Sènè Yiriwa
 * 
 * Ce fichier configure la navigation administrative de l'application.
 * Il gère les écrans réservés aux administrateurs avec une navigation
 * par onglets et des écrans de gestion.
 * 
 * Fonctionnalités :
 * - Navigation par onglets (dashboard, utilisateurs, contenu, paramètres)
 * - Gestion des utilisateurs (CRUD)
 * - Gestion du contenu (conseils, techniques)
 * - Statistiques et analytics
 * - Types TypeScript pour la sécurité
 * - Contrôle d'accès basé sur les rôles
 * 
 * @module navigation/AdminNavigator
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import des écrans admin
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminContentScreen from './screens/admin/AdminContentScreen';
import AdminSettingsScreen from './screens/admin/AdminSettingsScreen';
import AdminUserDetailScreen from './screens/admin/AdminUserDetailScreen';
import AdminContentDetailScreen from './screens/admin/AdminContentDetailScreen';

// Import des types
import { AdminStackParamList, AdminTabParamList } from './types';

// Import des styles et couleurs
import colors from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

// Import des hooks
import { useAuth } from '../hooks/useAuth';

// Création des navigateurs
const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createStackNavigator<AdminStackParamList>();

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Props du composant AdminNavigator
 */
export interface AdminNavigatorProps {
  /** Désactiver les animations */
  disableAnimations?: boolean;
  
  /** Écran initial (par défaut: 'Dashboard') */
  initialRouteName?: keyof AdminTabParamList;
}

// ============================================
// COMPOSANTS D'ICÔNES D'ONGLETS
// ============================================

/**
 * Icône pour l'onglet Dashboard
 */
const DashboardIcon: React.FC<{ focused: boolean; color: string; size: number }> = ({ 
  focused, 
  color, 
  size 
}) => (
  <Icon 
    name={focused ? 'view-dashboard' : 'view-dashboard-outline'} 
    size={size} 
    color={color} 
  />
);

/**
 * Icône pour l'onglet Utilisateurs
 */
const UsersIcon: React.FC<{ focused: boolean; color: string; size: number }> = ({ 
  focused, 
  color, 
  size 
}) => (
  <Icon 
    name={focused ? 'account-group' : 'account-group-outline'} 
    size={size} 
    color={color} 
  />
);

/**
 * Icône pour l'onglet Contenu
 */
const ContentIcon: React.FC<{ focused: boolean; color: string; size: number }> = ({ 
  focused, 
  color, 
  size 
}) => (
  <Icon 
    name={focused ? 'file-document-multiple' : 'file-document-multiple-outline'} 
    size={size} 
    color={color} 
  />
);

/**
 * Icône pour l'onglet Paramètres
 */
const SettingsIcon: React.FC<{ focused: boolean; color: string; size: number }> = ({ 
  focused, 
  color, 
  size 
}) => (
  <Icon 
    name={focused ? 'cog' : 'cog-outline'} 
    size={size} 
    color={color} 
  />
);

// ============================================
// OPTIONS DE NAVIGATION
// ============================================

/**
 * Options par défaut pour le Tab Navigator Admin
 */
const defaultTabOptions = ({ route }: { route: any }) => {
  const { t } = useTranslation();
  
  const getIcon = () => {
    switch (route.name) {
      case 'Dashboard':
        return DashboardIcon;
      case 'Users':
        return UsersIcon;
      case 'Content':
        return ContentIcon;
      case 'Settings':
        return SettingsIcon;
      default:
        return DashboardIcon;
    }
  };
  
  const getLabel = () => {
    switch (route.name) {
      case 'Dashboard':
        return t('admin_dashboard');
      case 'Users':
        return t('admin_users');
      case 'Content':
        return t('admin_content');
      case 'Settings':
        return t('admin_settings');
      default:
        return '';
    }
  };
  
  const IconComponent = getIcon();
  const label = getLabel();
  
  return {
    tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
      <IconComponent focused={focused} color={color} size={size} />
    ),
    tabBarLabel: label,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.gray[500],
    tabBarStyle: styles.tabBar,
    tabBarLabelStyle: styles.tabBarLabel,
    headerShown: false,
  };
};

/**
 * Options par défaut pour le Stack Navigator Admin
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
// TAB NAVIGATOR ADMIN
// ============================================

/**
 * TabNavigator - Navigation par onglets admin
 */
const TabNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={defaultTabOptions}
      initialRouteName="Dashboard"
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: t('admin_dashboard'),
        }}
      />
      <Tab.Screen 
        name="Users" 
        component={AdminUsersScreen}
        options={{
          tabBarLabel: t('admin_users'),
        }}
      />
      <Tab.Screen 
        name="Content" 
        component={AdminContentScreen}
        options={{
          tabBarLabel: t('admin_content'),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={AdminSettingsScreen}
        options={{
          tabBarLabel: t('admin_settings'),
        }}
      />
    </Tab.Navigator>
  );
};

// ============================================
// STACK NAVIGATOR ADMIN
// ============================================

/**
 * AdminNavigator - Navigateur principal admin
 * 
 * Vérifie les droits d'administrateur avant d'accorder l'accès
 */
const AdminNavigator: React.FC<AdminNavigatorProps> = ({
  disableAnimations = false,
  initialRouteName = 'Dashboard',
}) => {
  const { isAdmin, isAuthenticated } = useAuth();
  
  // Rediriger si l'utilisateur n'est pas administrateur
  if (!isAuthenticated || !isAdmin()) {
    return (
      <View style={styles.accessDenied}>
        <Icon name="lock" size={64} color={colors.error} />
        <Text style={styles.accessDeniedText}>Accès refusé</Text>
        <Text style={styles.accessDeniedSubtext}>
          Cette section est réservée aux administrateurs
        </Text>
      </View>
    );
  }
  
  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackOptions,
      }}
    >
      {/* Onglets principaux admin */}
      <Stack.Screen
        name="AdminTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Écrans de détail */}
      <Stack.Screen
        name="UserDetail"
        component={AdminUserDetailScreen}
        options={({ route }) => ({
          title: 'Détail utilisateur',
          headerShown: true,
        })}
      />
      
      <Stack.Screen
        name="ContentDetail"
        component={AdminContentDetailScreen}
        options={({ route }) => ({
          title: 'Détail contenu',
          headerShown: true,
        })}
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
  backIcon: {
    marginLeft: spacing.md,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  accessDeniedText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginTop: spacing.md,
  },
  accessDeniedSubtext: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default AdminNavigator;
