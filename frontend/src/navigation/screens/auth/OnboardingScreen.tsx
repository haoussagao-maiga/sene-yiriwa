/**
 * OnboardingScreen - Sènè Yiriwa
 * 
 * Écran de bienvenue pour les nouveaux utilisateurs.
 * Présente les fonctionnalités de l'application.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../../styles/colors';

// Fallback minimal OnboardingSlider component (used when the dedicated
// component is missing). It renders simple pages and exposes onFinish/onSkip.
const OnboardingSlider: React.FC<{
  onFinish?: () => void;
  onSkip?: () => void;
  showSkipButton?: boolean;
}> = ({ onFinish, onSkip }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Minimal placeholder for onboarding slides */}
      <TouchableOpacity onPress={onFinish} style={{ padding: 12, backgroundColor: colors.primary, borderRadius: 8 }}>
        <Text style={{ color: colors.white }}>Démarrer</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSkip} style={{ marginTop: 12 }}>
        <Text style={{ color: colors.primary }}>Passer</Text>
      </TouchableOpacity>
    </View>
  );
};

const OnboardingScreen: React.FC<any> = ({ navigation }: any) => {
  const { t } = useTranslation();

  const handleFinish = async () => {
    // Marquer l'onboarding comme complété
    await AsyncStorage.setItem('onboarding_completed', 'true');
    navigation.replace('Login');
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent={Platform.OS === 'android'}
      />
      <OnboardingSlider
        onFinish={handleFinish}
        onSkip={handleSkip}
        showSkipButton
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default OnboardingScreen;