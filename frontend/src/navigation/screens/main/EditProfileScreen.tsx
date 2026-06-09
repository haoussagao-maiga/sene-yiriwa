/**
 * EditProfileScreen - Sènè Yiriwa
 * 
 * Écran de modification du profil utilisateur permettant de mettre à jour
 * les informations personnelles et agricoles.
 * 
 * Fonctionnalités :
 * - Modification de la photo de profil
 * - Modification des informations personnelles (nom, prénom, téléphone)
 * - Modification de la localisation (région, cercle)
 * - Modification des informations agricoles (culture, superficie)
 * - Validation des formulaires
 * - Upload d'image
 * - Sauvegarde automatique
 * - Animations fluides
 * 
 * @module screens/main/EditProfileScreen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import * as ImagePicker from 'expo-image-picker'; // À installer avec: npm install expo-image-picker
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../../store';
import { updateUserProfile, fetchUserProfile } from '../../../store/slices/userSlice';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import colors from '../../../styles/colors';
import typography from '../../../styles/typography';
import spacing from '../../../styles/spacing';
import { showSuccessMessage, showErrorMessage } from '../../../utils/notifications';
import { validatePhoneMali, maskPhoneNumber } from '../../../utils/validators';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour les données du formulaire
 */
interface ProfileFormData {
  nom: string;
  prenom: string;
  telephone: string;
  bio: string;
  region: string;
  cercle: string;
  cultureType: string;
  superficie: string;
}

/**
 * Type pour les erreurs du formulaire — clé = champ du formulaire
 */
type FormErrors = Partial<Record<keyof ProfileFormData, string>>;

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
 * EditProfileScreen - Écran de modification du profil
 */
interface EditProfileScreenProps {
  navigation: any;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user, token } = useAuth();
  const { loadingProfile } = useAppSelector((state) => state.user);
  
  // États du formulaire
  const [formData, setFormData] = useState<ProfileFormData>({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    telephone: user?.telephone || '',
    bio: user?.bio || '',
    region: user?.localisation?.region || '',
    cercle: user?.localisation?.cercle || '',
    cultureType: user?.cultureType || '',
    superficie: user?.superficie?.toString() || '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [profileImage, setProfileImage] = useState<string | null>((user as any)?.photoProfil || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
   * Valide le formulaire
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = t('name_required');
    }
    
    if (!formData.prenom.trim()) {
      newErrors.prenom = t('name_required');
    }
    
    if (formData.telephone && !validatePhoneMali(formData.telephone)) {
      newErrors.telephone = t('invalid_phone');
    }
    
    if (formData.superficie && isNaN(Number(formData.superficie))) {
      newErrors.superficie = t('must_be_number');
    } else if (formData.superficie && Number(formData.superficie) <= 0) {
      newErrors.superficie = t('must_be_positive');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // ============================================
  // GESTION DE LA PHOTO
  // ============================================

  /**
   * Demande la permission d'accès à la galerie
   */
  // const requestGalleryPermission = useCallback(async (): Promise<boolean> => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert(
  //       t('permission_required'),
  //       t('gallery_permission_message'),
  //       [{ text: t('ok') }]
  //     );
  //     return false;
  //   }
  //   return true;
  // }, [t]);

  /**
   * Demande la permission d'accès à l'appareil photo
   */
  // const requestCameraPermission = useCallback(async (): Promise<boolean> => {
  //   const { status } = await ImagePicker.requestCameraPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert(
  //       t('permission_required'),
  //       t('camera_permission_message'),
  //       [{ text: t('ok') }]
  //     );
  //     return false;
  //   }
  //   return true;
  // }, [t]);

  /**
   * Ouvre la galerie d'images
   */
  // const pickImageFromGallery = useCallback(async () => {
  //   const hasPermission = await requestGalleryPermission();
  //   if (!hasPermission) return;
  //   
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 0.8,
  //   });
  //   
  //   if (!result.canceled && result.assets[0]) {
  //     setProfileImage(result.assets[0].uri);
  //     // Ici, vous pouvez uploader l'image vers votre serveur
  //   }
  // }, [requestGalleryPermission]);

  /**
   * Prend une photo avec l'appareil photo
   */
  // const takePhoto = useCallback(async () => {
  //   const hasPermission = await requestCameraPermission();
  //   if (!hasPermission) return;
  //   
  //   const result = await ImagePicker.launchCameraAsync({
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 0.8,
  //   });
  //   
  //   if (!result.canceled && result.assets[0]) {
  //     setProfileImage(result.assets[0].uri);
  //     // Ici, vous pouvez uploader l'image vers votre serveur
  //   }
  // }, [requestCameraPermission]);

  /**
   * Affiche le menu de sélection de la photo
   */
  const handleChangePhoto = useCallback(() => {
    Alert.alert(
      t('change_photo'),
      t('choose_photo_source'),
      [
        { text: t('cancel'), style: 'cancel' as const },
        { text: t('remove_photo'), style: 'destructive' as const, onPress: () => setProfileImage(null) },
      ]
    );
  }, [t, profileImage]);

  // ============================================
  // SAUVEGARDE
  // ============================================

  /**
   * Sauvegarde les modifications
   */
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const updateData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        telephone: formData.telephone.trim(),
        bio: formData.bio.trim(),
        localisation: {
          region: formData.region,
          cercle: formData.cercle,
        },
        cultureType: formData.cultureType,
        superficie: formData.superficie ? parseFloat(formData.superficie) : undefined,
        photoProfil: profileImage || undefined,
      };
      
      // @ts-ignore
      await dispatch(updateUserProfile({ data: updateData, token })).unwrap();
      
      showSuccessMessage(t('profile_updated'));
      navigation.goBack();
    } catch (error) {
      showErrorMessage(t('profile_update_error'));
    } finally {
      setIsSaving(false);
    }
  }, [formData, profileImage, token, dispatch, navigation, t, validateForm]);

  /**
   * Annule les modifications
   */
  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ============================================
  // GESTION DES CHAMPS
  // ============================================

  const handleFieldChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handlePhoneChange = useCallback((text: string) => {
    const masked = maskPhoneNumber(text);
    setFormData(prev => ({ ...prev, telephone: masked }));
    if (errors.telephone) {
      setErrors(prev => ({ ...prev, telephone: undefined }));
    }
  }, [errors.telephone]);

  // ============================================
  // RENDU
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
        <Text style={styles.headerTitle}>{t('edit_profile')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Photo de profil */}
      <Animated.View
        style={[
          styles.photoSection,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.8}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {formData.prenom?.charAt(0) || ''}{formData.nom?.charAt(0) || ''}
              </Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Icon name="camera" size={20} color={colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>{t('change_photo')}</Text>
      </Animated.View>

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
        {/* Nom */}
        <CustomInput
          label={t('last_name')}
          placeholder="Diallo"
          value={formData.nom}
          onChangeText={(text) => handleFieldChange('nom', text)}
          leftIcon="account"
          status={errors.nom ? 'error' : 'default'}
          errorMessage={errors.nom}
          required
        />

        {/* Prénom */}
        <CustomInput
          label={t('first_name')}
          placeholder="Mamadou"
          value={formData.prenom}
          onChangeText={(text) => handleFieldChange('prenom', text)}
          leftIcon="account"
          status={errors.prenom ? 'error' : 'default'}
          errorMessage={errors.prenom}
          required
        />

        {/* Téléphone */}
        <CustomInput
          label={t('phone')}
          placeholder="77 12 34 56 7"
          value={formData.telephone}
          onChangeText={handlePhoneChange}
          leftIcon="phone"
          keyboardType="phone-pad"
          status={errors.telephone ? 'error' : 'default'}
          errorMessage={errors.telephone}
        />

        {/* Bio */}
        <CustomInput
          label={t('bio')}
          placeholder={t('bio_placeholder')}
          value={formData.bio}
          onChangeText={(text) => handleFieldChange('bio', text)}
          leftIcon="text"
          type="textarea"
          numberOfLines={3}
        />

        {/* Région */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>{t('region')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipsContainer}>
              {MALI_REGIONS.map((region) => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.chip,
                    formData.region === region && styles.chipActive,
                  ]}
                  onPress={() => handleFieldChange('region', region)}
                >
                  <Text style={[
                    styles.chipText,
                    formData.region === region && styles.chipTextActive,
                  ]}>
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Cercle */}
        <CustomInput
          label={t('cercle')}
          placeholder={t('cercle_placeholder')}
          value={formData.cercle}
          onChangeText={(text) => handleFieldChange('cercle', text)}
          leftIcon="map-marker"
        />

        {/* Type de culture */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>{t('crop_type')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipsContainer}>
              {CROP_TYPES.map((crop) => (
                <TouchableOpacity
                  key={crop}
                  style={[
                    styles.chip,
                    formData.cultureType === crop && styles.chipActive,
                  ]}
                  onPress={() => handleFieldChange('cultureType', crop)}
                >
                  <Text style={[
                    styles.chipText,
                    formData.cultureType === crop && styles.chipTextActive,
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
          onChangeText={(text) => handleFieldChange('superficie', text)}
          leftIcon="ruler-square"
          keyboardType="numeric"
          status={errors.superficie ? 'error' : 'default'}
          errorMessage={errors.superficie}
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
            title={t('save')}
            variant="primary"
            size="large"
            loading={isSaving || loadingProfile}
            onPress={handleSave}
            containerStyle={styles.saveButton}
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
  
  // Photo de profil
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  changePhotoText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  
  // Formulaire
  form: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  
  // Picker
  pickerContainer: {
    marginBottom: spacing.md,
  },
  pickerLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  chipTextActive: {
    color: colors.white,
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
  saveButton: {
    flex: 1,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default EditProfileScreen;