/**
 * ChangePasswordScreen - Sènè Yiriwa
 * 
 * Écran de changement de mot de passe permettant à l'utilisateur connecté
 * de modifier son mot de passe en toute sécurité.
 * 
 * Fonctionnalités :
 * - Saisie du mot de passe actuel
 * - Saisie du nouveau mot de passe
 * - Confirmation du nouveau mot de passe
 * - Validation de la force du mot de passe
 * - Indicateur de force visuel
 * - Critères de mot de passe
 * - Affichage/masquage des mots de passe
 * - Gestion des erreurs
 * - Animations fluides
 * 
 * @module screens/main/ChangePasswordScreen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../hooks/useAuth';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import colors from '../../../styles/colors';
import typography from '../../../styles/typography';
import spacing from '../../../styles/spacing';
import { showSuccessMessage, showErrorMessage } from '../../../utils/notifications';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Niveaux de force du mot de passe
 */
type PasswordStrength = 'weak' | 'medium' | 'strong';

/**
 * Interface pour les erreurs du formulaire
 */
interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * ChangePasswordScreen - Écran de changement de mot de passe
 */
const ChangePasswordScreen: React.FC<any> = ({ navigation }) => {
  const { t } = useTranslation();
  const { changePassword, isLoading } = useAuth();
  
  // États
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Références
  const currentPasswordRef = useRef<any>(null);
  const newPasswordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);

  // ============================================
  // ANIMATIONS
  // ============================================

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
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
  const checkPasswordStrength = useCallback((password: string): PasswordStrength => {
    if (!password) return 'weak';
    
    let score = 0;
    
    // Longueur
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Complexité
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score >= 4) return 'strong';
    if (score >= 2) return 'medium';
    return 'weak';
  }, []);

  /**
   * Valide le formulaire
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    // Validation du mot de passe actuel
    if (!currentPassword) {
      newErrors.currentPassword = t('current_password_required');
    }
    
    // Validation du nouveau mot de passe
    if (!newPassword) {
      newErrors.newPassword = t('new_password_required');
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t('password_min_length');
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = t('password_same_as_current');
    }
    
    // Validation de la confirmation
    if (!confirmPassword) {
      newErrors.confirmPassword = t('confirm_password_required');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('passwords_do_not_match');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentPassword, newPassword, confirmPassword, t]);

  /**
   * Met à jour la force du mot de passe
   */
  const handleNewPasswordChange = useCallback((text: string) => {
    setNewPassword(text);
    setPasswordStrength(checkPasswordStrength(text));
    if (errors.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: undefined }));
    }
  }, [checkPasswordStrength, errors.newPassword]);

  /**
   * Met à jour la confirmation
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
   * Soumet le formulaire
   */
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    
    const result = await changePassword(currentPassword, newPassword, confirmPassword);
    
    if (result.success) {
      showSuccessMessage(t('password_changed_success'));
      navigation.goBack();
    } else {
      showErrorMessage(result.error || t('password_change_error'));
    }
  }, [currentPassword, newPassword, confirmPassword, changePassword, navigation, t, validateForm]);

  /**
   * Annule et retourne à l'écran précédent
   */
  const handleCancel = useCallback(() => {
    navigation.goBack();
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
    
    if (!newPassword) return null;
    
    return (
      <View style={[styles.strengthContainer, { backgroundColor: config.backgroundColor }]}>
        <View style={styles.strengthBarContainer}>
          <View style={[styles.strengthBar, { backgroundColor: config.color, width: config.width as any }]} />
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
    if (!newPassword) return null;
    
    const criteria = [
      { text: t('password_min_6_chars'), valid: newPassword.length >= 6 },
      { text: t('password_has_uppercase'), valid: /[A-Z]/.test(newPassword) },
      { text: t('password_has_number'), valid: /[0-9]/.test(newPassword) },
      { text: t('password_has_special'), valid: /[^A-Za-z0-9]/.test(newPassword) },
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

  // ============================================
  // RENDU PRINCIPAL
  // ============================================

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Icon name="chevron-left" size={28} color={colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('change_password')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Formulaire */}
      <Animated.View
        style={[
          styles.form,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Mot de passe actuel */}
        <CustomInput
          ref={currentPasswordRef}
          label={t('current_password')}
          type="password"
          placeholder="••••••••"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          leftIcon="lock"
          returnKeyType="next"
          onSubmitEditing={() => newPasswordRef.current?.focus()}
          status={errors.currentPassword ? 'error' : 'default'}
          errorMessage={errors.currentPassword}
          required
        />

        {/* Nouveau mot de passe */}
        <CustomInput
          ref={newPasswordRef}
          label={t('new_password')}
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChangeText={handleNewPasswordChange}
          leftIcon="lock-plus"
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          status={errors.newPassword ? 'error' : 'default'}
          errorMessage={errors.newPassword}
          required
        />
        
        {/* Indicateur de force */}
        {renderPasswordStrengthIndicator()}
        
        {/* Critères du mot de passe */}
        {renderPasswordCriteria()}

        {/* Confirmation du nouveau mot de passe */}
        <CustomInput
          ref={confirmPasswordRef}
          label={t('confirm_new_password')}
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          leftIcon="lock-check"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          status={errors.confirmPassword ? 'error' : 'default'}
          errorMessage={errors.confirmPassword}
          required
        />

        {/* Boutons */}
        <View style={styles.buttonsContainer}>
          <CustomButton
            title={t('cancel')}
            variant="outline"
            size="large"
            onPress={handleCancel}
            containerStyle={styles.cancelButton}
          />
          <CustomButton
            title={t('change_password')}
            variant="primary"
            size="large"
            loading={isLoading}
            onPress={handleSubmit}
            containerStyle={styles.submitButton}
          />
        </View>
      </Animated.View>
    </ScrollView>
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
  content: {
    paddingBottom: spacing.xl,
  },
  
  // En-tête
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  
  // Formulaire
  form: {
    padding: spacing.lg,
    gap: spacing.md,
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
  
  // Critères
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
  
  // Boutons
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default ChangePasswordScreen;