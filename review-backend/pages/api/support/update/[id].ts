import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { EmailService } from '../../../../lib/emailService';
import initMiddleware from '../../../../middleware/initMiddleware';
import Cors from 'cors';

// Initialize CORS middleware
const cors = initMiddleware(
  Cors({
    methods: ['PUT', 'PATCH', 'HEAD'],
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  })
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status, response } = req.body;

  // Validate and convert the request ID to number
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid request ID' });
  }

  const requestId = parseInt(id, 10);
  if (isNaN(requestId)) {
    return res.status(400).json({ message: 'Request ID must be a valid number' });
  }

  // Validate status if provided
  if (status && !['pending', 'reviewed', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be pending, reviewed, or resolved' });
  }

  try {
    // Check if the support request exists
    const existingRequest = await prisma.supportRequest.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return res.status(404).json({ message: 'Support request not found' });
    }

    // Update the support request
    const updatedRequest = await prisma.supportRequest.update({
      where: { id: requestId },
      data: {
        ...(status && { status }),
        ...(response && { response }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        status: true,
        response: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send status update email if status changed
    if (status && status !== existingRequest.status) {

      // Send status update email (don't wait for completion)
      EmailService.sendStatusUpdateEmail(
        updatedRequest.email,
        updatedRequest.name,
        updatedRequest.id,
        updatedRequest.subject,
        status,
        response || undefined
      ).then((sent) => {

      }).catch((error) => {
        console.error(`❌ Error sending status update email for request #${requestId}:`, error);
      });
    }

    // Format dates for frontend
    const formattedRequest = {
      ...updatedRequest,
      createdAt: updatedRequest.createdAt.toISOString(),
      updatedAt: updatedRequest.updatedAt.toISOString(),
    };

    res.status(200).json(formattedRequest);
  } catch (error) {
    console.error('Error updating support request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
