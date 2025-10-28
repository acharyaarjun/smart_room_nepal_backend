# User Flow Documentation - Smart Room Nepal

## Table of Contents

1. [User Flow (Regular User)](#user-flow-regular-user)
2. [Host Flow](#host-flow)
3. [Admin Flow](#admin-flow)
4. [Overflow & Edge Cases](#overflow--edge-cases)

---

## 🧑 User Flow (Regular User)

### 1️⃣ Registration & Authentication

#### Registration Process

```
START
  ↓
POST /api/v1/auth/register
  ├─ Upload document (citizenship/license)
  ├─ Provide: email, password, fullName, username
  ├─ Optional: phone, gender, dob, occupationStatus, maritalStatus
  ↓
Email Verification Required
  ↓
Account Created (Role: USER)
  ├─ User receives profile data
  └─ isEmailVerified: false (initially)
```

**Fields:**

- ✅ Required: email, password, fullName, username
- 📄 Document: Citizenship/License (uploaded)
- ℹ️ Optional: phone, gender, dob, occupationStatus, maritalStatus

#### Login Process

```
START
  ↓
POST /api/v1/auth/login
  ├─ Email & Password validation
  ├─ Check email verified
  ├─ Check account enabled
  ↓
SUCCESS
  ├─ accessToken (cookie + response)
  ├─ refreshToken (cookie + response)
  └─ User profile with userProfile details
```

**Returns:**

- User object with profile
- Access & refresh tokens
- Login history tracked (IP + User Agent)

---

### 2️⃣ Profile Management

#### View Profile

```
GET /api/v1/users/profile/me
  ↓
Returns: Full user profile
  ├─ Personal info (email, fullName, username)
  ├─ UserProfile (phone, gender, dob, etc.)
  ├─ Avatar image
  └─ Document image
```

#### Update Profile

```
PUT /api/v1/users/profile/me
  ├─ Update: fullName, phone, gender, dob
  ├─ Update: occupationStatus, maritalStatus
  ├─ Upload new avatar (optional)
  ├─ Upload new document (optional)
  ↓
Returns: Updated user object (same format as login)
```

#### Change Password

```
PUT /api/v1/auth/change-password
  ├─ Validate current password
  ├─ New password (min 6 chars)
  ├─ Confirm password match
  ↓
Returns: Updated user object (same format as login, no tokens)
```

---

### 3️⃣ Room Browsing & Discovery

#### Browse All Rooms

```
GET /api/v1/rooms (Public or Authenticated)
  ├─ Filters: district, roomType, maxCapacity
  ├─ Filters: minPrice, maxPrice, isFeatured
  ├─ Search by name/description
  ├─ Pagination: page, size
  ├─ Sort: sortBy, orderBy
  ↓
Returns: Paginated room list
  ├─ Room details with images
  ├─ District info
  ├─ Wishlist flag (if authenticated)
  └─ Owner info (if admin viewing)
```

**Public Access:** ✅ Works without authentication
**Authenticated:** Shows wishlist status

#### View Single Room

```
GET /api/v1/rooms/:slug/user (Public/Authenticated)
  ↓
Automatically tracks in "Recently Viewed" (if authenticated)
  ↓
Returns: Complete room details
  ├─ Room info (name, price, description)
  ├─ All media/images
  ├─ Amenities
  ├─ Reviews & ratings
  ├─ District details
  └─ Owner contact info
```

---

### 4️⃣ Wishlist Management

#### Toggle Wishlist

```
POST /api/v1/rooms/wishlist/:slug
  ↓
If exists → Remove from wishlist
If not exists → Add to wishlist
  ↓
Returns: Success message
```

#### View Wishlist

```
GET /api/v1/rooms/wishlist
  ├─ Pagination support
  ↓
Returns: All wishlisted rooms
  ├─ Room details
  ├─ Images
  └─ Current status
```

---

### 5️⃣ Room Request (Booking) Flow

#### Create Room Request

```
POST /api/v1/rooms/requests/:slug
  ├─ Required: roomId (from slug)
  ├─ isFixedDate: true/false
  ├─ Optional: startDate, endDate (if fixed date)
  ├─ Optional: price (proposed price)
  ↓
Request Created
  ├─ Status: PENDING
  ├─ Unique token generated
  └─ Notification sent to host
```

**Request Statuses:**

- `PENDING` → Initial state
- `APPROVED` → Host accepted
- `REJECTED` → Host declined
- `CANCELED` → User/Host canceled
- `ON_GOING` → Booking in progress
- `COMPLETED` → Booking finished

#### View My Requests

```
GET /api/v1/rooms/requests
  ├─ Filter by status
  ├─ Pagination support
  ↓
Returns: All user's room requests
  ├─ Request details
  ├─ Room info
  ├─ Status
  └─ Conversation history
```

#### Update Request (Cancel)

```
PUT /api/v1/rooms/requests/:token
  ├─ Update status to CANCELED
  ├─ Or negotiate price
  ↓
Returns: Updated request
```

---

### 6️⃣ Messaging (Conversations)

#### View Conversation

```
GET /api/v1/rooms/requests/:roomRequestId/conversations
  ↓
Returns: Message history
  ├─ All messages between user & host
  ├─ Sender info
  ├─ Read status
  └─ Timestamps
```

**Real-time via Socket.IO:**

```
Event: "message:send"
  ├─ roomRequestId
  ├─ message content
  ↓
Event: "message:receive" (broadcast)
  ├─ New message
  └─ Notification

Event: "message:read"
  ├─ Mark messages as read
  └─ Update read status
```

#### Unread Count

```
GET /api/v1/rooms/requests/:roomRequestId/conversations/unread-count
  ↓
Returns: Number of unread messages
```

#### Unread Summary

```
GET /api/v1/rooms/requests/conversations/summary
  ↓
Returns: All room requests with unread counts
```

---

### 7️⃣ Reviews & Ratings

#### Create Review (After Completion)

```
POST /api/v1/rooms/reviews/:roomRequestId
  ├─ Can only review COMPLETED requests
  ├─ rating: 1-5
  ├─ message: Review text
  ├─ Optional: Upload image
  ↓
Review Created
  ├─ One review per room request
  └─ Visible to all users
```

#### View My Reviews

```
GET /api/v1/rooms/reviews/user
  ↓
Returns: All reviews written by user
```

#### Update Review

```
PUT /api/v1/rooms/reviews/:reviewId
  ├─ Update rating
  ├─ Update message
  └─ Update image
```

#### Delete Review

```
DELETE /api/v1/rooms/reviews/:reviewId
  ↓
Soft delete (paranoid: true)
```

#### View Room Reviews

```
GET /api/v1/rooms/reviews (Public)
  ├─ Filter by room
  ├─ Pagination
  ↓
Returns: All public reviews
```

---

### 8️⃣ Recently Viewed Rooms

```
GET /api/v1/rooms/recently-viewed
  ├─ Automatic tracking when viewing rooms
  ├─ Limited to recent 20 rooms
  ↓
Returns: Recently viewed room history
  ├─ Room details
  ├─ Last viewed timestamp
  └─ Sorted by most recent
```

---

### 9️⃣ User Dashboard

```
GET /api/v1/dashboard/user
  ↓
Returns: Comprehensive dashboard
  ├─ Stats:
  │   ├─ Total requests (all statuses)
  │   ├─ Pending, Approved, Rejected counts
  │   ├─ Ongoing, Completed, Canceled counts
  │   ├─ Total wishlists
  │   ├─ Total recently viewed
  │   └─ Total reviews given
  ├─ Recent Requests (last 5)
  │   └─ With room details & images
  └─ Recent Wishlists (last 5)
      └─ With room details
```

---

### 🔟 Logout

```
POST /api/v1/auth/logout
  ↓
Invalidates refresh token
  ├─ Clear cookies
  └─ Remove from database
```

---

## 🏠 Host Flow

### 1️⃣ Registration & Setup

#### Become a Host

```
Register with Role: HOST
  ↓
Same registration as User
  ├─ Document required
  └─ Email verification required
```

**Host Privileges:**

- Can create rooms (with limits)
- Manage room requests
- View analytics
- Earn from bookings

---

### 2️⃣ Membership & Credits

#### View Membership Types

```
GET /api/v1/membership-types
  ↓
Returns: Available membership plans
  ├─ Free: 1 room limit
  ├─ Basic: X rooms
  ├─ Premium: Y rooms
  └─ Enterprise: Z rooms
```

#### Purchase Membership

```
POST /api/v1/membership
  ├─ Select membershipTypeId
  ├─ Choose payment method (Khalti)
  ↓
Payment Created (Status: PENDING)
  ├─ Redirect to Khalti
  └─ Return URL: /payment/verify/khalti
```

#### Payment Verification (Khalti Callback)

```
GET /api/v1/membership/payment/verify/khalti
  ├─ Verify with Khalti API
  ├─ Update payment status: COMPLETED
  ↓
Credits Added
  └─ Can now create more rooms
```

**Credit Calculation:**

```
Available Credits = (Total Membership Limits) - (Existing Rooms)
```

#### View Payment History

```
GET /api/v1/membership/payments
  ↓
Returns: All membership payments
  ├─ Payment details
  ├─ Status
  ├─ Membership type
  └─ Amount paid
```

#### View Active Membership

```
GET /api/v1/membership/active
  ↓
Returns: Current active membership
  ├─ Membership type
  ├─ Remaining credits
  └─ Expiry (if applicable)
```

---

### 3️⃣ Room Management

#### Create Room

```
POST /api/v1/rooms
  ├─ Check credit limit (checkLimitMiddleware)
  ├─ Upload featured image
  ├─ Required: name, description, price, district
  ├─ Required: roomType, maxCapacity, address
  ├─ Optional: offerPrice, longitude, latitude
  ↓
Room Created (Status: PENDING)
  ├─ Awaits admin approval
  └─ Slug auto-generated
```

**Room Creation Limit:**

```
IF (existing_rooms >= available_credits)
  → ERROR: "Room limit reached"
ELSE
  → CREATE ROOM
```

#### View My Rooms

```
GET /api/v1/rooms/host
  ├─ Filter: roomStatus, district, roomType
  ├─ Filter: minPrice, maxPrice, isFeatured
  ├─ Search & pagination
  ↓
Returns: Host's rooms only
  ├─ All room details
  ├─ District info
  └─ Images
```

#### View Single Room (Host View)

```
GET /api/v1/rooms/:slug
  ├─ Access: HOST (owner) or ADMIN
  ↓
Returns: Complete room details
  ├─ Including pending/disabled status
  └─ All analytics
```

#### Update Room

```
PUT /api/v1/rooms/:slug
  ├─ Update any room field
  ├─ Upload new image (optional)
  ├─ Only owner or admin can update
  ↓
Returns: Updated room
```

**Room Statuses:**

- `PENDING` → Awaiting admin approval
- `APPROVED` → Live and bookable
- `MAINTENANCE` → Temporarily unavailable
- `DISABLED_BY_ADMIN` → Blocked by admin
- `DISABLED_BY_OWNER` → Host disabled

---

### 4️⃣ Room Media Management

#### Add Media to Room

```
POST /api/v1/rooms/medias/:slug
  ├─ Upload multiple images
  ↓
Media added to room gallery
```

#### Delete Media

```
DELETE /api/v1/rooms/medias/:mediaId
  ↓
Media removed
  └─ File deleted from storage
```

---

### 5️⃣ Room Amenity Management

#### Add Amenities to Room

```
POST /api/v1/rooms/amenities/:slug
  ├─ Array of amenity IDs
  ↓
Amenities linked to room
```

#### Remove Amenity

```
DELETE /api/v1/rooms/amenities/:roomAmenityId
  ↓
Amenity unlinked from room
```

---

### 6️⃣ Request Management (Bookings)

#### View All Requests for My Rooms

```
GET /api/v1/rooms/requests/host
  ├─ Filter by status
  ├─ Pagination
  ↓
Returns: All requests for host's rooms
  ├─ Request details
  ├─ User info (requester)
  ├─ Room info
  └─ Status
```

#### Approve/Reject Request

```
PUT /api/v1/rooms/requests/:token
  ├─ Update status: APPROVED or REJECTED
  ├─ Set acceptedPrice (negotiated)
  ├─ Optional: Add response message
  ↓
Notification sent to user
  └─ Socket event triggered
```

#### Manage Booking Status

```
PUT /api/v1/rooms/requests/:token
  ├─ Change to: ON_GOING (started)
  ├─ Change to: COMPLETED (finished)
  ├─ Change to: CANCELED
  ↓
Status updated
```

---

### 7️⃣ Messaging with Users

#### View Conversations

```
GET /api/v1/rooms/requests/:roomRequestId/conversations
  ↓
Returns: All messages with requester
  ├─ Message history
  └─ Read status
```

**Socket.IO Events (Same as User):**

- Send messages
- Receive messages
- Mark as read
- Real-time notifications

---

### 8️⃣ Reviews Management

#### View Reviews for My Rooms

```
GET /api/v1/rooms/reviews/host
  ├─ All reviews for host's rooms
  ├─ Pagination
  ↓
Returns: Reviews with ratings
  ├─ Review details
  ├─ Room info
  ├─ User who reviewed
  └─ Rating & message
```

**Note:** Hosts CANNOT delete user reviews, only view them.

---

### 9️⃣ Host Dashboard

```
GET /api/v1/dashboard/host
  ↓
Returns: Comprehensive analytics
  ├─ Room Stats:
  │   ├─ Total rooms
  │   ├─ By status (approved, pending, etc.)
  │   ├─ Featured rooms count
  │   └─ Available credits
  ├─ Request Stats:
  │   ├─ Total requests
  │   ├─ Pending, Approved, Rejected
  │   ├─ Ongoing, Completed
  │   └─ By room breakdown
  ├─ Review Stats:
  │   ├─ Total reviews
  │   └─ Average rating (⭐)
  ├─ Recent Requests (last 5)
  │   └─ With user details
  └─ Top Rooms (last 5)
      └─ Most requested/rated
```

---

### 🔟 Profile & Settings

Same as User Flow:

- View profile
- Update profile
- Change password
- Logout

---

## 👑 Admin Flow

### 1️⃣ Authentication

Same login process, but with `Role: ADMIN`

---

### 2️⃣ User Management

#### View All Users

```
GET /api/v1/users
  ├─ Filter by: role, status
  ├─ Search by: email, username, fullName
  ├─ Pagination
  ↓
Returns: All users in system
  ├─ User details
  ├─ Profile info
  ├─ Account status
  └─ Role
```

#### Update User (Admin)

```
PUT /api/v1/users/:userId
  ├─ Update any field
  ├─ Change role (USER → HOST → ADMIN)
  ├─ Enable/disable account
  ├─ Update profile status
  ↓
Returns: Updated user
```

**Admin Can Modify:**

- Email verification status
- Account enabled/disabled
- User role
- Profile status (ACTIVE, SUSPENDED, DELETED)
- Any profile field

---

### 3️⃣ Room Management

#### View All Rooms

```
GET /api/v1/rooms/admin
  ├─ Filter by: userId, district, status
  ├─ Filter by: roomType, price range
  ├─ Search by name/description
  ├─ Pagination & sorting
  ↓
Returns: All rooms in system
  ├─ Room details
  ├─ Owner info
  ├─ District
  └─ All media
```

#### Approve/Reject Room

```
PUT /api/v1/rooms/:slug
  ├─ Change status: PENDING → APPROVED
  ├─ Or: → DISABLED_BY_ADMIN
  ├─ Update any room details
  ↓
Room status updated
  └─ Notification sent to host
```

#### Feature/Unfeature Room

```
PUT /api/v1/rooms/:slug
  ├─ isFeatured: true/false
  ↓
Room featured status updated
```

---

### 4️⃣ District Management

#### Create District

```
POST /api/v1/districts
  ├─ Upload district image
  ├─ name, slug, description
  ↓
District created
```

#### View All Districts

```
GET /api/v1/districts (Public)
  ↓
Returns: All districts
```

#### Update District

```
PUT /api/v1/districts/:id
  ├─ Update name, description
  ├─ Upload new image
  ↓
District updated
```

#### Delete District

```
DELETE /api/v1/districts/:id
  ↓
District deleted (soft delete)
```

---

### 5️⃣ Amenity Management

#### Create Amenity

```
POST /api/v1/amenities
  ├─ name, slug, description
  ├─ icon (optional)
  ↓
Amenity created
```

#### View All Amenities

```
GET /api/v1/amenities (Public)
  ↓
Returns: All amenities
```

#### Update Amenity

```
PUT /api/v1/amenities/:id
  ↓
Amenity updated
```

#### Delete Amenity

```
DELETE /api/v1/amenities/:id
  ↓
Amenity deleted
  └─ Removes from all rooms
```

---

### 6️⃣ Membership Type Management

#### Create Membership Type

```
POST /api/v1/membership-types
  ├─ name, description
  ├─ price, limit (room count)
  ├─ duration (days)
  ↓
Membership type created
```

#### View Membership Types

```
GET /api/v1/membership-types
  ↓
Returns: All membership plans
```

#### Update Membership Type

```
PUT /api/v1/membership-types/:id
  ├─ Update price, limit, etc.
  ↓
Membership updated
```

#### Delete Membership Type

```
DELETE /api/v1/membership-types/:id
  ↓
Membership type deleted
```

---

### 7️⃣ Payment Management

#### View All Payments

```
GET /api/v1/membership/admin/payments
  ├─ Filter by: status, userId
  ├─ Filter by: payment method
  ├─ Date range
  ├─ Pagination
  ↓
Returns: All payment transactions
  ├─ Payment details
  ├─ User info
  ├─ Membership type
  ├─ Amount
  └─ Status
```

#### Update Payment Status

```
PUT /api/v1/membership/admin/payments/:paymentId
  ├─ Manually update status
  ├─ PENDING → COMPLETED or FAILED
  ↓
Payment status updated
  └─ Credits adjusted for user
```

---

### 8️⃣ Request Management

#### View All Room Requests

```
GET /api/v1/rooms/requests/admin
  ├─ Filter by: status, roomId, userId
  ├─ Date range
  ├─ Pagination
  ↓
Returns: All booking requests
  ├─ Request details
  ├─ Room info
  ├─ User info (requester)
  └─ Host info
```

**Admin can monitor all bookings and disputes**

---

### 9️⃣ Review Management

#### View All Reviews

```
GET /api/v1/rooms/reviews/admin
  ├─ Filter by: rating, roomId
  ├─ Pagination
  ↓
Returns: All reviews in system
  ├─ Review details
  ├─ User who reviewed
  ├─ Room reviewed
  └─ Rating
```

**Admin can view but typically doesn't delete reviews (moderation)**

---

### 🔟 Admin Dashboard

```
GET /api/v1/dashboard/admin
  ↓
Returns: System-wide analytics
  ├─ User Statistics:
  │   ├─ Total users (by role)
  │   ├─ Active vs Suspended
  │   └─ Recent registrations
  ├─ Room Statistics:
  │   ├─ Total rooms (by status)
  │   ├─ Approved, Pending, Disabled
  │   ├─ Featured rooms
  │   └─ By district breakdown
  ├─ Request Statistics:
  │   ├─ Total bookings
  │   ├─ By status (all states)
  │   └─ Success rate
  ├─ Review Statistics:
  │   ├─ Total reviews
  │   └─ Average platform rating
  ├─ Payment Statistics:
  │   ├─ Total transactions
  │   ├─ Completed, Pending, Failed
  │   └─ 💰 Total Revenue
  ├─ District Statistics:
  │   └─ Total districts
  ├─ Recent Activity:
  │   ├─ Recent users (last 5)
  │   ├─ Recent rooms (last 5)
  │   └─ Recent requests (last 5)
  └─ Platform Health Metrics
```

---

## ⚠️ Overflow & Edge Cases

### 1️⃣ Room Creation Limit Overflow

#### Scenario: Host tries to create room without credits

```
POST /api/v1/rooms
  ↓
checkLimitMiddleware executes:
  ├─ Count existing rooms
  ├─ Calculate total membership limits
  ├─ Check: existing_rooms >= total_limit?
  ↓
IF LIMIT REACHED:
  └─ ERROR 403: "Room limit reached"
     ├─ Message: "You have reached your room limit of X"
     └─ Action: "Please upgrade your membership"

IF UNDER LIMIT:
  └─ Proceed with room creation
```

**Resolution:**

- Purchase additional membership
- Delete existing rooms
- Upgrade to higher tier

---

### 2️⃣ Multiple Membership Credits

#### Scenario: User purchases multiple memberships

```
User has:
  ├─ Basic Membership: 5 rooms
  ├─ Premium Membership: 10 rooms
  └─ Free: 1 room (default)

Total Credits = 5 + 10 + 1 = 16 rooms
Existing Rooms = 8
Available Credits = 16 - 8 = 8 rooms

✅ Can create 8 more rooms
```

**Credit Calculation Logic:**

```typescript
totalLimit = memberships.reduce((acc, membership) => {
  return acc + membership.membershipType.limit;
}, 0);

availableCredits = totalLimit - existingRooms;
```

---

### 3️⃣ Payment Verification Failure

#### Scenario: Khalti payment succeeds but verification fails

```
User initiates payment
  ↓
Redirected to Khalti
  ↓
Payment successful on Khalti
  ↓
Callback: /payment/verify/khalti
  ├─ Network error during verification
  ├─ OR Khalti API timeout
  ↓
Payment Status: PENDING (stuck)

Admin Action Required:
  └─ PUT /api/v1/membership/admin/payments/:paymentId
     ├─ Manually verify with Khalti
     └─ Update status: COMPLETED
```

**Prevention:**

- Webhook from Khalti (if implemented)
- Cron job to verify pending payments
- Admin manual verification

---

### 4️⃣ Duplicate Review Prevention

#### Scenario: User tries to review same booking twice

```
POST /api/v1/rooms/reviews/:roomRequestId
  ↓
Check: Review already exists for this roomRequestId?
  ├─ Database Constraint: unique(room_request_id)
  ↓
IF EXISTS:
  └─ ERROR 400: "Review already submitted"

IF NOT:
  └─ Create review
```

**Database Constraint:**

```typescript
@Table({
  indexes: [
    {
      unique: true,
      fields: ["room_request_id"],
      name: "unique_room_request_review",
    },
  ],
})
```

---

### 5️⃣ Request Status Validation

#### Scenario: Invalid status transitions

```
Valid Transitions:
  PENDING → APPROVED ✅
  PENDING → REJECTED ✅
  PENDING → CANCELED ✅
  APPROVED → ON_GOING ✅
  APPROVED → CANCELED ✅
  ON_GOING → COMPLETED ✅
  ON_GOING → CANCELED ❌ (typically not allowed)

Invalid Transitions:
  COMPLETED → PENDING ❌
  REJECTED → APPROVED ❌
  COMPLETED → CANCELED ❌
```

**Validation in Controller:**

```typescript
if (currentStatus === "COMPLETED") {
  throw new ApiError({
    status: 400,
    message: "Cannot modify completed requests",
  });
}
```

---

### 6️⃣ Concurrent Request Handling

#### Scenario: Multiple users request same room simultaneously

```
User A: POST /api/v1/rooms/requests/room-123
User B: POST /api/v1/rooms/requests/room-123
  ↓
Both requests created (Status: PENDING)
  ↓
Host can:
  ├─ Approve ONE request
  ├─ Reject others
  └─ Or approve multiple (if room allows)

Room Status Update:
  ├─ If APPROVED → Can mark room as "partially available"
  └─ If fully booked → roomStatus: MAINTENANCE
```

**No Hard Limit:** Multiple requests can exist for same room

---

### 7️⃣ Email Verification Edge Cases

#### Scenario: User registers but doesn't verify email

```
POST /api/v1/auth/register
  ↓
Account created (isEmailVerified: false)
  ↓
User tries to login:
  └─ ERROR 403: "Email not verified"

Resolution:
  ├─ Resend verification email (if implemented)
  └─ Or admin manually verifies
```

#### Scenario: Admin manually enables unverified account

```
Admin can:
  PUT /api/v1/users/:userId
    ├─ isEmailVerified: true
    └─ Bypass verification
```

---

### 8️⃣ File Upload Failures

#### Scenario: Image upload fails mid-request

```
POST /api/v1/rooms
  ├─ Image upload starts
  ├─ Upload fails (network/size/type error)
  ↓
Error Handling:
  └─ deleteUnusedMulterFilesOnError
     ├─ Cleans up partial uploads
     └─ Returns error to user

User must retry entire request
```

**File Validation:**

- Max size: 10MB (configurable)
- Allowed types: JPEG, PNG, PDF (documents)
- Directory-based storage

---

### 9️⃣ Soft Delete Conflicts

#### Scenario: User deletes review, then tries to create new one

```
All models use paranoid: true (soft delete)

Delete Review:
  └─ deletedAt: timestamp (not actually removed)

Create New Review:
  └─ Unique constraint still applies
     └─ ERROR: "Review already exists"

Resolution:
  ├─ Update existing review instead
  └─ Or admin hard delete: destroy({ force: true })
```

---

### 🔟 Socket.IO Connection Issues

#### Scenario: Real-time messaging fails

```
User sends message via socket
  ↓
Socket disconnected
  ↓
Fallback:
  └─ Message stored in database
     ├─ Retrieved via REST API
     └─ GET /api/v1/rooms/requests/:id/conversations

Reconnection:
  └─ Socket automatically reconnects
     └─ Syncs missed messages
```

**Socket Events:**

- `connection` - Client connects
- `disconnect` - Client disconnects
- `message:send` - Send message
- `message:receive` - Receive message
- `message:read` - Mark as read
- `notification` - System notifications

---

### 1️⃣1️⃣ Role Change Impact

#### Scenario: User upgraded to Host mid-session

```
Admin changes User → Host
  ↓
User still has old accessToken (Role: USER)
  ↓
Token needs refresh:
  └─ Logout & Login again
     └─ New token with Role: HOST

OR Implement:
  └─ Token refresh endpoint
     └─ Update role in active token
```

---

### 1️⃣2️⃣ Pagination Edge Cases

#### Scenario: User deletes item while paginating

```
Page 1: Items 1-10
User deletes Item 5
Page 2: Items 11-20 (but now shows 10-19)

Result: Item 10 appears on both pages

Prevention:
  └─ Use cursor-based pagination (not implemented)
  └─ Or: Accept minor inconsistency
```

---

### 1️⃣3️⃣ Race Condition: Credit Limit Check

#### Scenario: Host creates multiple rooms simultaneously

```
Available Credits: 2
Host sends 3 requests concurrently:
  ├─ Request A: Check credits (2) → OK
  ├─ Request B: Check credits (2) → OK
  └─ Request C: Check credits (2) → OK
All pass → 3 rooms created (exceeds limit!)

Prevention:
  └─ Database transaction lock
  └─ Or sequential request processing
```

**Current Implementation:**

- May allow slight overflow in race conditions
- Admin can manually disable excess rooms

---

## 📊 Summary Flow Chart

```
┌─────────────┐
│   VISITOR   │
└──────┬──────┘
       │
       ├─→ Register → Email Verify → Login
       │                                │
       ↓                                ↓
┌─────────────┐                  ┌──────────┐
│    USER     │                  │   HOST   │
└──────┬──────┘                  └─────┬────┘
       │                               │
       ├─→ Browse Rooms                ├─→ Buy Membership
       ├─→ Wishlist                    ├─→ Create Rooms
       ├─→ Recently Viewed             ├─→ Manage Rooms
       ├─→ Create Requests             ├─→ Handle Requests
       ├─→ Message Host                ├─→ Message Users
       ├─→ Write Reviews               ├─→ View Reviews
       ├─→ View Dashboard              └─→ View Dashboard
       │
       └─→ Update Profile
           Change Password
           Logout

                    ┌──────────┐
                    │  ADMIN   │
                    └─────┬────┘
                          │
                          ├─→ Manage Users
                          ├─→ Approve Rooms
                          ├─→ Manage Districts
                          ├─→ Manage Amenities
                          ├─→ Manage Memberships
                          ├─→ View Payments
                          ├─→ Monitor Requests
                          ├─→ View All Reviews
                          └─→ System Dashboard
```

---

## 🎯 Key Takeaways

### User Journey

1. **Discovery:** Browse rooms → Add to wishlist → View details
2. **Booking:** Create request → Message host → Wait for approval
3. **Experience:** Booking approved → Ongoing → Completed
4. **Feedback:** Write review → Rate experience

### Host Journey

1. **Setup:** Register → Buy membership → Get credits
2. **Listing:** Create room → Add media/amenities → Wait approval
3. **Management:** Receive requests → Approve/Reject → Manage bookings
4. **Growth:** View analytics → Get reviews → Expand listings

### Admin Journey

1. **Oversight:** Monitor users → Approve rooms → Manage content
2. **Finance:** Track payments → Verify transactions → View revenue
3. **Support:** Handle disputes → Moderate reviews → Assist users
4. **Analytics:** System dashboard → Performance metrics

### Edge Case Handling

- ✅ Credit limits enforced
- ✅ Payment verification fallbacks
- ✅ Unique constraints on critical data
- ✅ Soft delete for data recovery
- ✅ Real-time messaging with fallbacks
- ⚠️ Race conditions possible (minor)
- ⚠️ Pagination consistency trade-offs

---

**Last Updated:** October 28, 2025  
**Version:** 1.0  
**Status:** ✅ Complete & Production Ready
