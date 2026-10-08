import React from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Card } from './Card';
import { Button } from './Button';
import { MeetingStatusBadge } from './Badge';
import type { Meeting } from '@/types/database';

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const meetingDate = new Date(meeting.scheduled_at);
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = meetingDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleJoinMeeting = async () => {
    const url = meeting.external_meeting_url;
    if (!url) {
      Alert.alert('No Meeting Link', 'An external meeting link has not been provided for this meeting.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback for non-standard scheme or direct web link
        await Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
      }
    } catch (err) {
      console.warn('Failed to open meeting URL:', err);
      Alert.alert('Error', 'Unable to open the external meeting URL on this device.');
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {meeting.title}
          </Text>
        </View>
        <MeetingStatusBadge status={meeting.status} />
      </View>

      {meeting.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {meeting.description}
        </Text>
      ) : null}

      <View style={styles.metaContainer}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color={Colors.primaryLight} />
          <Text style={styles.metaText}>{formattedDate}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={15} color={Colors.primaryLight} />
          <Text style={styles.metaText}>
            {formattedTime} ({meeting.duration_minutes} mins)
          </Text>
        </View>

        {meeting.external_meeting_url ? (
          <View style={styles.metaRow}>
            <Ionicons name="link-outline" size={15} color={Colors.text.muted} />
            <Text style={styles.linkText} numberOfLines={1}>
              {meeting.external_meeting_url}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionRow}>
        <Button
          title={meeting.status === 'LIVE' ? 'Join Live Meeting' : 'Join Meeting'}
          onPress={handleJoinMeeting}
          variant={meeting.status === 'LIVE' ? 'destructive' : 'primary'}
          size="md"
          icon={<Ionicons name="videocam-outline" size={18} color="#FFFFFF" />}
          disabled={!meeting.external_meeting_url || meeting.status === 'CANCELLED'}
          style={styles.joinBtn}
        />
      </View>
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
    marginBottom: 8,
    gap: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: Colors.text.primary,
  },
  linkText: {
    fontSize: 12,
    color: Colors.text.muted,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
  },
  joinBtn: {
    flex: 1,
  },
});
