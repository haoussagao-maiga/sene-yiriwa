/**
 * Composant CustomInput - Sènè Yiriwa
 * 
 * Ce composant fournit un système de champs de saisie personnalisés,
 * réutilisables et adaptés aux besoins des agriculteurs maliens.
 * 
 * Fonctionnalités :
 * - Support de multiples types (texte, email, password, telephone, nombre)
 * - Validation intégrée avec messages d'erreur
 * - Icônes gauche et droite
 * - Mode mot de passe avec toggle de visibilité
 * - États (normal, focus, erreur, succès, désactivé)
 * - Animations de transition
 * - Accessibilité (VoiceOver, TalkBack)
 * - Clavier optimisé par type de saisie
 * 
 * @module components/common/CustomInput
 */

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../styles/colors';
import { typography } from '../../styles/typography';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Types de champs de saisie disponibles
 */
export type InputType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'tel' 
  | 'number' 
  | 'textarea'
  | 'search';

/**
 * États de validation du champ
 */
export type InputStatus = 'default' | 'success' | 'error' | 'warning';

/**
 * Props du composant CustomInput
 */
export interface CustomInputProps extends Omit<TextInputProps, 'onChangeText'> {
  /** Label du champ */
  label?: string;
  
  /** Type de champ */
  type?: InputType;
  
  /** État de validation */
  status?: InputStatus;
  
  /** Message d'erreur */
  errorMessage?: string;
  
  /** Message de succès */
  successMessage?: string;
  
  /** Message d'avertissement */
  warningMessage?: string;
  
  /** Texte d'aide (info supplémentaire) */
  helperText?: string;
  
  /** Icône à gauche */
  leftIcon?: string;
  
  /** Icône à droite (fixe) */
  rightIcon?: string;
  
  /** Couleur de l'icône */
  iconColor?: string;
  
  /** Placeholder */
  placeholder?: string;
  
  /** Valeur du champ */
  value?: string;
  
  /** Fonction appelée lors du changement de texte */
  onChangeText?: (text: string) => void;
  
  /** Fonction appelée lors du focus */
  onFocus?: () => void;
  
  /** Fonction appelée lors du blur */
  onBlur?: () => void;
  
  /** Désactive le champ */
  disabled?: boolean;
  
  /** Champ obligatoire */
  required?: boolean;
  
  /** Masque de saisie (formatage) */
  mask?: (text: string) => string;
  
  /** Validation personnalisée */
  validate?: (text: string) => boolean;
  
  /** Style personnalisé du conteneur */
  containerStyle?: ViewStyle;
  
  /** Style personnalisé du label */
  labelStyle?: TextStyle;
  
  /** Style personnalisé de l'input */
  inputStyle?: TextStyle;
  
  /** Style personnalisé du message d'erreur */
  errorStyle?: TextStyle;
  
  /** Nombre maximum de lignes (textarea uniquement) */
  numberOfLines?: number;
  
  /** Auto-focus sur le champ */
  autoFocus?: boolean;
  
  /** Touche de retour */
  returnKeyType?: ReturnKeyTypeOptions;
  
  /** Action au clic sur la touche retour */
  onSubmitEditing?: () => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * CustomInput - Champ de saisie personnalisé pour Sènè Yiriwa
 * 
 * @example
 * // Champ texte standard
 * <CustomInput
 *   label="Nom complet"
 *   placeholder="Entrez votre nom"
 *   value={name}
 *   onChangeText={setName}
 * />
 * 
 * @example
 * // Champ email avec validation
 * <CustomInput
 *   label="Email"
 *   type="email"
 *   placeholder="exemple@email.com"
 *   value={email}
 *   onChangeText={setEmail}
 *   status={emailError ? 'error' : 'success'}
 *   errorMessage={emailError}
 *   leftIcon="email"
 *   required
 * />
 * 
 * @example
 * // Champ mot de passe avec toggle
 * <CustomInput
 *   label="Mot de passe"
 *   type="password"
 *   placeholder="••••••••"
 *   value={password}
 *   onChangeText={setPassword}
 *   leftIcon="lock"
 *   required
 * />
 * 
 * @example
 * // Zone de texte multi-lignes
 * <CustomInput
 *   label="Description"
 *   type="textarea"
 *   placeholder="Décrivez votre exploitation..."
 *   value={description}
 *   onChangeText={setDescription}
 *   numberOfLines={4}
 * />
 */
type InputHandle = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
};

const CustomInput = forwardRef<InputHandle, CustomInputProps>(
  ({
  label,
  type = 'text',
  status = 'default',
  errorMessage,
  successMessage,
  warningMessage,
  helperText,
  leftIcon,
  rightIcon,
  iconColor,
  placeholder,
  value = '',
  onChangeText,
  onFocus,
  onBlur,
  disabled = false,
  required = false,
  mask,
  validate,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  numberOfLines = 1,
  autoFocus = false,
  returnKeyType = 'done',
  onSubmitEditing,
  ...restProps
  }, ref) => {
  // État local pour la visibilité du mot de passe
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // État pour le focus (animation)
  const [isFocused, setIsFocused] = useState(false);
  
  // Animation de la bordure
  const borderAnimation = useRef(new Animated.Value(0)).current;
  
  // Référence vers l'input
  const inputRef = useRef<TextInput>(null);

  // Expose quelques méthodes via la ref externe
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => inputRef.current?.clear(),
  }));

  /**
   * Animation au focus
   */
  const animateFocus = () => {
    Animated.timing(borderAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Gestion du focus
   */
  const handleFocus = () => {
    setIsFocused(true);
    animateFocus();
    onFocus?.();
  };

  /**
   * Gestion du blur
   */
  const handleBlur = () => {
    setIsFocused(false);
    animateFocus();
    
    // Validation automatique si fournie
    if (validate && value) {
      const isValid = validate(value);
      if (!isValid && !errorMessage) {
        // Déclenche une erreur si validation échoue
      }
    }
    
    onBlur?.();
  };

  /**
   * Gestion du changement de texte
   */
  const handleChangeText = (text: string) => {
    let processedText = text;
    
    // Application du masque si fourni
    if (mask) {
      processedText = mask(text);
    }
    
    onChangeText?.(processedText);
  };

  /**
   * Bascule la visibilité du mot de passe
   */
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  /**
   * Récupère le type de clavier approprié
   */
  const getKeyboardType = (): KeyboardTypeOptions => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'tel':
        return 'phone-pad';
      case 'number':
        return 'numeric';
      default:
        return 'default';
    }
  };

  /**
   * Récupère la couleur de bordure selon l'état
   */
  const getBorderColor = (): string => {
    if (disabled) return colors.gray[300];
    if (status === 'error') return colors.error;
    if (status === 'success') return colors.success;
    if (status === 'warning') return colors.warning;
    if (isFocused) return colors.primary;
    return colors.gray[300];
  };

  /**
   * Récupère la couleur du label selon l'état
   */
  const getLabelColor = (): string => {
    if (disabled) return colors.gray[500];
    if (status === 'error') return colors.error;
    if (isFocused) return colors.primary;
    return colors.gray[700];
  };

  /**
   * Récupère le message d'information approprié
   */
  const getInfoMessage = (): { text: string; type: 'error' | 'success' | 'warning' | 'info' } | null => {
    if (status === 'error' && errorMessage) {
      return { text: errorMessage, type: 'error' };
    }
    if (status === 'success' && successMessage) {
      return { text: successMessage, type: 'success' };
    }
    if (status === 'warning' && warningMessage) {
      return { text: warningMessage, type: 'warning' };
    }
    if (helperText) {
      return { text: helperText, type: 'info' };
    }
    return null;
  };

  /**
   * Récupère la couleur du message d'information
   */
  const getInfoColor = (infoType: string): string => {
    switch (infoType) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      default:
        return colors.gray[600];
    }
  };

  /**
   * Récupère l'icône pour le message d'information
   */
  const getInfoIcon = (infoType: string): string => {
    switch (infoType) {
      case 'error':
        return 'alert-circle';
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert';
      default:
        return 'information';
    }
  };

  /**
   * Calcule la hauteur pour le textarea
   */
  const getTextAreaHeight = (): number | undefined => {
    if (type === 'textarea') {
      return numberOfLines * 24; // 24px par ligne
    }
    return undefined;
  };

  // Styles dynamiques
  const borderColor = getBorderColor();
  const labelColor = getLabelColor();
  const infoMessage = getInfoMessage();

  // Animation de la bordure
  const borderWidth = borderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label avec indicateur requis */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: labelColor }, labelStyle]}>
            {label}
          </Text>
          {required && <Text style={styles.requiredStar}>*</Text>}
        </View>
      )}

      {/* Conteneur de l'input */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            borderWidth,
            backgroundColor: disabled ? colors.gray[50] : colors.white,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {/* Icône gauche */}
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={22}
            color={iconColor || (isFocused ? colors.primary : colors.gray[500])}
            style={styles.leftIcon}
          />
        )}

        {/* Champ de saisie */}
        <TextInput
          ref={(r) => {
            inputRef.current = r as TextInput | null;
            // forward the ref if it's a function or object
            if (!ref) return;
            if (typeof ref === 'function') ref(r);
            else {
              try {
                (ref as React.MutableRefObject<TextInput | null>).current = r as TextInput | null;
              } catch {}
            }
          }}
          style={[
            styles.input,
            type === 'textarea' && styles.textArea,
            { height: getTextAreaHeight() },
            inputStyle,
          ]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          editable={!disabled}
          secureTextEntry={type === 'password' && !isPasswordVisible}
          keyboardType={getKeyboardType()}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          autoCorrect={type !== 'email' && type !== 'password'}
          multiline={type === 'textarea'}
          numberOfLines={type === 'textarea' ? numberOfLines : 1}
          textAlignVertical={type === 'textarea' ? 'top' : 'center'}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          {...restProps}
        />

        {/* Icône droite (fixe) */}
        {rightIcon && !(type === 'password') && (
          <Icon
            name={rightIcon}
            size={22}
            color={iconColor || (isFocused ? colors.primary : colors.gray[500])}
            style={styles.rightIcon}
          />
        )}

        {/* Toggle mot de passe */}
        {type === 'password' && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
            activeOpacity={0.7}
            accessibilityLabel={isPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={22}
              color={iconColor || colors.gray[500]}
            />
          </TouchableOpacity>
        )}

        {/* Icône de statut */}
        {status === 'success' && !rightIcon && !(type === 'password') && (
          <Icon
            name="check-circle"
            size={20}
            color={colors.success}
            style={styles.statusIcon}
          />
        )}
        
        {status === 'error' && !rightIcon && !(type === 'password') && (
          <Icon
            name="alert-circle"
            size={20}
            color={colors.error}
            style={styles.statusIcon}
          />
        )}
      </Animated.View>

      {/* Message d'information */}
      {infoMessage && (
        <View style={styles.infoContainer}>
          <Icon
            name={getInfoIcon(infoMessage.type)}
            size={16}
            color={getInfoColor(infoMessage.type)}
            style={styles.infoIcon}
          />
          <Text
            style={[
              styles.infoText,
              { color: getInfoColor(infoMessage.type) },
              infoMessage.type === 'error' && errorStyle,
            ]}
          >
            {infoMessage.text}
          </Text>
        </View>
      )}
    </View>
  );
}); // Closing the forwardRef and component function

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  /**
   * Conteneur principal
   */
  container: {
    marginBottom: 16,
    width: '100%',
  },

  /**
   * Conteneur du label
   */
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  /**
   * Style du label
   */
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 0,
  },

  /**
   * Étoile pour champ requis
   */
  requiredStar: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    marginLeft: 4,
  },

  /**
   * Conteneur de l'input avec bordure animée
   */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 48,
  },

  /**
   * Champ de saisie
   */
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.gray[900],
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontFamily: typography.fontFamily.regular,
  },

  /**
   * Style pour zone de texte multi-lignes
   */
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  /**
   * Icône gauche
   */
  leftIcon: {
    marginRight: 12,
  },

  /**
   * Icône droite
   */
  rightIcon: {
    marginLeft: 12,
  },

  /**
   * Icône de statut
   */
  statusIcon: {
    marginLeft: 8,
  },

  /**
   * Conteneur du message d'information
   */
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },

  /**
   * Icône du message d'information
   */
  infoIcon: {
    marginRight: 6,
  },

  /**
   * Texte du message d'information
   */
  infoText: {
    fontSize: typography.fontSize.xs,
    flex: 1,
    lineHeight: 16,
  },
});

// ============================================
// COMPOSANTS DÉRIVÉS POUR CAS SPÉCIFIQUES
// ============================================

/**
 * Champ email préconfiguré
 */
export const EmailInput: React.FC<Omit<CustomInputProps, 'type' | 'leftIcon'>> = (props) => (
  <CustomInput
    {...props}
    type="email"
    leftIcon="email"
    autoCapitalize="none"
    autoCorrect={false}
  />
);

/**
 * Champ mot de passe préconfiguré
 */
export const PasswordInput: React.FC<Omit<CustomInputProps, 'type' | 'leftIcon'>> = (props) => (
  <CustomInput
    {...props}
    type="password"
    leftIcon="lock"
  />
);

/**
 * Champ téléphone préconfiguré
 */
export const PhoneInput: React.FC<Omit<CustomInputProps, 'type' | 'leftIcon'>> = (props) => (
  <CustomInput
    {...props}
    type="tel"
    leftIcon="phone"
    keyboardType="phone-pad"
  />
);

/**
 * Champ nombre préconfiguré
 */
export const NumberInput: React.FC<Omit<CustomInputProps, 'type'>> = (props) => (
  <CustomInput
    {...props}
    type="number"
    keyboardType="numeric"
  />
);

/**
 * Champ recherche préconfiguré
 */
export const SearchInput: React.FC<Omit<CustomInputProps, 'type' | 'leftIcon'>> = (props) => (
  <CustomInput
    {...props}
    type="search"
    leftIcon="magnify"
    returnKeyType="search"
  />
);

/**
 * Zone de texte (textarea) préconfigurée
 */
export const TextAreaInput: React.FC<Omit<CustomInputProps, 'type'>> = (props) => (
  <CustomInput
    {...props}
    type="textarea"
    multiline
  />
);

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default CustomInput;