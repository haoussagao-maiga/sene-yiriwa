/**
 * HelpScreen - Sènè Yiriwa
 * 
 * Écran d'aide et de support permettant aux utilisateurs d'accéder
 * aux FAQ, tutoriels et de contacter le support.
 * 
 * Fonctionnalités :
 * - FAQ organisée par catégories
 * - Tutoriels vidéo
 * - Contact support (email, téléphone)
 * - Guide d'utilisation
 * - Signalement de problème
 * - Suggestions d'amélioration
 * - Liens utiles
 * - Animations fluides
 * 
 * @module screens/main/HelpScreen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Animated,
  Share,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../../styles/colors';
import typography from '../../../styles/typography';
import spacing from '../../../styles/spacing';
import { showSuccessMessage, showErrorMessage } from '../../../utils/notifications';

// ============================================
// TYPES ET INTERFACES
// ============================================

/**
 * Interface pour une question FAQ
 */
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

/**
 * Interface pour un tutoriel
 */
interface TutorialItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  link: string;
}

/**
 * Interface pour un lien utile
 */
interface UsefulLink {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Questions fréquentes
 */
const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'Comment créer un compte ?',
    answer: 'Pour créer un compte, cliquez sur "S\'inscrire" sur l\'écran d\'accueil. Remplissez le formulaire avec vos informations personnelles et acceptez les conditions d\'utilisation. Une fois inscrit, vous pourrez accéder à toutes les fonctionnalités de l\'application.',
    category: 'compte',
  },
  {
    id: '2',
    question: 'Comment ajouter mon champ ?',
    answer: 'Allez dans l\'onglet "Profil", puis "Mes champs". Cliquez sur le bouton "+" pour ajouter un nouveau champ. Renseignez le nom, la superficie et la localisation. Vous pourrez ensuite suivre les conseils personnalisés pour ce champ.',
    category: 'profil',
  },
  {
    id: '3',
    question: 'Comment fonctionnent les conseils personnalisés ?',
    answer: 'Les conseils sont générés automatiquement en fonction de votre profil (localisation, type de culture, superficie). Ils prennent également en compte la météo locale et la saison. Plus vous renseignez d\'informations sur votre exploitation, plus les conseils seront pertinents.',
    category: 'conseils',
  },
  {
    id: '4',
    question: 'Comment obtenir un certificat ?',
    answer: 'Pour obtenir un certificat, vous devez compléter une technique agricole à 100%. Suivez toutes les étapes de la technique, marquez-les comme complétées, et un certificat sera automatiquement généré. Vous pourrez le télécharger depuis l\'écran de la technique.',
    category: 'techniques',
  },
  {
    id: '5',
    question: 'Comment changer la langue ?',
    answer: 'Allez dans "Paramètres" > "Langue". Vous pouvez choisir entre le français et le bambara. L\'application s\'adaptera automatiquement à la langue sélectionnée.',
    category: 'parametres',
  },
  {
    id: '6',
    question: 'Comment contacter le support ?',
    answer: 'Vous pouvez nous contacter par email à support@seneyiriwa.com ou par téléphone au +223 XX XX XX XX. Nous sommes disponibles du lundi au vendredi de 8h à 17h.',
    category: 'support',
  },
];

/**
 * Tutoriels vidéo
 */
const TUTORIALS: TutorialItem[] = [
  {
    id: '1',
    title: 'Premiers pas',
    description: 'Découvrez comment utiliser l\'application',
    icon: 'play-circle',
    duration: '3:45',
    link: 'https://youtube.com/watch?v=...',
  },
  {
    id: '2',
    title: 'Ajouter un champ',
    description: 'Apprenez à configurer votre exploitation',
    icon: 'play-circle',
    duration: '2:30',
    link: 'https://youtube.com/watch?v=...',
  },
  {
    id: '3',
    title: 'Utiliser les conseils',
    description: 'Comment tirer le meilleur parti des conseils',
    icon: 'play-circle',
    duration: '4:15',
    link: 'https://youtube.com/watch?v=...',
  },
];

/**
 * Liens utiles
 */
const USEFUL_LINKS: UsefulLink[] = [
  {
    id: '1',
    title: 'Conditions d\'utilisation',
    description: 'Lisez nos conditions d\'utilisation',
    icon: 'file-document',
    url: 'https://seneyiriwa.com/terms',
  },
  {
    id: '2',
    title: 'Politique de confidentialité',
    description: 'Comment nous protégeons vos données',
    icon: 'shield-account',
    url: 'https://seneyiriwa.com/privacy',
  },
  {
    id: '3',
    title: 'Journal',
    description: 'Actualités et conseils agricoles',
    icon: 'blog',
    url: 'https://seneyiriwa.com/blog',
  },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * HelpScreen - Écran d'aide et support
 */
const HelpScreen: React.FC<any> = ({ navigation }) => {
  const { t } = useTranslation();
  
  // États
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
  // ACTIONS
  // ============================================

  /**
   * Bascule l'expansion d'une FAQ
   */
  const toggleFAQ = useCallback((id: string) => {
    setExpandedFAQs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  /**
   * Ouvre un lien externe
   */
  const openLink = useCallback(async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        showErrorMessage(t('cannot_open_link'));
      }
    } catch (error) {
      showErrorMessage(t('error_opening_link'));
    }
  }, [t]);

  /**
   * Envoie un email au support
   */
  const sendEmail = useCallback(() => {
    Linking.openURL('mailto:support@seneyiriwa.com?subject=Aide%20Sènè%20Yiriwa');
  }, []);

  /**
   * Appelle le support téléphonique
   */
  const callSupport = useCallback(() => {
    Linking.openURL('tel:+223XXXXXXXX');
  }, []);

  /**
   * Partage l'application
   */
  const shareApp = useCallback(async () => {
    try {
      await Share.share({
        message: t('share_app_message'),
        url: 'https://seneyiriwa.com',
      });
      showSuccessMessage(t('shared_successfully'));
    } catch (error) {
      showErrorMessage(t('share_error'));
    }
  }, [t]);

  /**
   * Navigue vers l'écran de signalement
   */
  const reportIssue = useCallback(() => {
    navigation.navigate('ReportIssue');
  }, [navigation]);

  /**
   * Navigue vers l'écran de suggestion
   */
  const suggestImprovement = useCallback(() => {
    navigation.navigate('SuggestImprovement');
  }, [navigation]);

  // ============================================
  // RENDU DES COMPOSANTS
  // ============================================

  /**
   * Rendu de l'en-tête
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('help')}</Text>
      <Text style={styles.headerSubtitle}>
        {t('help_subtitle')}
      </Text>
    </View>
  );

  /**
   * Rendu des sections de support rapide
   */
  const renderQuickSupport = () => (
    <View style={styles.quickSupportContainer}>
      <Text style={styles.sectionTitle}>{t('quick_support')}</Text>
      <View style={styles.quickSupportGrid}>
        <TouchableOpacity style={styles.quickSupportItem} onPress={sendEmail}>
          <View style={[styles.quickSupportIcon, { backgroundColor: colors.primary + '15' }]}>
            <Icon name="email" size={28} color={colors.primary} />
          </View>
          <Text style={styles.quickSupportTitle}>{t('email')}</Text>
          <Text style={styles.quickSupportDesc}>support@seneyiriwa.com</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickSupportItem} onPress={callSupport}>
          <View style={[styles.quickSupportIcon, { backgroundColor: colors.secondary + '15' }]}>
            <Icon name="phone" size={28} color={colors.secondary} />
          </View>
          <Text style={styles.quickSupportTitle}>{t('phone')}</Text>
          <Text style={styles.quickSupportDesc}>+223 XX XX XX XX</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickSupportItem} onPress={shareApp}>
          <View style={[styles.quickSupportIcon, { backgroundColor: colors.info + '15' }]}>
            <Icon name="share" size={28} color={colors.info} />
          </View>
          <Text style={styles.quickSupportTitle}>{t('share_app')}</Text>
          <Text style={styles.quickSupportDesc}>{t('share_with_friends')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Rendu des catégories de FAQ
   */
  const renderFAQCategories = () => {
    const categories = [
      { id: 'all', label: t('all'), icon: 'format-list-bulleted' },
      { id: 'compte', label: t('account'), icon: 'account' },
      { id: 'profil', label: t('profile'), icon: 'account-edit' },
      { id: 'conseils', label: t('advice'), icon: 'leaf' },
      { id: 'techniques', label: t('techniques'), icon: 'school' },
      { id: 'parametres', label: t('settings'), icon: 'cog' },
      { id: 'support', label: t('support'), icon: 'headset' },
    ];
    
    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>{t('frequently_asked')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  activeCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <Icon
                  name={category.icon}
                  size={16}
                  color={activeCategory === category.id ? colors.white : colors.gray[700]}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    activeCategory === category.id && styles.categoryChipTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  /**
   * Rendu des questions FAQ
   */
  const renderFAQList = () => {
    const filteredFAQs = activeCategory === 'all'
      ? FAQ_DATA
      : FAQ_DATA.filter(faq => faq.category === activeCategory);
    
    return (
      <View style={styles.faqContainer}>
        {filteredFAQs.map((faq, index) => {
          const isExpanded = expandedFAQs.has(faq.id);
          
          return (
            <Animated.View
              key={faq.id}
              style={[
                styles.faqItem,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: Animated.multiply(slideAnim, (index % 3) + 1) }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(faq.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.gray[600]}
                />
              </TouchableOpacity>
              
              {isExpanded && (
                <Animated.View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </Animated.View>
              )}
            </Animated.View>
          );
        })}
      </View>
    );
  };

  /**
   * Rendu des tutoriels
   */
  const renderTutorials = () => (
    <View style={styles.tutorialsContainer}>
      <Text style={styles.sectionTitle}>{t('video_tutorials')}</Text>
      {TUTORIALS.map((tutorial, index) => (
        <Animated.View
          key={tutorial.id}
          style={[
            styles.tutorialItem,
            {
              opacity: fadeAnim,
              transform: [{ translateX: Animated.multiply(slideAnim, (index % 3) + 1) }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.tutorialContent}
            onPress={() => openLink(tutorial.link)}
          >
            <View style={[styles.tutorialIcon, { backgroundColor: colors.primary + '15' }]}>
              <Icon name={tutorial.icon} size={32} color={colors.primary} />
            </View>
            <View style={styles.tutorialInfo}>
              <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
              <Text style={styles.tutorialDescription}>{tutorial.description}</Text>
              <View style={styles.tutorialMeta}>
                <Icon name="clock-outline" size={12} color={colors.gray[500]} />
                <Text style={styles.tutorialDuration}>{tutorial.duration}</Text>
              </View>
            </View>
            <Icon name="play-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  /**
   * Rendu des actions supplémentaires
   */
  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>{t('need_more_help')}</Text>
      
      <TouchableOpacity style={styles.actionItem} onPress={reportIssue}>
        <View style={[styles.actionIcon, { backgroundColor: colors.error + '15' }]}>
          <Icon name="alert-circle" size={24} color={colors.error} />
        </View>
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>{t('report_issue')}</Text>
          <Text style={styles.actionDescription}>{t('report_issue_desc')}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.gray[400]} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionItem} onPress={suggestImprovement}>
        <View style={[styles.actionIcon, { backgroundColor: colors.success + '15' }]}>
          <Icon name="lightbulb" size={24} color={colors.success} />
        </View>
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>{t('suggest_improvement')}</Text>
          <Text style={styles.actionDescription}>{t('suggest_improvement_desc')}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.gray[400]} />
      </TouchableOpacity>
    </View>
  );

  /**
   * Rendu des liens utiles
   */
  const renderUsefulLinks = () => (
    <View style={styles.linksContainer}>
      <Text style={styles.sectionTitle}>{t('useful_links')}</Text>
      {USEFUL_LINKS.map((link, index) => (
        <Animated.View
          key={link.id}
          style={[
            styles.linkItem,
            {
              opacity: fadeAnim,
              transform: [{ translateX: Animated.multiply(slideAnim, (index % 3) + 1) }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.linkContent}
            onPress={() => openLink(link.url)}
          >
            <Icon name={link.icon} size={24} color={colors.primary} />
            <View style={styles.linkInfo}>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Text style={styles.linkDescription}>{link.description}</Text>
            </View>
            <Icon name="open-in-new" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  /**
   * Rendu de la version
   */
  const renderVersion = () => (
    <Text style={styles.versionText}>
      {t('version')} 1.0.0
    </Text>
  );

  // ============================================
  // RENDU PRINCIPAL
  // ============================================

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {renderHeader()}
      {renderQuickSupport()}
      {renderFAQCategories()}
      {renderFAQList()}
      {renderTutorials()}
      {renderActions()}
      {renderUsefulLinks()}
      {renderVersion()}
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
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  
  // Sections
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  
  // Support rapide
  quickSupportContainer: {
    padding: spacing.lg,
  },
  quickSupportGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickSupportItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickSupportIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickSupportTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: 2,
  },
  quickSupportDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    textAlign: 'center',
  },
  
  // Catégories FAQ
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoriesScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  
  // FAQ
  faqContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[800],
    marginRight: spacing.md,
  },
  faqAnswer: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  faqAnswerText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  
  // Tutoriels
  tutorialsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tutorialItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tutorialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  tutorialIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialInfo: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: 2,
  },
  tutorialDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: 4,
  },
  tutorialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tutorialDuration: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  
  // Actions
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  
  // Liens utiles
  linksContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  linkItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[800],
    marginBottom: 2,
  },
  linkDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  
  // Version
  versionText: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
    marginTop: spacing.md,
  },
});

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default HelpScreen;