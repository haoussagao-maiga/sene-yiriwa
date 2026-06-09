/**
 * ResetPasswordScreen - Sènè Yiriwa
 * 
 * Écran de réinitialisation du mot de passe permettant aux utilisateurs
 * de définir un nouveau mot de passe après avoir reçu un lien par email.
 * 
 * Fonctionnalités :
 * - Saisie du nouveau mot de passe
 * - Confirmation du mot de passe
 * - Validation de la force du mot de passe
 * - Gestion des erreurs
 * - Indicateur de force du mot de passe
 * - Affichage/masquage du mot de passe
 * - Redirection vers la connexion après succès
 * - Animations fluides
 * 
 * @module screens/auth/ResetPasswordScreen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../hooks/useAuth';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import  colors  from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Niveaux de force du mot de passe
 */
type PasswordStrength = 'weak' | 'medium' | 'strong';

/**
 * Props du composant
 */
interface ResetPasswordScreenProps {
  route: {
    params: {
      token: string;
      email?: string;
    };
  };
  navigation: any;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * ResetPasswordScreen - Écran de réinitialisation du mot de passe
 */
const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ route, navigation }: any) => {
  const { t } = useTranslation();
  const { resetPassword, isLoading } = useAuth();
  
  // Récupération du token depuis les paramètres
  const { token, email } = route.params || {};
  
  // États
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Références
  const passwordInputRef = useRef<any>(null);
  const confirmPasswordInputRef = useRef<any>(null);

  // ============================================
  // ANIMATIONS
  // ============================================

  useEffect(() => {
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
      Animated.spring(scaleAnim, {
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
   * Analyse la force du mot de passe
   */
  const checkPasswordStrength = useCallback((pwd: string): PasswordStrength => {
    if (!pwd) return 'weak';
    
    let score = 0;
    
    // Longueur
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    
    // Complexité
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score >= 4) return 'strong';
    if (score >= 2) return 'medium';
    return 'weak';
  }, []);

  /**
   * Valide le formulaire
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    // Validation du mot de passe
    if (!password) {
      newErrors.password = t('password_required');
    } else if (password.length < 6) {
      newErrors.password = t('password_min_length');
    }
    
    // Validation de la confirmation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('passwords_do_not_match');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [password, confirmPassword, t]);

  /**
   * Met à jour la force du mot de passe
   */
  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setPasswordStrength(checkPasswordStrength(text));
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [checkPasswordStrength, errors.password]);

  /**
   * Met à jour la confirmation du mot de passe
   */
  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  }, [errors.confirmPassword]);

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Réinitialise le mot de passe
   */
  const handleResetPassword = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    
    const result = await resetPassword(token, password, confirmPassword);
    
    if (result.success) {
      setIsSubmitted(true);
      
      // Redirection automatique après 3 secondes
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
    } else {
      Alert.alert(
        t('error'),
        result.error || t('password_reset_error'),
        [{ text: t('ok') }]
      );
    }
  }, [token, password, confirmPassword, resetPassword, validateForm, navigation, t]);

  /**
   * Navigation vers l'écran de connexion
   */
  const handleBackToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  /**
   * Rendu de l'indicateur de force du mot de passe
   */
  const renderPasswordStrengthIndicator = () => {
    const strengthConfig = {
      weak: { text: t('password_weak'), color: colors.error, width: '33%', backgroundColor: colors.error + '15' },
      medium: { text: t('password_medium'), color: colors.warning, width: '66%', backgroundColor: colors.warning + '15' },
      strong: { text: t('password_strong'), color: colors.success, width: '100%', backgroundColor: colors.success + '15' },
    };
    
    const config = strengthConfig[passwordStrength];
    
    if (!password) return null;
    
    return (
      <View style={[styles.strengthContainer, { backgroundColor: config.backgroundColor }]}>
        <View style={styles.strengthBarContainer}>
          <View style={[styles.strengthBar, { backgroundColor: config.color, width: typeof config.width === 'string' ? parseInt(config.width, 10) : config.width }]} />
        </View>
        <Text style={[styles.strengthText, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
    );
  };

  /**
   * Rendu des critères du mot de passe
   */
  const renderPasswordCriteria = () => {
    if (!password) return null;
    
    const criteria = [
      { text: t('password_min_6_chars'), valid: password.length >= 6 },
      { text: t('password_has_uppercase'), valid: /[A-Z]/.test(password) },
      { text: t('password_has_number'), valid: /[0-9]/.test(password) },
      { text: t('password_has_special'), valid: /[^A-Za-z0-9]/.test(password) },
    ];
    
    return (
      <View style={styles.criteriaContainer}>
        {criteria.map((criterion, index) => (
          <View key={index} style={styles.criterionItem}>
            <Icon
              name={criterion.valid ? 'check-circle' : 'circle-outline'}
              size={14}
              color={criterion.valid ? colors.success : colors.gray[400]}
            />
            <Text style={[styles.criterionText, criterion.valid && styles.criterionValid]}>
              {criterion.text}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  /**
   * Rendu du formulaire
   */
  const renderForm = () => (
    <View style={styles.form}>
      {/* Nouveau mot de passe */}
      <CustomInput
        ref={passwordInputRef}
        label={t('new_password')}
        type="password"
        placeholder="••••••••"
        value={password}
        onChangeText={handlePasswordChange}
        leftIcon="lock"
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
        status={errors.password ? 'error' : 'default'}
        errorMessage={errors.password}
        required
      />
      
      {renderPasswordStrengthIndicator()}
      {renderPasswordCriteria()}
      
      {/* Confirmation du mot de passe */}
      <CustomInput
        ref={confirmPasswordInputRef}
        label={t('confirm_new_password')}
        type="password"
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        leftIcon="lock-check"
        returnKeyType="done"
        onSubmitEditing={handleResetPassword}
        status={errors.confirmPassword ? 'error' : 'default'}
        errorMessage={errors.confirmPassword}
        required
      />
      
      <CustomButton
        title={t('reset_password')}
        variant="primary"
        size="large"
        fullWidth
        loading={isLoading}
        onPress={handleResetPassword}
        disabled={isLoading || !password || !confirmPassword}
      />
    </View>
  );

  /**
   * Rendu du message de succès
   */
  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <Animated.View
        style={[
          styles.successIconContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Icon name="check-circle" size={60} color={colors.success} />
      </Animated.View>
      
      <Text style={styles.successTitle}>
        {t('password_reset_success')}
      </Text>
      
      <Text style={styles.successMessage}>
        {t('password_reset_success_message')}
      </Text>
      
      <Text style={styles.redirectText}>
        {t('redirecting_to_login')}...
      </Text>
    </View>
  );

  /**
   * Rendu de l'en-tête
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackToLogin}
        activeOpacity={0.7}
      >
        <Icon name="chevron-left" size={28} color={colors.gray[700]} />
      </TouchableOpacity>
      <Text style={styles.title}>{t('reset_password')}</Text>
    </View>
  );

  /**
   * Rendu du contenu principal
   */
  const renderContent = () => (
    <View style={styles.content}>
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.illustration}>🔒</Text>
        <Text style={styles.subtitle}>
          {isSubmitted ? t('password_updated') : t('reset_password_description')}
        </Text>
        {email && !isSubmitted && (
          <Text style={styles.emailInfo}>
            {t('resetting_password_for')} {email}
          </Text>
        )}
      </Animated.View>
      
      {isSubmitted ? renderSuccess() : renderForm()}
    </View>
  );

  // Vérification du token
  if (!token) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>{t('invalid_reset_link')}</Text>
        <Text style={styles.errorMessage}>{t('invalid_reset_link_message')}</Text>
        <TouchableOpacity style={styles.errorButton} onPress={handleBackToLogin}>
          <Text style={styles.errorButtonText}>{t('back_to_login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ============================================
  // RENDU PRINCIPAL
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
        {renderHeader()}
        {renderContent()}
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
  
  // En-tête
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    textAlign: 'center',
    marginRight: 40,
  },
  
  // Contenu
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  illustration: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  emailInfo: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  
  // Formulaire
  form: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  
  // Indicateur de force
  strengthContainer: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: 8,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: typography.fontSize.xs,
  },
  
  // Critères du mot de passe
  criteriaContainer: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  criterionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  criterionText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  criterionValid: {
    color: colors.success,
  },
  
  // Succès
  successContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  redirectText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  
  // Erreur (token invalide)
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  errorButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  errorButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default ResetPasswordScreen;