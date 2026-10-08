import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Card } from './Card';
import { AudienceBadge } from './Badge';
import type { Announcement } from '@/types/database';

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const formattedDate = new Date(announcement.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={styles.title}>{announcement.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color={Colors.text.muted} />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>
        <AudienceBadge audience={announcement.target_audience} />
      </View>

      <Text style={styles.content}>{announcement.content}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  content: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
});
