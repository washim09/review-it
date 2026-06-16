// pages/api/reviews/resubmit-affiliate.ts
// Allows a reviewer to edit and resubmit a NEEDS_CHANGES affiliate review
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { runCorsMiddleware } from '../../../lib/cors-middleware';
import { runAffiliatePipeline } from '../../../lib/affiliatePipeline';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

function getUserId(req: NextApiRequest): number | null {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.id || decoded.userId || null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { reviewId, title, content, review, rating, affiliateLink, affiliatePlatform } = req.body;

  if (!reviewId) {
    return res.status(400).json({ error: 'reviewId is required' });
  }

  try {
    // Fetch the existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(reviewId, 10) },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check ownership
    if (existingReview.authorId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    // Check that the review is in NEEDS_CHANGES status
    if (existingReview.affiliateStatus !== 'NEEDS_CHANGES') {
      return res.status(400).json({ error: 'Only reviews with NEEDS_CHANGES status can be resubmitted' });
    }

    // Use updated fields or fall back to existing
    const updatedTitle = title || existingReview.title;
    const updatedContent = content || existingReview.content;
    const updatedReview = review || existingReview.review;
    const updatedRating = rating !== undefined ? parseInt(rating, 10) : existingReview.rating;
    const updatedAffiliateLink = affiliateLink || existingReview.affiliateLink || '';
    const updatedAffiliatePlatform = affiliatePlatform || existingReview.affiliatePlatform || '';

    // Re-run the affiliate pipeline
    const pipelineResult = await runAffiliatePipeline(
      {
        affiliateEnabled: true,
        affiliatePlatform: updatedAffiliatePlatform,
        affiliateLink: updatedAffiliateLink,
        title: updatedTitle,
        content: updatedContent,
        review: updatedReview,
        rating: updatedRating,
        entity: existingReview.entity,
        category: existingReview.category || undefined,
        tags: existingReview.tags || [],
        authorId: userId,
      },
      prisma
    );

    // If pipeline has hard errors, reject the resubmission
    if (!pipelineResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: pipelineResult.errors,
      });
    }

    // Update the review with new content and reset affiliate status
    const updated = await prisma.review.update({
      where: { id: existingReview.id },
      data: {
        title: updatedTitle,
        content: updatedContent,
        review: updatedReview,
        rating: updatedRating,
        affiliateLink: updatedAffiliateLink,
        affiliatePlatform: updatedAffiliatePlatform,
        affiliateStatus: pipelineResult.affiliateStatus || 'PENDING_VERIFICATION',
        aiSpamScore: pipelineResult.aiSpamScore,
        aiSpamReasons: pipelineResult.aiSpamReasons,
        affiliateNeedsChangesReason: null, // Clear previous feedback
        affiliateSubmittedAt: new Date(),
        affiliateVerifiedAt: null,
      },
    });

    // Create audit log
    await prisma.affiliateAuditLog.create({
      data: {
        reviewId: existingReview.id,
        action: 'RESUBMITTED',
        reason: 'Reviewer edited and resubmitted after NEEDS_CHANGES feedback',
        aiSpamScore: pipelineResult.aiSpamScore,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Review resubmitted successfully. It will be reviewed again.',
      affiliateStatus: updated.affiliateStatus,
    });
  } catch (error) {
    console.error('[ResubmitAffiliate] Error:', error);
    return res.status(500).json({ error: 'Failed to resubmit review' });
  }
}
