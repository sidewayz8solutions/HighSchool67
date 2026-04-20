import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { colors } from '@repo/ui';
import { ErrorBoundary } from '@/components/error-boundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'HIGH SCHOOL 67', headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ErrorBoundary>
  );
}
