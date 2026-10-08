import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { PointBalanceCard } from '@/components/PointBalanceCard';
import { TransactionItem } from '@/components/TransactionItem';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { usePointsSummary, usePointsTransactions } from '@/hooks/usePoints';

export default function PointsScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'EARNED' | 'DEDUCTED'>('ALL');

  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
    isRefetching: isSummaryRefetching,
  } = usePointsSummary();

  const {
    data: transactions = [],
    isLoading: isTxLoading,
    refetch: refetchTx,
    isRefetching: isTxRefetching,
  } = usePointsTransactions(100);

  const filteredTransactions = useMemo(() => {
    if (filter === 'EARNED') {
      return transactions.filter((t) => Number(t.amount) > 0);
    }
    if (filter === 'DEDUCTED') {
      return transactions.filter((t) => Number(t.amount) < 0);
    }
    return transactions;
  }, [transactions, filter]);

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchTx()]);
  };

  const isRefreshing = isSummaryRefetching || isTxRefetching;

  return (
    <ScreenWrapper
      scrollable
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={styles.container}
    >
      {/* Prominent Points Summary Card */}
      <PointBalanceCard
        summary={summary}
        isLoading={isSummaryLoading}
        onRefresh={handleRefresh}
      />

      {/* Admin Quick Action Button */}
      {isAdmin && (
        <Button
          title="Manual Point Action (Admin)"
          onPress={() => router.push('/admin/award-points')}
          variant="gold"
          size="md"
          icon={<Ionicons name="shield-checkmark" size={18} color="#0B0F19" />}
          style={styles.adminActionBtn}
        />
      )}

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'ALL' && styles.filterBtnActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            All ({transactions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'EARNED' && styles.filterBtnActive]}
          onPress={() => setFilter('EARNED')}
        >
          <Text style={[styles.filterText, filter === 'EARNED' && styles.filterTextActive]}>
            Earned
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'DEDUCTED' && styles.filterBtnActive]}
          onPress={() => setFilter('DEDUCTED')}
        >
          <Text style={[styles.filterText, filter === 'DEDUCTED' && styles.filterTextActive]}>
            Deducted
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transaction Ledger Card */}
      <View style={styles.ledgerHeader}>
        <Text style={styles.ledgerTitle}>Transaction History</Text>
        <Text style={styles.ledgerSubtitle}>Immutable Ledger</Text>
      </View>

      <Card style={styles.listCard}>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))
        ) : (
          <EmptyState
            icon="receipt-outline"
            title="No Transactions"
            message={
              filter === 'ALL'
                ? 'No transactions found in your immutable points ledger.'
                : `No ${filter.toLowerCase()} transactions recorded.`
            }
          />
        )}
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  adminActionBtn: {
    marginBottom: 16,
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
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  ledgerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  ledgerSubtitle: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  listCard: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});
