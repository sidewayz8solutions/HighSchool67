import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import { AvatarPreview } from '@/components/avatar-preview';
import { CurrencyBadge } from '@/components/visuals';
import { useAuth } from '@/hooks/use-auth';
import { useCloudSync } from '@/hooks/use-cloud-sync';

export default function ProfileScreen() {
  const router = useRouter();
  const player = useGameStore((s) => s.player);
  const progress = useGameStore((s) => s.progress);
  const initGame = useGameStore((s) => s.initGame);

  const { user, signOut } = useAuth();
  const { syncing, lastSync, syncError, syncNow, loadFromCloud, autoSyncEnabled, setAutoSyncEnabled } = useCloudSync();

  const restart = () => {
    initGame('Player', 'nerd');
    router.replace('/');
  };

  const formatLastSync = (iso: string | null) => {
    if (!iso) return 'Never';
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <LinearGradient colors={colors.gradientDark as unknown as [string, string]} style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AvatarPreview config={player.avatarConfig} size={100} />
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.clique}>{player.clique}</Text>
        </View>

        <View style={styles.currencyRow}>
          <CurrencyBadge points={player.currency.points} gems={player.currency.gems} size="lg" />
        </View>

        <Card glow style={styles.card}>
          <Text style={styles.sectionTitle}>Cloud Save</Text>
          {user ? (
            <>
              <View style={styles.authRow}>
                <View>
                  <Text style={styles.authStatus}>Signed In</Text>
                  <Text style={styles.authDetail}>{user.email ?? `Anonymous (${user.id.slice(0, 12)}...)`}</Text>
                </View>
                <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.syncRow}>
                <Text style={styles.syncLabel}>Auto-Sync</Text>
                <Switch value={autoSyncEnabled} onValueChange={setAutoSyncEnabled} trackColor={{ false: colors.surfaceHighlight, true: colors.primary }} />
              </View>
              <Text style={styles.syncStatus}>
                {syncing ? 'Syncing...' : syncError ? `Error: ${syncError}` : `Last sync: ${formatLastSync(lastSync)}`}
              </Text>
              <View style={styles.syncButtons}>
                <TouchableOpacity style={styles.syncBtn} onPress={syncNow} disabled={syncing}>
                  <Text style={styles.syncBtnText}>Save to Cloud</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.syncBtn} onPress={loadFromCloud} disabled={syncing}>
                  <Text style={styles.syncBtnText}>Load from Cloud</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.authStatus}>Not Signed In</Text>
              <Text style={styles.authDetail}>Your progress is saved locally only. Sign in to sync across devices.</Text>
              <Button title="Sign In / Create Account" onPress={() => router.push('/auth')} style={{ marginTop: spacing.sm }} />
            </>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <Text style={styles.detail}>Semester: <Text style={styles.detailBold}>{progress.semester}</Text></Text>
          <Text style={styles.detail}>Day: <Text style={styles.detailBold}>{progress.day}</Text></Text>
          <Text style={styles.detail}>Period: <Text style={styles.detailBold}>{progress.period}</Text></Text>
        </Card>

        <Button title="Reset Game" variant="ghost" onPress={restart} />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { padding: spacing.lg, paddingTop: 60, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  clique: { fontSize: 16, color: colors.primaryLight, fontWeight: '600', textTransform: 'capitalize' },
  currencyRow: { marginBottom: spacing.lg },
  card: { width: '100%', marginBottom: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.sm },
  authRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  authStatus: { color: colors.success, fontSize: 16, fontWeight: '700' },
  authDetail: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  signOutBtn: { backgroundColor: colors.surfaceHighlight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  signOutText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  syncRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  syncLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  syncStatus: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
  syncButtons: { flexDirection: 'row', gap: spacing.sm },
  syncBtn: { flex: 1, backgroundColor: colors.surfaceHighlight, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  syncBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  detail: { color: colors.textMuted, fontSize: 14, marginBottom: 4, textTransform: 'capitalize' },
  detailBold: { color: colors.text, fontWeight: '600' },
});
