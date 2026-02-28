// // pages/api/events.ts - Polling approach instead of SSE
import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory message queue for real-time updates
const messageQueue = new Map<number, Array<any>>();

// Add message to queue for a specific user
export function broadcastMessage(message: any) {
  if (!message || typeof message.senderId !== 'number') return;
  
  // Get recipient ID
  const recipientId = message.recipientId;
  if (typeof recipientId !== 'number') return;
  
  // Initialize queue for recipient if it doesn't exist
  if (!messageQueue.has(recipientId)) {
    messageQueue.set(recipientId, []);
  }
  
  // Add message to queue
  const queue = messageQueue.get(recipientId);
  if (queue) queue.push(message);

}

// Add read receipt to queue
export function broadcastReadReceipt(senderId: number, messageIds: number[]) {
  if (typeof senderId !== 'number' || !Array.isArray(messageIds)) return;
  
  // Initialize queue for sender if it doesn't exist
  if (!messageQueue.has(senderId)) {
    messageQueue.set(senderId, []);
  }
  
  // Add read receipt to queue
  const queue = messageQueue.get(senderId);
  if (queue) {
    queue.push({
      type: 'read_receipt',
      messageIds,
      timestamp: new Date().toISOString()
    });
  }
}

// Add delivery receipt to queue
export function broadcastDeliveryReceipt(senderId: number, messageIds: number[]) {
  if (typeof senderId !== 'number' || !Array.isArray(messageIds)) return;
  
  // Initialize queue for sender if it doesn't exist
  if (!messageQueue.has(senderId)) {
    messageQueue.set(senderId, []);
  }
  
  // Add delivery receipt to queue
  const queue = messageQueue.get(senderId);
  if (queue) {
    queue.push({
      type: 'delivery_receipt',
      messageIds,
      timestamp: new Date().toISOString()
    });
  }
}

// API handler - polling based instead of SSE
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  // Validate query parameters
  const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
  
  if (!userId || isNaN(userId)) {
    res.status(400).json({ error: 'Valid userId is required as a query parameter' });
    return;
  }
  
  // Return queued messages and clear the queue
  const messages = messageQueue.get(userId) || [];
  messageQueue.set(userId, []); // Clear the queue
  
  // Return the messages
  res.status(200).json({
    userId,
    timestamp: new Date().toISOString(),
    messages
  });
}

// Create a stub implementation with NO exports
// pages/api/events.ts
// import type { NextApiRequest, NextApiResponse } from 'next';

// // Create empty no-op functions that won't cause errors when imported
// export function broadcastMessage() {}
// export function broadcastReadReceipt() {}
// export function broadcastDeliveryReceipt() {}

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   res.status(200).json({ message: 'Realtime functionality disabled' });
// }