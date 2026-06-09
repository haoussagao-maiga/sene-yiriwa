/**
 * ForgotPasswordScreen - Sènè Yiriwa
 * 
 * Écran de réinitialisation du mot de passe permettant aux utilisateurs
 * de demander un lien de réinitialisation par email.
 * 
 * Fonctionnalités :
 * - Saisie de l'email
 * - Validation du format email
 * - Envoi de la demande de réinitialisation
 * - Gestion des erreurs (email non trouvé, réseau, etc.)
 * - Message de confirmation
 * - Navigation vers l'écran de connexion
 * - Animations fluides
 * 
 * @module screens/auth/ForgotPasswordScreen
 */

import React, { useState, useCallback, useRef } from 'react';
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
import colors  from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * ForgotPasswordScreen - Écran de réinitialisation du mot de passe
 */
const ForgotPasswordScreen: React.FC<any> = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { forgotPassword, isLoading } = useAuth();
  
  // États
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Timer pour le compte à rebours
  const countdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================
  // ANIMATIONS
  // ============================================

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Gestion du compte à rebours
  React.useEffect(() => {
    if (countdown > 0) {
      countdownTimer.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (countdownTimer.current) {
        clearTimeout(countdownTimer.current);
      }
    };
  }, [countdown]);

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Valide le format de l'email
   */
  const validateEmail = useCallback((): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      setEmailError(t('email_required'));
      return false;
    }
    
    if (!emailRegex.test(email)) {
      setEmailError(t('invalid_email'));
      return false;
    }
    
    setEmailError('');
    return true;
  }, [email, t]);

  /**
   * Nettoie l'erreur d'email lors de la saisie
   */
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  }, [emailError]);

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Envoie la demande de réinitialisation
   */
  const handleSendResetLink = useCallback(async () => {
    if (!validateEmail()) {
      return;
    }
    
    const result = await forgotPassword(email);
    
    if (result.success) {
      setIsSubmitted(true);
      setResendCount(1);
      setCountdown(60);
    } else {
      Alert.alert(
        t('error'),
        result.error || t('reset_email_error'),
        [{ text: t('ok') }]
      );
    }
  }, [email, forgotPassword, validateEmail, t]);

  /**
   * Renvoie l'email de réinitialisation
   */
  const handleResend = useCallback(async () => {
    if (countdown > 0) return;
    
    const result = await forgotPassword(email);
    
    if (result.success) {
      setResendCount(prev => prev + 1);
      setCountdown(60);
      Alert.alert(
        t('success'),
        t('reset_email_resent'),
        [{ text: t('ok') }]
      );
    }
  }, [email, forgotPassword, countdown, t]);

  /**
   * Navigation vers l'écran de connexion
   */
  const handleBackToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  // ============================================
  // RENDU
  // ============================================

  /**
   * Rendu du formulaire de demande
   */
  const renderResetForm = () => (
    <View style={styles.form}>
      <CustomInput
        label={t('email')}
        placeholder="exemple@email.com"
        value={email}
        onChangeText={handleEmailChange}
        leftIcon="email"
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="done"
        onSubmitEditing={handleSendResetLink}
        status={emailError ? 'error' : 'default'}
        errorMessage={emailError}
        required
      />
      
      <CustomButton
        title={t('send_reset_link')}
        variant="primary"
        size="large"
        fullWidth
        loading={isLoading}
        onPress={handleSendResetLink}
        disabled={isLoading}
      />
    </View>
  );

  /**
   * Rendu du message de confirmation
   */
  const renderConfirmation = () => (
    <View style={styles.confirmationContainer}>
      <Animated.View
        style={[
          styles.successIconContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Icon name="email-check" size={60} color={colors.success} />
      </Animated.View>
      
      <Text style={styles.confirmationTitle}>
        {t('reset_link_sent')}
      </Text>
      
      <Text style={styles.confirmationMessage}>
        {t('reset_link_sent_message', { email })}
      </Text>
      
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          {t('didnt_receive_email')}
        </Text>
        
        {countdown > 0 ? (
          <Text style={styles.countdownText}>
            {t('resend_in')} {countdown}s
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>
              {t('resend_email')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {resendCount > 1 && (
        <Text style={styles.resendInfo}>
          {t('check_spam_folder')}
        </Text>
      )}
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
        <Text style={styles.illustration}>🔐</Text>
        <Text style={styles.subtitle}>
          {isSubmitted ? t('check_your_email') : t('forgot_password_description')}
        </Text>
      </Animated.View>
      
      {isSubmitted ? renderConfirmation() : renderResetForm()}
    </View>
  );

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
        
        {/* Lien de retour */}
        {isSubmitted && (
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={handleBackToLogin}
          >
            <Text style={styles.backToLoginText}>
              {t('back_to_login')}
            </Text>
          </TouchableOpacity>
        )}
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
  
  // Formulaire
  form: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  
  // Confirmation
  confirmationContainer: {
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
  confirmationTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  countdownText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    fontWeight: typography.fontWeight.medium,
  },
  resendLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  resendInfo: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  
  // Lien retour
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
  },
  backToLoginText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default ForgotPasswordScreen;