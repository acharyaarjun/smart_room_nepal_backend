# API Documentation - Dashboard and Profile Management

## Overview

This document outlines the newly created APIs for dashboard data fetching and user profile management.

---

## 📊 Dashboard APIs

### 1. User Dashboard

**Endpoint:** `GET /api/v1/dashboard/user`  
**Access:** Private (User role only)  
**Description:** Fetches comprehensive dashboard data for regular users

**Response Data:**

```typescript
{
  stats: {
    totalRequests: number;           // Total room requests made
    pendingRequests: number;          // Pending requests
    approvedRequests: number;         // Approved requests
    rejectedRequests: number;         // Rejected requests
    canceledRequests: number;         // Canceled requests
    ongoingRequests: number;          // Ongoing requests
    completedRequests: number;        // Completed requests
    totalWishlists: number;           // Total wishlist items
    totalRecentlyViewed: number;      // Total recently viewed rooms
    totalReviews: number;             // Total reviews given
  },
  recentRequests: RoomRequest[];      // Last 5 room requests with room details
  recentWishlists: Wishlist[];        // Last 5 wishlist items with room details
}
```

---

### 2. Host Dashboard

**Endpoint:** `GET /api/v1/dashboard/host`  
**Access:** Private (Host role only)  
**Description:** Fetches comprehensive dashboard data for hosts

**Response Data:**

```typescript
{
  stats: {
    totalRooms: number;               // Total rooms created
    approvedRooms: number;            // Approved rooms
    pendingRooms: number;             // Pending rooms
    maintenanceRooms: number;         // Rooms under maintenance
    disabledByAdminRooms: number;     // Disabled by admin
    disabledByOwnerRooms: number;     // Disabled by owner
    featuredRooms: number;            // Featured rooms
    totalRequests: number;            // Total requests for host's rooms
    pendingRequests: number;          // Pending requests
    approvedRequests: number;         // Approved requests
    rejectedRequests: number;         // Rejected requests
    ongoingRequests: number;          // Ongoing requests
    completedRequests: number;        // Completed requests
    totalReviews: number;             // Total reviews received
    averageRating: number;            // Average rating (0-5)
    availableCredits: number;         // Available room posting credits
  },
  recentRequests: RoomRequest[];      // Last 5 requests with user details
  topRatedRooms: Room[];              // Last 5 rooms with details
}
```

---

### 3. Admin Dashboard

**Endpoint:** `GET /api/v1/dashboard/admin`  
**Access:** Private (Admin role only)  
**Description:** Fetches comprehensive dashboard data for administrators

**Response Data:**

```typescript
{
  stats: {
    users: {
      total: number;                  // Total users
      admins: number;                 // Total admins
      hosts: number;                  // Total hosts
      normalUsers: number;            // Total regular users
      active: number;                 // Active users
      inactive: number;               // Suspended users
    },
    rooms: {
      total: number;                  // Total rooms
      approved: number;               // Approved rooms
      pending: number;                // Pending rooms
      maintenance: number;            // Maintenance rooms
      disabledByAdmin: number;        // Disabled by admin
      disabledByOwner: number;        // Disabled by owner
      featured: number;               // Featured rooms
    },
    requests: {
      total: number;                  // Total requests
      pending: number;                // Pending requests
      approved: number;               // Approved requests
      rejected: number;               // Rejected requests
      ongoing: number;                // Ongoing requests
      completed: number;              // Completed requests
    },
    reviews: {
      total: number;                  // Total reviews
      averageRating: number;          // Overall average rating
    },
    payments: {
      total: number;                  // Total payments
      completed: number;              // Completed payments
      pending: number;                // Pending payments
      failed: number;                 // Failed payments
      totalRevenue: number;           // Total revenue from completed payments
    },
    districts: {
      total: number;                  // Total districts
    }
  },
  recentUsers: User[];                // Last 5 registered users
  recentRooms: Room[];                // Last 5 created rooms
  recentRequests: RoomRequest[];      // Last 5 room requests
}
```

---

## 🔐 Authentication & Profile APIs

### 4. Change Password

**Endpoint:** `PUT /api/v1/auth/change-password`  
**Access:** Private (All authenticated users)  
**Description:** Allows authenticated users to change their password

**Request Body:**

```typescript
{
  currentPassword: string; // Current password (required)
  newPassword: string; // New password (required, min 6 chars, different from current)
  confirmPassword: string; // Must match newPassword
}
```

**Validation Rules:**

- `currentPassword`: Required, must match current password
- `newPassword`: Required, minimum 6 characters, must be different from current
- `confirmPassword`: Required, must match newPassword

**Response Data:** (Same format as login, without tokens)

```typescript
{
  user: {
    id: number;
    role: string;
    username: string;
    email: string;
    fullName: string;
    isEmailVerified: boolean;
    isEnabled: boolean;
    loginMethod: string;
    userProfile: {
      id: number;
      phone: string;
      gender: string;
      dob: Date;
      occupationStatus: string;
      maritalStatus: string;
      avatar: Media | null;
      document: Media | null;
    }
  },
  availableCredits?: number;  // Only for hosts
}
```

---

### 5. Update Profile (Modified)

**Endpoint:** `PUT /api/v1/users/profile/me`  
**Access:** Private (All authenticated users)  
**Description:** Updates user profile with enhanced response format

**Request Body:** (All fields optional, supports multipart/form-data)

```typescript
{
  fullName?: string;              // 2-100 characters
  phone?: string;                 // 10 digits
  gender?: Gender;                // Enum value
  dob?: Date;                     // ISO8601 format, age 18-120
  occupationStatus?: string;      // Enum value
  maritalStatus?: string;         // Enum value
  avatar?: File;                  // Image file
  document?: File;                // Document file
}
```

**Response Data:** (Same format as login and changePassword, without tokens)

```typescript
{
  user: {
    id: number;
    role: string;
    username: string;
    email: string;
    fullName: string;
    isEmailVerified: boolean;
    isEnabled: boolean;
    loginMethod: string;
    userProfile: {
      id: number;
      phone: string;
      gender: string;
      dob: Date;
      occupationStatus: string;
      maritalStatus: string;
      avatar: Media | null;
      document: Media | null;
    }
  },
  availableCredits?: number;  // Only for hosts (calculated based on memberships)
}
```

---

## 📁 File Structure

### Controllers

```
src/controllers/v1/
├── dashboard/
│   ├── index.ts
│   ├── getUserDashboard.controller.ts
│   ├── getHostDashboard.controller.ts
│   └── getAdminDashboard.controller.ts
├── auth/
│   ├── index.ts
│   ├── changePassword.controller.ts  (NEW)
│   └── ...existing files
└── users/
    ├── updateProfile.controller.ts   (MODIFIED)
    └── ...existing files
```

### Routes

```
src/routes/v1/
├── dashboard/
│   └── routes.ts                     (NEW)
├── auth/
│   └── routes.ts                     (MODIFIED - added change password)
└── index.ts                          (MODIFIED - registered dashboard routes)
```

### Validators

```
src/validators/v1/
└── auth/
    ├── index.ts                      (MODIFIED)
    └── changePassword.validator.ts   (NEW)
```

---

## 🔑 Key Features

### Dashboard APIs

- ✅ Role-based access control (User, Host, Admin)
- ✅ Comprehensive statistics for each role
- ✅ Recent activity tracking
- ✅ Performance metrics (ratings, revenue)
- ✅ Membership credit calculation for hosts

### Profile Management

- ✅ Secure password change with validation
- ✅ Profile updates with file uploads
- ✅ Consistent response format across login, changePassword, and updateProfile
- ✅ Automatic credit calculation for hosts
- ✅ Avatar and document management

---

## 🎯 Usage Examples

### Get User Dashboard

```bash
GET /api/v1/dashboard/user
Authorization: Bearer <access_token>
```

### Get Host Dashboard

```bash
GET /api/v1/dashboard/host
Authorization: Bearer <access_token>
```

### Get Admin Dashboard

```bash
GET /api/v1/dashboard/admin
Authorization: Bearer <access_token>
```

### Change Password

```bash
PUT /api/v1/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

### Update Profile

```bash
PUT /api/v1/users/profile/me
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

fullName: John Doe
phone: 9876543210
gender: male
avatar: <file>
document: <file>
```

---

## 📝 Notes

1. **Role-Based Access**: Dashboard endpoints are protected by role-specific middleware
2. **Credits Calculation**: For hosts, available credits = (total membership limits) - (existing rooms)
3. **Response Consistency**: Profile update and change password return the same user object format as login (without tokens)
4. **File Uploads**: Avatar saves to `/uploads/avatars/`, documents to `/uploads/documents/`
5. **Enum Values**: Use actual enum values from:
   - `RoomStatus`: PENDING, APPROVED, MAINTENANCE, DISABLED_BY_ADMIN, DISABLED_BY_OWNER
   - `RoomRequestStatus`: PENDING, APPROVED, REJECTED, CANCELED, ON_GOING, COMPLETED
   - `UserStatus`: PENDING, ACTIVE, SUSPENDED, DELETED

---

## ✨ Implementation Complete

All APIs have been successfully created and integrated into the existing codebase following the established patterns and best practices.
