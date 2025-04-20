// This API route handles chat messages between users in a review context.
// It allows users to send messages related to specific reviews.
// The route is protected and requires authentication via JWT tokens.
// It also handles CORS preflight requests and provides error handling for various scenarios.
// File: review-backend/pages/api/chat.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { PrismaClient } from '@prisma/client';
// import Cors from 'cors';
// import jwt from 'jsonwebtoken';


// const prisma = new PrismaClient();
// const cors = Cors({ methods: ['POST', 'OPTIONS'] });

// async function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result: any) => {
//       if (result instanceof Error) return reject(result);
//       return resolve(result);
//     });
//   });
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   await runMiddleware(req, res, cors);

//   try {
//     // Handle OPTIONS request for CORS preflight
//     if (req.method === 'OPTIONS') {
//       return res.status(200).end();
//     }

//     if (req.method === 'POST') {
//       // Get the token from the Authorization header
//       const token = req.headers.authorization?.split(' ')[1];
//       if (!token) {
//         return res.status(401).json({ error: 'Authentication required' });
//       }

//       // Verify the token and extract the sender's user ID
//       const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
//       const senderId = decoded.userId;

//       // Extract the message data from the request body
//       const { reviewId, content } = req.body;

//       // Fetch the review to get the recipient's user ID (the review author)
//       const review = await prisma.review.findUnique({
//         where: { id: reviewId },
//         select: { authorId: true },
//       });

//       if (!review) {
//         return res.status(404).json({ error: 'Review not found' });
//       }

//       const recipientId = req.body.isReply 
//     ? req.body.originalSenderId // Use original sender for replies
//     : review.authorId; // Use review author for new conversations

// // Update message creation:
// const newMessage = await prisma.chatMessage.create({
//   data: {
//     content,
//     reviewId,
//     senderId,
//     recipientId, // Now properly set based on context
//     isReply: req.body.isReply || false
//   }
// });

//       return res.status(201).json(newMessage);
//     }

//     res.setHeader('Allow', ['POST']);
//     return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
//   } catch (error) {
//     console.error('Server error:', error);
//     return res.status(500).json({
//       error: 'Internal server error',
//       message: error instanceof Error ? error.message : 'Unknown error',
//     });
//   }
// }






import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const cors = Cors({ methods: ['POST', 'OPTIONS'] });

async function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
      const senderId = decoded.userId;
      const { content, reviewId, isReply, originalSenderId } = req.body;

      // Determine the recipient based on whether this is a reply
      let recipientId;
      if (isReply && originalSenderId) {
        recipientId = originalSenderId; // If it's a reply, send to the original sender
      } else {
        // If it's a new message, find the review owner
        const review = await prisma.review.findUnique({
          where: { id: reviewId },
          select: { authorId: true }
        });
        if (!review) {
          return res.status(404).json({ error: 'Review not found' });
        }
        recipientId = review.authorId;
      }

      // Create the message
      const newMessage = await prisma.chatMessage.create({
        data: {
          content,
          reviewId,
          senderId,
          recipientId,
          isReply: isReply || false
        },
        include: {
          sender: {
            select: { id: true, name: true }
          },
          recipient: {
            select: { id: true, name: true }
          },
          review: {
            select: { id: true, entity: true, imageUrl: true }
          }
        }
      });

      const messagePayload = {
        ...newMessage,
        createdAt: newMessage.createdAt.toISOString(),
        updatedAt: newMessage.updatedAt?.toISOString()
      };

      // With our polling-based approach, we no longer need to emit socket events
      // The frontend will poll for new messages periodically
      console.log(`Message sent from user ${senderId} to user ${recipientId}`);
      

      return res.status(201).json(messagePayload);
    } catch (error) {
      console.error('Chat error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
