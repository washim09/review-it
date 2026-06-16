/**
 * Affiliate Link Validator
 * 
 * Tier 1 validation: URL format, HTTPS enforcement, domain allowlist,
 * Google Safe Browsing check, duplicate detection, and malicious URL rejection.
 */

import crypto from 'crypto';

// Platform-to-domain mapping (strict allowlist)
export const AFFILIATE_PLATFORMS = {
  AMAZON: {
    label: 'Amazon',
    domains: ['amazon.in', 'amazon.com', 'amzn.in', 'amzn.to', 'amzn.eu'],
  },
  FLIPKART: {
    label: 'Flipkart',
    domains: ['flipkart.com', 'dl.flipkart.com', 'fkrt.it'],
  },
  MEESHO: {
    label: 'Meesho',
    domains: ['meesho.com', 'share.meesho.com'],
  },
  MYNTRA: {
    label: 'Myntra',
    domains: ['myntra.com'],
  },
  AJIO: {
    label: 'Ajio',
    domains: ['ajio.com'],
  },
  NYKAA: {
    label: 'Nykaa',
    domains: ['nykaa.com', 'nykaafashion.com'],
  },
  CROMA: {
    label: 'Croma',
    domains: ['croma.com'],
  },
} as const;

export type AffiliatePlatform = keyof typeof AFFILIATE_PLATFORMS;

// Blocked URL schemes
const BLOCKED_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];

// Known redirect/shortener services that should NOT be allowed (unless in platform whitelist)
const BLOCKED_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly',
  'is.gd', 'buff.ly', 'rebrand.ly', 'cutt.ly', 'short.io',
];

export interface AffiliateValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedUrl?: string;
  urlHash?: string; // SHA-256 hash for duplicate detection
}

/**
 * Validate affiliate link - Tier 1 checks
 */
export function validateAffiliateLink(
  url: string,
  platform: string
): AffiliateValidationResult {
  const errors: string[] = [];

  // 1. Basic presence check
  if (!url || url.trim().length === 0) {
    return { isValid: false, errors: ['Affiliate link is required.'] };
  }

  if (!platform || platform.trim().length === 0) {
    return { isValid: false, errors: ['Affiliate platform is required.'] };
  }

  const trimmedUrl = url.trim();

  // 2. Max length check (prevent buffer overflow attacks)
  if (trimmedUrl.length > 2048) {
    errors.push('Affiliate link is too long (max 2048 characters).');
    return { isValid: false, errors };
  }

  // 3. Block dangerous schemes
  const lowerUrl = trimmedUrl.toLowerCase();
  for (const scheme of BLOCKED_SCHEMES) {
    if (lowerUrl.startsWith(scheme)) {
      errors.push('Invalid URL scheme detected. Only HTTPS links are allowed.');
      return { isValid: false, errors };
    }
  }

  // 4. HTTPS enforcement
  if (!lowerUrl.startsWith('https://')) {
    errors.push('Affiliate link must use HTTPS (start with https://).');
    return { isValid: false, errors };
  }

  // 5. URL format validation
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    errors.push('Invalid URL format. Please enter a valid affiliate link.');
    return { isValid: false, errors };
  }

  // 6. Validate platform exists in our allowlist
  const platformKey = platform.toUpperCase() as AffiliatePlatform;
  const platformConfig = AFFILIATE_PLATFORMS[platformKey];
  if (!platformConfig) {
    errors.push(`"${platform}" is not a supported affiliate platform.`);
    return { isValid: false, errors };
  }

  // 7. Domain validation - extract hostname and strip www.
  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

  // 8. Check against blocked shorteners (unless in platform's own domain list)
  if (BLOCKED_SHORTENERS.includes(hostname) && !(platformConfig.domains as readonly string[]).includes(hostname)) {
    errors.push('URL shorteners are not allowed. Please use the direct affiliate link.');
    return { isValid: false, errors };
  }

  // 9. Check domain matches selected platform
  const isDomainAllowed = platformConfig.domains.some((allowed) => {
    return hostname === allowed || hostname.endsWith('.' + allowed);
  });

  if (!isDomainAllowed) {
    errors.push(
      `The link domain "${hostname}" does not match the selected platform "${platformConfig.label}". ` +
      `Allowed domains: ${platformConfig.domains.join(', ')}.`
    );
    return { isValid: false, errors };
  }

  // 10. Check for suspicious patterns in URL
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /<script/i,
    /on\w+=/i, // onclick=, onerror=, etc.
    /%3Cscript/i, // URL-encoded <script
    /&#/i, // HTML entities
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedUrl)) {
      errors.push('Suspicious content detected in the URL. Please provide a clean affiliate link.');
      return { isValid: false, errors };
    }
  }

  // 11. Generate normalized URL hash for duplicate detection
  const normalizedUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search}`;
  const urlHash = crypto.createHash('sha256').update(normalizedUrl.toLowerCase()).digest('hex');

  return {
    isValid: true,
    errors: [],
    normalizedUrl,
    urlHash,
  };
}

/**
 * Check URL against Google Safe Browsing API
 * Returns true if the URL is safe, false if flagged
 */
export async function checkGoogleSafeBrowsing(url: string): Promise<{ isSafe: boolean; threats: string[] }> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  // If no API key configured, skip check (log warning in development)
  if (!apiKey) {
    console.warn('[AffiliateValidator] GOOGLE_SAFE_BROWSING_API_KEY not set. Skipping Safe Browsing check.');
    return { isSafe: true, threats: [] };
  }

  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            clientId: 'riviewit',
            clientVersion: '1.0.0',
          },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('[AffiliateValidator] Safe Browsing API error:', response.status);
      return { isSafe: true, threats: [] }; // Fail open to avoid blocking legitimate submissions
    }

    const data = await response.json();

    if (data.matches && data.matches.length > 0) {
      const threats = data.matches.map((m: any) => m.threatType as string);
      return { isSafe: false, threats };
    }

    return { isSafe: true, threats: [] };
  } catch (error) {
    console.error('[AffiliateValidator] Safe Browsing API exception:', error);
    return { isSafe: true, threats: [] }; // Fail open
  }
}

/**
 * Check for duplicate affiliate links in the database
 */
export async function checkDuplicateLink(
  prisma: any,
  urlHash: string,
  excludeReviewId?: number
): Promise<{ isDuplicate: boolean; existingReviewId?: number }> {
  // We'll compare by normalizing and hashing in the application layer
  // For now, check if the exact affiliate link already exists in an approved review
  // This is called from the API route with the prisma instance
  try {
    const existing = await prisma.review.findFirst({
      where: {
        affiliateEnabled: true,
        affiliateStatus: { in: ['APPROVED', 'AUTO_APPROVED', 'PENDING_VERIFICATION'] },
        ...(excludeReviewId ? { id: { not: excludeReviewId } } : {}),
      },
      select: { id: true, affiliateLink: true },
    });

    // We can't easily hash-compare in SQL, so we do it in memory
    // For scalability, add a affiliateLinkHash column later
    if (existing && existing.affiliateLink) {
      const existingNormalized = normalizeUrlForHash(existing.affiliateLink);
      const existingHash = crypto.createHash('sha256').update(existingNormalized).digest('hex');
      if (existingHash === urlHash) {
        return { isDuplicate: true, existingReviewId: existing.id };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('[AffiliateValidator] Duplicate check error:', error);
    return { isDuplicate: false }; // Fail open
  }
}

/**
 * Rate limit check: max affiliate submissions per user per day
 */
export async function checkAffiliateRateLimit(
  prisma: any,
  userId: number,
  maxPerDay: number = 5
): Promise<{ isAllowed: boolean; count: number; limit: number }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const count = await prisma.review.count({
      where: {
        authorId: userId,
        affiliateEnabled: true,
        affiliateSubmittedAt: { gte: oneDayAgo },
      },
    });

    return {
      isAllowed: count < maxPerDay,
      count,
      limit: maxPerDay,
    };
  } catch (error) {
    console.error('[AffiliateValidator] Rate limit check error:', error);
    return { isAllowed: true, count: 0, limit: maxPerDay }; // Fail open
  }
}

function normalizeUrlForHash(url: string): string {
  try {
    const parsed = new URL(url.trim());
    return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}${parsed.search}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
