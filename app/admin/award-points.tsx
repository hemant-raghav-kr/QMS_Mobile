import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAwardPoints } from '@/hooks/usePoints';
import { getAllMembers } from '@/services/profileService';
import type { Profile } from '@/types/database';

export default function AdminAwardPointsScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const awardMutation = useAdminAwardPoints();

  const [members, setMembers] = useState<Profile[]>([]);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [amount, setAmount] = useState('');
  const [isDeduction, setIsDeduction] = useState(false);
  const [reason, setReason] = useState('');
  const [txType, setTxType] = useState<'MANUAL' | 'ADJUSTMENT'>('MANUAL');
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    getAllMembers()
      .then((data) => setMembers(data))
      .finally(() => setIsLoadingMembers(false));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <ScreenWrapper contentContainerStyle={styles.centered}>
        <Ionicons name="lock-closed" size={48} color={Colors.rose} />
        <Text style={styles.unauthorizedTitle}>Access Restricted</Text>
        <Text style={styles.unauthorizedText}>
          Only administrators can access manual point ledger actions.
        </Text>
        <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
      </ScreenWrapper>
    );
  }

  const handleSubmit = async () => {
    if (!selectedMember) {
      Alert.alert('Selection Required', 'Please select a member to award or deduct points.');
      return;
    }

    const numAmount = Math.abs(parseInt(amount, 10));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number of points.');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Reason Required', 'Please provide an audit reason for this transaction.');
      return;
    }

    const finalAmount = isDeduction ? -numAmount : numAmount;

    awardMutation.mutate(
      {
        userId: selectedMember.id,
        amount: finalAmount,
        reason: reason.trim(),
        type: txType,
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Success',
            `Successfully recorded ${finalAmount > 0 ? `+${finalAmount}` : finalAmount} pts for ${selectedMember.full_name || selectedMember.email}.`,
            [{ text: 'OK', onPress: () => router.back() }]
          );
        },
        onError: (err: any) => {
          Alert.alert('Transaction Failed', err?.message || 'Failed to record transaction.');
        },
      }
    );
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.goldLight} />
          <Text style={styles.infoTitle}>Manual Ledger Operation</Text>
        </View>
        <Text style={styles.infoBody}>
          Automatic point generation is currently disabled. All points must be recorded with an immutable audit reason.
        </Text>
      </Card>

      {/* Select Member */}
      <Text style={styles.sectionLabel}>Select Member</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberScroll}>
        {members.map((member) => {
          const isSelected = selectedMember?.id === member.id;
          return (
            <TouchableOpacity
              key={member.id}
              style={[styles.memberChip, isSelected && styles.memberChipSelected]}
              onPress={() => setSelectedMember(member)}
            >
              <Text
                style={[styles.memberChipText, isSelected && styles.memberChipTextSelected]}
                numberOfLines={1}
              >
                {member.full_name || member.email}
              </Text>
              <Badge label={member.role} variant={isSelected ? 'gold' : 'slate'} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedMember && (
        <View style={styles.selectedMemberBadge}>
          <Text style={styles.selectedMemberLabel}>Target:</Text>
          <Text style={styles.selectedMemberName}>
            {selectedMember.full_name || selectedMember.email} ({selectedMember.email})
          </Text>
        </View>
      )}

      {/* Action Type Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.actionToggle, !isDeduction && styles.actionToggleEarned]}
          onPress={() => setIsDeduction(false)}
        >
          <Ionicons
            name="arrow-up"
            size={16}
            color={!isDeduction ? Colors.emeraldLight : Colors.text.muted}
          />
          <Text style={[styles.actionToggleText, !isDeduction && styles.actionToggleTextEarned]}>
            Add Points (+)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionToggle, isDeduction && styles.actionToggleDeducted]}
          onPress={() => setIsDeduction(true)}
        >
          <Ionicons
            name="arrow-down"
            size={16}
            color={isDeduction ? Colors.roseLight : Colors.text.muted}
          />
          <Text style={[styles.actionToggleText, isDeduction && styles.actionToggleTextDeducted]}>
            Deduct Points (-)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      <Input
        label="Point Amount"
        placeholder="e.g. 50"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Input
        label="Audit Reason"
        placeholder="e.g. Exceptional project contributions"
        value={reason}
        onChangeText={setReason}
      />

      {/* Type Selection */}
      <Text style={styles.sectionLabel}>Transaction Classification</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, txType === 'MANUAL' && styles.typeBtnActive]}
          onPress={() => setTxType('MANUAL')}
        >
          <Text style={[styles.typeText, txType === 'MANUAL' && styles.typeTextActive]}>
            MANUAL
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeBtn, txType === 'ADJUSTMENT' && styles.typeBtnActive]}
          onPress={() => setTxType('ADJUSTMENT')}
        >
          <Text style={[styles.typeText, txType === 'ADJUSTMENT' && styles.typeTextActive]}>
            ADJUSTMENT
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title={isDeduction ? `Deduct ${amount || '0'} Points` : `Award ${amount || '0'} Points`}
        onPress={handleSubmit}
        loading={awardMutation.isPending}
        variant={isDeduction ? 'destructive' : 'gold'}
        size="lg"
        style={styles.submitBtn}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  unauthorizedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  unauthorizedText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: Colors.goldBg,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.goldLight,
  },
  infoBody: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  memberScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  memberChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    gap: 4,
    maxWidth: 180,
  },
  memberChipSelected: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  memberChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  memberChipTextSelected: {
    color: Colors.goldLight,
  },
  selectedMemberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  selectedMemberLabel: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  selectedMemberName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  actionToggleEarned: {
    borderColor: Colors.emerald,
    backgroundColor: Colors.emeraldBg,
  },
  actionToggleDeducted: {
    borderColor: Colors.rose,
    backgroundColor: Colors.roseBg,
  },
  actionToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  actionToggleTextEarned: {
    color: Colors.emeraldLight,
  },
  actionToggleTextDeducted: {
    color: Colors.roseLight,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtnActive: {
    borderColor: Colors.primaryLight,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  typeTextActive: {
    color: Colors.primaryLight,
  },
  submitBtn: {
    marginTop: 8,
  },
});
