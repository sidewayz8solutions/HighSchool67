import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, colors, spacing } from '@repo/ui';
import { usePurchases } from '@/hooks/use-purchases';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SeasonPassScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tiers, customerInfo, loading, purchasing, hasPass, hasVIP, purchase, restore } = usePurchases();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    if (!selectedTier) return;
    const success = await purchase(selectedTier);
    if (success) {
      router.back();
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    await restore();
    setRestoring(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textMuted, marginTop: spacing.md }}>Loading offerings...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🎫 Season Pass</Text>
      <Text style={styles.subtitle}>Unlock the full experience. Premium stories, exclusive items, and more.</Text>

      {hasPass && (
        <Card style={[styles.statusCard, { borderColor: colors.success, borderWidth: 2 }]}>
          <Text style={styles.statusText}>You have an active Season Pass!</Text>
          {hasVIP && <Text style={styles.statusSubtext}>VIP Level — All perks unlocked</Text>}
        </Card>
      )}

      {tiers.map((tier, index) => (
        <Animated.View key={tier.id} entering={FadeInUp.delay(index * 100)}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedTier(tier.id)}
            style={[
              styles.tierCard,
              selectedTier === tier.id && { borderColor: tier.color, borderWidth: 3 },
            ]}
          >
            {tier.popular && (
              <View style={[styles.popularBadge, { backgroundColor: tier.color }]}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            <View style={styles.tierHeader}>
              <View>
                <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{tier.price}</Text>
                  <Text style={styles.period}>{tier.period}</Text>
                </View>
              </View>
              <View style={[styles.radio, selectedTier === tier.id && { backgroundColor: tier.color, borderColor: tier.color }]}>
                {selectedTier === tier.id && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </View>
            <View style={styles.features}>
              {tier.features.map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <Text style={[styles.featureCheck, { color: tier.color }]}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}

      <Button
        title={purchasing ? 'Processing...' : selectedTier ? 'Subscribe Now' : 'Select a Plan'}
        onPress={handlePurchase}
        disabled={!selectedTier || purchasing || hasPass}
        style={{ marginTop: spacing.lg }}
      />

      <TouchableOpacity onPress={handleRestore} disabled={restoring} style={styles.restoreBtn}>
        <Text style={styles.restoreText}>
          {restoring ? 'Restoring...' : 'Restore Purchases'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.terms}>
        Subscriptions auto-renew. Cancel anytime.{'\n'}
        RevenueCat handles secure payment processing.
      </Text>
      <Button title="Maybe Later" variant="ghost" onPress={() => router.back()} />
      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statusCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  statusText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '700',
  },
  statusSubtext: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  tierCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tierName: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  period: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 4,
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  features: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureCheck: {
    fontWeight: '700',
    marginRight: 8,
    fontSize: 14,
  },
  featureText: {
    color: colors.textMuted,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  restoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  terms: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
});
