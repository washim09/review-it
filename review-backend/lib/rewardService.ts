/**
 * Review rewards and manual withdrawals.
 *
 * A published review can earn ₹1 only after server-side checks. The available
 * balance is the sum of REVIEW_CREDIT rows whose review is still APPROVED,
 * minus WITHDRAWAL_DEBIT rows, plus WITHDRAWAL_REVERSAL rows. Ledger rows are
 * insert-only. A REVIEW_REVERSAL is an audit marker; the credit counts again
 * only if an admin later sets that same review back to APPROVED.
 */

import crypto from 'crypto';
import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import EmailService from './emailService';

const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

export const REWARD_AMOUNT = 1;
export const MIN_WITHDRAWAL = 100;
export const MAX_WITHDRAWAL = 1000;
export const MAX_MONTHLY_WITHDRAWAL = 2000;
export const MIN_REWARD_WORDS = 80;
export const MIN_AFFILIATE_REWARD_WORDS = 150;
export const MAX_REVIEWS_PER_DAY = 5;
export const MAX_REWARD_REVIEWS_PER_DAY = 3;
export const MAX_REVIEWS_PER_IP_PER_DAY = 10;
const NEW_ACCOUNT_MS = 48 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * DAY_MS;

const PUBLIC_AFFILIATE = ['APPROVED', 'AUTO_APPROVED'];
const OPEN_WITHDRAWAL = ['PENDING', 'APPROVED'];
const LOCKED_WITHDRAWAL = ['PENDING', 'APPROVED', 'PAID'];

type Db = PrismaClient | Prisma.TransactionClient;

export class RewardError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getRequestUserId(req: NextApiRequest): number | null {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: number | string; userId?: number | string; role?: string };
    if (decoded.role === 'admin') return null;
    const raw = decoded.userId ?? decoded.id;
    const userId = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    return Number.isNaN(userId) ? null : userId;
  } catch {
    return null;
  }
}

export function getRequestAdminId(req: NextApiRequest): number | null {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: number | string; adminId?: number | string; role?: string };
    if (decoded.role !== 'admin' && !decoded.adminId) return null;
    const raw = decoded.adminId ?? decoded.id;
    const adminId = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    return Number.isNaN(adminId) ? null : adminId;
  } catch {
    return null;
  }
}

export function getClientIp(req: NextApiRequest): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = raw?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
  return ip || null;
}

function hashValue(value: string): string {
  const salt = process.env.REWARD_IP_SALT || JWT_SECRET;
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

export function hashContent(title: string, content: string, review: string): string {
  const normalized = `${title}\n${content}\n${review}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function countWords(title: string, content: string, review: string): number {
  return `${title} ${content} ${review}`.split(/\s+/).filter((word) => word.length > 0).length;
}

function isPublicReview(review: { affiliateEnabled: boolean; affiliateStatus: string | null }): boolean {
  return !review.affiliateEnabled || PUBLIC_AFFILIATE.includes(review.affiliateStatus || '');
}

function isUniqueConflict(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002';
}

async function openFlag(userId: number, reviewId: number | null, reason: string, details: string): Promise<boolean> {
  const existing = await prisma.rewardFlag.findFirst({
    where: { userId, reviewId, reason, status: 'OPEN' },
  });
  if (existing) return false;

  await prisma.rewardFlag.create({
    data: { userId, reviewId, reason, details, status: 'OPEN' },
  });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  if (user) {
    EmailService.sendRewardFlagAdminEmail(user.name, user.email, reason, details).catch((error) => {
      console.error('[Rewards] Flag email failed:', error);
    });
  }
  return true;
}

async function writeReversal(db: Db, reviewId: number, userId: number, note: string) {
  const credit = await db.rewardLedger.findFirst({
    where: { reviewId, entryType: 'REVIEW_CREDIT' },
  });
  if (!credit) return;
  const reversal = await db.rewardLedger.findFirst({
    where: { reviewId, entryType: 'REVIEW_REVERSAL' },
  });
  if (reversal) return;
  await db.rewardLedger.create({
    data: {
      userId,
      reviewId,
      entryType: 'REVIEW_REVERSAL',
      amount: credit.amount,
      note,
    },
  });
}

async function earnedAmount(db: Db, userId: number): Promise<{ amount: number; count: number }> {
  const approved = await db.review.findMany({
    where: { authorId: userId, rewardStatus: 'APPROVED' },
    select: { id: true },
  });
  if (approved.length === 0) return { amount: 0, count: 0 };
  const ids = approved.map((review) => review.id);
  const credits = await db.rewardLedger.aggregate({
    where: { userId, entryType: 'REVIEW_CREDIT', reviewId: { in: ids } },
    _sum: { amount: true },
    _count: true,
  });
  return { amount: credits._sum.amount || 0, count: credits._count };
}

async function netWithdrawn(db: Db, userId: number): Promise<number> {
  const [debits, reversals] = await Promise.all([
    db.rewardLedger.aggregate({
      where: { userId, entryType: 'WITHDRAWAL_DEBIT' },
      _sum: { amount: true },
    }),
    db.rewardLedger.aggregate({
      where: { userId, entryType: 'WITHDRAWAL_REVERSAL' },
      _sum: { amount: true },
    }),
  ]);
  return (debits._sum.amount || 0) - (reversals._sum.amount || 0);
}

async function monthlyWithdrawalTotal(db: Db, userId: number): Promise<number> {
  const since = new Date(Date.now() - MONTH_MS);
  const rows = await db.withdrawalRequest.aggregate({
    where: {
      userId,
      status: { in: ['PENDING', 'APPROVED', 'PAID'] },
      createdAt: { gte: since },
    },
    _sum: { amount: true },
  });
  return rows._sum.amount || 0;
}

async function availableBalance(db: Db, userId: number): Promise<number> {
  const earned = await earnedAmount(db, userId);
  const withdrawn = await netWithdrawn(db, userId);
  return earned.amount - withdrawn;
}

function withdrawalAmount(available: number, usedThisMonth: number): number {
  return Math.min(available, MAX_WITHDRAWAL, MAX_MONTHLY_WITHDRAWAL - usedThisMonth);
}

export async function assertCanSubmitReview(userId: number, ip: string | null): Promise<{ ok: true; ipHash: string | null } | { ok: false; message: string }> {
  const since = new Date(Date.now() - DAY_MS);
  const userCount = await prisma.review.count({
    where: { authorId: userId, createdAt: { gte: since } },
  });
  if (userCount >= MAX_REVIEWS_PER_DAY) {
    return { ok: false, message: `You can publish up to ${MAX_REVIEWS_PER_DAY} reviews every 24 hours.` };
  }

  if (!ip) return { ok: true, ipHash: null };
  const ipHash = hashValue(ip);
  const ipCount = await prisma.review.count({
    where: { submissionIpHash: ipHash, createdAt: { gte: since } },
  });
  if (ipCount >= MAX_REVIEWS_PER_IP_PER_DAY) {
    return { ok: false, message: 'Too many reviews were submitted from this network. Please try again tomorrow.' };
  }
  return { ok: true, ipHash };
}

export async function applyRewardDecision(reviewId: number): Promise<void> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      author: { select: { id: true, name: true, isVerified: true, createdAt: true } },
    },
  });
  if (!review) return;
  if (review.rewardStatus === 'REJECTED') return;

  const contentHash = hashContent(review.title, review.content, review.review);
  const words = countWords(review.title, review.content, review.review);
  const isPublic = isPublicReview(review);

  if (isPublic && review.rewardStatus === 'APPROVED' && review.contentHash === contentHash) {
    return;
  }

  const setStatus = async (rewardStatus: string) => {
    await prisma.review.update({
      where: { id: review.id },
      data: { rewardStatus, contentHash },
    });
    if (rewardStatus !== 'APPROVED' && review.rewardStatus === 'APPROVED') {
      await writeReversal(prisma, review.id, review.authorId, `reviewId:${review.id} no longer approved (${rewardStatus})`);
    }
  };

  if (!isPublic) {
    const pendingAffiliate = review.affiliateEnabled && (
      !review.affiliateStatus ||
      review.affiliateStatus === 'PENDING_VERIFICATION' ||
      review.affiliateStatus === 'NEEDS_CHANGES'
    );
    await setStatus(pendingAffiliate ? 'PENDING' : 'INELIGIBLE');
    return;
  }

  if (!review.author.isVerified) {
    await setStatus('PENDING');
    return;
  }

  const minWords = review.affiliateEnabled ? MIN_AFFILIATE_REWARD_WORDS : MIN_REWARD_WORDS;
  if (words < minWords) {
    await setStatus('INELIGIBLE');
    return;
  }

  const ownDuplicate = await prisma.review.findFirst({
    where: {
      authorId: review.authorId,
      contentHash,
      id: { not: review.id },
    },
    select: { id: true },
  });
  if (ownDuplicate) {
    await setStatus('INELIGIBLE');
    return;
  }

  const reasons: string[] = [];
  const otherDuplicate = await prisma.review.findFirst({
    where: { contentHash, authorId: { not: review.authorId } },
    select: { id: true },
  });
  if (otherDuplicate) reasons.push('DUPLICATE_CONTENT');

  const since = new Date(Date.now() - DAY_MS);
  const recentRewardReviews = await prisma.review.count({
    where: {
      authorId: review.authorId,
      id: { not: review.id },
      createdAt: { gte: since },
      rewardStatus: { in: ['APPROVED', 'FLAGGED', 'PENDING'] },
    },
  });
  if (recentRewardReviews >= MAX_REWARD_REVIEWS_PER_DAY) reasons.push('REWARD_VELOCITY');

  if (Date.now() - review.author.createdAt.getTime() < NEW_ACCOUNT_MS) reasons.push('NEW_ACCOUNT');

  if (reasons.length > 0) {
    await setStatus('FLAGGED');
    for (const reason of reasons) {
      const created = await openFlag(review.authorId, review.id, reason, `Review ${review.id} needs a manual reward decision.`);
      if (created && reason === reasons[0]) {
        await prisma.notification.create({
          data: {
            userId: review.authorId,
            type: 'REWARD_FLAGGED',
            title: 'Reward pending review',
            message: `Your review "${review.title}" is published. The ₹${REWARD_AMOUNT} reward is on hold until an admin reviews it.`,
            metadata: JSON.stringify({ reviewId: review.id }),
          },
        });
      }
    }
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.update({
      where: { id: review.id },
      data: { rewardStatus: 'APPROVED', contentHash },
    });
    const credit = await tx.rewardLedger.findFirst({
      where: { reviewId: review.id, entryType: 'REVIEW_CREDIT' },
    });
    if (!credit) {
      await tx.rewardLedger.create({
        data: {
          userId: review.authorId,
          reviewId: review.id,
          entryType: 'REVIEW_CREDIT',
          amount: REWARD_AMOUNT,
          note: `reviewId:${review.id} system-approved`,
        },
      });
    }
  });

  if (review.rewardStatus !== 'APPROVED') {
    await prisma.notification.create({
      data: {
        userId: review.authorId,
        type: 'REWARD_CREDITED',
        title: 'Reward credited',
        message: `You earned ₹${REWARD_AMOUNT} for "${review.title}". It is added to your available balance.`,
        metadata: JSON.stringify({ reviewId: review.id }),
      },
    });
  }
}

export async function reevaluatePendingRewards(userId: number): Promise<void> {
  const pending = await prisma.review.findMany({
    where: { authorId: userId, rewardStatus: 'PENDING' },
    select: { id: true },
    take: 30,
    orderBy: { createdAt: 'desc' },
  });
  for (const review of pending) {
    await applyRewardDecision(review.id);
  }
}

async function findSharedNetwork(userId: number): Promise<boolean> {
  const hashes = await prisma.review.findMany({
    where: { authorId: userId, submissionIpHash: { not: null } },
    select: { submissionIpHash: true },
    distinct: ['submissionIpHash'],
  });
  const ipHashes = hashes.map((row) => row.submissionIpHash).filter((value): value is string => !!value);
  if (ipHashes.length === 0) return false;
  const other = await prisma.review.findFirst({
    where: { submissionIpHash: { in: ipHashes }, authorId: { not: userId } },
    select: { id: true },
  });
  return !!other;
}

export async function getRewardSummary(userId: number) {
  await reevaluatePendingRewards(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { upiId: true, isVerified: true },
  });
  const [earned, withdrawn, usedThisMonth, openFlag, withdrawals, openWithdrawal] = await Promise.all([
    earnedAmount(prisma, userId),
    netWithdrawn(prisma, userId),
    monthlyWithdrawalTotal(prisma, userId),
    prisma.rewardFlag.findFirst({ where: { userId, status: 'OPEN' }, select: { id: true, reason: true } }),
    prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        amount: true,
        upiId: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        reviewedAt: true,
        paidAt: true,
      },
    }),
    prisma.withdrawalRequest.findFirst({
      where: { userId, status: { in: OPEN_WITHDRAWAL } },
      select: { id: true, amount: true, status: true, createdAt: true },
    }),
  ]);

  const available = earned.amount - withdrawn;
  const nextAmount = withdrawalAmount(available, usedThisMonth);
  let withdrawBlockReason: string | null = null;
  if (!user?.isVerified) withdrawBlockReason = 'Verify your email before withdrawing.';
  else if (!user.upiId) withdrawBlockReason = 'Add your UPI ID to request a withdrawal.';
  else if (openFlag) withdrawBlockReason = 'Your account is under review. Withdrawals are paused.';
  else if (openWithdrawal) withdrawBlockReason = 'You already have a withdrawal request in progress.';
  else if (available < MIN_WITHDRAWAL) withdrawBlockReason = `Withdrawals open at ₹${MIN_WITHDRAWAL}.`;
  else if (nextAmount < MIN_WITHDRAWAL) withdrawBlockReason = `The 30-day withdrawal limit is ₹${MAX_MONTHLY_WITHDRAWAL}.`;

  return {
    approvedReviewCount: earned.count,
    totalEarnings: earned.amount,
    availableBalance: available,
    minimumWithdrawal: MIN_WITHDRAWAL,
    maximumWithdrawal: MAX_WITHDRAWAL,
    monthlyLimit: MAX_MONTHLY_WITHDRAWAL,
    upiId: user?.upiId || null,
    hasOpenFlag: !!openFlag,
    openWithdrawal,
    nextWithdrawalAmount: nextAmount >= MIN_WITHDRAWAL && !withdrawBlockReason ? nextAmount : 0,
    canWithdraw: !withdrawBlockReason,
    withdrawBlockReason,
    withdrawals,
  };
}

const UPI_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,255}@[a-zA-Z][a-zA-Z]{1,63}$/;

export async function saveUpi(userId: number, rawUpi: string) {
  const upiId = rawUpi.trim().toLowerCase();
  if (!UPI_PATTERN.test(upiId)) {
    throw new RewardError(400, 'Enter a valid UPI ID, such as name@bank.');
  }

  const openWithdrawal = await prisma.withdrawalRequest.findFirst({
    where: { userId, status: { in: OPEN_WITHDRAWAL } },
    select: { id: true },
  });
  if (openWithdrawal) {
    throw new RewardError(409, 'You cannot change your UPI ID while a withdrawal request is open.');
  }

  const taken = await prisma.user.findFirst({
    where: { upiId, id: { not: userId } },
    select: { id: true },
  });
  if (taken) {
    throw new RewardError(409, 'This UPI ID is already registered to another account.');
  }

  await prisma.user.update({ where: { id: userId }, data: { upiId } });
  return { upiId };
}

export async function requestWithdrawal(userId: number, clientAmount: number | null) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new RewardError(404, 'User not found');
  if (!user.isVerified) throw new RewardError(403, 'Verify your email before withdrawing.');
  if (!user.upiId) throw new RewardError(400, 'Add your UPI ID before withdrawing.');

  const existingFlag = await prisma.rewardFlag.findFirst({ where: { userId, status: 'OPEN' } });
  if (existingFlag) {
    throw new RewardError(403, 'Your account is under review. Withdrawals are paused until an admin clears it.');
  }

  if (await findSharedNetwork(userId)) {
    await openFlag(
      userId,
      null,
      'SHARED_NETWORK',
      'This account submitted reviews from a network also used by another account.'
    );
    throw new RewardError(403, 'This account needs a manual review before a withdrawal can be requested.');
  }

  const upiTaken = await prisma.user.findFirst({
    where: { upiId: user.upiId, id: { not: userId } },
    select: { id: true },
  });
  if (upiTaken) throw new RewardError(409, 'This UPI ID is already registered to another account.');

  try {
    const withdrawal = await prisma.$transaction(async (tx) => {
      const available = await availableBalance(tx, userId);
      const usedThisMonth = await monthlyWithdrawalTotal(tx, userId);
      const amount = withdrawalAmount(available, usedThisMonth);

      if (available < MIN_WITHDRAWAL) {
        throw new RewardError(400, `You can withdraw once your available balance reaches ₹${MIN_WITHDRAWAL}.`);
      }
      if (amount < MIN_WITHDRAWAL) {
        throw new RewardError(400, `The 30-day withdrawal limit is ₹${MAX_MONTHLY_WITHDRAWAL}.`);
      }
      if (clientAmount != null && clientAmount !== amount) {
        throw new RewardError(409, `The withdrawal amount is ₹${amount}. Refresh the page and try again.`);
      }

      const created = await tx.withdrawalRequest.create({
        data: {
          userId,
          amount,
          upiId: user.upiId!,
          status: 'PENDING',
          openKey: `user-${userId}`,
        },
      });
      await tx.rewardLedger.create({
        data: {
          userId,
          withdrawalId: created.id,
          entryType: 'WITHDRAWAL_DEBIT',
          amount,
          note: `Withdrawal ${created.id} requested`,
        },
      });
      await tx.notification.create({
        data: {
          userId,
          type: 'WITHDRAWAL_RECEIVED',
          title: 'Withdrawal request received',
          message: `We received your withdrawal request for ₹${amount}. If it is approved, payment is expected within 24 hours to ${user.upiId}.`,
          metadata: JSON.stringify({ withdrawalId: created.id }),
        },
      });
      return created;
    });

    EmailService.sendWithdrawalUserEmail(
      user.email,
      user.name,
      withdrawal.amount,
      'received',
      user.upiId
    ).catch((error) => console.error('[Rewards] User withdrawal email failed:', error));
    EmailService.sendWithdrawalAdminEmail(user.name, user.email, withdrawal.amount, user.upiId, withdrawal.id)
      .catch((error) => console.error('[Rewards] Admin withdrawal email failed:', error));

    return withdrawal;
  } catch (error) {
    if (isUniqueConflict(error)) {
      throw new RewardError(409, 'You already have a withdrawal request in progress.');
    }
    throw error;
  }
}

export async function adminDecideReward(reviewId: number, adminId: number, action: 'APPROVE' | 'REJECT', reason?: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { author: { select: { id: true, isVerified: true, name: true } } },
  });
  if (!review) throw new RewardError(404, 'Review not found');

  if (action === 'APPROVE') {
    if (!isPublicReview(review)) {
      throw new RewardError(400, 'This review is not published, so it cannot earn a reward.');
    }
    if (!review.author.isVerified) {
      throw new RewardError(400, 'The author must verify their email before this reward can be approved.');
    }
    const contentHash = hashContent(review.title, review.content, review.review);
    await prisma.$transaction(async (tx) => {
      await tx.review.update({
        where: { id: review.id },
        data: { rewardStatus: 'APPROVED', contentHash },
      });
      const credit = await tx.rewardLedger.findFirst({
        where: { reviewId: review.id, entryType: 'REVIEW_CREDIT' },
      });
      if (!credit) {
        await tx.rewardLedger.create({
          data: {
            userId: review.authorId,
            reviewId: review.id,
            entryType: 'REVIEW_CREDIT',
            amount: REWARD_AMOUNT,
            note: `reviewId:${review.id} approved by admin ${adminId}`,
          },
        });
      }
      await tx.rewardFlag.updateMany({
        where: { reviewId: review.id, status: 'OPEN' },
        data: { status: 'CLEARED', clearedAt: new Date(), clearedBy: adminId },
      });
      await tx.notification.create({
        data: {
          userId: review.authorId,
          type: 'REWARD_APPROVED',
          title: 'Reward approved',
          message: `An admin approved ₹${REWARD_AMOUNT} for "${review.title}".`,
          metadata: JSON.stringify({ reviewId: review.id }),
        },
      });
    });
    return;
  }

  if (!reason?.trim()) throw new RewardError(400, 'A reason is required to reject a reward.');
  await prisma.$transaction(async (tx) => {
    await tx.review.update({
      where: { id: review.id },
      data: { rewardStatus: 'REJECTED' },
    });
    await writeReversal(tx, review.id, review.authorId, `reviewId:${review.id} rejected by admin ${adminId}: ${reason.trim()}`);
    await tx.rewardFlag.updateMany({
      where: { reviewId: review.id, status: 'OPEN' },
      data: { status: 'CLEARED', clearedAt: new Date(), clearedBy: adminId },
    });
    await tx.notification.create({
      data: {
        userId: review.authorId,
        type: 'REWARD_REJECTED',
        title: 'Reward not approved',
        message: `The reward for "${review.title}" was not approved. Reason: ${reason.trim()}`,
        metadata: JSON.stringify({ reviewId: review.id }),
      },
    });
  });
}

export async function clearUserFlags(userId: number, adminId: number) {
  await prisma.rewardFlag.updateMany({
    where: { userId, status: 'OPEN' },
    data: { status: 'CLEARED', clearedAt: new Date(), clearedBy: adminId },
  });
}

export async function adminDecideWithdrawal(
  withdrawalId: number,
  adminId: number,
  action: 'APPROVE' | 'REJECT' | 'PAY',
  reason?: string
) {
  const existing = await prisma.withdrawalRequest.findUnique({
    where: { id: withdrawalId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!existing) throw new RewardError(404, 'Withdrawal request not found');

  if (action === 'APPROVE') {
    if (existing.status !== 'PENDING') throw new RewardError(409, 'Only a pending request can be approved.');
    const approved = await prisma.withdrawalRequest.updateMany({
      where: { id: withdrawalId, status: 'PENDING' },
      data: { status: 'APPROVED', reviewedBy: adminId, reviewedAt: new Date(), openKey: `user-${existing.userId}` },
    });
    if (approved.count !== 1) throw new RewardError(409, 'Only a pending request can be approved.');
    await prisma.notification.create({
      data: {
        userId: existing.userId,
        type: 'WITHDRAWAL_APPROVED',
        title: 'Withdrawal approved',
        message: `Your withdrawal of ₹${existing.amount} was approved. Payment to ${existing.upiId} is expected within 24 hours.`,
        metadata: JSON.stringify({ withdrawalId }),
      },
    });
    EmailService.sendWithdrawalUserEmail(existing.user.email, existing.user.name, existing.amount, 'approved', existing.upiId)
      .catch((error) => console.error('[Rewards] Approval email failed:', error));
    return;
  }

  if (action === 'PAY') {
    const paid = await prisma.withdrawalRequest.updateMany({
      where: { id: withdrawalId, status: 'APPROVED' },
      data: { status: 'PAID', paidAt: new Date(), reviewedBy: adminId, openKey: null },
    });
    if (paid.count !== 1) throw new RewardError(409, 'Only an approved request can be marked paid, and it can be paid once.');
    await prisma.notification.create({
      data: {
        userId: existing.userId,
        type: 'WITHDRAWAL_PAID',
        title: 'Withdrawal paid',
        message: `₹${existing.amount} was sent to ${existing.upiId}.`,
        metadata: JSON.stringify({ withdrawalId }),
      },
    });
    EmailService.sendWithdrawalUserEmail(existing.user.email, existing.user.name, existing.amount, 'paid', existing.upiId)
      .catch((error) => console.error('[Rewards] Paid email failed:', error));
    return;
  }

  if (!reason?.trim()) throw new RewardError(400, 'A reason is required to reject a withdrawal.');
  if (!OPEN_WITHDRAWAL.includes(existing.status)) {
    throw new RewardError(409, 'This withdrawal can no longer be rejected.');
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.withdrawalRequest.updateMany({
      where: { id: withdrawalId, status: { in: OPEN_WITHDRAWAL } },
      data: {
        status: 'REJECTED',
        rejectionReason: reason.trim(),
        reviewedBy: adminId,
        reviewedAt: new Date(),
        openKey: null,
      },
    });
    if (updated.count !== 1) throw new RewardError(409, 'This withdrawal was already updated.');
    await tx.rewardLedger.create({
      data: {
        userId: existing.userId,
        withdrawalId,
        entryType: 'WITHDRAWAL_REVERSAL',
        amount: existing.amount,
        note: `Withdrawal ${withdrawalId} rejected by admin ${adminId}`,
      },
    });
    await tx.notification.create({
      data: {
        userId: existing.userId,
        type: 'WITHDRAWAL_REJECTED',
        title: 'Withdrawal rejected',
        message: `Your withdrawal of ₹${existing.amount} was rejected and the amount was returned to your balance. Reason: ${reason.trim()}`,
        metadata: JSON.stringify({ withdrawalId }),
      },
    });
  });
  EmailService.sendWithdrawalUserEmail(existing.user.email, existing.user.name, existing.amount, 'rejected', existing.upiId, reason.trim())
    .catch((error) => console.error('[Rewards] Rejection email failed:', error));
}

export async function getAuthorDeleteBlock(reviewId: number, authorId: number): Promise<string | null> {
  const credit = await prisma.rewardLedger.findFirst({
    where: { reviewId, entryType: 'REVIEW_CREDIT' },
    select: { id: true },
  });
  if (!credit) return null;
  const withdrawal = await prisma.withdrawalRequest.findFirst({
    where: { userId: authorId, status: { in: LOCKED_WITHDRAWAL } },
    select: { id: true },
  });
  if (!withdrawal) return null;
  return 'This review earned a reward that is part of a withdrawal already requested or paid, so it cannot be deleted.';
}

export async function settleRewardOnDelete(reviewId: number, byAdmin: boolean): Promise<void> {
  const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { id: true, authorId: true } });
  if (!review) return;
  await writeReversal(prisma, review.id, review.authorId, `reviewId:${review.id} deleted`);
  if (!byAdmin) return;
  const withdrawal = await prisma.withdrawalRequest.findFirst({
    where: { userId: review.authorId, status: { in: LOCKED_WITHDRAWAL } },
    select: { id: true },
  });
  const credit = await prisma.rewardLedger.findFirst({
    where: { reviewId, entryType: 'REVIEW_CREDIT' },
    select: { id: true },
  });
  if (credit && withdrawal) {
    await openFlag(
      review.authorId,
      review.id,
      'REVIEW_REMOVED_AFTER_WITHDRAWAL',
      `Rewarded review ${review.id} was deleted after withdrawal ${withdrawal.id}.`
    );
  }
}
