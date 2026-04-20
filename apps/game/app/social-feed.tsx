import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, colors, spacing } from '@repo/ui';
import {
  MOCK_FEED_ITEMS,
  likeFeedItem,
  getFeedTypeEmoji,
  getFeedTypeColor,
  getFeedTypeLabel,
  useGameStore,
} from '@repo/game-engine';
import { NpcAvatar } from '@/components/visuals';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SocialFeedItem, SocialComment } from '@repo/game-engine';

const ACTOR_AVATARS: Record<string, { seed: string; hair: string[]; hairColor: string; skinColor: string }> = {
  'You': { seed: 'player', hair: ['short01'], hairColor: '#0e0e0e', skinColor: '#f5d0b5' },
  'Alex Ramos': { seed: 'alex', hair: ['short05'], hairColor: '#4a2511', skinColor: '#f5d0b5' },
  'Sam Kim': { seed: 'sam', hair: ['long01'], hairColor: '#0e0e0e', skinColor: '#ecad80' },
  'Jordan Taylor': { seed: 'jordan', hair: ['short11'], hairColor: '#e5d7a3', skinColor: '#f2d3b1' },
  'Riley Parker': { seed: 'riley', hair: ['long06'], hairColor: '#d4553a', skinColor: '#f5d0b5' },
  'Casey Williams': { seed: 'casey', hair: ['short03'], hairColor: '#acafaf', skinColor: '#ecad80' },
};

function getAvatarConfig(actorName: string) {
  return ACTOR_AVATARS[actorName] ?? { seed: actorName.toLowerCase(), hair: ['short01'], hairColor: '#0e0e0e', skinColor: '#f5d0b5' };
}

function SparkleAnimation({ active, color }: { active: boolean; color: string }) {
  if (!active) return null;
  return (
    <View style={styles.sparkleContainer} pointerEvents="none">
      {[...Array(6)].map((_, i) => (
        <Animated.View
          key={i}
          entering={FadeInUp.delay(i * 60).duration(400)}
          style={[
            styles.sparkle,
            {
              backgroundColor: color,
              left: `${15 + (i * 15)}%`,
              top: `${10 + (i % 3) * 20}%`,
              opacity: 0.6 - i * 0.08,
            },
          ]}
        />
      ))}
    </View>
  );
}

function HeartAnimation({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <View style={styles.heartContainer} pointerEvents="none">
      {[...Array(5)].map((_, i) => (
        <Animated.View
          key={i}
          entering={FadeInUp.delay(i * 100).duration(500)}
          style={[styles.heartFloater, { left: `${20 + i * 18}%` }]}
        >
          <Text style={[styles.heartText, { opacity: 0.5 - i * 0.08 }]}>❤️</Text>
        </Animated.View>
      ))}
    </View>
  );
}

export default function SocialFeedScreen() {
  const insets = useSafeAreaInsets();
  const player = useGameStore((s) => s.player);
  const [feedItems, setFeedItems] = useState<SocialFeedItem[]>(MOCK_FEED_ITEMS);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [showSparkle, setShowSparkle] = useState<string | null>(null);
  const [showHearts, setShowHearts] = useState<string | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  const handleLike = useCallback((itemId: string, type: string) => {
    setFeedItems((prev) => likeFeedItem(prev, itemId));
    if (type === 'achievement_unlocked') {
      setShowSparkle(itemId);
      setTimeout(() => setShowSparkle(null), 1500);
    }
    if (type === 'npc_romance' || type === 'friendship_milestone') {
      setShowHearts(itemId);
      setTimeout(() => setShowHearts(null), 1500);
    }
  }, []);

  const toggleComments = useCallback((itemId: string) => {
    setExpandedComments((prev) => (prev === itemId ? null : itemId));
  }, []);

  const formatTimestamp = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getCardAccent = (type: string): string => {
    switch (type) {
      case 'achievement_unlocked': return colors.warning;
      case 'npc_romance': return colors.secondary;
      case 'rival_defeated': return colors.danger;
      case 'minigame_highscore': return colors.primary;
      case 'level_up': return colors.accent;
      case 'friendship_milestone': return colors.secondaryLight;
      default: return colors.textMuted;
    }
  };

  return (
    <LinearGradient colors={colors.gradientDark } style={styles.gradientBg}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={styles.title}>Social Feed</Text>
        <Text style={styles.subtitle}>See what everyone is up to.</Text>

        {feedItems.map((item, index) => {
          const avatarCfg = getAvatarConfig(item.actorName);
          const typeColor = getFeedTypeColor(item.type);
          const emoji = getFeedTypeEmoji(item.type);
          const label = getFeedTypeLabel(item.type);
          const isSpecial = item.type === 'achievement_unlocked' || item.type === 'npc_romance' || item.type === 'minigame_highscore' || item.type === 'level_up' || item.type === 'friendship_milestone';

          return (
            <Animated.View key={item.id} entering={FadeInUp.delay(index * 60)}>
              <Card style={[styles.feedCard, isSpecial && styles.specialCard]}>
                {showSparkle === item.id && <SparkleAnimation active color={getCardAccent(item.type)} />}
                {showHearts === item.id && <HeartAnimation active />}

                <View style={[styles.typeBadge, { backgroundColor: `${typeColor}22`, borderColor: `${typeColor}44` }]}>
                  <Text style={[styles.typeBadgeText, { color: typeColor }]}>{emoji} {label}</Text>
                </View>

                <View style={styles.feedHeader}>
                  <NpcAvatar
                    seed={avatarCfg.seed}
                    hair={avatarCfg.hair}
                    hairColor={avatarCfg.hairColor}
                    skinColor={avatarCfg.skinColor}
                    size={44}
                    borderColor={typeColor}
                  />
                  <View style={styles.feedHeaderInfo}>
                    <Text style={styles.actorName}>{item.actorName}</Text>
                    <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                  </View>
                </View>

                <Text style={styles.description}>{item.description}</Text>

                <View style={styles.feedActions}>
                  <TouchableOpacity
                    style={[styles.likeBtn, item.likedByPlayer && styles.likeBtnActive]}
                    onPress={() => handleLike(item.id, item.type)}
                  >
                    <Text style={[styles.likeIcon, item.likedByPlayer && { color: colors.danger }]}>
                      {item.likedByPlayer ? '❤️' : '🤍'}
                    </Text>
                    <Text style={[styles.likeCount, item.likedByPlayer && styles.likeCountActive]}>
                      {item.likes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.commentBtn} onPress={() => toggleComments(item.id)}>
                    <Text style={styles.commentIcon}>💬</Text>
                    <Text style={styles.commentCount}>{item.comments.length}</Text>
                  </TouchableOpacity>
                </View>

                {expandedComments === item.id && item.comments.length > 0 && (
                  <View style={styles.commentsSection}>
                    {item.comments.map((comment) => (
                      <View key={comment.id} style={styles.commentRow}>
                        <Text style={styles.commentAuthor}>{comment.authorName}:</Text>
                        <Text style={styles.commentText}>{comment.text}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            </Animated.View>
          );
        })}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { padding: spacing.lg },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: spacing.lg },
  feedCard: { marginBottom: spacing.md, overflow: 'hidden' },
  specialCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  feedHeaderInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  actorName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  feedActions: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: spacing.sm,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  likeBtnActive: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  likeIcon: { fontSize: 16 },
  likeCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
  likeCountActive: {
    color: colors.danger,
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  commentIcon: { fontSize: 16 },
  commentCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
  commentsSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
    marginRight: 6,
  },
  commentText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  sparkleContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heartContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    pointerEvents: 'none',
  },
  heartFloater: {
    position: 'absolute',
    top: '20%',
  },
  heartText: { fontSize: 20 },
});
