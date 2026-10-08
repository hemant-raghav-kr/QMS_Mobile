import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAnnouncements } from '@/hooks/useAnnouncements';

export default function AnnouncementsScreen() {
  const { data: announcements = [], isLoading, refetch, isRefetching } = useAnnouncements();

  return (
    <ScreenWrapper
      scrollable
      refreshing={isRefetching}
      onRefresh={refetch}
      contentContainerStyle={styles.container}
    >
      {isLoading ? (
        <LoadingSpinner message="Loading announcements..." />
      ) : announcements.length > 0 ? (
        announcements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))
      ) : (
        <EmptyState
          icon="megaphone-outline"
          title="No Announcements"
          message="There are no active organization announcements at this time."
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
});
