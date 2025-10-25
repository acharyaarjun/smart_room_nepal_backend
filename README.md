# 📌 Smart Room Nepal

Backend API for Smart Room Nepal - A room rental platform with real-time messaging capabilities.

## 🚀 Features

- ✅ **User Authentication** - JWT-based authentication with role-based access control
- ✅ **Room Management** - Create, update, and manage room listings
- ✅ **Room Requests** - Users can request rooms with date ranges and price negotiation
- ✅ **Real-time Messaging** - Socket.IO powered real-time conversations between renters and hosts
- ✅ **File Uploads** - Image and document upload support
- ✅ **Payment Integration** - Membership and payment tracking
- ✅ **Reviews & Ratings** - Users can review rooms after completion
- ✅ **Wishlist & Recent Views** - Track user preferences and activity

## 🔌 Real-Time Messaging (Socket.IO)

This application includes a complete Socket.IO implementation for real-time messaging between renters and hosts.

### Quick Start

```bash
# Start the server
npm run dev

# The Socket.IO server will be available at the same URL
# Connect using: http://localhost:3000
```

### Testing Socket Connection

Open `socket-test-client.html` in your browser to test the real-time messaging features.

### Features

- **Real-time bidirectional communication**
- **JWT authentication for socket connections**
- **Automatic access control** (only requesters and room owners)
- **Read receipts** with notifications
- **Typing indicators**
- **Message history** via REST API
- **Unread message counts**

### Documentation

- 📚 [Complete Socket.IO Documentation](./SOCKET_DOCUMENTATION.md)
- ⚡ [Quick Start Guide](./SOCKET_QUICKSTART.md)
- 📋 [Implementation Summary](./SOCKET_IMPLEMENTATION_SUMMARY.md)

<!-- ## Generating private and public keys for JWT

### Generate private key

```bash
openssl genrsa \
-out jwt-private-key.pem \
2048
```

### Generate public key

```bash
openssl rsa -in jwt-private-key.pem \
-pubout \
-outform PEM \
-out jwt-public-key.pem
``` -->

<!-- Modals -->

## Database Schema

This document outlines the database structure for **Smart Room Nepal**, including all entities and their fields.

---

### 👤 UserProfile

Stores additional details about users.

- **id**
- **userId**
- **phoneNumber**
- **dateOfBirth**
- **gender**
- **occupationStatus**
- **maritalStatus**
- **avatar**
- **documentId**
- **status** → `pending`, `approved`

---

### 💳 MembershipTypes

Defines available membership plans.

- **id**
- **name**
- **limit** (e.g., 1, 10, 11111)
- **price**
- **features**

---

### 💰 Payments

Tracks user payments for memberships.

- **id**
- **userId**
- **membershipTypeId**
- **status** → `pending`, `completed`, `refunded`, `cancelled`
- **remarks**

---

### 🏷 Amenities

Available room facilities/amenities.

- **id**
- **name**
- **description**
- **icon**

---

### 📍 District

Represents geographic districts.

- **id**
- **name**
- **description**
- **image**

---

### 🏠 Rooms

Main room listing information.

- **id**
- **userId**
- **name**
- **shortDescription**
- **description**
- **price**
- **offerPrice**
- **districtId**
- **longitude**
- **latitude**
- **address**
- **type**
- **maxCapacity**
- **isFeatured**

---

### 🖼 RoomMedias

Associates rooms with uploaded media.

- **roomId**
- **mediaId**

---

### 🏷 RoomAmenities

Links rooms with amenities.

- **roomId**
- **amenitiesId**
- **shortDescription**

---

### 📩 RoomRequests

Handles booking requests.

- **id**
- **userId**
- **roomId**
- **status** → `pending`, `approved`, `rejected`, `ongoing`, `completed`
- **isFixedDate**
- **startDate**
- **endDate**
- **price**
- **acceptedPrice**
- **message** _(conversation will be stored separately)_

---

### 💬 RoomRequestConversations

Conversation/chat between host and user for a request.

- **id**
- **roomRequest**
- **from** → `host`, `user`
- **message** (nullable)
- **mediaId** (nullable)
- **createdAt**

---

### ⭐ RoomReviews

Reviews and ratings for completed room requests.

- **id**
- **roomRequestId**
- **rating**
- **message**
- **mediaId** (nullable)

---

### ❤️ Wishlists

User wishlists for rooms.

- **userId**
- **roomId**

---

### 👀 RecentlyViewed

Tracks recently viewed rooms per user.

- **userId**
- **roomId**

---
