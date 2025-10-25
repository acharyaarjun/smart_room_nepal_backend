# Testing Socket.IO with Postman

## Method 1: Using Postman's WebSocket/SocketIO Feature

### Step 1: Create New SocketIO Request

1. **Open Postman**
2. **Click "New" → "WebSocket Request"** or use the + icon
3. **Change protocol from "ws://" to Socket.IO**
   - Look for dropdown at top left
   - Select "Socket.IO" instead of "WebSocket"

### Step 2: Configure Connection

**Socket URL:**

```
http://localhost:8081
```

**Event Listeners (Add these):**

Click "Events" tab and add listeners:

| Event Name         | Description              |
| ------------------ | ------------------------ |
| `connect`          | Connection successful    |
| `connect_error`    | Connection failed        |
| `disconnect`       | Disconnected             |
| `room_joined`      | Successfully joined room |
| `message_received` | New message received     |
| `user_typing`      | Someone is typing        |
| `message_read`     | Messages marked as read  |
| `error`            | Error occurred           |

### Step 3: Add Authentication

**In "Headers" or "Handshake Auth":**

Add authentication parameters:

**Method 1: Using Auth object**

```json
{
  "auth": {
    "token": "YOUR_JWT_TOKEN_HERE"
  }
}
```

**Method 2: Using Headers**
Add header:

- Key: `authorization`
- Value: `Bearer YOUR_JWT_TOKEN_HERE`

### Step 4: Connect

Click **"Connect"** button

You should see in the Messages panel:

```
Connected to http://localhost:8081
Socket ID: abc123xyz
```

### Step 5: Emit Events

Click "Message" tab to send events:

**Join Room:**

```json
{
  "event": "join_room_request",
  "data": {
    "roomRequestId": 1
  }
}
```

**Send Message:**

```json
{
  "event": "send_message",
  "data": {
    "roomRequestId": 1,
    "message": "Hello from Postman!"
  }
}
```

**Typing Indicator:**

```json
{
  "event": "typing",
  "data": {
    "roomRequestId": 1,
    "isTyping": true
  }
}
```

**Mark as Read:**

```json
{
  "event": "mark_as_read",
  "data": {
    "roomRequestId": 1
  }
}
}
```

**Leave Room:**

```json
{
  "event": "leave_room_request",
  "data": {
    "roomRequestId": 1
  }
}
```

---

## Method 2: Using Node.js Test Client (RECOMMENDED - No CORS Issues)

This is the **easiest way** to test without CORS problems:

### Step 1: Run the Interactive Test Client

```bash
# Make sure server is running first
npm run dev

# In another terminal, run:
node simple-socket-test.js
```

### Step 2: Use Interactive Commands

Once connected, you can type:

```bash
# Send a message
> msg Hello, this is a test!

# Send typing indicator
> typing

# Mark messages as read
> read

# Join a different room
> join 2

# Leave room
> leave

# Show help
> help

# Exit
> exit
```

### Step 3: Watch Server Logs

In the terminal running `npm run dev`, you'll see:

```
🔐 Socket authentication attempt...
   ✅ Authentication successful!
   User ID: 2
   Username: someuser

✅ Socket connected successfully!
   Socket ID: abc123xyz
   User: someuser (ID: 2)
```

---

## Method 3: Using cURL (Quick Test)

Test Socket.IO server is accessible:

```bash
curl http://localhost:8081/socket.io/\?EIO\=4\&transport\=polling
```

You should get a response like:

```
0{"sid":"abc123","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":60000}
```

---

## Method 4: Postman Collection Import

Create a file `socketio-test.postman_collection.json`:

```json
{
  "info": {
    "name": "Room Request Socket.IO Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Connect to Socket.IO",
      "request": {
        "method": "SOCKET",
        "url": {
          "raw": "http://localhost:8081",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8081"
        },
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{jwt_token}}",
              "type": "string"
            }
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "jwt_token",
      "value": "YOUR_JWT_TOKEN_HERE"
    }
  ]
}
```

Import this into Postman and update the `jwt_token` variable.

---

## Troubleshooting

### Error: "xhr poll error" or CORS Error

**This is why Node.js client is recommended!**

If you must use browser/Postman:

1. **Make sure server is running:**

   ```bash
   lsof -i :8081
   ```

2. **Check CORS in logs:**

   - The server logs should show connection attempts
   - Look for CORS-related errors

3. **Try the Node.js client instead:**
   ```bash
   node simple-socket-test.js
   ```
   This bypasses all CORS issues!

### Error: "Authentication error"

1. **Get fresh JWT token:**

   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your@email.com","password":"yourpassword"}'
   ```

2. **Update token in test client:**
   ```bash
   TOKEN="your-new-token" node simple-socket-test.js
   ```

### Server Not Responding

1. **Check server is running:**

   ```bash
   npm run dev
   ```

2. **Verify you see:**
   ```
   🔌 Socket.IO Server STARTED
      URL: http://localhost:8081
      Status: RUNNING
   ```

---

## Best Testing Workflow

1. **Terminal 1 - Start Server:**

   ```bash
   cd /Users/arjunacharya/Projects/fyp/smart_room_nepal_backend
   npm run dev
   ```

2. **Terminal 2 - Run Test Client:**

   ```bash
   cd /Users/arjunacharya/Projects/fyp/smart_room_nepal_backend
   node simple-socket-test.js
   ```

3. **Watch logs in Terminal 1** to see:

   - Authentication attempts
   - Connection success/failure
   - Events being emitted and received

4. **Interact in Terminal 2:**
   ```
   > msg Hello from terminal!
   > typing
   > read
   ```

This way you avoid all CORS issues and can test everything! 🚀

---

## Summary

| Method             | CORS Issues? | Easy to Use?  | Recommended? |
| ------------------ | ------------ | ------------- | ------------ |
| Postman            | Maybe        | Medium        | ⚠️           |
| Browser HTML       | Yes          | Easy          | ❌           |
| **Node.js Client** | **No**       | **Very Easy** | **✅ BEST**  |
| cURL               | No           | Hard          | ⚠️           |

**Use the Node.js client (`simple-socket-test.js`) for testing!** It's the easiest and has no CORS issues.
