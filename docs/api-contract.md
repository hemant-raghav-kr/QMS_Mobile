# Quartzite Management System (QMS) — Mobile API Contract (v1)

This document establishes the official API contract between the **QMS Web Backend** (`https://quartzitemanagementsystem.vercel.app`) and the **QMS Mobile Application** (`QMS_Mobile`).

---

## 1. Architectural Principles

1. **Protocol & Base URL**:
   - Production API: `https://quartzitemanagementsystem.vercel.app`
   - Configurable via: `EXPO_PUBLIC_API_URL`
2. **Versioning**:
   - All mobile REST endpoints adhere to `/api/v1/...` to preserve compatibility with existing web endpoints.
3. **Authentication**:
   - All protected requests require a valid Supabase Access Token in the `Authorization` header:
     ```http
     Authorization: Bearer <supabase_access_token>
     ```
   - User identity is derived strictly server-side from `auth.uid()`.
   - Client-supplied user identities are never trusted for authorization.
4. **Standard Error Schema**:
   ```json
   {
     "error": "Human-readable error description",
     "code": "ERROR_CODE_ENUM",
     "details": null
   }
   ```
   Standard HTTP Status Codes:
   - `200 OK` / `201 Created`: Request succeeded.
   - `400 Bad Request`: Validation failure or bad input.
   - `401 Unauthorized`: Missing, invalid, or expired session token.
   - `403 Forbidden`: Insufficient role or permissions.
   - `404 Not Found`: Entity does not exist.
   - `429 Too Many Requests`: Rate limit triggered.
   - `500 Internal Server Error`: Server failure.

---

## 2. Profile Endpoints

### 2.1. Get Current User Profile
- **Method**: `GET`
- **URL**: `/api/v1/profile`
- **Authentication**: `Bearer <access_token>`
- **Required Role**: Any authenticated member (`MEMBER`, `ADMIN`, `SUPER_ADMIN`)
- **Query Parameters**: None
- **Response `200 OK`**:
  ```json
  {
    "id": "c1f7a0b3-90d1-4cb5-87f1-840bf2b12345",
    "email": "member@quartzite.io",
    "full_name": "Hemant Raghav",
    "avatar_url": null,
    "role": "MEMBER",
    "created_at": "2026-09-20T10:00:00Z",
    "updated_at": "2026-10-08T14:30:00Z"
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Token missing or expired.
  - `404 Not Found`: Profile record does not exist.

### 2.2. Update Permitted Profile Fields
- **Method**: `PATCH`
- **URL**: `/api/v1/profile`
- **Authentication**: `Bearer <access_token>`
- **Required Role**: Any authenticated member
- **Request Body**:
  ```json
  {
    "full_name": "Hemant Raghav",
    "avatar_url": null
  }
  ```
- **Rules**:
  - Users CANNOT modify their `role`, `id`, `email`, or `created_at`.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c1f7a0b3-90d1-4cb5-87f1-840bf2b12345",
      "email": "member@quartzite.io",
      "full_name": "Hemant Raghav",
      "avatar_url": null,
      "role": "MEMBER",
      "updated_at": "2026-10-08T15:00:00Z"
    }
  }
  ```

---

## 3. Points Endpoints

### 3.1. Get Points Summary
- **Method**: `GET`
- **URL**: `/api/v1/points`
- **Authentication**: `Bearer <access_token>`
- **Required Role**: Any authenticated member
- **Query Parameters**: None
- **Calculation Rule**:
  - Point balance MUST be calculated strictly from the immutable `point_transactions` ledger:
    `totalPoints = SUM(amount)`
    `pointsEarned = SUM(amount WHERE amount > 0)`
    `pointsDeducted = ABS(SUM(amount WHERE amount < 0))`
- **Response `200 OK`**:
  ```json
  {
    "totalPoints": 150,
    "pointsEarned": 180,
    "pointsDeducted": 30,
    "transactionsCount": 12
  }
  ```

### 3.2. Get Points Transaction History
- **Method**: `GET`
- **URL**: `/api/v1/points/transactions`
- **Authentication**: `Bearer <access_token>`
- **Required Role**: Any authenticated member
- **Query Parameters**:
  - `limit` (optional, default: 50): Number of transactions to return.
  - `type` (optional): Filter by transaction type (`MANUAL`, `AUTOMATIC`, `ADJUSTMENT`, `REVERSAL`).
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "e9b2-...",
      "user_id": "c1f7a0b3-...",
      "amount": 25,
      "reason": "Active participation in weekly engineering sync",
      "type": "MANUAL",
      "rule_id": null,
      "meeting_id": null,
      "reversal_of_id": null,
      "created_by": "admin-uuid",
      "created_at": "2026-10-08T12:00:00Z"
    }
  ]
  ```

---

## 4. Meetings Endpoints

### 4.1. Get Meetings List
- **Method**: `GET`
- **URL**: `/api/v1/meetings`
- **Authentication**: `Bearer <access_token>`
- **Required Role**: Any authenticated member
- **Query Parameters**:
  - `filter` (optional, default: `upcoming`): `'upcoming' | 'past' | 'all'`
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "f512-...",
      "title": "Weekly Engineering Review",
      "description": "Cross-platform mobile and web roadmap updates.",
      "scheduled_at": "2026-10-10T14:00:00Z",
      "duration_minutes": 45,
      "meeting_type": "EXTERNAL",
      "external_meeting_url": "https://meet.google.com/abc-defg-hij",
      "status": "SCHEDULED",
      "created_by": "user-uuid",
      "created_at": "2026-10-07T10:00:00Z",
      "updated_at": "2026-10-07T10:00:00Z"
    }
  ]
  ```

### 4.2. Existing Meeting Endpoints (Reused)
- **Token**: `GET /api/meetings/[id]/token` (LiveKit SFU token generation; preserved for future native LiveKit phase).
- **Conclude Meeting**: `POST /api/meetings/[id]/end` (Hosts/admins end meeting and trigger attendance finalization).

---

## 5. Announcements Endpoints

### 5.1. Get Announcements
- **Method**: `GET`
- **URL**: `/api/v1/announcements`
- **Authentication**: `Bearer <access_token>`
- **Required Role**: Any authenticated member
- **Query Parameters**:
  - `includeArchived` (optional, default: `false`): Include archived notices.
- **Audience Enforcement**:
  - `MEMBER` role receives only `target_audience IN ('ALL', 'MEMBERS')`.
  - `ADMIN` and `SUPER_ADMIN` receive all audiences.
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "ann-123",
      "title": "Welcome to QMS Mobile Beta",
      "content": "The QMS mobile app is now available for attendance and point tracking.",
      "target_audience": "ALL",
      "archived": false,
      "created_by": "admin-uuid",
      "created_at": "2026-10-08T09:00:00Z",
      "updated_at": "2026-10-08T09:00:00Z"
    }
  ]
  ```

---

## 6. Notifications Endpoints

### 6.1. Get Notifications
- **Method**: `GET`
- **URL**: `/api/v1/notifications`
- **Authentication**: `Bearer <access_token>`
- **Required Role**: Any authenticated member
- **Query Parameters**:
  - `limit` (optional, default: 50)
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "notif-456",
      "user_id": "c1f7a0b3-...",
      "title": "Points Awarded",
      "message": "You received +25 points for engineering contributions.",
      "type": "POINTS",
      "link_url": "/(tabs)/points",
      "read": false,
      "created_at": "2026-10-08T12:00:00Z"
    }
  ]
  ```

### 6.2. Mark Notification as Read
- **Method**: `PATCH`
- **URL**: `/api/v1/notifications/:id/read`
- **Authentication**: `Bearer <access_token>`
- **Response `200 OK`**:
  ```json
  {
    "success": true
  }
  ```

### 6.3. Mark All Notifications as Read
- **Method**: `POST`
- **URL**: `/api/v1/notifications/read-all`
- **Authentication**: `Bearer <access_token>`
- **Response `200 OK`**:
  ```json
  {
    "success": true
  }
  ```

### 6.4. Register Device Push Token
- **Method**: `POST`
- **URL**: `/api/v1/notifications/push-token`
- **Authentication**: `Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "platform": "ios"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Push token registered successfully."
  }
  ```

---

## 7. Admin Endpoints

### 7.1. Get All Members
- **Method**: `GET`
- **URL**: `/api/v1/admin/members`
- **Authentication**: `Bearer <access_token>`
- **Required Role**: `ADMIN` or `SUPER_ADMIN`
- **Response `200 OK`**: Array of member profiles.
- **Errors**:
  - `403 Forbidden`: When called by a standard `MEMBER`.

### 7.2. Award or Deduct Points Manually
- **Method**: `POST`
- **URL**: `/api/v1/admin/points`
- **Authentication**: `Bearer <access_token>`
- **Required Role**: `ADMIN` or `SUPER_ADMIN`
- **Request Body**:
  ```json
  {
    "userId": "c1f7a0b3-...",
    "amount": 50,
    "reason": "Exemplary contribution to mobile client rollout",
    "type": "MANUAL"
  }
  ```
- **Rules**:
  - Amount can be positive (award) or negative (deduction).
  - Reason is required for audit logs.
  - Automatically records `created_by` as the authenticated admin.
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "new-tx-uuid",
      "user_id": "c1f7a0b3-...",
      "amount": 50,
      "reason": "Exemplary contribution to mobile client rollout",
      "type": "MANUAL",
      "created_at": "2026-10-08T15:30:00Z"
    }
  }
  ```
- **Errors**:
  - `403 Forbidden`: Non-admin user attempt.

---

## 8. Web Backend Readiness & Mobile Fallback Policy

| Endpoint | Web Backend Route Status | Mobile Client Implementation | Fallback Strategy |
| :--- | :--- | :--- | :--- |
| `GET /api/v1/profile` | Needs creation in Web Repo | `services/profileService.ts` | Authenticated Supabase RLS query on `profiles` |
| `PATCH /api/v1/profile` | Needs creation in Web Repo | `services/profileService.ts` | Authenticated Supabase RLS update on `profiles` |
| `GET /api/v1/points` | Needs creation in Web Repo | `services/pointsService.ts` | Dynamic calculation from immutable `point_transactions` ledger |
| `GET /api/v1/points/transactions` | Needs creation in Web Repo | `services/pointsService.ts` | Supabase RLS query on `point_transactions` |
| `GET /api/v1/meetings` | Needs creation in Web Repo | `services/meetingsService.ts` | Supabase query on `meetings` |
| `GET /api/v1/announcements` | Needs creation in Web Repo | `services/announcementsService.ts`| Supabase query with target audience filter |
| `GET /api/v1/notifications` | Needs creation in Web Repo | `services/notificationsService.ts`| Supabase query on `notifications` |
| `POST /api/v1/admin/points` | Needs creation in Web Repo | `services/pointsService.ts` | Supabase RLS insert with server-side admin check |
| `GET /api/meetings/[id]/token` | Reusable from existing web | `lib/api/client.ts` | Consumes existing Next.js API route directly |
| `POST /api/meetings/[id]/end` | Reusable from existing web | `lib/api/client.ts` | Consumes existing Next.js API route directly |
