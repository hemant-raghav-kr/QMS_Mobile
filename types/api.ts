import type {
  Profile,
  PointTransaction,
  UserPointsSummary,
  Announcement,
  Meeting,
  Notification,
  UserRole,
  PointTransactionType,
} from './database';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

// GET /api/v1/profile
export type GetProfileResponse = ApiResponse<Profile>;

// PATCH /api/v1/profile
export interface UpdateProfileRequest {
  full_name?: string | null;
  avatar_url?: string | null;
}
export type UpdateProfileResponse = ApiResponse<Profile>;

// GET /api/v1/points
export type GetPointsSummaryResponse = ApiResponse<UserPointsSummary>;

// GET /api/v1/points/transactions
export interface GetPointsTransactionsQuery {
  limit?: number;
  offset?: number;
  type?: PointTransactionType;
}
export type GetPointsTransactionsResponse = ApiResponse<PointTransaction[]>;

// GET /api/v1/announcements
export interface GetAnnouncementsQuery {
  includeArchived?: boolean;
  audience?: 'ALL' | 'MEMBERS' | 'ADMINS';
}
export type GetAnnouncementsResponse = ApiResponse<Announcement[]>;

// GET /api/v1/meetings
export interface GetMeetingsQuery {
  filter?: 'upcoming' | 'past' | 'all';
}
export type GetMeetingsResponse = ApiResponse<Meeting[]>;

// GET /api/v1/notifications
export interface GetNotificationsQuery {
  limit?: number;
  unreadOnly?: boolean;
}
export type GetNotificationsResponse = ApiResponse<Notification[]>;

// PATCH /api/v1/notifications/:id/read
export type MarkNotificationReadResponse = ApiResponse<{ id: string; read: boolean }>;

// POST /api/v1/notifications/read-all
export type MarkAllNotificationsReadResponse = ApiResponse<{ updatedCount: number }>;

// POST /api/v1/notifications/push-token
export interface RegisterPushTokenRequest {
  pushToken: string;
  platform: 'ios' | 'android' | 'web';
  deviceName?: string;
}
export type RegisterPushTokenResponse = ApiResponse<{ registered: boolean }>;

// Admin APIs:
// GET /api/v1/admin/members
export type AdminGetMembersResponse = ApiResponse<Profile[]>;

// GET /api/v1/admin/members/:id/points
export type AdminGetMemberPointsResponse = ApiResponse<UserPointsSummary>;

// GET /api/v1/admin/members/:id/transactions
export type AdminGetMemberTransactionsResponse = ApiResponse<PointTransaction[]>;

// POST /api/v1/admin/points
export interface AdminAwardPointsRequest {
  userId: string;
  amount: number;
  reason: string;
  type?: 'MANUAL' | 'ADJUSTMENT';
}
export type AdminAwardPointsResponse = ApiResponse<PointTransaction>;
