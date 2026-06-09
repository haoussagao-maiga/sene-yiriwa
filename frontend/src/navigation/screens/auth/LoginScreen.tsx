/**
 * LoginScreen - Sènè Yiriwa
 * 
 * Écran de connexion permettant aux utilisateurs de s'authentifier
 * pour accéder à l'application. Il gère la saisie des identifiants,
 * la validation des formulaires et les erreurs d'authentification.
 * 
 * Fonctionnalités :
 * - Formulaire de connexion (email + mot de passe)
 * - Validation des champs en temps réel
 * - Option "Se souvenir de moi"
 * - Lien vers mot de passe oublié
 * - Lien vers l'inscription
 * - Gestion des erreurs d'authentification
 * - État de chargement pendant la connexion
 * - Accessibilité (VoiceOver, TalkBack)
 * - Design adapté aux agriculteurs
 * 
 * @module screens/auth/LoginScreen
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

const { width, height } = Dimensions.get('window');

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour les erreurs du formulaire
 */
interface FormErrors {
  email?: string;
  password?: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * LoginScreen - Écran de connexion
 * 
 * @example
 * // Navigation standard
 * <LoginScreen navigation={navigation} />
 */
interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  
  // État du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  
  // Références pour les inputs
  const passwordInputRef = useRef<any>(null);

  // ============================================
  // ANIMATIONS
  // ============================================

  /**
   * Animation d'entrée de l'écran
   */
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Valide le formulaire de connexion
   * 
   * @returns true si le formulaire est valide
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    // Validation email
    if (!email.trim()) {
      newErrors.email = t('email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('invalid_email');
    }
    
    // Validation mot de passe
    if (!password) {
      newErrors.password = t('password_required');
    } else if (password.length < 6) {
      newErrors.password = t('password_min_length');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, t]);

  /**
   * Réinitialise les erreurs du formulaire
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Gère le changement d'email
   */
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [errors.email]);

  /**
   * Gère le changement de mot de passe
   */
  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [errors.password]);

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Soumet le formulaire de connexion
   */
  const handleLogin = useCallback(async () => {
    // Fermer le clavier
    Keyboard.dismiss();
    
    // Valider le formulaire
    if (!validateForm()) {
      return;
    }
    
    // Tentative de connexion
    const result = await login({ 
      email: email.trim().toLowerCase(), 
      password, 
      rememberMe 
    });
    
    if (!result.success) {
      Alert.alert(
        t('error'),
        result.error || t('login_error'),
        [
          { 
            text: t('ok'), 
            onPress: () => {
              // Focus sur le champ email si l'erreur est liée
              if (result.error?.includes('email')) {
                // focus sur email
              }
            } 
          }
        ]
      );
    }
  }, [email, password, rememberMe, login, validateForm, t]);

  /**
   * Navigation vers l'écran d'inscription
   */
  const handleNavigateToRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  /**
   * Navigation vers l'écran mot de passe oublié
   */
  const handleNavigateToForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  // ============================================
  // RENDU
  // ============================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Logo et titre */}
          <Animated.View style={[styles.header, { transform: [{ scale: logoScale }] }]}>
            <Text style={styles.logo}>🌾</Text>
            <Text style={styles.title}>Sènè Yiriwa</Text>
            <Text style={styles.subtitle}>
              {t('welcome_back')}
            </Text>
          </Animated.View>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Champ Email */}
            <CustomInput
              label={t('email')}
              placeholder="exemple@email.com"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={clearErrors}
              leftIcon="email"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              status={errors.email ? 'error' : 'default'}
              errorMessage={errors.email}
              required
            />

            {/* Champ Mot de passe */}
            <CustomInput
              ref={passwordInputRef}
              label={t('password')}
              type="password"
              placeholder="••••••••"
              value={password}
              onChangeText={handlePasswordChange}
              onBlur={clearErrors}
              leftIcon="lock"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              status={errors.password ? 'error' : 'default'}
              errorMessage={errors.password}
              required
            />

            {/* Option Se souvenir de moi */}
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
              accessibilityLabel={t('remember_me')}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
            >
              <View style={[
                styles.checkbox,
                rememberMe && styles.checkboxChecked
              ]}>
                {rememberMe && <Text style={styles.checkboxMark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>{t('remember_me')}</Text>
            </TouchableOpacity>

            {/* Bouton de connexion */}
            <CustomButton
              title={t('login')}
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              onPress={handleLogin}
              disabled={isLoading}
            />

            {/* Liens */}
            <View style={styles.links}>
              <TouchableOpacity
                onPress={handleNavigateToForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>{t('forgot_password')}</Text>
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>{t('no_account')} </Text>
                <TouchableOpacity
                  onPress={handleNavigateToRegister}
                  activeOpacity={0.7}
                >
                  <Text style={styles.registerLink}>{t('register')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Version de l'application */}
          <Text style={styles.version}>Version 1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    textAlign: 'center',
  },
  form: {
    marginTop: spacing.lg,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxMark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  links: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginBottom: spacing.md,
    textDecorationLine: 'underline',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  registerText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  registerLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
  version: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default LoginScreen;