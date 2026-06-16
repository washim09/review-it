/**
 * Affiliate Review Pipeline Orchestrator
 * 
 * Coordinates the 3-tier validation:
 * T1: URL validation + domain check + Safe Browsing + duplicate + rate limit
 * T2: AI spam detection (heuristics + OpenAI)
 * T3: Manual admin review (for borderline cases)
 * 
 * Returns the final affiliate status and all metadata to be saved with the review.
 */

import {
  validateAffiliateLink,
  checkGoogleSafeBrowsing,
  checkAffiliateRateLimit,
  type AffiliatePlatform,
} from './affiliateValidator';
import { detectSpam, getMinWordCount, type SpamDetectionResult } from './aiSpamDetector';

export interface AffiliatePipelineInput {
  affiliateEnabled: boolean;
  affiliatePlatform: string;
  affiliateLink: string;
  title: string;
  content: string;
  review: string;
  rating: number;
  entity: string;
  category?: string;
  tags?: string[];
  authorId: number;
}

export interface AffiliatePipelineResult {
  success: boolean;
  affiliateStatus: string | null; // PENDING_VERIFICATION | AUTO_APPROVED | AUTO_REJECTED | null (non-affiliate)
  aiSpamScore: number | null;
  aiSpamReasons: string[];
  errors: string[]; // Validation errors that block submission
  warnings: string[]; // Non-blocking issues
}

/**
 * Run the full affiliate validation pipeline
 */
export async function runAffiliatePipeline(
  input: AffiliatePipelineInput,
  prisma: any
): Promise<AffiliatePipelineResult> {
  // If affiliate is not enabled, skip everything
  if (!input.affiliateEnabled) {
    return {
      success: true,
      affiliateStatus: null,
      aiSpamScore: null,
      aiSpamReasons: [],
      errors: [],
      warnings: [],
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // ==========================================
  // TIER 1: URL Validation & Security Checks
  // ==========================================

  // 1a. Validate URL format and domain
  const urlValidation = validateAffiliateLink(input.affiliateLink, input.affiliatePlatform);
  if (!urlValidation.isValid) {
    return {
      success: false,
      affiliateStatus: null,
      aiSpamScore: null,
      aiSpamReasons: [],
      errors: urlValidation.errors,
      warnings: [],
    };
  }

  // 1b. Minimum word count check for affiliate reviews
  const fullText = `${input.title} ${input.content} ${input.review}`;
  const wordCount = fullText.split(/\s+/).filter((w) => w.length > 0).length;
  const minWords = getMinWordCount();
  if (wordCount < minWords) {
    errors.push(
      `Affiliate reviews require at least ${minWords} words. Your review has ${wordCount} words. ` +
      `Please add more detail about your genuine experience with the product.`
    );
    return {
      success: false,
      affiliateStatus: null,
      aiSpamScore: null,
      aiSpamReasons: [],
      errors,
      warnings: [],
    };
  }

  // 1c. Rate limit check
  const rateLimit = await checkAffiliateRateLimit(prisma, input.authorId);
  if (!rateLimit.isAllowed) {
    errors.push(
      `You have reached the daily limit of ${rateLimit.limit} affiliate reviews. ` +
      `Please try again tomorrow.`
    );
    return {
      success: false,
      affiliateStatus: null,
      aiSpamScore: null,
      aiSpamReasons: [],
      errors,
      warnings: [],
    };
  }

  // 1d. Google Safe Browsing check
  const safeBrowsing = await checkGoogleSafeBrowsing(input.affiliateLink);
  if (!safeBrowsing.isSafe) {
    return {
      success: false,
      affiliateStatus: 'AUTO_REJECTED',
      aiSpamScore: 100,
      aiSpamReasons: [`URL flagged by Google Safe Browsing: ${safeBrowsing.threats.join(', ')}`],
      errors: ['This URL has been flagged as potentially dangerous and cannot be used.'],
      warnings: [],
    };
  }

  // ==========================================
  // TIER 2: AI Spam Detection
  // ==========================================

  const spamResult: SpamDetectionResult = await detectSpam(
    {
      title: input.title,
      content: input.content,
      review: input.review,
      rating: input.rating,
      entity: input.entity,
      category: input.category,
      tags: input.tags,
      affiliatePlatform: input.affiliatePlatform,
      affiliateLink: input.affiliateLink,
      authorId: input.authorId,
    },
    prisma
  );

  // ==========================================
  // TIER 3: Determine outcome
  // ==========================================

  // Check if the reviewer is a trusted reviewer
  const trustedReviewer = await prisma.trustedReviewer.findUnique({
    where: { userId: input.authorId },
  });
  const isTrusted = trustedReviewer?.isTrusted === true;

  let affiliateStatus: string;

  switch (spamResult.decision) {
    case 'AUTO_APPROVE':
      affiliateStatus = 'AUTO_APPROVED';
      warnings.push('Review auto-approved by our verification system.');
      break;
    case 'AUTO_REJECT':
      affiliateStatus = 'AUTO_REJECTED';
      errors.push(
        'Your review has been flagged by our automated quality system. ' +
        'Please ensure your review contains genuine, detailed personal experience with the product. ' +
        'Avoid promotional language, keyword stuffing, or copied content.'
      );
      return {
        success: false,
        affiliateStatus: 'AUTO_REJECTED',
        aiSpamScore: spamResult.score,
        aiSpamReasons: spamResult.reasons,
        errors,
        warnings: [],
      };
    case 'MANUAL_REVIEW':
    default:
      // Trusted reviewers with borderline scores get auto-approved
      if (isTrusted && spamResult.score <= 55) {
        affiliateStatus = 'AUTO_APPROVED';
        warnings.push('Auto-approved: Trusted reviewer with acceptable content score.');
      } else {
        affiliateStatus = 'PENDING_VERIFICATION';
      }
      break;
  }

  // Update trusted reviewer stats
  if (trustedReviewer) {
    if (affiliateStatus === 'AUTO_APPROVED' || affiliateStatus === 'APPROVED') {
      await prisma.trustedReviewer.update({
        where: { userId: input.authorId },
        data: { approvedCount: { increment: 1 } },
      });
    }
  }

  return {
    success: true,
    affiliateStatus,
    aiSpamScore: spamResult.score,
    aiSpamReasons: spamResult.reasons,
    errors: [],
    warnings,
  };
}
