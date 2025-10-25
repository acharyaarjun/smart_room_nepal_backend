# Socket.IO Implementation Analysis & Documentation

## 📋 Overview

This document provides a comprehensive analysis of all Socket.IO related components in the Room Request Conversation system.

---

## 🏗️ Architecture

### Socket Server Configuration

**File:** `src/config/socket.config.ts`

```typescript
Server URL: http://localhost:8081
CORS Policy: Allow all origins (*)
Ping Timeout: 60000ms (60 seconds)
Ping Interval: 25000ms (25 seconds)
Transport Methods: WebSocket, Polling
```

**Key Features:**

- ✅ Open CORS policy for development
- ✅ Automatic ping/pong for connection health
- ✅ Fallback to polling if WebSocket fails

---

## 🔐 Authentication

### Socket Authentication Middleware

**File:** `src/middlewares/socket.middleware.ts`

**Authentication Flow:**

1. Extract JWT token from handshake (auth.token or headers.authorization)
2. Remove "Bearer " prefix if present
3. Verify token and fetch user from database
4. Attach user object to socket.data.user
5. Allow or reject connection

**Token Sources (Priority Order):**

1. `socket.handshake.auth.token`
2. `socket.handshake.headers.authorization`

**User Data Available:**

```typescript
socket.data.user = {
  id: number,
  username: string,
  email: string,
  fullName: string,
  role: Role,
  // ... other user fields
};
```

---

## 📡 Socket Events

### Event Types (src/socket/types.ts)

#### 1. Connection Events

| Event        | Direction       | Description         |
| ------------ | --------------- | ------------------- |
| `connection` | Server → Client | Socket connected    |
| `disconnect` | Server → Client | Socket disconnected |
| `error`      | Server → Client | General error       |

#### 2. Room Request Conversation Events

##### Client → Server (Emit)

| Event                | Payload                                      | Description               |
| -------------------- | -------------------------------------------- | ------------------------- |
| `join_room_request`  | `{ roomRequestId: number }`                  | Join a conversation room  |
| `leave_room_request` | `{ roomRequestId: number }`                  | Leave a conversation room |
| `send_message`       | `{ roomRequestId: number, message: string }` | Send a message            |
| `mark_as_read`       | `{ roomRequestId: number }`                  | Mark messages as read     |
| `typing`             | `{ roomRequestId: number }`                  | Start typing indicator    |
| `stop_typing`        | `{ roomRequestId: number }`                  | Stop typing indicator     |

##### Server → Client (Listen)

| Event                  | Payload                               | Description             |
| ---------------------- | ------------------------------------- | ----------------------- |
| `message_received`     | `IMessageReceivedData`                | New message received    |
| `messages_marked_read` | `{ roomRequestId, messageIds[] }`     | Messages marked as read |
| `user_typing`          | `{ roomRequestId, userId, username }` | User is typing          |
| `user_stop_typing`     | `{ roomRequestId, userId, username }` | User stopped typing     |
| `room_request_error`   | `{ message, code? }`                  | Error occurred          |

---

## 📦 Data Interfaces

### IMessageReceivedData

```typescript
{
  id: number; // Message ID
  roomRequestId: number; // Room request ID
  sender: "user" | "host"; // Message sender type
  message: string; // Message content
  isRead: boolean; // Read status
  createdAt: Date; // Timestamp
  senderDetails: {
    id: number; // User ID
    username: string; // Username
    fullName: string; // Full name
  }
}
```

### Error Response

```typescript
{
  message: string;               // Error message
  code?: string;                 // Error code (optional)
}
```

**Error Codes:**

- `ACCESS_DENIED` - User doesn't have permission
- `INVALID_MESSAGE` - Message is empty/invalid
- `JOIN_ERROR` - Failed to join room
- `SEND_ERROR` - Failed to send message

---

## 🎯 Business Logic

### Room Request Access Control

**File:** `src/socket/handlers/roomRequestConversation.handler.ts`

**Access Rules:**

1. User must be authenticated (JWT token)
2. User must be EITHER:
   - The room requester (userId matches request.userId)
   - The room owner (userId matches request.room.userId)
3. If neither, access is denied

**Verification Process:**

```typescript
1. Fetch RoomRequest with Room and User associations
2. Check if user.id === roomRequest.userId (requester)
3. Check if user.id === roomRequest.room.userId (owner)
4. Return hasAccess: true/false
```

### Message Sender Determination

**Sender Types:**

- `USER` - The person who requested the room
- `HOST` - The room owner

**Logic:**

```typescript
if (userId === roomRequest.room.userId) {
  sender = MessageSender.HOST;
} else {
  sender = MessageSender.USER;
}
```

### Auto-Read on Join

When a user joins a room:

1. Determine their sender type (USER or HOST)
2. Get opposite sender type
3. Mark all unread messages from opposite sender as read
4. This simulates "opening the chat"

---

## 🔄 Event Handlers

### 1. Join Room Request

**Event:** `join_room_request`
**Payload:** `{ roomRequestId: number }`

**Flow:**

1. Verify user has access to room request
2. Join socket room: `room_request_{roomRequestId}`
3. Mark unread messages as read automatically
4. Return error if access denied

**Socket Rooms:**

- Format: `room_request_1`, `room_request_2`, etc.
- Enables targeted broadcasting

### 2. Send Message

**Event:** `send_message`
**Payload:** `{ roomRequestId: number, message: string }`

**Flow:**

1. Validate message is not empty
2. Verify user has access
3. Determine sender type (USER/HOST)
4. Create RoomRequestConversation record
5. Emit `message_received` to all users in room
6. Include sender details in response

**Broadcast:**

```typescript
socket.to(roomName).emit("message_received", data); // To others
socket.emit("message_received", data); // To sender
```

### 3. Mark Messages as Read

**Event:** `mark_as_read`
**Payload:** `{ roomRequestId: number }`

**Flow:**

1. Verify access
2. Determine opposite sender
3. Find all unread messages from opposite sender
4. Mark them as read in database
5. Emit `messages_marked_read` with message IDs
6. Notify other users in room

### 4. Typing Indicators

**Events:** `typing` / `stop_typing`
**Payload:** `{ roomRequestId: number }`

**Flow:**

1. Verify access
2. Broadcast to other users in room (not to sender)
3. Include userId and username
4. No database persistence

**Client Implementation:**

```typescript
// Start typing
socket.emit("typing", { roomRequestId: 1 });

// Listen for others typing
socket.on("user_typing", (data) => {
  // Show "username is typing..."
});

// Auto-stop after timeout or on send
setTimeout(() => {
  socket.emit("stop_typing", { roomRequestId: 1 });
}, 3000);
```

### 5. Leave Room

**Event:** `leave_room_request`
**Payload:** `{ roomRequestId: number }`

**Flow:**

1. Leave socket room
2. Stop receiving updates for that room
3. User can rejoin anytime

---

## 🗄️ Database Models

### RoomRequestConversation

**Table:** `room_request_conversations`

**Fields:**

```typescript
id: number;
roomRequestId: number; // FK to room_requests
sender: "user" | "host"; // MessageSender enum
message: string;
isRead: boolean;
createdAt: Date;
updatedAt: Date;
```

**Associations:**

- BelongsTo: RoomRequest

### RoomRequest

**Table:** `room_requests`

**Relevant Fields:**

```typescript
id: number;
userId: number; // The requester
roomId: number;
status: RoomRequestStatus;
// ... other fields
```

**Associations:**

- BelongsTo: User (requester)
- BelongsTo: Room
- HasMany: RoomRequestConversation

### Room

**Table:** `rooms`

**Relevant Fields:**

```typescript
id: number;
userId: number; // The room owner (HOST)
name: string;
// ... other fields
```

---

## 🧪 Testing Guide

### Using the HTML Tester (`socket-io-tester.html`)

#### Step 1: Get JWT Token

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

#### Step 2: Open HTML File

```bash
open socket-io-tester.html
# or
firefox socket-io-tester.html
```

#### Step 3: Configure

1. Paste JWT token in the token field
2. Set server URL (default: http://localhost:8081)
3. Click "Connect"

#### Step 4: Test Features

- Join a room
- Send messages
- Test typing indicators
- Mark messages as read
- Leave room
- Run automated test scenarios

### Testing Multi-User Scenarios

**Setup:**

1. Open two browser windows/tabs
2. Login with two different users (one owner, one requester)
3. Get both JWT tokens
4. Connect both to Socket.IO
5. Both join the same room request ID

**Test:**

1. User 1 sends message → User 2 receives instantly
2. User 2 types → User 1 sees typing indicator
3. User 2 sends message → User 1 receives instantly
4. User 1 marks as read → User 2 sees read receipt

---

## 🚀 Production Considerations

### Security

- [ ] Restrict CORS to specific domains
- [ ] Implement rate limiting for messages
- [ ] Add message length validation
- [ ] Sanitize message content
- [ ] Add request throttling

### Performance

- [ ] Implement Redis adapter for horizontal scaling
- [ ] Add message pagination
- [ ] Cache room access checks
- [ ] Implement connection pooling
- [ ] Add metrics/monitoring

### Reliability

- [ ] Handle reconnection logic
- [ ] Implement message queue for offline delivery
- [ ] Add delivery receipts
- [ ] Implement exponential backoff for retries
- [ ] Add connection health checks

---

## 📊 Event Flow Diagrams

### Full Conversation Flow

```
User A (Requester)                    Server                    User B (Owner)
       |                                |                              |
       |-- connect (with JWT) -------->|                              |
       |<-- connect event -------------|                              |
       |                                |<-- connect (with JWT) -------|
       |                                |--- connect event ----------->|
       |                                |                              |
       |-- join_room_request(id:1) --->|                              |
       |<-- auto mark messages read ---|                              |
       |                                |<-- join_room_request(id:1) --|
       |                                |--- auto mark messages read ->|
       |                                |                              |
       |-- typing ---------------------->|                              |
       |                                |--- user_typing ------------->|
       |                                |                              |
       |-- stop_typing ---------------->|                              |
       |                                |--- user_stop_typing -------->|
       |                                |                              |
       |-- send_message ---------------->|                              |
       |<-- message_received ----------|                              |
       |                                |--- message_received -------->|
       |                                |                              |
       |                                |<-- mark_as_read -------------|
       |<-- messages_marked_read ------|                              |
       |                                |--- messages_marked_read ---->|
```

---

## 🔧 Configuration Files

### Socket Server Initialization

**File:** `src/server.ts`

```typescript
// Create Socket.IO server
const socketServer = createSocketServer(server);

// Initialize handlers
initializeSocketHandlers(socketServer);

// Start server
const SOCKET_PORT = config.socket.port || 8081;
server.listen(SOCKET_PORT);
```

### Environment Variables

```env
SOCKET_PORT=8081
JWT_SECRET=your-secret-key
JWT_PUBLIC_KEY_PATH=./jwt-public-key.pem
JWT_PRIVATE_KEY_PATH=./jwt-private-key.pem
```

---

## 📝 API Integration

### REST API Endpoints (for reference)

#### Get Conversations

```
GET /api/v1/room-requests/:roomRequestId/conversations
```

Returns paginated conversation history

#### Get Unread Count

```
GET /api/v1/room-requests/:roomRequestId/conversations/unread-count
```

Returns unread message count for current user

#### Get Unread Summary

```
GET /api/v1/room-requests/conversations/unread-summary
```

Returns unread counts across all room requests

---

## 🐛 Common Issues & Solutions

### Issue: Connection Failed

**Symptoms:** `connect_error` event
**Solutions:**

1. Check JWT token is valid
2. Verify server is running on correct port
3. Check CORS configuration
4. Ensure token format is correct

### Issue: Access Denied

**Symptoms:** `room_request_error` with code `ACCESS_DENIED`
**Solutions:**

1. Verify user is requester or room owner
2. Check room request exists
3. Ensure associations are loaded correctly

### Issue: Messages Not Received

**Symptoms:** No `message_received` event
**Solutions:**

1. Verify both users joined the room
2. Check socket connection is active
3. Ensure event listeners are attached
4. Check server logs for errors

### Issue: Typing Indicator Not Working

**Symptoms:** No `user_typing` event
**Solutions:**

1. Ensure user has joined room first
2. Check opposite user is listening to event
3. Verify access control passes

---

## 📚 Code Examples

### Client-Side Implementation (JavaScript)

```javascript
// Connect
const socket = io("http://localhost:8081", {
  auth: {
    token: "your-jwt-token",
  },
});

// Listen for connection
socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

// Join room
socket.emit("join_room_request", { roomRequestId: 1 });

// Listen for messages
socket.on("message_received", (data) => {
  console.log("New message:", data.message);
  displayMessage(data);
});

// Send message
function sendMessage(message) {
  socket.emit("send_message", {
    roomRequestId: 1,
    message: message,
  });
}

// Typing indicator
let typingTimeout;
function onTyping() {
  socket.emit("typing", { roomRequestId: 1 });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stop_typing", { roomRequestId: 1 });
  }, 3000);
}

// Mark as read
socket.on("message_received", (data) => {
  // Auto-mark as read when message is received
  socket.emit("mark_as_read", { roomRequestId: 1 });
});

// Error handling
socket.on("room_request_error", (error) => {
  console.error("Error:", error.message);
  alert(error.message);
});
```

---

## 🎯 Best Practices

### 1. Connection Management

- ✅ Always handle connection errors
- ✅ Implement reconnection logic
- ✅ Clean up listeners on disconnect
- ✅ Use connection pooling in production

### 2. Message Handling

- ✅ Validate messages before sending
- ✅ Sanitize user input
- ✅ Implement rate limiting
- ✅ Add message length limits

### 3. Error Handling

- ✅ Handle all error events
- ✅ Provide user-friendly error messages
- ✅ Log errors for debugging
- ✅ Implement fallback mechanisms

### 4. Performance

- ✅ Use rooms for targeted broadcasting
- ✅ Minimize data in events
- ✅ Implement pagination for history
- ✅ Cache frequently accessed data

### 5. Security

- ✅ Always verify JWT tokens
- ✅ Validate user permissions
- ✅ Sanitize all inputs
- ✅ Use HTTPS in production
- ✅ Implement rate limiting

---

## 📈 Monitoring & Logging

### Server Logs

**Location:** Console output + Winston logger

**Log Levels:**

- `info` - Connection events, successful operations
- `warn` - Failed authentication, disconnections
- `error` - Errors, exceptions

**Key Events to Monitor:**

- Connection attempts
- Authentication failures
- Message send failures
- Error events
- Disconnection reasons

### Metrics to Track

- Active connections count
- Messages per second
- Error rate
- Average response time
- Room join/leave frequency

---

## 🔗 Related Files

### Core Socket Files

- `src/config/socket.config.ts` - Server configuration
- `src/socket/index.ts` - Handler initialization
- `src/socket/types.ts` - TypeScript interfaces
- `src/socket/handlers/roomRequestConversation.handler.ts` - Event handlers
- `src/middlewares/socket.middleware.ts` - Authentication

### Supporting Files

- `src/models/roomRequestConversation.ts` - Database model
- `src/enums/messageSender.ts` - Sender type enum
- `src/utils/getUserFromToken.ts` - Token verification
- `src/logger/index.ts` - Logging utility

### Testing Files

- `socket-io-tester.html` - Interactive HTML tester
- `Room_Request_SocketIO.postman_collection.json` - Postman collection
- `SOCKET_IO_POSTMAN_GUIDE.md` - Postman usage guide

---

## ✅ Checklist for Implementation

### Development

- [x] Socket.IO server configured
- [x] Authentication middleware implemented
- [x] All event handlers created
- [x] Database models defined
- [x] Error handling implemented
- [x] Logging added
- [x] HTML tester created
- [x] Postman collection created

### Testing

- [ ] Unit tests for handlers
- [ ] Integration tests for events
- [ ] Load testing for concurrent connections
- [ ] Security testing
- [ ] Error scenario testing

### Production Ready

- [ ] CORS restricted to domain
- [ ] Rate limiting implemented
- [ ] Redis adapter for scaling
- [ ] Monitoring/metrics setup
- [ ] SSL/TLS enabled
- [ ] Error tracking (Sentry)
- [ ] Performance optimization
- [ ] Documentation complete

---

**Last Updated:** October 25, 2025
**Version:** 1.0
**Status:** Development ✅
