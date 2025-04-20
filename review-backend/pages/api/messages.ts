// review-backend/pages/api/messages.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { PrismaClient } from '@prisma/client';
// import Cors from 'cors';
// import jwt from 'jsonwebtoken';

// const prisma = new PrismaClient();
// const cors = Cors({ methods: ['GET', 'PUT'] });

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
//     // Get the token from the Authorization header
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }

//     // Verify the token and extract the user ID
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
//     const userId = decoded.userId;

//     if (req.method === 'PUT') {
//       // Mark all messages as read
//       await prisma.chatMessage.updateMany({
//         where: { recipientId: userId, isRead: false },
//         data: { isRead: true },
//       });

//       return res.status(200).json({ message: 'Messages marked as read' });
//     }

//     // Fetch messages for the authenticated user as the recipient
//     const messages = await prisma.chatMessage.findMany({
//       where: {
//         OR: [
//           { recipientId: userId }, // Messages received
//           { senderId: userId }     // Messages sent
//         ]
//       },
//       include: {
//         review: {
//           select: {
//             id: true,
//             entity: true,
//             imageUrl: true,
//           },
//         },
//         sender: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     res.status(200).json(
//       messages.map((msg) => ({
//         id: msg.id,
//         content: msg.content,
//         createdAt: msg.createdAt.toISOString(),
//         isRead: msg.isRead,
//         review: msg.review,
//         sender: msg.sender,
//       }))
//     );
//   } catch (error) {
//     console.error('Messages API error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }








// import { NextApiRequest, NextApiResponse } from 'next';
// import { PrismaClient } from '@prisma/client';
// import jwt from 'jsonwebtoken';

// const prisma = new PrismaClient();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
//     const userId = decoded.userId;

//     // Handle unread count request
//     if (req.method === 'GET' && req.query.type === 'unread-count') {
//       const count = await prisma.chatMessage.count({
//         where: {
//           recipientId: userId,
//           isRead: false
//         }
//       });
//       return res.status(200).json(count);
//     }

//     // Handle mark as read request
//     if (req.method === 'PUT' && req.query.type === 'mark-read') {
//       const { messageIds } = req.body;
      
//       await prisma.chatMessage.updateMany({
//         where: {
//           id: { in: messageIds },
//           recipientId: userId // Ensure user can only mark their own messages as read
//         },
//         data: {
//           isRead: true
//         }
//       });

//       return res.status(200).json({ success: true });
//     }

//     // Handle get all messages request
//     if (req.method === 'GET') {
//       const messages = await prisma.chatMessage.findMany({
//         where: {
//           OR: [
//             { recipientId: userId },
//             { senderId: userId }
//           ]
//         },
//         include: {
//           review: true,
//           sender: true,
//           recipient: true
//         },
//         orderBy: { createdAt: 'desc' },
//       });

//       return res.status(200).json(messages);
//     }

//     return res.status(405).json({ error: 'Method not allowed' });
//   } catch (error) {
//     console.error('API error:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }








// pages/api/messages.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import Cors from 'cors';
import errorMiddleware from './middlewareError'; // Import the error handler

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET; // Get from env



async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
      return res.status(200).end();
  }
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, secretKey!) as { userId: number };
    const userId = decoded.userId;

    // Handle unread count request
    if (req.method === 'GET' && req.query.type === 'unread-count') {
      const count = await prisma.chatMessage.count({
        where: {
          recipientId: userId,
          isRead: false
        }
      });
      return res.status(200).json(count);
    }

    // Handle mark as read request
    if (req.method === 'PUT' && req.query.type === 'mark-read') {
      const { messageIds } = req.body;

      await prisma.chatMessage.updateMany({
        where: {
          id: { in: messageIds },
          recipientId: userId // Ensure user can only mark their own messages as read
        },
        data: {
          isRead: true
        }
      });

      return res.status(200).json({ success: true });
    }

    // Handle get all messages request
    if (req.method === 'GET') {
      const messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { recipientId: userId },
            { senderId: userId }
          ]
        },
        include: {
          review: true,
          sender: true,
          recipient: true
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(messages);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
          return res.status(401).json({ error: 'Token expired' });
      } else if (error instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ error: 'Invalid token' });
      }
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
import allowCors from './cors';

export default allowCors(errorMiddleware(handler)); // Wrap with both error and CORS middleware