import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Badge } from './Badge';
import type { PointTransaction } from '@/types/database';

interface TransactionItemProps {
  transaction: PointTransaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isPositive = Number(transaction.amount) > 0;
  const isZero = Number(transaction.amount) === 0;

  const formattedDate = new Date(transaction.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(transaction.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBox,
          isPositive ? styles.iconPositive : isZero ? styles.iconZero : styles.iconNegative,
        ]}
      >
        <Ionicons
          name={isPositive ? 'arrow-up' : isZero ? 'remove' : 'arrow-down'}
          size={16}
          color={isPositive ? Colors.emeraldLight : isZero ? Colors.text.muted : Colors.roseLight}
        />
      </View>

      <View style={styles.details}>
        <View style={styles.topRow}>
          <Text style={styles.reason} numberOfLines={1}>
            {transaction.reason || 'Point adjustment'}
          </Text>
          <Text
            style={[
              styles.amount,
              isPositive ? styles.amountPositive : styles.amountNegative,
            ]}
          >
            {isPositive ? `+${transaction.amount}` : transaction.amount} pts
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.dateTime}>
            {formattedDate} • {formattedTime}
          </Text>
          <Badge
            label={transaction.type || 'MANUAL'}
            variant={
              transaction.type === 'AUTOMATIC'
                ? 'primary'
                : transaction.type === 'REVERSAL'
                ? 'rose'
                : 'slate'
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPositive: {
    backgroundColor: Colors.emeraldBg,
  },
  iconNegative: {
    backgroundColor: Colors.roseBg,
  },
  iconZero: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  details: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  amountPositive: {
    color: Colors.emeraldLight,
  },
  amountNegative: {
    color: Colors.roseLight,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTime: {
    fontSize: 12,
    color: Colors.text.muted,
  },
});
