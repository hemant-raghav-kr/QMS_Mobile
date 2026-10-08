import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import type { UserRole, MeetingStatus, AnnouncementAudience } from '@/types/database';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'gold' | 'emerald' | 'rose' | 'slate' | 'purple';
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>{label}</Text>
    </View>
  );
}

export function RoleBadge({ role }: { role: UserRole | null }) {
  if (!role) return null;
  const config = {
    SUPER_ADMIN: { label: 'SUPER ADMIN', variant: 'purple' as const },
    ADMIN: { label: 'ADMIN', variant: 'primary' as const },
    MEMBER: { label: 'MEMBER', variant: 'slate' as const },
  };
  const item = config[role] || { label: role, variant: 'slate' as const };
  return <Badge label={item.label} variant={item.variant} />;
}

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  const config = {
    LIVE: { label: 'LIVE NOW', variant: 'rose' as const },
    SCHEDULED: { label: 'SCHEDULED', variant: 'primary' as const },
    COMPLETED: { label: 'COMPLETED', variant: 'emerald' as const },
    CANCELLED: { label: 'CANCELLED', variant: 'slate' as const },
  };
  const item = config[status] || { label: status, variant: 'slate' as const };
  return <Badge label={item.label} variant={item.variant} />;
}

export function AudienceBadge({ audience }: { audience: AnnouncementAudience }) {
  const config = {
    ALL: { label: 'ALL MEMBERS', variant: 'emerald' as const },
    MEMBERS: { label: 'MEMBERS ONLY', variant: 'primary' as const },
    ADMINS: { label: 'ADMINS ONLY', variant: 'purple' as const },
  };
  const item = config[audience] || { label: audience, variant: 'slate' as const };
  return <Badge label={item.label} variant={item.variant} />;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primary: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  primaryText: {
    color: Colors.primaryLight,
  },
  gold: {
    backgroundColor: Colors.goldBg,
  },
  goldText: {
    color: Colors.goldLight,
  },
  emerald: {
    backgroundColor: Colors.emeraldBg,
  },
  emeraldText: {
    color: Colors.emeraldLight,
  },
  rose: {
    backgroundColor: Colors.roseBg,
  },
  roseText: {
    color: Colors.roseLight,
  },
  slate: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  slateText: {
    color: Colors.text.secondary,
  },
  purple: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  purpleText: {
    color: '#C084FC',
  },
});
