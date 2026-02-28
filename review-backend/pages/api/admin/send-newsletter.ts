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
      // Simple admin authentication (you can enhance this with proper JWT admin auth)
      const { adminKey } = req.body;
      if (adminKey !== process.env.ADMIN_INVITE_CODE) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if newsletter was sent recently (prevent spam)
      const lastSent = await prisma.emailSubscription.findFirst({
        where: {
          isActive: true,
          lastEmailSent: { not: null }
        },
        orderBy: {
          lastEmailSent: 'desc'
        },
        select: {
          lastEmailSent: true
        }
      });

      // Don't send if last email was sent less than 24 hours ago
      if (lastSent?.lastEmailSent) {
        const hoursSinceLastSent = (Date.now() - lastSent.lastEmailSent.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastSent < 24) {
          return res.status(400).json({ 
            error: 'Newsletter was sent recently. Wait at least 24 hours between sends.',
            lastSent: lastSent.lastEmailSent,
            hoursRemaining: Math.ceil(24 - hoursSinceLastSent)
          });
        }
      }

      // Get all active subscribers
      const subscribers = await prisma.emailSubscription.findMany({
        where: { isActive: true }
      });

      if (subscribers.length === 0) {
        return res.status(200).json({ message: 'No active subscribers found' });
      }

      // Get latest reviews (last 7 days or top 5 recent reviews)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const latestReviews = await prisma.review.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        },
        include: {
          author: {
            select: {
              name: true,
              profileImage: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });

      // If no reviews in last 7 days, get top 5 most recent reviews
      const reviewsToSend = latestReviews.length > 0 ? latestReviews : await prisma.review.findMany({
        include: {
          author: {
            select: {
              name: true,
              profileImage: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });

      if (reviewsToSend.length === 0) {
        return res.status(200).json({ message: 'No reviews available to send' });
      }

      // Generate email content
      const generateReviewsHTML = (reviews: any[]) => {
        return reviews.map(review => `
          <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 12px;">
                ${review.author.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style="margin: 0; color: #333; font-size: 18px;">${review.title}</h3>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">by ${review.author.name}</p>
              </div>
            </div>
            <div style="margin-bottom: 15px;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="color: #333; font-weight: bold; margin-right: 10px;">${review.entity}</span>
                <div style="display: flex; align-items: center;">
                  ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                  <span style="margin-left: 8px; color: #666; font-size: 14px;">${review.rating}/5</span>
                </div>
              </div>
              <p style="color: #555; line-height: 1.6; margin: 0;">
                ${review.content.length > 150 ? review.content.substring(0, 150) + '...' : review.content}
              </p>
            </div>
            ${review.tags && review.tags.length > 0 ? `
              <div style="margin-bottom: 15px;">
                ${review.tags.map((tag: string) => `<span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; display: inline-block;">#${tag}</span>`).join('')}
              </div>
            ` : ''}
            <div style="text-align: right;">
              <a href="${process.env.FRONTEND_URL}/review/${review.id}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; text-decoration: none; border-radius: 20px; font-size: 14px; display: inline-block;">Read Full Review</a>
            </div>
          </div>
        `).join('');
      };

      const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📝 Weekly Review Digest</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${currentDate}</p>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0; text-align: center;">🌟 Fresh Reviews from Our Community</h2>
            <p style="color: #666; text-align: center; margin-bottom: 30px;">Discover the latest insights and honest reviews from our trusted community members.</p>
            ${generateReviewsHTML(reviewsToSend)}
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <a href="${process.env.FRONTEND_URL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; margin-right: 15px;">Explore More Reviews</a>
              <a href="${process.env.FRONTEND_URL}/write-review" style="background: transparent; color: #667eea; padding: 12px 30px; text-decoration: none; border: 2px solid #667eea; border-radius: 25px; display: inline-block; font-weight: bold;">Write a Review</a>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                You're receiving this because you subscribed to Review-it newsletter.<br>
                <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #999; text-decoration: underline;">Unsubscribe</a> | 
                <a href="${process.env.FRONTEND_URL}" style="color: #999; text-decoration: underline;">Visit Website</a>
              </p>
            </div>
          </div>
        </div>
      `;

      // Send emails to all subscribers
      const emailPromises = subscribers.map(async (subscriber) => {
        const msg = {
          to: subscriber.email,
          from: process.env.SENDGRID_FROM_EMAIL!,
          subject: `🌟 Weekly Review Digest - ${currentDate}`,
          html: emailHTML
        };

        try {
          await sgMail.send(msg);
          
          // Update last email sent timestamp
          await prisma.emailSubscription.update({
            where: { id: subscriber.id },
            data: { lastEmailSent: new Date() }
          });

          return { email: subscriber.email, status: 'sent' };
        } catch (error) {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
          return { email: subscriber.email, status: 'failed', error };
        }
      });

      const results = await Promise.all(emailPromises);
      const successCount = results.filter(r => r.status === 'sent').length;
      const failCount = results.filter(r => r.status === 'failed').length;

      return res.status(200).json({
        message: 'Weekly newsletter sent successfully',
        success: true,
        stats: {
          totalSubscribers: subscribers.length,
          emailsSent: successCount,
          emailsFailed: failCount,
          reviewsIncluded: reviewsToSend.length,
          sentAt: new Date()
        },
        results
      });

    } catch (error) {
      console.error('Newsletter sending error:', error);
      return res.status(500).json({ error: 'Failed to send newsletter' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
