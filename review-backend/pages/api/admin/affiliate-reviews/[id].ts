// pages/api/admin/affiliate-reviews/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { runCorsMiddleware } from '../../../../lib/cors-middleware';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

function verifyAdminToken(req: NextApiRequest): { adminId: number } | null {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin' && !decoded.adminId) return null;
    return { adminId: decoded.adminId || decoded.id };
  } catch {
    return null;
  }
}

// Helper to send notification to reviewer
async function createNotification(
  userId: number,
  type: string,
  title: string,
  message: string,
  reviewId: number
) {
  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      metadata: JSON.stringify({ reviewId }),
    },
  });
}

// Helper to send email notification (uses SendGrid directly)
async function sendStatusEmail(email: string, name: string, reviewTitle: string, status: string, reason?: string) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('[AffiliateAdmin] SendGrid API key not configured, skipping email');
      return;
    }

    const sgMail = (await import('@sendgrid/mail')).default;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const statusMessages: Record<string, string> = {
      APPROVED: `Great news! Your affiliate review "${reviewTitle}" has been approved and is now live on Riviewit.`,
      REJECTED: `Your affiliate review "${reviewTitle}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      NEEDS_CHANGES: `Your affiliate review "${reviewTitle}" requires some changes before it can be approved.${reason ? ` Feedback: ${reason}` : ''}`,
    };

    const subject = `Riviewit - Affiliate Review ${status === 'APPROVED' ? 'Approved' : status === 'REJECTED' ? 'Rejected' : 'Needs Changes'}`;
    const htmlContent = `
      <h2>Hi ${name},</h2>
      <p>${statusMessages[status] || 'Your review status has been updated.'}</p>
      ${status === 'NEEDS_CHANGES' ? '<p>Please log in to your account to make the required changes and resubmit.</p>' : ''}
      ${status === 'APPROVED' ? '<p>Your review is now visible to all Riviewit users. Thank you for contributing!</p>' : ''}
      <p>Best regards,<br>The Riviewit Team</p>
    `;

    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@riviewit.com',
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error('[AffiliateAdmin] Failed to send status email:', error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const admin = verifyAdminToken(req);
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized: Admin access required' });
  }

  const reviewId = parseInt(req.query.id as string, 10);
  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  // GET - Get single affiliate review detail with audit log
  if (req.method === 'GET') {
    try {
      const review = await prisma.review.findFirst({
        where: { id: reviewId, affiliateEnabled: true },
        include: {
          author: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
          affiliateAuditLogs: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!review) {
        return res.status(404).json({ error: 'Affiliate review not found' });
      }

      return res.status(200).json(review);
    } catch (error) {
      console.error('Error fetching affiliate review:', error);
      return res.status(500).json({ error: 'Failed to fetch affiliate review' });
    }
  }

  // PUT - Update affiliate review status (approve/reject/needs-changes)
  if (req.method === 'PUT') {
    try {
      const { action, reason } = req.body;

      if (!action || !['APPROVE', 'REJECT', 'NEEDS_CHANGES'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be APPROVE, REJECT, or NEEDS_CHANGES' });
      }

      // Validate reason is provided for reject/needs-changes
      if ((action === 'REJECT' || action === 'NEEDS_CHANGES') && !reason?.trim()) {
        return res.status(400).json({ error: `A reason is required when ${action === 'REJECT' ? 'rejecting' : 'requesting changes for'} a review.` });
      }

      // Get the review first
      const existingReview = await prisma.review.findFirst({
        where: { id: reviewId, affiliateEnabled: true },
        include: { author: { select: { id: true, name: true, email: true } } },
      });

      if (!existingReview) {
        return res.status(404).json({ error: 'Affiliate review not found' });
      }

      // Determine new status and update data
      let updateData: any = {
        affiliateVerifiedBy: admin.adminId,
        affiliateVerifiedAt: new Date(),
      };

      let notificationType: string;
      let notificationTitle: string;
      let notificationMessage: string;

      switch (action) {
        case 'APPROVE':
          updateData.affiliateStatus = 'APPROVED';
          updateData.affiliateNeedsChangesReason = null;
          updateData.affiliateRejectionReason = null;
          notificationType = 'AFFILIATE_APPROVED';
          notificationTitle = 'Affiliate Review Approved!';
          notificationMessage = `Your affiliate review "${existingReview.title}" has been approved and is now live on Riviewit.`;
          break;

        case 'REJECT':
          updateData.affiliateStatus = 'REJECTED';
          updateData.affiliateRejectionReason = reason.trim();
          notificationType = 'AFFILIATE_REJECTED';
          notificationTitle = 'Affiliate Review Rejected';
          notificationMessage = `Your affiliate review "${existingReview.title}" has been rejected. Reason: ${reason.trim()}`;
          break;

        case 'NEEDS_CHANGES':
          updateData.affiliateStatus = 'NEEDS_CHANGES';
          updateData.affiliateNeedsChangesReason = reason.trim();
          notificationType = 'AFFILIATE_NEEDS_CHANGES';
          notificationTitle = 'Changes Required for Affiliate Review';
          notificationMessage = `Your affiliate review "${existingReview.title}" needs changes. Feedback: ${reason.trim()}`;
          break;

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      // Update the review
      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: updateData,
      });

      // Create audit log
      await prisma.affiliateAuditLog.create({
        data: {
          reviewId,
          adminId: admin.adminId,
          action: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'NEEDS_CHANGES',
          reason: reason?.trim() || null,
          aiSpamScore: existingReview.aiSpamScore,
        },
      });

      // Create in-app notification
      await createNotification(
        existingReview.author.id,
        notificationType,
        notificationTitle,
        notificationMessage,
        reviewId
      );

      // Send email notification
      await sendStatusEmail(
        existingReview.author.email,
        existingReview.author.name,
        existingReview.title,
        action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'NEEDS_CHANGES',
        reason?.trim()
      );

      // Update TrustedReviewer stats
      try {
        if (action === 'APPROVE') {
          await prisma.trustedReviewer.upsert({
            where: { userId: existingReview.authorId },
            create: { userId: existingReview.authorId, approvedCount: 1 },
            update: { approvedCount: { increment: 1 } },
          });
        } else if (action === 'REJECT') {
          await prisma.trustedReviewer.upsert({
            where: { userId: existingReview.authorId },
            create: { userId: existingReview.authorId, rejectedCount: 1 },
            update: { rejectedCount: { increment: 1 } },
          });
        }
      } catch (e) {
        console.error('[AffiliateAdmin] Error updating TrustedReviewer stats:', e);
      }

      return res.status(200).json({
        success: true,
        message: `Review ${action.toLowerCase()}${action === 'APPROVE' ? 'd' : action === 'REJECT' ? 'ed' : ''} successfully.`,
        review: updatedReview,
      });
    } catch (error) {
      console.error('Error updating affiliate review:', error);
      return res.status(500).json({ error: 'Failed to update affiliate review' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
