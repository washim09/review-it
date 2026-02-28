const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const PORT = process.env.SOCKET_PORT || 3001;

// IMPORTANT: This JWT secret MUST match your backend's production .env file exactly
// Temporarily hardcoded to ensure it matches production backend
const JWT_SECRET = 'a8f5f167f44f4964e6c998dee827110c8bd1a9c8b4e5f2a3b7d8c9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4';

console.log('🔑 JWT_SECRET loaded:', JWT_SECRET ? 'Yes' : 'No');
console.log('🔑 JWT_SECRET length:', JWT_SECRET.length);
console.log('🔑 JWT_SECRET first 20 chars:', JWT_SECRET.substring(0, 20) + '...');

// Create HTTP server
const httpServer = createServer();

// Configure Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3174', 
      'https://riviewit.com',
      'https://www.riviewit.com',
      'https://admin.riviewit.com',
      'http://riviewit.com',
      'http://www.riviewit.com'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store active users and their socket IDs
const activeUsers = new Map();
const socketToUser = new Map();

// Middleware to authenticate socket connections
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    console.log('🔐 Auth attempt with token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.error('❌ No token provided');
      return next(new Error('Authentication failed - No token'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    
    // Handle both userId and id formats
    socket.userId = decoded.userId || decoded.id;
    
    if (!socket.userId) {
      console.error('❌ No user ID in token');
      return next(new Error('Authentication failed - Invalid token'));
    }
    
    console.log('✅ User authenticated:', socket.userId);
    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    next(new Error('Authentication failed - ' + err.message));
  }
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.userId);
  
  // Store user's socket ID (ensure userId is string for consistent lookup)
  const userIdStr = String(socket.userId);
  activeUsers.set(userIdStr, socket.id);
  socketToUser.set(socket.id, userIdStr);
  
  console.log('👥 Active users:', Array.from(activeUsers.keys()));
  
  // Notify user's contacts that they're online
  socket.broadcast.emit('user-online', socket.userId);

  // Handle joining a room for private messaging
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room ${roomId}`);
  });

  // Handle sending messages
  socket.on('send-message', (data) => {
    const { recipientId, message, roomId } = data;
    
    // Send to recipient if they're online
    const recipientSocketId = activeUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive-message', {
        senderId: socket.userId,
        message,
        timestamp: new Date()
      });
    }
    
    // Also send to room for message history
    socket.to(roomId).emit('new-message', {
      senderId: socket.userId,
      message,
      timestamp: new Date()
    });
  });

  // WebRTC Signaling for Voice/Video Calls
  
  // Handle initiating a call
  socket.on('call-user', (data) => {
    const { targetUserId, offer, callType } = data;
    
    // Convert targetUserId to string to match storage format
    const targetUserIdStr = String(targetUserId);
    const targetSocketId = activeUsers.get(targetUserIdStr);
    
    console.log(`📞 Call initiated:`);
    console.log(`  From: ${socket.userId} (socket: ${socket.id})`);
    console.log(`  To: ${targetUserIdStr}`);
    console.log(`  Type: ${callType}`);
    console.log(`  Active users:`, Array.from(activeUsers.keys()));
    console.log(`  Target socket found: ${targetSocketId || 'NO - user offline'}`);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming-call', {
        callerId: String(socket.userId),
        callerSocketId: socket.id,
        offer,
        callType
      });
      console.log('✅ Call signal sent to recipient');
    } else {
      socket.emit('user-unavailable', { targetUserId });
      console.log('❌ User unavailable - not connected');
    }
  });

  // Handle answering a call
  socket.on('answer-call', (data) => {
    const { callerSocketId, answer } = data;
    console.log(`User ${socket.userId} answered call from ${socketToUser.get(callerSocketId)}`);
    
    io.to(callerSocketId).emit('call-answered', {
      answer,
      answererId: socket.userId
    });
  });

  // Handle rejecting a call
  socket.on('reject-call', (data) => {
    const { callerSocketId } = data;
    console.log(`User ${socket.userId} rejected call from ${socketToUser.get(callerSocketId)}`);
    
    io.to(callerSocketId).emit('call-rejected', {
      rejectedBy: socket.userId
    });
  });

  // Handle ending a call
  socket.on('end-call', (data) => {
    const { targetUserId } = data;
    const targetSocketId = activeUsers.get(targetUserId);
    
    console.log(`Call ended between ${socket.userId} and ${targetUserId}`);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-ended', {
        endedBy: socket.userId
      });
    }
  });

  // Handle ICE candidates for WebRTC
  socket.on('ice-candidate', (data) => {
    const { targetUserId, targetSocketId, candidate } = data;
    console.log('📡 ICE candidate relay from user:', socket.userId, 'to:', targetUserId || targetSocketId);
    
    // Handle both targetUserId and targetSocketId for compatibility
    let finalTargetSocketId;
    if (targetSocketId) {
      finalTargetSocketId = targetSocketId;
    } else if (targetUserId) {
      finalTargetSocketId = activeUsers.get(targetUserId);
    }
    
    if (finalTargetSocketId) {
      io.to(finalTargetSocketId).emit('ice-candidate', {
        candidate,
        senderId: socket.userId
      });
      console.log('📡 ICE candidate forwarded to socket:', finalTargetSocketId);
    } else {
      console.log('❌ Target not found for ICE candidate');
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { recipientId } = data;
    const recipientSocketId = activeUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user-typing', {
        userId: socket.userId
      });
    }
  });

  socket.on('stop-typing', (data) => {
    const { recipientId } = data;
    const recipientSocketId = activeUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user-stop-typing', {
        userId: socket.userId
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
    
    // Remove from active users
    activeUsers.delete(socket.userId);
    socketToUser.delete(socket.id);
    
    // Notify others that user is offline
    socket.broadcast.emit('user-offline', socket.userId);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`WebRTC signaling ready for voice/video calls`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});
