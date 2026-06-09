/**
 * Composant SafeAreaWrapper - Sènè Yiriwa
 * 
 * Ce composant fournit une enveloppe sécurisée pour les zones sûres
 * des différents appareils (notch, barre de statut, barre de navigation).
 * Il est essentiel pour une expérience utilisateur cohérente sur tous
 * les appareils iOS et Android.
 * 
 * Fonctionnalités :
 * - Gestion automatique des safe areas (iOS notch, barre d'état)
 * - Support Android Edge-to-Edge
 * - Gestion de la barre de navigation
 * - Mode transparent ou coloré
 * - Customisation par plateforme
 * - Animations lors des changements
 * 
 * @module components/layout/SafeAreaWrapper
 */

import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  StatusBar,
  Platform,
  SafeAreaView as RNSafeAreaView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../styles/colors';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Mode d'affichage de la barre de statut
 */
export type StatusBarMode = 'auto' | 'light' | 'dark';

/**
 * Type de safe area à appliquer
 */
export type SafeAreaType = 
  | 'all'           // Applique aux 4 côtés
  | 'top'           // Applique seulement en haut
  | 'bottom'        // Applique seulement en bas
  | 'horizontal'    // Applique à gauche et droite
  | 'vertical'      // Applique en haut et bas
  | 'none';         // N'applique aucune safe area

/**
 * Props du composant SafeAreaWrapper
 */
export interface SafeAreaWrapperProps {
  /** Contenu à afficher dans l'enveloppe sécurisée */
  children: React.ReactNode;
  
  /** Type de safe area à appliquer */
  safeAreaType?: SafeAreaType;
  
  /** Couleur de fond */
  backgroundColor?: string;
  
  /** Mode de la barre de statut */
  statusBarMode?: StatusBarMode;
  
  /** Couleur de la barre de statut (Android uniquement) */
  statusBarColor?: string;
  
  /** Afficher la barre de statut */
  showStatusBar?: boolean;
  
  /** Style personnalisé du conteneur principal */
  style?: ViewStyle;
  
  /** Style personnalisé du conteneur intérieur */
  contentStyle?: ViewStyle;
  
  /** Utilise le SafeAreaView natif (recommandé) */
  useNativeSafeArea?: boolean;
  
  /** Défaut pour les appareils sans safe area */
  fallbackInsets?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  
  /** Mode de couleur de la barre de statut (déprécié, utilisez statusBarMode) */
  barStyle?: 'light-content' | 'dark-content' | 'default';
  
  /** Transparent (pour fonds avec image) */
  transparent?: boolean;
  
  /** Animation lors du montage */
  animated?: boolean;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * SafeAreaWrapper - Enveloppe sécurisée pour les zones sûres
 * 
 * @example
 * // Wrapper standard
 * <SafeAreaWrapper>
 *   <Header title="Accueil" />
 *   <FlatList data={data} renderItem={renderItem} />
 * </SafeAreaWrapper>
 * 
 * @example
 * // Wrapper avec fond personnalisé
 * <SafeAreaWrapper
 *   backgroundColor={colors.primary}
 *   statusBarMode="light"
 * >
 *   <AuthContent />
 * </SafeAreaWrapper>
 * 
 * @example
 * // Wrapper transparent pour images de fond
 * <SafeAreaWrapper
 *   transparent
 *   statusBarMode="light"
 * >
 *   <ImageBackground source={bgImage}>
 *     <Content />
 *   </ImageBackground>
 * </SafeAreaWrapper>
 * 
 * @example
 * // Wrapper sans safe area en bas (pour tab bars)
 * <SafeAreaWrapper safeAreaType="top">
 *   <ScrollView>
 *     <Content />
 *   </ScrollView>
 * </SafeAreaWrapper>
 */
const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  safeAreaType = 'all',
  backgroundColor,
  statusBarMode = 'auto',
  statusBarColor,
  showStatusBar = true,
  style,
  contentStyle,
  useNativeSafeArea = true,
  fallbackInsets = { top: 0, bottom: 0, left: 0, right: 0 },
  barStyle,
  transparent = false,
  animated = false,
}) => {
  // Récupération des insets de safe area
  const insets = useSafeAreaInsets();
  
  // Animation d'opacité (optionnelle)
  const [fadeAnim] = React.useState(new Animated.Value(0));

  /**
   * Détermine la couleur de fond
   */
  const getBackgroundColor = (): string => {
    if (transparent) return 'transparent';
    if (backgroundColor) return backgroundColor;
    return colors.background;
  };

  /**
   * Détermine le style de la barre de statut
   */
  const getStatusBarStyle = (): 'light-content' | 'dark-content' | 'default' => {
    // Priorité au barStyle pour compatibilité
    if (barStyle) return barStyle;
    
    switch (statusBarMode) {
      case 'light':
        return 'light-content';
      case 'dark':
        return 'dark-content';
      case 'auto':
      default:
        // Auto-détection basée sur la couleur de fond
        const bgColor = getBackgroundColor();
        if (bgColor === colors.primary || bgColor === colors.primaryDark) {
          return 'light-content';
        }
        if (bgColor === colors.white || bgColor === colors.background) {
          return 'dark-content';
        }
        return 'dark-content';
    }
  };

  /**
   * Calcule les paddings basés sur le type de safe area
   */
  const getSafeAreaPadding = (): ViewStyle => {
    const top = safeAreaType === 'all' || safeAreaType === 'top' || safeAreaType === 'vertical'
      ? insets.top
      : fallbackInsets.top;
    
    const bottom = safeAreaType === 'all' || safeAreaType === 'bottom' || safeAreaType === 'vertical'
      ? insets.bottom
      : fallbackInsets.bottom;
    
    const left = safeAreaType === 'all' || safeAreaType === 'horizontal'
      ? insets.left
      : fallbackInsets.left;
    
    const right = safeAreaType === 'all' || safeAreaType === 'horizontal'
      ? insets.right
      : fallbackInsets.right;

    // Si aucune safe area n'est demandée
    if (safeAreaType === 'none') {
      return {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      };
    }

    return {
      paddingTop: top,
      paddingBottom: bottom,
      paddingLeft: left,
      paddingRight: right,
    };
  };

  /**
   * Calcule les marges négatives pour les contenus qui veulent
   * ignorer la safe area (ex: images plein écran)
   */
  const getNegativeMargins = (): ViewStyle => {
    return {
      marginTop: -insets.top,
      marginBottom: -insets.bottom,
      marginLeft: -insets.left,
      marginRight: -insets.right,
    };
  };

  /**
   * Vérifie si l'appareil a un notch
   */
  const hasNotch = (): boolean => {
    return insets.top > 20 || insets.bottom > 0;
  };

  /**
   * Animation d'entrée
   */
  React.useEffect(() => {
    if (animated) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [animated]);

  // Configuration de la barre de statut
  React.useEffect(() => {
    if (!showStatusBar) {
      StatusBar.setHidden(true);
      return;
    }

    StatusBar.setHidden(false);
    
    if (Platform.OS === 'android') {
      // Pour Android, on utilise la couleur fournie ou la couleur de fond
      const finalStatusBarColor = statusBarColor || getBackgroundColor();
      StatusBar.setBackgroundColor(finalStatusBarColor, true);
    }
    
    StatusBar.setBarStyle(getStatusBarStyle());
  }, [showStatusBar, statusBarColor, statusBarMode, barStyle, backgroundColor]);

  // Styles calculés
  const backgroundColorValue = getBackgroundColor();
  const statusBarStyleValue = getStatusBarStyle();
  const safeAreaPadding = getSafeAreaPadding();
  
  // Style du conteneur principal
  const containerStyles: StyleProp<ViewStyle> = [
    styles.container,
    {
      backgroundColor: backgroundColorValue,
    },
    safeAreaPadding,
    !transparent && styles.shadow,
    style,
  ];

  // Style du conteneur animé
  const animatedStyle = animated ? { opacity: fadeAnim } : {};

  // Contenu intérieur
  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  /**
   * Rendu avec SafeAreaView natif (iOS/Android)
   */
  const renderWithNativeSafeArea = () => {
    return (
      <RNSafeAreaView
        style={[
          styles.nativeContainer,
          { backgroundColor: backgroundColorValue },
          style,
        ]}
      >
        {content}
      </RNSafeAreaView>
    );
  };

  /**
   * Rendu avec View personnalisée (plus de contrôle)
   */
  const renderWithCustomView = () => {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: backgroundColorValue,
          },
          safeAreaPadding,
          animatedStyle,
          style,
        ]}
      >
        {content}
      </Animated.View>
    );
  };

  // Affichage de la barre de statut séparée pour Android en mode transparent
  const renderStatusBar = () => {
    if (!showStatusBar) return null;
    
    if (Platform.OS === 'android' && transparent) {
      return (
        <View
          style={[
            styles.androidStatusBar,
            { backgroundColor: 'transparent' },
          ]}
        >
          <StatusBar translucent backgroundColor="transparent" />
        </View>
      );
    }
    
    return <StatusBar translucent={transparent} />;
  };

  // Si transparent, on rend la barre de statut séparément
  if (transparent && Platform.OS === 'android') {
    return (
      <>
        {renderStatusBar()}
        {useNativeSafeArea ? renderWithNativeSafeArea() : renderWithCustomView()}
      </>
    );
  }

  return useNativeSafeArea ? renderWithNativeSafeArea() : renderWithCustomView();
};

// ============================================
// COMPOSANTS DÉRIVÉS
// ============================================

/**
 * Wrapper pour écrans principaux (avec barre de navigation)
 */
export const MainSafeAreaWrapper: React.FC<Omit<SafeAreaWrapperProps, 'safeAreaType'>> = (props) => (
  <SafeAreaWrapper {...props} safeAreaType="all" />
);

/**
 * Wrapper pour écrans avec barre de tabulation
 * (évite le double padding en bas)
 */
export const TabSafeAreaWrapper: React.FC<Omit<SafeAreaWrapperProps, 'safeAreaType'>> = (props) => (
  <SafeAreaWrapper {...props} safeAreaType="top" />
);

/**
 * Wrapper pour modales (sans safe area)
 */
export const ModalSafeAreaWrapper: React.FC<Omit<SafeAreaWrapperProps, 'safeAreaType'>> = (props) => (
  <SafeAreaWrapper {...props} safeAreaType="none" />
);

/**
 * Wrapper pour écrans d'authentification
 * (fond coloré, barre de statut claire)
 */
export const AuthSafeAreaWrapper: React.FC<Omit<SafeAreaWrapperProps, 'backgroundColor' | 'statusBarMode'>> = (props) => (
  <SafeAreaWrapper
    {...props}
    backgroundColor={colors.primary}
    statusBarMode="light"
    safeAreaType="all"
  />
);

/**
 * Wrapper pour écrans avec image de fond
 * (barre de statut transparente)
 */
export const TransparentSafeAreaWrapper: React.FC<Omit<SafeAreaWrapperProps, 'transparent'>> = (props) => (
  <SafeAreaWrapper {...props} transparent safeAreaType="all" />
);

/**
 * Wrapper pour formulaires longs
 * (gère correctement le clavier)
 */
export const FormSafeAreaWrapper: React.FC<SafeAreaWrapperProps> = (props) => (
  <SafeAreaWrapper {...props} safeAreaType="all" />
);

// ============================================
// HOOKS PERSONNALISÉS
// ============================================

/**
 * Hook pour obtenir les dimensions de la safe area
 * 
 * @example
 * const insets = useSafeAreaValues();
 * console.log(`Top inset: ${insets.top}`);
 */
export const useSafeAreaValues = () => {
  const insets = useSafeAreaInsets();
  const hasNotchDevice = insets.top > 20 || insets.bottom > 0;
  
  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    hasNotch: hasNotchDevice,
    // Utile pour les calculs de hauteur
    screenOffset: insets.top + insets.bottom,
  };
};

/**
 * Hook pour créer un style avec safe area
 * 
 * @example
 * const styles = useSafeAreaStyles({
 *   container: {
 *     paddingTop: 20,
 *     paddingBottom: 10,
 *   }
 * });
 */
export const useSafeAreaStyles = <T extends Record<string, ViewStyle>>(
  styles: T
): T => {
  const insets = useSafeAreaInsets();
  
  const enhancedStyles = useMemo(() => {
    const result = { ...styles };
    
    Object.keys(result).forEach((key) => {
      const style = result[key];
      if (style.paddingTop !== undefined) {
        style.paddingTop = (style.paddingTop as number) + insets.top;
      }
      if (style.paddingBottom !== undefined) {
        style.paddingBottom = (style.paddingBottom as number) + insets.bottom;
      }
      if (style.marginTop !== undefined) {
        style.marginTop = (style.marginTop as number) + insets.top;
      }
      if (style.marginBottom !== undefined) {
        style.marginBottom = (style.marginBottom as number) + insets.bottom;
      }
    });
    
    return result;
  }, [styles, insets]);
  
  return enhancedStyles;
};

// ============================================
// COMPOSANT POUR CONTENU PLEIN ÉCRAN
// ============================================

/**
 * Component pour ignorer la safe area (image plein écran, etc.)
 * 
 * @example
 * <IgnoreSafeArea>
 *   <Image source={bgImage} style={{ width: '100%', height: '100%' }} />
 * </IgnoreSafeArea>
 */
export const IgnoreSafeArea: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  const insets = useSafeAreaInsets();
  
  const negativeMargins = {
    marginTop: -insets.top,
    marginBottom: -insets.bottom,
    marginLeft: -insets.left,
    marginRight: -insets.right,
  };
  
  return (
    <View style={[styles.ignoreContainer, negativeMargins, style]}>
      {children}
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  /**
   * Conteneur principal
   */
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  /**
   * Conteneur natif (SafeAreaView)
   */
  nativeContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  /**
   * Contenu intérieur
   */
  content: {
    flex: 1,
  },
  
  /**
   * Ombre (optionnelle)
   */
  shadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  /**
   * Barre de statut Android
   */
  androidStatusBar: {
    height: StatusBar.currentHeight || 0,
    width: '100%',
  },
  
  /**
   * Conteneur pour ignorer la safe area
   */
  ignoreContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

// Import pour Animated
import * as ReactNative from 'react-native';

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default SafeAreaWrapper;