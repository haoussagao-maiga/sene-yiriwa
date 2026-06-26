/**
 * AdminContentDetailScreen - Sènè Yiriwa
 * 
 * Écran de détail d'un contenu pour les administrateurs.
 * Permet de voir, modifier et modérer les conseils et techniques.
 * 
 * Fonctionnalités :
 * - Affichage du contenu complet
 * - Modification du contenu
 * - Gestion du statut (brouillon, en attente, publié, archivé)
 * - Actions de modération
 * - Statistiques de consultation
 * 
 * @module navigation/screens/admin/AdminContentDetailScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Button, Divider, Chip } from 'react-native-paper';

// Import des styles
import colors from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';

// ============================================
// TYPES ET INTERFACES
// ============================================

interface ContentDetail {
  id: string;
  type: 'conseil' | 'technique';
  title: string;
  content: string;
  category: string;
  author: string;
  authorId: string;
  status: 'draft' | 'pending' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  likes: number;
  shares: number;
  tags: string[];
  images?: string[];
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const AdminContentDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  
  const { contentId, contentType } = route.params as { 
    contentId: string; 
    contentType: 'conseil' | 'technique' 
  };
  
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Charge les détails du contenu
   */
  const loadContentDetail = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par les vrais appels API
      // const response = await AdminAPI.getContentDetail(contentId, contentType);
      
      // Simulation de données
      setTimeout(() => {
        const mockContent: ContentDetail = {
          id: contentId,
          type: contentType,
          title: 'Comment améliorer la culture du mil',
          content: 'Le mil est une céréale essentielle pour l\'agriculture malienne. Voici quelques conseils pour améliorer votre production...',
          category: 'Céréales',
          author: 'Dr. Touré',
          authorId: 'author-1',
          status: 'published',
          createdAt: '2024-01-15',
          updatedAt: '2024-06-10',
          publishedAt: '2024-01-20',
          views: 1234,
          likes: 89,
          shares: 23,
          tags: ['mil', 'céréales', 'production', 'conseils'],
        };
        
        setContent(mockContent);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
      setLoading(false);
    }
  };

  /**
   * Change le statut du contenu
   */
  const changeStatus = (newStatus: ContentDetail['status']) => {
    if (!content) return;
    
    Alert.alert(
      t('change_status'),
      t('confirm_change_status'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          onPress: () => {
            setContent({ ...content, status: newStatus });
            // TODO: Appel API
          },
        },
      ]
    );
  };

  /**
   * Supprime le contenu
   */
  const deleteContent = () => {
    Alert.alert(
      t('delete_content'),
      t('confirm_delete_content'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
            // TODO: Appel API
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadContentDetail();
  }, [contentId, contentType]);

  // ============================================
  // RENDU
  // ============================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="file-off" size={64} color={colors.error} />
        <Text style={styles.errorText}>{t('content_not_found')}</Text>
      </View>
    );
  }

  const getTypeColor = () => {
    return content.type === 'conseil' ? colors.primary : colors.info;
  };

  const getTypeLabel = () => {
    return content.type === 'conseil' ? t('conseil') : t('technique');
  };

  const getStatusColor = () => {
    switch (content.status) {
      case 'published': return colors.success;
      case 'pending': return colors.warning;
      case 'draft': return colors.gray[500];
      case 'archived': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getStatusLabel = () => {
    switch (content.status) {
      case 'published': return t('published');
      case 'pending': return t('pending');
      case 'draft': return t('draft');
      case 'archived': return t('archived');
      default: return content.status;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* En-tête */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerMeta}>
            <Chip
              style={[styles.typeChip, { backgroundColor: `${getTypeColor()}20` }]}
              textStyle={[styles.typeChipText, { color: getTypeColor() }]}
            >
              {getTypeLabel()}
            </Chip>
            <Chip
              style={[styles.statusChip, { backgroundColor: `${getStatusColor()}20` }]}
              textStyle={[styles.statusChipText, { color: getStatusColor() }]}
            >
              {getStatusLabel()}
            </Chip>
          </View>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.category}>{content.category}</Text>
          <View style={styles.authorInfo}>
            <Icon name="account" size={16} color={colors.gray[600]} />
            <Text style={styles.author}>{content.author}</Text>
          </View>
        </View>
      </Card>

      {/* Statistiques */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('statistics')}</Text>
        <Card style={styles.card}>
          <View style={styles.statsGrid}>
            <StatItem icon="eye" label={t('views')} value={content.views} />
            <StatItem icon="heart" label={t('likes')} value={content.likes} />
            <StatItem icon="share-variant" label={t('shares')} value={content.shares} />
          </View>
        </Card>
      </View>

      {/* Contenu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('content')}</Text>
        <Card style={styles.card}>
          <Text style={styles.contentText}>{content.content}</Text>
        </Card>
      </View>

      {/* Tags */}
      {content.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tags')}</Text>
          <View style={styles.tagsContainer}>
            {content.tags.map((tag, index) => (
              <Chip key={index} style={styles.tag} compact>
                {tag}
              </Chip>
            ))}
          </View>
        </View>
      )}

      {/* Informations de publication */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('publication_info')}</Text>
        <Card style={styles.card}>
          <InfoRow label={t('created_at')} value={content.createdAt} icon="calendar" />
          <Divider />
          <InfoRow label={t('updated_at')} value={content.updatedAt} icon="clock" />
          {content.publishedAt && (
            <>
              <Divider />
              <InfoRow label={t('published_at')} value={content.publishedAt} icon="calendar-check" />
            </>
          )}
        </Card>
      </View>

      {/* Actions de statut */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('status_actions')}</Text>
        <Card style={styles.card}>
          {content.status !== 'published' && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => changeStatus('published')}
              >
                <Icon name="publish" size={24} color={colors.success} />
                <Text style={styles.actionButtonText}>{t('publish')}</Text>
              </TouchableOpacity>
              <Divider />
            </>
          )}
          {content.status !== 'pending' && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => changeStatus('pending')}
              >
                <Icon name="clock-outline" size={24} color={colors.warning} />
                <Text style={styles.actionButtonText}>{t('set_pending')}</Text>
              </TouchableOpacity>
              <Divider />
            </>
          )}
          {content.status !== 'draft' && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => changeStatus('draft')}
              >
                <Icon name="file-document-edit" size={24} color={colors.gray[600]} />
                <Text style={styles.actionButtonText}>{t('set_draft')}</Text>
              </TouchableOpacity>
              <Divider />
            </>
          )}
          {content.status !== 'archived' && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => changeStatus('archived')}
              >
                <Icon name="archive" size={24} color={colors.info} />
                <Text style={styles.actionButtonText}>{t('archive')}</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>
      </View>

      {/* Actions de modération */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('moderation')}</Text>
        <Card style={styles.card}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="pencil" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>{t('edit_content')}</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="flag" size={24} color={colors.warning} />
            <Text style={styles.actionButtonText}>{t('report_content')}</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="email" size={24} color={colors.info} />
            <Text style={styles.actionButtonText}>{t('contact_author')}</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Actions dangereuses */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.error }]}>
          {t('danger_zone')}
        </Text>
        <Card style={[styles.card, styles.dangerCard]}>
          <TouchableOpacity style={styles.dangerButton} onPress={deleteContent}>
            <Icon name="delete-forever" size={24} color={colors.error} />
            <Text style={styles.dangerButtonText}>{t('delete_content')}</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
};

// ============================================
// COMPOSANTS AUXILIAIRES
// ============================================

const StatItem: React.FC<{
  icon: string;
  label: string;
  value: number;
}> = ({ icon, label, value }) => (
  <View style={styles.statItem}>
    <Icon name={icon} size={24} color={colors.primary} />
    <Text style={styles.statValue}>{value.toLocaleString()}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow: React.FC<{
  label: string;
  value: string;
  icon: string;
}> = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    <Icon name={icon} size={20} color={colors.gray[500]} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    marginTop: spacing.md,
  },
  headerCard: {
    marginBottom: spacing.xl,
    elevation: 2,
    borderRadius: 12,
  },
  headerContent: {
    padding: spacing.lg,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeChip: {
    height: 28,
  },
  typeChipText: {
    fontSize: typography.fontSize.xs,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: typography.fontSize.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginLeft: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
    marginTop: 2,
  },
  contentText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[800],
    lineHeight: 24,
    padding: spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.gray[100],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  infoContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
    marginLeft: spacing.md,
  },
  dangerCard: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dangerButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
    marginLeft: spacing.md,
  },
});

// ============================================
// IMPORTS SUPPLÉMENTAIRES
// ============================================

import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default AdminContentDetailScreen;
