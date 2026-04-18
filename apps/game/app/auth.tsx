import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, colors, spacing } from '@repo/ui';
import { useAuth } from '@/hooks/use-auth';

export default function AuthScreen() {
  const router = useRouter();
  const { user, loading, signUp, signIn, signInAnonymous } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You're Signed In!</Text>
        <Card style={styles.card}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{user.id.slice(0, 16)}...</Text>
          {user.email && (
            <>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </>
          )}
        </Card>
        <Button title="Back to Profile" onPress={() => router.back()} />
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    setError(null);

    const result = mode === 'signin'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);

    if (result.error) {
      setError(result.error);
    }
    setSubmitting(false);
  };

  const handleAnonymous = async () => {
    setSubmitting(true);
    setError(null);
    const result = await signInAnonymous();
    if (result.error) {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cloud Save</Text>
      <Text style={styles.subtitle}>Sign in to sync your progress across devices.</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, mode === 'signin' && styles.tabActive]}
          onPress={() => { setMode('signin'); setError(null); }}
        >
          <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'signup' && styles.tabActive]}
          onPress={() => { setMode('signup'); setError(null); }}
        >
          <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Min 6 characters"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}
      </Card>

      <Button
        title={submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        onPress={handleSubmit}
        disabled={submitting}
      />

      <View style={{ height: spacing.md }} />

      <Button
        title="Play Without Account (Anonymous)"
        variant="ghost"
        onPress={handleAnonymous}
        disabled={submitting}
      />

      <Text style={styles.terms}>
        Anonymous saves work on this device only.{'\n'}
        Create an account later to transfer progress.
      </Text>

      <Button title="Back" variant="ghost" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.surfaceHighlight,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  card: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceHighlight,
    color: colors.text,
    padding: spacing.md,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.sm,
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
