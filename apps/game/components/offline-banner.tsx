import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { colors, spacing } from '@repo/ui';

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚠️ Offline — some features may be unavailable</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
  },
});
