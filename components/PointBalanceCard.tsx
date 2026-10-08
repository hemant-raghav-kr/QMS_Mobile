import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Card } from './Card';
import type { UserPointsSummary } from '@/types/database';

interface PointBalanceCardProps {
  summary: UserPointsSummary | null | undefined;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function PointBalanceCard({ summary, isLoading, onRefresh }: PointBalanceCardProps) {
  const router = useRouter();
  const total = summary?.totalPoints ?? 0;
  const earned = summary?.pointsEarned ?? 0;
  const deducted = summary?.pointsDeducted ?? 0;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={18} color={Colors.goldLight} />
          </View>
          <Text style={styles.headerTitle}>CURRENT POINT BALANCE</Text>
        </View>
        {onRefresh && (
          <TouchableOpacity
            onPress={onRefresh}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isLoading}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={isLoading ? Colors.text.muted : Colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceValue}>{isLoading ? '...' : total.toLocaleString()}</Text>
        <Text style={styles.pointsLabel}>PTS</Text>
      </View>

      <Text style={styles.ledgerInfo}>Verified via immutable point_transactions ledger</Text>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIconGained}>
            <Ionicons name="arrow-up" size={14} color={Colors.emeraldLight} />
          </View>
          <View>
            <Text style={styles.statLabel}>Total Earned</Text>
            <Text style={styles.statGained}>+{earned.toLocaleString()} pts</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIconDeducted}>
            <Ionicons name="arrow-down" size={14} color={Colors.roseLight} />
          </View>
          <View>
            <Text style={styles.statLabel}>Total Deducted</Text>
            <Text style={styles.statDeducted}>-{deducted.toLocaleString()} pts</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.7}
        onPress={() => router.push('/(tabs)/points')}
      >
        <Text style={styles.actionText}>View Full Point History</Text>
        <Ionicons name="arrow-forward" size={16} color={Colors.primaryLight} />
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131B2E',
    borderColor: '#22324D',
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.goldBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.goldLight,
    letterSpacing: 0.8,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  pointsLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gold,
  },
  ledgerInfo: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statIconGained: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.emeraldBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconDeducted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.roseBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  statGained: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.emeraldLight,
  },
  statDeducted: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.roseLight,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
});
