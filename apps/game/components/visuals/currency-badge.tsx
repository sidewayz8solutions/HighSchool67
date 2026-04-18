import { View, Text, StyleSheet } from 'react-native';

interface CurrencyBadgeProps {
  points?: number;
  gems?: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { font: 12, padding: 6, gap: 4, dot: 6 },
  md: { font: 14, padding: 8, gap: 6, dot: 8 },
  lg: { font: 18, padding: 10, gap: 8, dot: 10 },
};

export function CurrencyBadge({ points, gems, size = 'md' }: CurrencyBadgeProps) {
  const s = SIZES[size];
  return (
    <View style={[styles.row, { gap: s.gap }]}>
      {points !== undefined && (
        <View style={[styles.badge, { paddingHorizontal: s.padding, paddingVertical: s.padding * 0.5 }]}>
          <View style={[styles.dot, { width: s.dot, height: s.dot, backgroundColor: '#f59e0b' }]} />
          <Text style={[styles.text, { fontSize: s.font }]}>{points.toLocaleString()}</Text>
        </View>
      )}
      {gems !== undefined && (
        <View style={[styles.badge, { paddingHorizontal: s.padding, paddingVertical: s.padding * 0.5 }]}>
          <View style={[styles.dot, { width: s.dot, height: s.dot, backgroundColor: '#3b82f6' }]} />
          <Text style={[styles.text, { fontSize: s.font }]}>{gems.toLocaleString()}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dot: {
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
  },
});
