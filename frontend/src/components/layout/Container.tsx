/**
 * Composant Container - Sènè Yiriwa
 * 
 * Ce composant fournit un conteneur de mise en page réutilisable,
 * adapté aux besoins des agriculteurs maliens.
 * 
 * Fonctionnalités :
 * - Padding uniforme ou personnalisable
 * - Centrage du contenu
 * - Scroll automatique (KeyboardAwareScrollView)
 * - Gestion du fond d'écran
 * - Multiples variantes (principal, carte, modal)
 * - Support des safe areas
 * - Animation lors de l'apparition
 * - Barre de défilement personnalisable
 * 
 * @module components/layout/Container
 */

/// <reference path="../../types/react-native-keyboard-aware-scroll-view.d.ts" />

import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../styles/colors';
import { spacing } from '../../styles/spacing';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Variantes de conteneur
 */
export type ContainerVariant = 
  | 'default'      // Fond clair standard
  | 'primary'      // Fond vert principal
  | 'secondary'    // Fond secondaire
  | 'card'         // Style carte avec ombre
  | 'modal'        // Style modal (fond sombre)
  | 'transparent'; // Fond transparent

/**
 * Mode de défilement
 */
export type ScrollMode = 
  | 'none'      // Pas de défilement
  | 'normal'    // ScrollView standard
  | 'keyboard'  // KeyboardAwareScrollView (recommended)
  | 'vertical'; // ScrollView vertical uniquement

/**
 * Props du composant Container
 */
export interface ContainerProps {
  /** Contenu du conteneur */
  children: ReactNode;
  
  /** Variante de style */
  variant?: ContainerVariant;
  
  /** Mode de défilement */
  scrollMode?: ScrollMode;
  
  /** Indique si le contenu doit être centré verticalement */
  centerVertically?: boolean;
  
  /** Indique si le contenu doit être centré horizontalement */
  centerHorizontally?: boolean;
  
  /** Padding personnalisé (écrase les valeurs par défaut) */
  padding?: number | keyof typeof spacing;
  
  /** Padding horizontal */
  paddingHorizontal?: number;
  
  /** Padding vertical */
  paddingVertical?: number;
  
  /** Padding en haut */
  paddingTop?: number;
  
  /** Padding en bas */
  paddingBottom?: number;
  
  /** Padding à gauche */
  paddingLeft?: number;
  
  /** Padding à droite */
  paddingRight?: number;
  
  /** Marge personnalisée */
  margin?: number;
  
  /** Marge horizontale */
  marginHorizontal?: number;
  
  /** Marge verticale */
  marginVertical?: number;
  
  /** Couleur de fond personnalisée */
  backgroundColor?: string;
  
  /** Largeur personnalisée */
  width?: number | string;
  
  /** Hauteur personnalisée */
  height?: number | string;
  
  /** Bordures arrondies */
  borderRadius?: number;
  
  /** Ombre portée */
  withShadow?: boolean;
  
  /** Bordure */
  withBorder?: boolean;
  
  /** Couleur de la bordure */
  borderColor?: string;
  
  /** Taille de la bordure */
  borderWidth?: number;
  
  /** Support du safe area */
  safeArea?: boolean;
  
  /** Couleur de la barre de statut */
  statusBarColor?: string;
  
  /** Style de la barre de statut */
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  
  /** Animation d'apparition */
  animated?: boolean;
  
  /** Délai de l'animation */
  animationDelay?: number;
  
  /** Pull to refresh (ScrollMode normal uniquement) */
  refreshing?: boolean;
  
  /** Fonction de rappel pour le refresh */
  onRefresh?: () => void;
  
  /** Couleur du refresh indicator */
  refreshColors?: string[];
  
  /** Style personnalisé du conteneur principal */
  containerStyle?: ViewStyle;
  
  /** Style personnalisé du conteneur intérieur */
  innerStyle?: ViewStyle;
  
  /** Affiche la barre de défilement */
  showsVerticalScrollIndicator?: boolean;
  
  /** Désactive le bounce du scroll */
  scrollBounces?: boolean;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * Container - Conteneur de mise en page personnalisé
 * 
 * @example
 * // Container simple avec scroll
 * <Container scrollMode="keyboard">
 *   <Text>Contenu</Text>
 * </Container>
 * 
 * @example
 * // Container centré avec fond personnalisé
 * <Container
 *   variant="primary"
 *   centerVertically
 *   centerHorizontally
 *   padding={24}
 * >
 *   <Text>Contenu centré</Text>
 * </Container>
 * 
 * @example
 * // Container avec pull to refresh
 * <Container
 *   scrollMode="normal"
 *   refreshing={isRefreshing}
 *   onRefresh={handleRefresh}
 * >
 *   <ListeConseils />
 * </Container>
 */
const Container: React.FC<ContainerProps> = ({
  children,
  variant = 'default',
  scrollMode = 'none',
  centerVertically = false,
  centerHorizontally = false,
  padding,
  paddingHorizontal,
  paddingVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  margin,
  marginHorizontal,
  marginVertical,
  backgroundColor: customBackgroundColor,
  width,
  height,
  borderRadius,
  withShadow = false,
  withBorder = false,
  borderColor: customBorderColor,
  borderWidth = 1,
  safeArea = true,
  statusBarColor,
  statusBarStyle = 'dark-content',
  animated = false,
  animationDelay = 0,
  refreshing = false,
  onRefresh,
  refreshColors = [colors.primary],
  containerStyle,
  innerStyle,
  showsVerticalScrollIndicator = true,
  scrollBounces = true,
}) => {
  const insets = useSafeAreaInsets();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  /**
   * Gère l'animation d'apparition
   */
  React.useEffect(() => {
    if (animated) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: animationDelay,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [animated, animationDelay]);

  /**
   * Récupère la couleur de fond selon la variante
   */
  const getBackgroundColor = (): string => {
    if (customBackgroundColor) return customBackgroundColor;
    
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'card':
        return colors.white;
      case 'modal':
        return 'rgba(0, 0, 0, 0.5)';
      case 'transparent':
        return 'transparent';
      case 'default':
      default:
        return colors.background;
    }
  };

  /**
   * Récupère la couleur de bordure par défaut
   */
  const getBorderColor = (): string => {
    if (customBorderColor) return customBorderColor;
    return colors.gray[200];
  };

  /**
   * Construit le style du conteneur
   */
  const buildContainerStyle = (): ViewStyle => {
    const backgroundColor = getBackgroundColor();
    const borderColor = getBorderColor();

    // Gestion du padding
    const paddingStyles = getPaddingStyles();
    
    // Gestion du margin
    const marginStyles = getMarginStyles();

    // Gestion du centrage
    const justifyContent = centerVertically ? 'center' : 'flex-start';
    const alignItems = centerHorizontally ? 'center' : 'stretch';

    const widthValue = width !== undefined ? width : '100%';
    const heightValue = height !== undefined ? height : '100%';

    return {
      flex: 1,
      backgroundColor,
      width: widthValue as any,
      height: heightValue as any,
      justifyContent,
      alignItems,
      borderRadius: borderRadius || 0,
      ...paddingStyles,
      ...marginStyles,
      ...(withShadow && styles.shadow),
      ...(withBorder && { borderWidth, borderColor }),
    };
  };

  /**
   * Construit les styles de padding
   */
  const getPaddingStyles = (): ViewStyle => {
    const defaultPadding = spacing.md;
    const spacingPadding = typeof padding === 'string' ? spacing[padding] : undefined;
    
    if (typeof padding === 'number') {
      return {
        padding,
        paddingHorizontal: paddingHorizontal ?? padding,
        paddingVertical: paddingVertical ?? padding,
      };
    }
    
    const effectivePadding = spacingPadding ?? defaultPadding;
    return {
      padding: effectivePadding,
      paddingHorizontal: paddingHorizontal ?? effectivePadding,
      paddingVertical: paddingVertical ?? effectivePadding,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
    };
  };

  /**
   * Construit les styles de margin
   */
  const getMarginStyles = (): ViewStyle => {
    if (typeof margin === 'number') {
      return {
        margin,
        marginHorizontal: marginHorizontal ?? margin,
        marginVertical: marginVertical ?? margin,
      };
    }
    
    return {
      margin,
      marginHorizontal,
      marginVertical,
    };
  };

  /**
   * Rendu du contenu intérieur
   */
  const renderInnerContent = () => {
    const innerContentStyle: ViewStyle = {
      flexGrow: 1,
      ...(centerVertically && { justifyContent: 'center' }),
      ...(centerHorizontally && { alignItems: 'center' }),
      ...innerStyle,
    };

    return (
      <View style={innerContentStyle}>
        {children}
      </View>
    );
  };

  /**
   * Rendu avec animation
   */
  const AnimatedView = animated ? Animated.View : View;

  const content = (
    <AnimatedView
      style={[
        buildContainerStyle(),
        animated && { opacity: fadeAnim },
        containerStyle,
      ]}
    >
      {renderInnerContent()}
    </AnimatedView>
  );

  /**
   * Application du safe area
   */
  const wrapWithSafeArea = (component: React.ReactNode) => {
    if (!safeArea) return component;
    
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: getBackgroundColor() }}>
        {component}
      </SafeAreaView>
    );
  };

  /**
   * Application du keyboard avoiding view
   */
  const wrapWithKeyboardAvoiding = (component: React.ReactNode) => {
    if (scrollMode !== 'keyboard') return component;
    
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {component}
      </KeyboardAvoidingView>
    );
  };

  /**
   * Application du scroll
   */
  const wrapWithScroll = (component: React.ReactNode) => {
    if (scrollMode === 'none') return component;
    
    const refreshControl = onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={refreshColors}
        tintColor={colors.primary}
      />
    ) : undefined;

    if (scrollMode === 'keyboard') {
      return (
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          refreshControl={refreshControl}
          enableOnAndroid
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
          bounces={scrollBounces}
        >
          {component}
        </KeyboardAwareScrollView>
      );
    }

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshControl={refreshControl}
        bounces={scrollBounces}
        keyboardShouldPersistTaps="handled"
      >
        {component}
      </ScrollView>
    );
  };

  // Configuration de la barre de statut
  React.useEffect(() => {
    if (statusBarColor) {
      StatusBar.setBackgroundColor(statusBarColor);
    }
    StatusBar.setBarStyle(statusBarStyle);
  }, [statusBarColor, statusBarStyle]);

  // Chaînage des transformations
  let finalComponent: React.ReactNode = content;
  finalComponent = wrapWithScroll(finalComponent);
  finalComponent = wrapWithKeyboardAvoiding(finalComponent);
  finalComponent = wrapWithSafeArea(finalComponent);

  return finalComponent;
};

// ============================================
// COMPOSANTS DÉRIVÉS
// ============================================

/**
 * Container pour écrans avec formulaire
 * Utilise KeyboardAwareScrollView par défaut
 */
export const FormContainer: React.FC<Omit<ContainerProps, 'scrollMode' | 'variant'>> = (props) => (
  <Container {...props} scrollMode="keyboard" variant="default" />
);

/**
 * Container pour cartes et éléments groupés
 */
export const CardContainer: React.FC<Omit<ContainerProps, 'variant' | 'withShadow' | 'withBorder'>> = (props) => (
  <Container
    {...props}
    variant="card"
    withShadow
    withBorder
    borderRadius={12}
    padding={spacing.md}
  />
);

/**
 * Container pour modales
 */
export const ModalContainer: React.FC<Omit<ContainerProps, 'variant' | 'centerVertically' | 'centerHorizontally'>> = (props) => (
  <Container
    {...props}
    variant="modal"
    centerVertically
    centerHorizontally
    safeArea={false}
  />
);

/**
 * Container pour écran d'accueil
 */
export const HomeContainer: React.FC<Omit<ContainerProps, 'variant'>> = (props) => (
  <Container {...props} variant="default" scrollMode="normal" />
);

/**
 * Container pour écrans d'authentification
 */
export const AuthContainer: React.FC<Omit<ContainerProps, 'variant' | 'scrollMode'>> = (props) => (
  <Container
    {...props}
    variant="primary"
    scrollMode="keyboard"
    centerVertically
    centerHorizontally
    statusBarStyle="light-content"
  />
);

/**
 * Container pour écrans de détail
 */
export const DetailContainer: React.FC<Omit<ContainerProps, 'variant'>> = (props) => (
  <Container {...props} variant="card" scrollMode="normal" withShadow />
);

/**
 * Container avec gradient (nécessite react-native-linear-gradient)
 */
export const GradientContainer: React.FC<Omit<ContainerProps, 'variant'> & {
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}> = ({ colors: gradientColors, start, end, children, ...props }) => {
  // Note: Nécessite l'installation de react-native-linear-gradient
  // import LinearGradient from 'react-native-linear-gradient';
  
  const defaultColors = [colors.primary, colors.primaryDark];
  const defaultStart = { x: 0, y: 0 };
  const defaultEnd = { x: 1, y: 1 };

  // Version simplifiée sans LinearGradient (utilise un View normal)
  return (
    <Container {...props} variant="primary">
      {children}
    </Container>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  /**
   * Ombre portée
   */
  shadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default Container;