// Simple Express server that only serves API routes
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON request body
app.use(express.json());

// Load JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_key';

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// API endpoints
// Messages endpoint
app.get('/api/messages', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if we're fetching unread count
    if (req.query.type === 'unread-count') {
      const count = await prisma.chatMessage.count({
        where: {
          recipientId: userId,
          isRead: false
        }
      });
      
      return res.status(200).json(count);
    }
    
    // Fetch all messages
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        review: {
          select: {
            id: true,
            title: true,
            entity: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.status(200).json(messages);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Send message endpoint
app.post('/api/messages', authenticate, async (req, res) => {
  try {
    const { content, recipientId, reviewId } = req.body;
    const userId = req.user.userId;
    
    if (!content || !recipientId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        content,
        senderId: userId,
        recipientId: Number(recipientId),
        reviewId: reviewId ? Number(reviewId) : null,
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true, 
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        review: reviewId ? {
          select: {
            id: true,
            title: true,
            entity: true,
            imageUrl: true
          }
        } : undefined
      }
    });
    
    return res.status(201).json(message);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read endpoint
app.put('/api/messages', authenticate, async (req, res) => {
  try {
    if (req.query.type !== 'mark-read') {
      return res.status(400).json({ error: 'Invalid request type' });
    }
    
    const { messageIds } = req.body;
    const userId = req.user.userId;
    
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'Invalid message IDs' });
    }
    
    // Only allow marking messages where the user is the recipient
    await prisma.chatMessage.updateMany({
      where: {
        id: { in: messageIds },
        recipientId: userId
      },
      data: {
        isRead: true
      }
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Map other Next.js API routes from the pages/api directory
const apiDir = path.join(__dirname, 'pages', 'api');
function loadApiRoutes(directory, basePath = '/api') {
  try {
    if (!fs.existsSync(directory)) {
      console.log(`API directory not found: ${directory}`);
      return;
    }
    
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // It's a directory, recursively load routes
        loadApiRoutes(fullPath, `${basePath}/${entry.name}`);
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
        // Skip the files we've already implemented
        if (basePath === '/api/messages' && entry.name === 'index.ts') {
          return;
        }
        
        // Register a route handler
        const routePath = `${basePath}/${entry.name.replace(/\.[jt]s$/, '')}`;
        console.log(`API route registered: ${routePath}`);
        
        // Generic handler for all routes
        app.all(routePath, (req, res) => {
          res.status(501).json({ 
            error: 'Not implemented in simple server', 
            message: 'This API endpoint is not yet implemented in the simple server',
            route: routePath
          });
        });
      }
    });
  } catch (error) {
    console.error('Error loading API routes:', error);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Simple API server running at http://localhost:${port}`);
  console.log('Endpoints implemented:');
  console.log('- GET /api/messages - Fetch all messages');
  console.log('- GET /api/messages?type=unread-count - Get unread message count');
  console.log('- POST /api/messages - Send a new message');
  console.log('- PUT /api/messages?type=mark-read - Mark messages as read');
  
  // Load other API routes
  loadApiRoutes(apiDir);
  
  console.log('\nConnected to database');
});
