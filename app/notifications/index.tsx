import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { NotificationItem } from '@/components/NotificationItem';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Colors } from '@/constants/colors';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications';
import type { Notification } from '@/types/database';

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: notifications = [], isLoading, refetch, isRefetching } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationPress = async (item: Notification) => {
    if (!item.read) {
      markReadMutation.mutate(item.id);
    }

    // Deep link based on notification metadata or link_url
    if (item.link_url) {
      if (item.link_url.includes('meetings')) {
        router.push('/(tabs)/meetings');
      } else if (item.link_url.includes('points')) {
        router.push('/(tabs)/points');
      } else if (item.link_url.includes('announcements')) {
        router.push('/(tabs)/announcements');
      } else {
        router.push(item.link_url as any);
      }
    } else if (item.type === 'MEETING') {
      router.push('/(tabs)/meetings');
    } else if (item.type === 'POINTS' || item.type === 'POINT_AWARD') {
      router.push('/(tabs)/points');
    } else if (item.type === 'ANNOUNCEMENT') {
      router.push('/(tabs)/announcements');
    }
  };

  return (
    <ScreenWrapper
      scrollable
      refreshing={isRefetching}
      onRefresh={refetch}
      contentContainerStyle={styles.container}
    >
      {/* Top action row */}
      <View style={styles.headerRow}>
        <Text style={styles.unreadCountText}>
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <Ionicons name="checkmark-done" size={16} color={Colors.primaryLight} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications list */}
      {isLoading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length > 0 ? (
        notifications.map((item) => (
          <NotificationItem
            key={item.id}
            notification={item}
            onPress={handleNotificationPress}
          />
        ))
      ) : (
        <EmptyState
          icon="notifications-off-outline"
          title="No Notifications"
          message="You have no notifications yet. System and activity alerts will appear here."
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  unreadCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
});
