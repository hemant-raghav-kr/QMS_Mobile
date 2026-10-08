import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Colors } from '@/constants/colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { View, StyleSheet } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30,
    },
  },
});

function RootNavigation() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Initialize push notification listeners & registration
  usePushNotifications();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect unauthenticated user to login
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Redirect authenticated user to main dashboard
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Initializing QMS..." />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="points/index"
        options={{
          title: 'Points Ledger',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="meetings/index"
        options={{
          title: 'Meetings',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="announcements/index"
        options={{
          title: 'Announcements',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="notifications/index"
        options={{
          title: 'Notifications',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="profile/index"
        options={{
          title: 'My Profile',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="admin/award-points"
        options={{
          title: 'Award / Deduct Points',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
