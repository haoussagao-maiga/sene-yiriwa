/**
 * Composant WeatherIcon - Sènè Yiriwa
 * 
 * Ce composant affiche l'icône météo appropriée en fonction des conditions
 * météorologiques. Il supporte différents codes météo et fournit des
 * icônes claires et reconnaissables pour les agriculteurs maliens.
 * 
 * Fonctionnalités :
 * - Mapping complet des codes météo vers icônes MaterialCommunityIcons
 * - Support des conditions spécifiques à l'Afrique de l'Ouest (harmattan, etc.)
 * - Animation optionnelle pour certaines conditions
 * - Tailles personnalisables
 * - Couleurs adaptables
 * - Mode jour/nuit automatique
 * 
 * @module components/weather/WeatherIcon
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../styles/colors';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Codes des conditions météorologiques
 * Basé sur les standards OpenWeatherMap et adapté pour le Mali
 */
export type WeatherConditionCode = 
  | 'clear_sky'           // Ciel dégagé (jour)
  | 'clear_sky_night'     // Ciel dégagé (nuit)
  | 'few_clouds'          // Peu nuageux (11-25%)
  | 'few_clouds_night'    // Peu nuageux nuit
  | 'scattered_clouds'    // Nuages épars (25-50%)
  | 'broken_clouds'       // Nuageux (51-84%)
  | 'overcast'            // Couvert (85-100%)
  | 'light_rain'          // Pluie légère
  | 'moderate_rain'       // Pluie modérée
  | 'heavy_rain'          // Fortes pluies
  | 'extreme_rain'        // Pluies torrentielles
  | 'thunderstorm'        // Orage
  | 'heavy_thunderstorm'  // Orage violent
  | 'drizzle'             // Bruine
  | 'snow'                // Neige (rare au Mali)
  | 'mist'                // Brume
  | 'fog'                 // Brouillard
  | 'haze'                // Brume sèche
  | 'dust'                // Poussière
  | 'sand'                // Sable (harmattan)
  | 'harmattan'           // Harmattan (spécifique Afrique)
  | 'tornado'             // Tornade
  | 'hurricane'           // Ouragan/cyclone
  | 'hot'                 // Très chaud
  | 'cold'                // Froid
  | 'windy'               // Venteux
  | 'strong_wind'         // Vent fort
  | 'drought'             // Sécheresse
  | 'sunny'               // Ensoleillé (alias)
  | 'rain'                // Pluie (alias)
  | 'cloudy';             // Nuageux (alias)

/**
 * Animateur d'icône
 */
export type IconAnimator = 'none' | 'rotate' | 'pulse' | 'bounce' | 'shake';

/**
 * Props du composant WeatherIcon
 */
export interface WeatherIconProps {
  /** Code de condition météo */
  conditionCode: WeatherConditionCode | string;
  
  /** Taille de l'icône en pixels (défaut: 48) */
  size?: number;
  
  /** Couleur de l'icône (défaut: couleur primaire) */
  color?: string;
  
  /** Couleur de fond (optionnel) */
  backgroundColor?: string;
  
  /** Ajoute un contour circulaire autour de l'icône */
  circular?: boolean;
  
  /** Affiche une ombre portée */
  withShadow?: boolean;
  
  /** Type d'animation */
  animated?: boolean;
  
  /** Type d'animateur */
  animator?: IconAnimator;
  
  /** Indique s'il fait nuit (pour adaptation jour/nuit) */
  isNight?: boolean;
  
  /** Style personnalisé du conteneur */
  containerStyle?: ViewStyle;
  
  /** Affiche le texte de la condition (petit texte sous l'icône) */
  showLabel?: boolean;
  
  /** Label personnalisé (défaut: traduction du code) */
  label?: string;
  
  /** Taille du texte du label */
  labelSize?: number;
}

// ============================================
// MAPPING DES CONDITIONS
// ============================================

/**
 * Mapping des conditions météo vers les icônes MaterialCommunityIcons
 * 
 * Chaque condition peut avoir une icône spécifique pour le jour et la nuit
 */
const weatherIconMap: Record<string, { day: string; night: string; label: string }> = {
  // Ciel clair
  clear_sky: { day: 'weather-sunny', night: 'weather-night', label: 'Ciel dégagé' },
  sunny: { day: 'weather-sunny', night: 'weather-night', label: 'Ensoleillé' },
  
  // Nuages
  few_clouds: { day: 'weather-partly-cloudy', night: 'weather-night-partly-cloudy', label: 'Peu nuageux' },
  scattered_clouds: { day: 'weather-cloudy', night: 'weather-night-cloudy', label: 'Nuages épars' },
  broken_clouds: { day: 'weather-cloudy', night: 'weather-night-cloudy', label: 'Nuageux' },
  overcast: { day: 'weather-overcast', night: 'weather-night-overcast', label: 'Couvert' },
  cloudy: { day: 'weather-cloudy', night: 'weather-night-cloudy', label: 'Nuageux' },
  
  // Pluie
  light_rain: { day: 'weather-rainy', night: 'weather-night-rainy', label: 'Pluie légère' },
  moderate_rain: { day: 'weather-pouring', night: 'weather-night-pouring', label: 'Pluie modérée' },
  heavy_rain: { day: 'weather-pouring', night: 'weather-night-pouring', label: 'Fortes pluies' },
  extreme_rain: { day: 'weather-pouring', night: 'weather-night-pouring', label: 'Pluies torrentielles' },
  drizzle: { day: 'weather-rainy', night: 'weather-night-rainy', label: 'Bruine' },
  rain: { day: 'weather-rainy', night: 'weather-night-rainy', label: 'Pluie' },
  
  // Orages
  thunderstorm: { day: 'weather-lightning', night: 'weather-lightning', label: 'Orage' },
  heavy_thunderstorm: { day: 'weather-lightning-rainy', night: 'weather-lightning-rainy', label: 'Orage violent' },
  
  // Neige (rare au Mali mais incluse pour complétude)
  snow: { day: 'weather-snowy', night: 'weather-snowy', label: 'Neige' },
  
  // Brume et brouillard
  mist: { day: 'weather-fog', night: 'weather-fog', label: 'Brume' },
  fog: { day: 'weather-fog', night: 'weather-fog', label: 'Brouillard' },
  haze: { day: 'weather-hazy', night: 'weather-hazy', label: 'Brume sèche' },
  
  // Poussière et sable (harmattan)
  dust: { day: 'weather-dust', night: 'weather-dust', label: 'Poussière' },
  sand: { day: 'weather-sandstorm', night: 'weather-sandstorm', label: 'Sable' },
  harmattan: { day: 'weather-sandstorm', night: 'weather-sandstorm', label: 'Harmattan' },
  
  // Phénomènes extrêmes
  tornado: { day: 'weather-tornado', night: 'weather-tornado', label: 'Tornade' },
  hurricane: { day: 'weather-hurricane', night: 'weather-hurricane', label: 'Cyclone' },
  
  // Température extrême
  hot: { day: 'thermometer-high', night: 'thermometer', label: 'Très chaud' },
  cold: { day: 'thermometer-low', night: 'thermometer', label: 'Froid' },
  
  // Vent
  windy: { day: 'weather-windy', night: 'weather-windy', label: 'Venteux' },
  strong_wind: { day: 'weather-windy-variant', night: 'weather-windy-variant', label: 'Vent fort' },
  
  // Sécheresse
  drought: { day: 'weather-sunny-alert', night: 'weather-sunny-alert', label: 'Sécheresse' },
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * WeatherIcon - Icône météo personnalisée
 * 
 * @example
 * // Usage basique
 * <WeatherIcon conditionCode="sunny" size={64} />
 * 
 * @example
 * // Avec animation
 * <WeatherIcon 
 *   conditionCode="thunderstorm" 
 *   animated 
 *   animator="shake"
 *   size={56}
 * />
 * 
 * @example
 * // Avec fond circulaire pour la météo actuelle
 * <WeatherIcon 
 *   conditionCode="clear_sky" 
 *   circular 
 *   withShadow 
 *   size={80}
 * />
 * 
 * @example
 * // Mode nuit automatique
 * <WeatherIcon 
 *   conditionCode="clear_sky" 
 *   isNight={true}
 *   size={48}
 * />
 */
const WeatherIcon: React.FC<WeatherIconProps> = ({
  conditionCode,
  size = 48,
  color,
  backgroundColor,
  circular = false,
  withShadow = false,
  animated = false,
  animator = 'none',
  isNight = false,
  containerStyle,
  showLabel = false,
  label,
  labelSize = 12,
}) => {
  // États pour l'animation (si animated)
  const [animValue] = React.useState(new Animated.Value(0));

  /**
   * Récupère le nom de l'icône à partir du code condition
   * Gère le mode jour/nuit automatiquement
   */
  const getIconName = (): string => {
    // Nettoyer le code (convertir en minuscules)
    const cleanCode = conditionCode.toLowerCase().trim();
    
    // Vérifier si le code existe dans le mapping
    const mapping = weatherIconMap[cleanCode];
    
    if (mapping) {
      // Utiliser l'icône de nuit si demandé et disponible
      if (isNight && mapping.night !== mapping.day) {
        return mapping.night;
      }
      return mapping.day;
    }
    
    // Codes spécifiques avec préfixe (ex: clear_sky -> clear_sky)
    if (cleanCode.includes('night')) {
      return 'weather-night';
    }
    
    // Code par défaut
    return 'weather-cloudy';
  };

  /**
   * Récupère le label textuel de la condition
   */
  const getLabel = (): string => {
    if (label) return label;
    
    const cleanCode = conditionCode.toLowerCase().trim();
    const mapping = weatherIconMap[cleanCode];
    
    if (mapping) {
      return mapping.label;
    }
    
    // Traduction par défaut
    const defaultLabels: Record<string, string> = {
      clear_sky: 'Ciel dégagé',
      few_clouds: 'Peu nuageux',
      scattered_clouds: 'Nuages épars',
      broken_clouds: 'Nuageux',
      overcast: 'Couvert',
      light_rain: 'Pluie légère',
      moderate_rain: 'Pluie modérée',
      heavy_rain: 'Fortes pluies',
      thunderstorm: 'Orage',
      harmattan: 'Harmattan',
      drought: 'Sécheresse',
    };
    
    return defaultLabels[cleanCode] || conditionCode;
  };

  /**
   * Récupère la couleur par défaut selon la condition
   */
  const getDefaultColor = (): string => {
    if (color) return color;
    
    const cleanCode = conditionCode.toLowerCase().trim();
    
    // Couleurs spécifiques selon les conditions
    const colorMap: Record<string, string> = {
      clear_sky: '#FFB300',      // Jaune soleil
      sunny: '#FFB300',
      hot: '#F44336',             // Rouge chaleur
      cold: '#2196F3',            // Bleu froid
      light_rain: '#4FC3F7',     // Bleu clair pluie
      moderate_rain: '#29B6F6',
      heavy_rain: '#0288D1',
      thunderstorm: '#7C4DFF',   // Violet orage
      harmattan: '#D2B48C',      // Beige sable
      dust: '#D2B48C',
      sand: '#C2A878',
      windy: '#78909C',          // Gris vent
      strong_wind: '#607D8B',
      drought: '#EF6C00',        // Orange sécheresse
    };
    
    if (colorMap[cleanCode]) {
      return colorMap[cleanCode];
    }
    
    // Couleur par défaut selon jour/nuit
    if (isNight) {
      return '#90CAF9';
    }
    
    return colors.primary;
  };

  /**
   * Récupère la couleur de fond pour l'icône circulaire
   */
  const getBackgroundColor = (): string => {
    if (backgroundColor) return backgroundColor;
    
    const iconColor = getDefaultColor();
    // Fond semi-transparent de la même couleur
    return `${iconColor}20`;
  };

  /**
   * Configure l'animation
   */
  React.useEffect(() => {
    if (!animated) return;
    
    let animation: Animated.CompositeAnimation;
    
    switch (animator) {
      case 'rotate':
        animation = Animated.loop(
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        );
        break;
      case 'pulse':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        );
        break;
      case 'bounce':
        animation = Animated.loop(
          Animated.sequence([
            Animated.spring(animValue, {
              toValue: 1,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.spring(animValue, {
              toValue: 0,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }),
          ])
        );
        break;
      case 'shake':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: -1,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
          ])
        );
        break;
      default:
        return;
    }
    
    animation.start();
    
    return () => {
      animation.stop();
    };
  }, [animated, animator]);

  /**
   * Styles d'animation
   */
  const getAnimatedStyle = (): any => {
    if (!animated) return {};
    
    switch (animator) {
      case 'rotate':
        const rotate = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });
        return { transform: [{ rotate }] };
      case 'pulse':
        const scale = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        });
        return { transform: [{ scale }] };
      case 'bounce':
        const bounce = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        });
        return { transform: [{ translateY: bounce }] };
      case 'shake':
        const shakeX = animValue.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-5, 0, 5],
        });
        return { transform: [{ translateX: shakeX }] };
      default:
        return {};
    }
  };

  // Récupération des valeurs
  const iconName = getIconName();
  const iconColor = getDefaultColor();
  const bgColor = getBackgroundColor();
  const labelText = getLabel();

  // Styles du conteneur
  const containerStyles = [
    styles.container,
    circular && styles.circularContainer,
    circular && { backgroundColor: bgColor, width: size * 1.3, height: size * 1.3 },
    withShadow && styles.shadow,
    containerStyle,
  ];

  // Composant icône
  const iconElement = (
    <Icon name={iconName} size={size} color={iconColor} />
  );

  // Version animée
  const animatedIconElement = animated ? (
    <Animated.View style={getAnimatedStyle()}>
      {iconElement}
    </Animated.View>
  ) : iconElement;

  // Version avec label
  if (showLabel) {
    return (
      <View style={containerStyles}>
        {animatedIconElement}
        <Text style={[styles.label, { fontSize: labelSize, color: iconColor }]}>
          {labelText}
        </Text>
      </View>
    );
  }

  return (
    <View style={containerStyles}>
      {animatedIconElement}
    </View>
  );
};

// ============================================
// COMPOSANTS DÉRIVÉS
// ============================================

/**
 * Icône météo pour affichage principal (grande taille)
 */
export const LargeWeatherIcon: React.FC<Omit<WeatherIconProps, 'size'>> = (props) => (
  <WeatherIcon {...props} size={80} circular withShadow />
);

/**
 * Icône météo pour affichage compact (petite taille)
 */
export const SmallWeatherIcon: React.FC<Omit<WeatherIconProps, 'size'>> = (props) => (
  <WeatherIcon {...props} size={32} />
);

/**
 * Icône météo pour alertes (avec animation)
 */
export const AlertWeatherIcon: React.FC<Omit<WeatherIconProps, 'animated' | 'animator'>> = (props) => (
  <WeatherIcon {...props} animated animator="pulse" size={40} />
);

/**
 * Icône météo pour orages (animation shake)
 */
export const ThunderWeatherIcon: React.FC<Omit<WeatherIconProps, 'conditionCode' | 'animated' | 'animator'>> = (props) => (
  <WeatherIcon {...props} conditionCode="thunderstorm" animated animator="shake" size={48} />
);

/**
 * Icône météo pour sécheresse (avec label)
 */
export const DroughtWeatherIcon: React.FC<Omit<WeatherIconProps, 'conditionCode' | 'showLabel'>> = (props) => (
  <WeatherIcon {...props} conditionCode="drought" showLabel size={48} />
);

/**
 * Icône météo pour harmattan (spécifique Afrique)
 */
export const HarmattanWeatherIcon: React.FC<Omit<WeatherIconProps, 'conditionCode'>> = (props) => (
  <WeatherIcon {...props} conditionCode="harmattan" size={48} />
);

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Convertit un code météo OpenWeatherMap vers le format WeatherIcon
 * 
 * @param openWeatherCode - Code météo OpenWeatherMap (ex: 800, 801, etc.)
 * @returns Code WeatherIcon correspondant
 */
export const fromOpenWeatherCode = (openWeatherCode: number): WeatherConditionCode => {
  const mapping: Record<number, WeatherConditionCode> = {
    800: 'clear_sky',           // Ciel dégagé
    801: 'few_clouds',          // 11-25% nuages
    802: 'scattered_clouds',    // 25-50% nuages
    803: 'broken_clouds',       // 51-84% nuages
    804: 'overcast',            // 85-100% nuages
    300: 'drizzle',             // Bruine légère
    301: 'drizzle',             // Bruine
    302: 'drizzle',             // Bruine forte
    500: 'light_rain',          // Pluie légère
    501: 'moderate_rain',       // Pluie modérée
    502: 'heavy_rain',          // Pluie forte
    503: 'extreme_rain',        // Pluie très forte
    504: 'extreme_rain',        // Pluie extrême
    511: 'light_rain',          // Pluie verglaçante
    520: 'light_rain',          // Averses légères
    521: 'moderate_rain',       // Averses modérées
    522: 'heavy_rain',          // Averses fortes
    200: 'thunderstorm',        // Orage avec pluie légère
    201: 'thunderstorm',        // Orage avec pluie
    202: 'heavy_thunderstorm',  // Orage avec pluie forte
    210: 'thunderstorm',        // Orage léger
    211: 'thunderstorm',        // Orage
    212: 'heavy_thunderstorm',  // Orage violent
    221: 'thunderstorm',        // Orage
    600: 'snow',                // Neige légère
    601: 'snow',                // Neige
    602: 'snow',                // Neige forte
    701: 'mist',                // Brume
    711: 'haze',                // Fumée/haze
    721: 'haze',                // Haze
    731: 'dust',                // Poussière/sable
    741: 'fog',                 // Brouillard
    751: 'sand',                // Sable
    761: 'dust',                // Poussière
    762: 'dust',                // Cendres volcaniques
    771: 'strong_wind',         // Rafales
    781: 'tornado',             // Tornade
  };
  
  return mapping[openWeatherCode] || 'cloudy';
};

/**
 * Détermine si le temps est favorable pour l'agriculture
 * 
 * @param conditionCode - Code météo
 * @returns true si favorable
 */
export const isFavorableForFarming = (conditionCode: WeatherConditionCode): boolean => {
  const favorableConditions = [
    'clear_sky', 'few_clouds', 'scattered_clouds',
    'light_rain', 'moderate_rain', 'drizzle'
  ];
  return favorableConditions.includes(conditionCode);
};

/**
 * Obtient la couleur de recommandation pour la condition météo
 * 
 * @param conditionCode - Code météo
 * @returns Code couleur
 */
export const getWeatherRecommendationColor = (conditionCode: WeatherConditionCode): string => {
  if (isFavorableForFarming(conditionCode)) {
    return colors.success;
  }
  
  const riskyConditions = ['heavy_rain', 'thunderstorm', 'strong_wind', 'tornado', 'hurricane'];
  if (riskyConditions.includes(conditionCode)) {
    return colors.error;
  }
  
  const warningConditions = ['overcast', 'cloudy', 'windy', 'harmattan', 'dust', 'sand'];
  if (warningConditions.includes(conditionCode)) {
    return colors.warning;
  }
  
  return colors.info;
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  circularContainer: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  
  shadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  label: {
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default WeatherIcon;
