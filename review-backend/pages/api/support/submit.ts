import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { EmailService } from '../../../lib/emailService';
import Cors from 'cors';
import initMiddleware from '../../../middleware/initMiddleware';

// Initialize CORS middleware
const cors = initMiddleware(
  Cors({
    methods: ['POST', 'OPTIONS'],
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],
    credentials: true,
  })
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run CORS middleware
  await cors(req, res);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message, priority = 'Medium' } = req.body;

    // Validate the input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields: name, email, subject, and message' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address' 
      });
    }

    // Store the support request in the database
    const supportRequest = await prisma.supportRequest.create({
      data: {
        name,
        email,
        subject,
        message,
        priority: priority.toUpperCase(),
        status: 'PENDING', // Default status
      },
    });

    // Prepare email data
    const emailData = {
      name,
      email,
      subject,
      message,
      priority,
      submittedAt: supportRequest.createdAt.toISOString(),
      supportId: supportRequest.id
    };

    // Send email notifications (don't wait for completion to avoid blocking the response)
    Promise.all([
      EmailService.sendSupportNotification(emailData),
      EmailService.sendSupportConfirmation(emailData)
    ]).then(([adminSent, userSent]) => {

    }).catch((error) => {
      console.error(`❌ Error sending email notifications for request #${supportRequest.id}:`, error);
    });

    return res.status(201).json({ 
      success: true,
      message: 'Support request submitted successfully! You will receive a confirmation email shortly.',
      requestId: supportRequest.id,
      emailNotifications: {
        adminNotification: 'Sending...',
        userConfirmation: 'Sending...'
      }
    });
    
  } catch (error) {
    console.error('Error submitting support request:', error);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while submitting your support request' 
    });
  }
}
