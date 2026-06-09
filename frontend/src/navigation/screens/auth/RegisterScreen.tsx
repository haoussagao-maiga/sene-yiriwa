/**
 * RegisterScreen - Sènè Yiriwa
 * 
 * Écran d'inscription permettant aux nouveaux utilisateurs de créer
 * un compte pour accéder à l'application. Il gère la saisie des
 * informations personnelles et agricoles, la validation des formulaires
 * et les erreurs d'inscription.
 * 
 * Fonctionnalités :
 * - Formulaire complet (nom, prénom, email, téléphone, mot de passe)
 * - Informations agricoles optionnelles (culture, superficie, localisation)
 * - Validation en temps réel des champs
 * - Conditions d'utilisation
 * - Téléphone au format Mali (automatique)
 * - Mot de passe avec force indicator
 * - Gestion des erreurs d'inscription
 * - État de chargement
 * - Accessibilité (VoiceOver, TalkBack)
 * - Design adapté aux agriculteurs
 * 
 * @module screens/auth/RegisterScreen
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';
// Local validators fallback (copiés depuis `src/utils/validators.ts`)
const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const re = /^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/;
  return re.test(email.trim());
};

const validatePassword = (password: string): boolean => {
  if (!password) return false;
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
};

const validatePhoneMali = (phone: string): boolean => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 8) return true;
  if (digits.length === 11 && digits.startsWith('223')) return true;
  return false;
};

const maskPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  let core = digits;
  if (digits.length === 11 && digits.startsWith('223')) {
    core = digits.slice(3);
  }
  if (core.length === 8) {
    return `+223 ${core.slice(0,2)} ${core.slice(2,4)} ${core.slice(4)}`;
  }
  return digits.replace(/(\d{1,3})(?=(\d{3})+$)/g, '$1 ');
};

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour les données du formulaire
 */
interface RegisterFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  confirmPassword: string;
  cultureType?: string;
  superficie?: string;
  region?: string;
}

/**
 * Interface pour les erreurs du formulaire
 */
interface FormErrors {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  password?: string;
  confirmPassword?: string;
  cultureType?: string;
  superficie?: string;
  region?: string;
  terms?: string;
}

/**
 * Niveaux de force du mot de passe
 */
type PasswordStrength = 'weak' | 'medium' | 'strong';

// ============================================
// CONSTANTES
// ============================================

/**
 * Liste des régions du Mali
 */
const MALI_REGIONS = [
  'Bamako',
  'Sikasso',
  'Koulikoro',
  'Mopti',
  'Ségou',
  'Kayes',
  'Gao',
  'Tombouctou',
  'Kidal',
  'Taoudénit',
  'Ménaka',
];

/**
 * Liste des cultures principales
 */
const CROP_TYPES = [
  'mil',
  'sorgho',
  'mais',
  'riz',
  'coton',
  'arachide',
  'niebe',
  'manioc',
  'igname',
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * RegisterScreen - Écran d'inscription
 * 
 * @example
 * // Navigation standard
 * <RegisterScreen navigation={navigation} />
 */
interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { register, isLoading } = useAuth();
  
  // État du formulaire
  const [formData, setFormData] = useState<RegisterFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    cultureType: '',
    superficie: '',
    region: '',
  });
  
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showAgriculturalInfo, setShowAgriculturalInfo] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Références pour les inputs
  const inputsRef = useRef<{ [key: string]: any }>({});

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
   * Met à jour la force du mot de passe
   */
  const handlePasswordChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, password: text }));
    setPasswordStrength(checkPasswordStrength(text));
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [checkPasswordStrength]);

  /**
   * Valide le formulaire complet
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    // Nom
    if (!formData.nom.trim()) {
      newErrors.nom = t('name_required');
    }
    
    // Prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = t('name_required');
    }
    
    // Email
    if (!formData.email.trim()) {
      newErrors.email = t('email_required');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('invalid_email');
    }
    
    // Téléphone
    if (!formData.telephone.trim()) {
      newErrors.telephone = t('phone_required');
    } else if (!validatePhoneMali(formData.telephone)) {
      newErrors.telephone = t('invalid_phone');
    }
    
    // Mot de passe
    if (!formData.password) {
      newErrors.password = t('password_required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('password_min_length');
    }
    
    // Confirmation mot de passe
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwords_do_not_match');
    }
    
    // Superficie (si renseignée)
    if (formData.superficie && isNaN(Number(formData.superficie))) {
      newErrors.superficie = t('must_be_number');
    } else if (formData.superficie && Number(formData.superficie) <= 0) {
      newErrors.superficie = t('must_be_positive');
    }
    
    // Conditions d'utilisation
    if (!acceptTerms) {
      newErrors.terms = t('accept_terms_required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, acceptTerms, t]);

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Soumet le formulaire d'inscription
   */
  const handleRegister = useCallback(async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      // Faire défiler jusqu'au premier champ en erreur
      const firstError = Object.keys(errors)[0];
      if (firstError && inputsRef.current[firstError]) {
        inputsRef.current[firstError].focus();
      }
      return;
    }
    
    const result = await register({
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      email: formData.email.trim().toLowerCase(),
      telephone: formData.telephone.replace(/\s/g, ''),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      acceptTerms,
      cultureType: formData.cultureType,
      superficie: formData.superficie ? parseFloat(formData.superficie) : undefined,
      localisation: formData.region ? { region: formData.region } : undefined,
    });
    
    if (!result.success) {
      Alert.alert(t('error'), result.error || t('register_error'));
    }
  }, [formData, acceptTerms, register, validateForm, t]);

  /**
   * Navigation vers l'écran de connexion
   */
  const handleNavigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  /**
   * Gère le changement de téléphone avec masque
   */
  const handlePhoneChange = useCallback((text: string) => {
    const masked = maskPhoneNumber(text);
    setFormData(prev => ({ ...prev, telephone: masked }));
    if (errors.telephone) {
      setErrors(prev => ({ ...prev, telephone: undefined }));
    }
  }, [errors.telephone]);

  // ============================================
  // RENDU DES COMPOSANTS SPÉCIFIQUES
  // ============================================

  /**
   * Affiche l'indicateur de force du mot de passe
   */
  const renderPasswordStrengthIndicator = () => {
    const strengthConfig = {
      weak: { text: t('password_weak'), color: colors.error, width: '33%' },
      medium: { text: t('password_medium'), color: colors.warning, width: '66%' },
      strong: { text: t('password_strong'), color: colors.success, width: '100%' },
    };
    
    const config = strengthConfig[passwordStrength];
    
    if (!formData.password) return null;
    
    return (
      <View style={styles.strengthContainer}>
        <View style={styles.strengthBarContainer}>
          <View style={[styles.strengthBar, { backgroundColor: config.color, width: typeof config.width === 'string' ? parseInt(config.width) : config.width }]} />
        </View>
        <Text style={[styles.strengthText, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
    );
  };

  /**
   * Affiche les informations agricoles optionnelles
   */
  const renderAgriculturalInfo = () => (
    <Animated.View style={styles.agriculturalSection}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setShowAgriculturalInfo(!showAgriculturalInfo)}
      >
        <Text style={styles.sectionTitle}>{t('agricultural_info')}</Text>
        <Text style={styles.sectionToggle}>{showAgriculturalInfo ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      
      {showAgriculturalInfo && (
        <View style={styles.agriculturalContent}>
          {/* Type de culture */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>{t('crop_type')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.cropChips}>
                {CROP_TYPES.map((crop) => (
                  <TouchableOpacity
                    key={crop}
                    style={[
                      styles.cropChip,
                      formData.cultureType === crop && styles.cropChipActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, cultureType: crop }))}
                  >
                    <Text style={[
                      styles.cropChipText,
                      formData.cultureType === crop && styles.cropChipTextActive,
                    ]}>
                      {t(crop)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          
          {/* Superficie */}
          <CustomInput
            label={t('field_size')}
            placeholder="Ex: 5.5"
            value={formData.superficie}
            onChangeText={(text) => setFormData(prev => ({ ...prev, superficie: text }))}
            leftIcon="ruler-square"
            keyboardType="numeric"
            status={errors.superficie ? 'error' : 'default'}
            errorMessage={errors.superficie}
          />
          
          {/* Région */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>{t('region')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.regionChips}>
                {MALI_REGIONS.map((region) => (
                  <TouchableOpacity
                    key={region}
                    style={[
                      styles.regionChip,
                      formData.region === region && styles.regionChipActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, region }))}
                  >
                    <Text style={[
                      styles.regionChipText,
                      formData.region === region && styles.regionChipTextActive,
                    ]}>
                      {region}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </Animated.View>
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
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* En-tête */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('create_account')}</Text>
            <Text style={styles.subtitle}>{t('join_community')}</Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Nom */}
            <CustomInput
              ref={(r) => { inputsRef.current.nom = r; }}
              label={t('last_name')}
              placeholder="Diallo"
              value={formData.nom}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nom: text }))}
              leftIcon="account"
              returnKeyType="next"
              onSubmitEditing={() => inputsRef.current.prenom?.focus()}
              status={errors.nom ? 'error' : 'default'}
              errorMessage={errors.nom}
              required
            />

            {/* Prénom */}
            <CustomInput
              ref={(r) => { inputsRef.current.prenom = r; }}
              label={t('first_name')}
              placeholder="Mamadou"
              value={formData.prenom}
              onChangeText={(text) => setFormData(prev => ({ ...prev, prenom: text }))}
              leftIcon="account"
              returnKeyType="next"
              onSubmitEditing={() => inputsRef.current.email?.focus()}
              status={errors.prenom ? 'error' : 'default'}
              errorMessage={errors.prenom}
              required
            />

            {/* Email */}
            <CustomInput
              ref={(r) => { inputsRef.current.email = r; }}
              label={t('email')}
              placeholder="exemple@email.com"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              leftIcon="email"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => inputsRef.current.telephone?.focus()}
              status={errors.email ? 'error' : 'default'}
              errorMessage={errors.email}
              required
            />

            {/* Téléphone */}
            <CustomInput
              ref={(ref) => { inputsRef.current.telephone = ref; }}
              label={t('phone')}
              placeholder="77 12 34 56 7"
              value={formData.telephone}
              onChangeText={handlePhoneChange}
              leftIcon="phone"
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => inputsRef.current.password?.focus()}
              status={errors.telephone ? 'error' : 'default'}
              errorMessage={errors.telephone}
              helperText={t('phone_format_helper')}
              required
            />

            {/* Mot de passe */}
            <CustomInput
              ref={(ref) => { inputsRef.current.password = ref; }}
              label={t('password')}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChangeText={handlePasswordChange}
              leftIcon="lock"
              returnKeyType="next"
              onSubmitEditing={() => inputsRef.current.confirmPassword?.focus()}
              status={errors.password ? 'error' : 'default'}
              errorMessage={errors.password}
              required
            />
            
            {/* Indicateur de force du mot de passe */}
            {renderPasswordStrengthIndicator()}

            {/* Confirmation mot de passe */}
            <CustomInput
              ref={(ref) => { inputsRef.current.confirmPassword = ref; }}
              label={t('confirm_password')}
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
              leftIcon="lock-check"
              returnKeyType="next"
              onSubmitEditing={() => setShowAgriculturalInfo(true)}
              status={errors.confirmPassword ? 'error' : 'default'}
              errorMessage={errors.confirmPassword}
              required
            />

            {/* Informations agricoles (optionnelles) */}
            {renderAgriculturalInfo()}

            {/* Conditions d'utilisation */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Text style={styles.checkboxMark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                {t('accept_terms')}{' '}
                <Text style={styles.termsLink} onPress={() => {}}>
                  {t('terms')}
                </Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            {/* Bouton d'inscription */}
            <CustomButton
              title={t('register')}
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              onPress={handleRegister}
              disabled={isLoading}
            />

            {/* Lien vers connexion */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={handleNavigateToLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>
                {t('already_account')} {t('login')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Version */}
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
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    textAlign: 'center',
  },
  form: {
    marginTop: spacing.md,
  },
  strengthContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  agriculturalSection: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },
  sectionToggle: {
    fontSize: 16,
    color: colors.gray[500],
  },
  agriculturalContent: {
    marginTop: spacing.md,
  },
  pickerContainer: {
    marginBottom: spacing.md,
  },
  pickerLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  cropChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cropChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    marginRight: spacing.sm,
  },
  cropChipActive: {
    backgroundColor: colors.primary,
  },
  cropChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  cropChipTextActive: {
    color: colors.white,
  },
  regionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  regionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  regionChipActive: {
    backgroundColor: colors.secondary,
  },
  regionChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  regionChipTextActive: {
    color: colors.white,
  },
  termsContainer: {
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
  termsText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    flex: 1,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  loginLinkText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
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

export default RegisterScreen;
