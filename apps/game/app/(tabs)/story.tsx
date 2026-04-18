import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import { STORY_CHAPTERS } from '@repo/game-engine';


const CHAPTER_ICONS: Record<string, { gradient: [string, string]; letter: string }> = {
  'ch1-freshman-first-day': { gradient: ['#3b82f6', '#1d4ed8'], letter: '1' },
  'ch2-lunch-drama': { gradient: ['#f59e0b', '#d97706'], letter: '2' },
  'ch3-prom-night': { gradient: ['#ec4899', '#be185d'], letter: '3' },
  'ch4-senior-prank': { gradient: ['#a855f7', '#7c3aed'], letter: '4' },
  'ch5-graduation': { gradient: ['#22c55e', '#15803d'], letter: '5' },
  'ch6-the-rival': { gradient: ['#ef4444', '#b91c1c'], letter: '6' },
  'ch7-festival-of-arts': { gradient: ['#f59e0b', '#d97706'], letter: '7' },
  'ch8-summer-job': { gradient: ['#3b82f6', '#1d4ed8'], letter: '8' },
  'ch9-the-breakup': { gradient: ['#ec4899', '#be185d'], letter: '9' },
  'ch10-senior-trip': { gradient: ['#22c55e', '#15803d'], letter: '10' },
};

export default function StoryScreen() {
  const router = useRouter();
  const { storyProgress, progress, player, getChapterStatus } = useGameStore();

  return (
    <LinearGradient colors={colors.gradientDark as unknown as [string, string]} style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Story</Text>
        <Text style={styles.subtitle}>Your choices shape your legacy.</Text>

        {STORY_CHAPTERS.map((chapter) => {
          const status = getChapterStatus(chapter);
          const icon = CHAPTER_ICONS[chapter.id] || { gradient: ['#64748b', '#475569'], letter: '?' };
          return (
            <Card
              key={chapter.id}
              style={[styles.card, status.completed && styles.cardCompleted, !status.unlocked && styles.cardLocked]}
              glow={status.unlocked && !status.completed}
            >
              <View style={styles.row}>
                <LinearGradient colors={icon.gradient} style={styles.iconBg}>
                  <Text style={styles.iconLetter}>{icon.letter}</Text>
                </LinearGradient>
                <View style={styles.info}>
                  <Text style={styles.chapterTitle}>
                    {chapter.title}
                    {status.completed && <Text style={styles.completedBadge}> DONE</Text>}
                  </Text>
                  <Text style={styles.chapterDesc}>{chapter.description}</Text>
                  <Text style={styles.meta}>Semester {chapter.semester} • Episode {chapter.episode}</Text>
                  {!status.unlocked && status.reason && (
                    <Text style={styles.lockReason}>{status.reason}</Text>
                  )}
                </View>
              </View>
              {status.unlocked && !status.completed && (
                <TouchableOpacity
                  style={styles.playBtn}
                  onPress={() => router.push({ pathname: '/story-chapter', params: { chapterId: chapter.id } })}
                >
                  <Text style={styles.playText}>Play Chapter</Text>
                </TouchableOpacity>
              )}
              {status.completed && (
                <TouchableOpacity
                  style={styles.replayBtn}
                  onPress={() => router.push({ pathname: '/story-chapter', params: { chapterId: chapter.id } })}
                >
                  <Text style={styles.replayText}>Replay</Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        })}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { padding: spacing.lg, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  cardCompleted: { borderColor: colors.success, borderWidth: 1 },
  cardLocked: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBg: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  iconLetter: { fontSize: 20, fontWeight: '900', color: '#fff' },
  info: { flex: 1 },
  chapterTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  completedBadge: { color: colors.success, fontSize: 12 },
  chapterDesc: { color: colors.textMuted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  meta: { color: colors.textSecondary, fontSize: 12, marginTop: 4, fontWeight: '600' },
  lockReason: { color: colors.warning, fontSize: 12, marginTop: 4, fontWeight: '600' },
  playBtn: { marginTop: spacing.sm, backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  playText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  replayBtn: { marginTop: spacing.sm, backgroundColor: colors.surfaceHighlight, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  replayText: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },
});
