/**
 * AI Spam Detector for Affiliate Reviews
 * 
 * Tier 2 validation: Combines heuristic checks with OpenAI content analysis
 * to generate a spam score (0-100) and actionable reasons.
 * 
 * Score ranges:
 *  0-39: Auto-approve (clean content)
 * 40-70: Manual review (borderline)
 * 71-100: Auto-reject (obvious spam)
 */

import crypto from 'crypto';

export interface SpamDetectionResult {
  score: number; // 0-100
  reasons: string[];
  decision: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'AUTO_REJECT';
}

interface ReviewContent {
  title: string;
  content: string; // Brief summary
  review: string; // Detailed review text
  rating: number;
  entity: string; // Product name
  category?: string;
  tags?: string[];
  affiliatePlatform: string;
  affiliateLink: string;
  authorId: number;
}

// Thresholds (configurable)
const AUTO_APPROVE_THRESHOLD = 39;
const AUTO_REJECT_THRESHOLD = 71;
const MIN_WORD_COUNT = 150; // Minimum words for affiliate reviews

/**
 * Main spam detection function - combines heuristics + AI
 */
export async function detectSpam(
  reviewContent: ReviewContent,
  prisma: any
): Promise<SpamDetectionResult> {
  const reasons: string[] = [];
  let totalScore = 0;

  // Phase 1: Heuristic checks (fast, no API calls)
  const heuristicResult = runHeuristicChecks(reviewContent);
  totalScore += heuristicResult.score;
  reasons.push(...heuristicResult.reasons);

  // Phase 2: Duplicate content check
  const duplicateResult = await checkDuplicateContent(reviewContent, prisma);
  totalScore += duplicateResult.score;
  reasons.push(...duplicateResult.reasons);

  // Phase 3: Submission frequency check
  const frequencyResult = await checkSubmissionFrequency(reviewContent.authorId, prisma);
  totalScore += frequencyResult.score;
  reasons.push(...frequencyResult.reasons);

  // Phase 4: OpenAI content analysis (if key available)
  const aiResult = await analyzeWithOpenAI(reviewContent);
  totalScore += aiResult.score;
  reasons.push(...aiResult.reasons);

  // Cap score at 100
  const finalScore = Math.min(100, Math.max(0, totalScore));

  // Determine decision
  let decision: SpamDetectionResult['decision'];
  if (finalScore <= AUTO_APPROVE_THRESHOLD) {
    decision = 'AUTO_APPROVE';
  } else if (finalScore >= AUTO_REJECT_THRESHOLD) {
    decision = 'AUTO_REJECT';
  } else {
    decision = 'MANUAL_REVIEW';
  }

  return { score: finalScore, reasons, decision };
}

/**
 * Heuristic checks - no external API calls
 */
function runHeuristicChecks(content: ReviewContent): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const fullText = `${content.title} ${content.content} ${content.review}`;
  const words = fullText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // 1. Minimum word count for affiliate reviews
  if (wordCount < MIN_WORD_COUNT) {
    score += 25;
    reasons.push(`Review too short (${wordCount} words, minimum ${MIN_WORD_COUNT} required for affiliate reviews).`);
  } else if (wordCount < 200) {
    score += 10;
    reasons.push(`Review is relatively short (${wordCount} words).`);
  }

  // 2. Keyword stuffing detection
  const linkKeywords = ['buy', 'purchase', 'click', 'order', 'discount', 'deal', 'offer', 'sale', 'cheap', 'best price', 'limited time'];
  const keywordMatches = linkKeywords.filter((kw) => fullText.toLowerCase().includes(kw));
  const keywordDensity = keywordMatches.length / Math.max(wordCount / 100, 1);
  if (keywordDensity > 3) {
    score += 20;
    reasons.push('High promotional keyword density detected.');
  } else if (keywordDensity > 2) {
    score += 10;
    reasons.push('Moderate promotional keyword density.');
  }

  // 3. ALL CAPS detection
  const capsWords = words.filter((w) => w.length > 3 && w === w.toUpperCase());
  const capsRatio = capsWords.length / words.length;
  if (capsRatio > 0.3) {
    score += 15;
    reasons.push('Excessive use of capital letters.');
  }

  // 4. Excessive exclamation/punctuation
  const exclamationCount = (fullText.match(/!/g) || []).length;
  if (exclamationCount > 10) {
    score += 10;
    reasons.push('Excessive exclamation marks.');
  }

  // 5. URL presence in review text (besides the affiliate link itself)
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urlsInText = fullText.match(urlPattern) || [];
  if (urlsInText.length > 2) {
    score += 15;
    reasons.push('Multiple URLs found in review content.');
  }

  // 6. Repetitive content detection
  const sentences = fullText.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const uniqueSentences = new Set(sentences.map((s) => s.trim().toLowerCase()));
  if (sentences.length > 3 && uniqueSentences.size < sentences.length * 0.6) {
    score += 20;
    reasons.push('Repetitive content detected.');
  }

  // 7. Rating bias (always 5 stars with affiliate = suspicious)
  if (content.rating === 5) {
    score += 5;
    reasons.push('Maximum rating with affiliate link (minor flag).');
  }

  // 8. Title matches product name exactly (lazy copy)
  if (content.title.toLowerCase().trim() === content.entity.toLowerCase().trim()) {
    score += 5;
    reasons.push('Review title identical to product name.');
  }

  // 9. Content is mostly the affiliate link or very little actual review
  const reviewTextOnly = content.review.replace(urlPattern, '').trim();
  if (reviewTextOnly.split(/\s+/).length < 50) {
    score += 15;
    reasons.push('Very little actual review content after removing URLs.');
  }

  return { score, reasons };
}

/**
 * Check for duplicate/similar content from the same user
 */
async function checkDuplicateContent(
  content: ReviewContent,
  prisma: any
): Promise<{ score: number; reasons: string[] }> {
  let score = 0;
  const reasons: string[] = [];

  try {
    // Check if user has submitted similar content recently
    const contentHash = crypto
      .createHash('sha256')
      .update(`${content.title}${content.content}${content.review}`.toLowerCase().replace(/\s+/g, ''))
      .digest('hex');

    const recentReviews = await prisma.review.findMany({
      where: {
        authorId: content.authorId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      },
      select: { title: true, content: true, review: true },
      take: 20,
    });

    for (const existing of recentReviews) {
      const existingHash = crypto
        .createHash('sha256')
        .update(`${existing.title}${existing.content}${existing.review}`.toLowerCase().replace(/\s+/g, ''))
        .digest('hex');

      if (existingHash === contentHash) {
        score += 30;
        reasons.push('Duplicate content detected from the same user.');
        break;
      }

      // Partial similarity check (title match)
      if (existing.title.toLowerCase().trim() === content.title.toLowerCase().trim()) {
        score += 15;
        reasons.push('Similar review title from the same user recently.');
        break;
      }
    }
  } catch (error) {
    console.error('[AISpamDetector] Duplicate content check error:', error);
  }

  return { score, reasons };
}

/**
 * Check submission frequency patterns
 */
async function checkSubmissionFrequency(
  authorId: number,
  prisma: any
): Promise<{ score: number; reasons: string[] }> {
  let score = 0;
  const reasons: string[] = [];

  try {
    // Count affiliate reviews in last 24 hours
    const last24h = await prisma.review.count({
      where: {
        authorId,
        affiliateEnabled: true,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (last24h >= 5) {
      score += 20;
      reasons.push(`High affiliate submission frequency (${last24h} in 24h).`);
    } else if (last24h >= 3) {
      score += 10;
      reasons.push(`Moderate affiliate submission frequency (${last24h} in 24h).`);
    }

    // Count total reviews from user (new accounts are more suspicious)
    const totalReviews = await prisma.review.count({
      where: { authorId },
    });

    if (totalReviews <= 1) {
      score += 10;
      reasons.push('New user with first review containing affiliate link.');
    }
  } catch (error) {
    console.error('[AISpamDetector] Frequency check error:', error);
  }

  return { score, reasons };
}

/**
 * OpenAI content analysis
 */
async function analyzeWithOpenAI(content: ReviewContent): Promise<{ score: number; reasons: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('[AISpamDetector] OPENAI_API_KEY not set. Skipping AI analysis.');
    return { score: 0, reasons: [] };
  }

  try {
    const prompt = `You are a content moderation AI for a product review platform. Analyze the following review that contains an affiliate purchase link.

Rate the spam likelihood from 0-30 (this will be ADDED to other scores):
- 0-5: Genuine, helpful review with personal experience
- 6-15: Somewhat promotional but contains useful information
- 16-25: Clearly promotional with little genuine review content
- 26-30: Obvious spam, AI-generated filler, or meaningless content

Review Details:
- Title: "${content.title}"
- Product: "${content.entity}"
- Category: "${content.category || 'N/A'}"
- Rating: ${content.rating}/5
- Platform: ${content.affiliatePlatform}
- Summary: "${content.content}"
- Full Review: "${content.review}"

Respond ONLY with valid JSON in this exact format:
{"score": <number 0-30>, "reasons": ["reason1", "reason2"]}

Evaluate for:
1. Is this a genuine personal experience or generic/AI-generated content?
2. Does the review provide specific, useful details about the product?
3. Is the review overly focused on selling rather than reviewing?
4. Does the content read naturally or is it keyword-stuffed?
5. Is there evidence of copied/templated content?`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective for moderation
        messages: [
          { role: 'system', content: 'You are a content moderation assistant. Respond only with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1, // Low temperature for consistent scoring
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('[AISpamDetector] OpenAI API error:', response.status);
      return { score: 0, reasons: [] };
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      return { score: 0, reasons: [] };
    }

    // Parse AI response
    const parsed = JSON.parse(aiResponse);
    const aiScore = Math.min(30, Math.max(0, Number(parsed.score) || 0));
    const aiReasons = Array.isArray(parsed.reasons)
      ? parsed.reasons.map((r: any) => `[AI] ${String(r)}`)
      : [];

    return { score: aiScore, reasons: aiReasons };
  } catch (error) {
    console.error('[AISpamDetector] OpenAI analysis error:', error);
    return { score: 0, reasons: [] }; // Fail open
  }
}

/**
 * Get decision thresholds (can be adjusted per trusted reviewer status)
 */
export function getThresholds(isTrustedReviewer: boolean = false) {
  if (isTrustedReviewer) {
    return {
      autoApprove: 55, // Higher threshold for trusted reviewers
      autoReject: AUTO_REJECT_THRESHOLD,
    };
  }
  return {
    autoApprove: AUTO_APPROVE_THRESHOLD,
    autoReject: AUTO_REJECT_THRESHOLD,
  };
}

/**
 * Get minimum word count for affiliate reviews
 */
export function getMinWordCount(): number {
  return MIN_WORD_COUNT;
}
