import { Component, type ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radii } from '@repo/ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>💥</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity onPress={this.handleReset} style={styles.button}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
});
