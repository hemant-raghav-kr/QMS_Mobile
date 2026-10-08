import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import type { Notification } from '@/types/database';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const formattedDate = new Date(notification.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const getIcon = () => {
    switch (notification.type) {
      case 'MEETING':
      case 'MEETING_REMINDER':
        return 'videocam-outline';
      case 'POINTS':
      case 'POINT_AWARD':
        return 'sparkles-outline';
      case 'ANNOUNCEMENT':
        return 'megaphone-outline';
      default:
        return 'notifications-outline';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(notification)}
      style={[styles.container, !notification.read && styles.unreadContainer]}
    >
      <View style={[styles.iconBox, !notification.read && styles.unreadIconBox]}>
        <Ionicons
          name={getIcon() as any}
          size={18}
          color={!notification.read ? Colors.primaryLight : Colors.text.muted}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.title, !notification.read && styles.unreadTitle]} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>

      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 10,
    gap: 12,
  },
  unreadContainer: {
    backgroundColor: '#162035',
    borderColor: '#2563EB40',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadIconBox: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  message: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
  },
});
