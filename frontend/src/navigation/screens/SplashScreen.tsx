/**
 * SplashScreen - Sènè Yiriwa
 *
 * Écran de démarrage animé affiché pendant le chargement initial.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const { width, height } = Dimensions.get('window');

const SPLASH_DURATION = 2500;
const MESSAGE_KEYS = [
  'splash_loading_advice',
  'splash_loading_weather',
  'splash_loading_techniques',
  'splash_almost_ready',
] as const;

const SplashScreen: React.FC = () => {
  const { t } = useTranslation();

  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(24)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const [messageIndex, setMessageIndex] = React.useState(0);
  const loadingMessages = useMemo(
    () => MESSAGE_KEYS.map((key) => t(key)),
    [t]
  );

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.primaryDark);
      StatusBar.setTranslucent(false);
    }

    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ringScale, {
        toValue: 1.15,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ringOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: SPLASH_DURATION,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);

    return () => {
      clearInterval(messageInterval);
      pulseLoop.stop();
      floatLoop.stop();
    };
  }, [loadingMessages.length]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={styles.container}>
      {/* Fond dégradé simulé */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />

      {/* Cercles décoratifs */}
      <View style={[styles.decorCircle, styles.decorCircleTopRight]} />
      <View style={[styles.decorCircle, styles.decorCircleBottomLeft]} />
      <View style={[styles.decorCircle, styles.decorCircleCenter]} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoSection,
          {
            opacity: logoOpacity,
            transform: [{ translateY: floatTranslateY }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoRing,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.logoCard,
            {
              transform: [{ scale: Animated.multiply(logoScale, pulseAnim) }],
            },
          ]}
        >
          <Text style={styles.logoEmoji}>🌾</Text>
        </Animated.View>
        <Text style={styles.appName}>{t('app_name')}</Text>
        <Text style={styles.tagline}>{t('splash_subtitle')}</Text>
      </Animated.View>

      {/* Chargement */}
      <Animated.View
        style={[
          styles.loadingSection,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <Text style={styles.loadingMessage}>{loadingMessages[messageIndex]}</Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        <View style={styles.dotsRow}>
          {loadingMessages.map((_, index) => (
            <View
              key={MESSAGE_KEYS[index]}
              style={[
                styles.dot,
                index === messageIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.Text style={[styles.version, { opacity: contentOpacity }]}>
        {t('version')} 1.0.0
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    opacity: 0.92,
  },
  gradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.45,
    backgroundColor: colors.primaryDark,
    opacity: 0.55,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  decorCircleTopRight: {
    width: width * 0.7,
    height: width * 0.7,
    top: -width * 0.25,
    right: -width * 0.2,
  },
  decorCircleBottomLeft: {
    width: width * 0.55,
    height: width * 0.55,
    bottom: -width * 0.15,
    left: -width * 0.2,
  },
  decorCircleCenter: {
    width: width * 0.35,
    height: width * 0.35,
    top: height * 0.18,
    left: -width * 0.12,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl * 1.5,
  },
  logoRing: {
    position: 'absolute',
    top: 8,
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoCard: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 56,
  },
  appName: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.82)',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingSection: {
    width: width * 0.78,
    alignItems: 'center',
  },
  loadingMessage: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    marginBottom: spacing.md,
    minHeight: 20,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.secondary,
  },
  version: {
    position: 'absolute',
    bottom: spacing.lg,
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.45)',
  },
});

export default SplashScreen;
