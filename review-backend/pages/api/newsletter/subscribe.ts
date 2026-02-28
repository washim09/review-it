import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';

const prisma = new PrismaClient();

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email already exists
      const existingSubscription = await prisma.emailSubscription.findUnique({
        where: { email }
      });

      if (existingSubscription) {
        if (existingSubscription.isActive) {
          return res.status(400).json({ error: 'Email is already subscribed' });
        } else {
          // Reactivate subscription
          await prisma.emailSubscription.update({
            where: { email },
            data: { isActive: true }
          });
        }
      } else {
        // Create new subscription
        await prisma.emailSubscription.create({
          data: { email }
        });
      }

      // Send welcome email
      const welcomeMsg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject: 'Welcome to Review-it Newsletter!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Review-it!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Thank you for subscribing to our newsletter</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">What to expect:</h2>
              <ul style="color: #666; line-height: 1.6;">
                <li>🌟 Latest product reviews from our community</li>
                <li>📈 Trending reviews and ratings</li>
                <li>💡 Tips for making informed purchase decisions</li>
                <li>🎯 Personalized recommendations</li>
              </ul>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Visit Review-it</a>
              </div>
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                You can unsubscribe at any time by clicking the unsubscribe link in our emails.
              </p>
            </div>
          </div>
        `
      };

      await sgMail.send(welcomeMsg);

      return res.status(200).json({ 
        message: 'Successfully subscribed to newsletter!',
        success: true 
      });

    } catch (error) {
      console.error('Subscription error:', error);
      return res.status(500).json({ error: 'Failed to subscribe to newsletter' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Deactivate subscription
      await prisma.emailSubscription.update({
        where: { email },
        data: { isActive: false }
      });

      return res.status(200).json({ 
        message: 'Successfully unsubscribed from newsletter',
        success: true 
      });

    } catch (error) {
      console.error('Unsubscribe error:', error);
      return res.status(500).json({ error: 'Failed to unsubscribe' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
