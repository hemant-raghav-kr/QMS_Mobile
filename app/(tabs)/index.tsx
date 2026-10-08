import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { PointBalanceCard } from '@/components/PointBalanceCard';
import { TransactionItem } from '@/components/TransactionItem';
import { MeetingCard } from '@/components/MeetingCard';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { RoleBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { Card } from '@/components/Card';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { usePointsSummary, usePointsTransactions } from '@/hooks/usePoints';
import { useMeetings } from '@/hooks/useMeetings';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useNotifications } from '@/hooks/useNotifications';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, user, role, isAdmin } = useAuth();

  const {
    data: pointsSummary,
    isLoading: isPointsLoading,
    refetch: refetchPoints,
    isRefetching: isPointsRefetching,
  } = usePointsSummary();

  const {
    data: transactions = [],
    isLoading: isTxLoading,
    refetch: refetchTx,
  } = usePointsTransactions(3);

  const {
    data: upcomingMeetings = [],
    isLoading: isMeetingsLoading,
    refetch: refetchMeetings,
  } = useMeetings('upcoming');

  const {
    data: announcements = [],
    isLoading: isAnnouncementsLoading,
    refetch: refetchAnnouncements,
  } = useAnnouncements();

  const {
    data: notifications = [],
    refetch: refetchNotifications,
  } = useNotifications(10);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isRefreshing = isPointsRefetching;

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchPoints(),
      refetchTx(),
      refetchMeetings(),
      refetchAnnouncements(),
      refetchNotifications(),
    ]);
  }, [refetchPoints, refetchTx, refetchMeetings, refetchAnnouncements, refetchNotifications]);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Member';

  return (
    <ScreenWrapper
      scrollable
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={styles.container}
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.userGreeting}>
          <Text style={styles.greetingSub}>WELCOME BACK</Text>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName}
            </Text>
            <RoleBadge role={role} />
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.text.primary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Quick Banner */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.adminBanner}
          activeOpacity={0.8}
          onPress={() => router.push('/admin/award-points')}
        >
          <View style={styles.adminBannerLeft}>
            <Ionicons name="shield-checkmark" size={18} color="#C084FC" />
            <Text style={styles.adminBannerText}>Admin Tools: Manual Points Ledger</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#C084FC" />
        </TouchableOpacity>
      )}

      {/* Visually Prominent Points Card */}
      <PointBalanceCard
        summary={pointsSummary}
        isLoading={isPointsLoading}
        onRefresh={() => refetchPoints()}
      />

      {/* Upcoming Meetings Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="videocam-outline" size={18} color={Colors.primaryLight} />
          <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/meetings')}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {upcomingMeetings.length > 0 ? (
        <MeetingCard meeting={upcomingMeetings[0]} />
      ) : (
        <Card style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={28} color={Colors.text.muted} />
          <Text style={styles.emptyText}>No upcoming meetings scheduled right now.</Text>
        </Card>
      )}

      {/* Recent Point Transactions Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="receipt-outline" size={18} color={Colors.goldLight} />
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/points')}>
          <Text style={styles.seeAllText}>View Ledger</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.txCard}>
        {transactions.length > 0 ? (
          transactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
        ) : (
          <EmptyState
            icon="receipt-outline"
            title="No Activity Yet"
            message="Your point transactions will appear here once recorded in the ledger."
          />
        )}
      </Card>

      {/* Latest Announcements Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="megaphone-outline" size={18} color={Colors.emeraldLight} />
          <Text style={styles.sectionTitle}>Announcements</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/announcements')}>
          <Text style={styles.seeAllText}>All Updates</Text>
        </TouchableOpacity>
      </View>

      {announcements.length > 0 ? (
        <AnnouncementCard announcement={announcements[0]} />
      ) : (
        <Card style={styles.emptyCard}>
          <Ionicons name="megaphone-outline" size={28} color={Colors.text.muted} />
          <Text style={styles.emptyText}>No active announcements posted.</Text>
        </Card>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userGreeting: {
    flex: 1,
  },
  greetingSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.muted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.rose,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  adminBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D8B4FE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
  txCard: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.text.muted,
  },
});
