export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
export type MeetingType = 'INTERNAL' | 'EXTERNAL';
export type MeetingStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'LEFT_EARLY';
export type PointTransactionType = 'AUTOMATIC' | 'MANUAL' | 'ADJUSTMENT' | 'REVERSAL';
export type AnnouncementAudience = 'ALL' | 'MEMBERS' | 'ADMINS';
export type WeeklyReportStatus = 'SENT' | 'FAILED' | 'PENDING';
export type MeetingReminderType = '30_MIN' | '10_MIN' | 'START';

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile };
      meetings: { Row: Meeting };
      meeting_participants: { Row: MeetingParticipant };
      attendance: { Row: Attendance };
      point_rules: { Row: PointRule };
      point_transactions: { Row: PointTransaction };
      announcements: { Row: Announcement };
      notifications: { Row: Notification };
      audit_logs: { Row: AuditLog };
      push_subscriptions: { Row: PushSubscription };
    };
  };
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meeting_type: MeetingType;
  external_meeting_url: string | null;
  status: MeetingStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingParticipant {
  meeting_id: string;
  user_id: string;
  invited_at: string;
  profiles?: Profile | null;
}

export interface Attendance {
  id: string;
  meeting_id: string;
  user_id: string;
  status: AttendanceStatus;
  joined_at: string | null;
  left_at: string | null;
  marked_by: string | null;
  overridden_by: string | null;
  override_reason: string | null;
  original_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface PointRule {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  condition_value: string | null;
  points: number;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  type: PointTransactionType;
  rule_id: string | null;
  meeting_id: string | null;
  reversal_of_id: string | null;
  idempotency_key: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience: AnnouncementAudience;
  archived: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  creator?: Profile | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link_url: string | null;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Json;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}

export interface UserPointsSummary {
  totalPoints: number;
  pointsEarned: number;
  pointsDeducted: number;
  transactionsCount: number;
}
