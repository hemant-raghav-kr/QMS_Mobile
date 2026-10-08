import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MeetingCard } from '@/components/MeetingCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Colors } from '@/constants/colors';
import { useMeetings } from '@/hooks/useMeetings';

export default function MeetingsScreen() {
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const { data: meetings = [], isLoading, refetch, isRefetching } = useMeetings(filter);

  return (
    <ScreenWrapper
      scrollable
      refreshing={isRefetching}
      onRefresh={refetch}
      contentContainerStyle={styles.container}
    >
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'upcoming' && styles.filterBtnActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'past' && styles.filterBtnActive]}
          onPress={() => setFilter('past')}
        >
          <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
            Past
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notice info */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          Meetings are currently hosted via external video links. Tap "Join Meeting" to open the room.
        </Text>
      </View>

      {/* Meeting list */}
      {isLoading ? (
        <LoadingSpinner message="Loading meetings..." />
      ) : meetings.length > 0 ? (
        meetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
      ) : (
        <EmptyState
          icon="videocam-outline"
          title="No Meetings Found"
          message={
            filter === 'upcoming'
              ? 'There are no upcoming meetings scheduled at this time.'
              : 'No past meetings recorded.'
          }
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  infoBanner: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
