-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "affiliateClickCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "affiliateEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "affiliateLink" TEXT,
ADD COLUMN     "affiliateLinkHealth" VARCHAR(20),
ADD COLUMN     "affiliateNeedsChangesReason" TEXT,
ADD COLUMN     "affiliatePlatform" VARCHAR(50),
ADD COLUMN     "affiliateRejectionReason" TEXT,
ADD COLUMN     "affiliateStatus" VARCHAR(30),
ADD COLUMN     "affiliateSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "affiliateVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "affiliateVerifiedBy" INTEGER,
ADD COLUMN     "aiSpamReasons" TEXT[],
ADD COLUMN     "aiSpamScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "tags" TEXT[],
    "author" VARCHAR(100) NOT NULL,
    "authorImage" TEXT,
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateAuditLog" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "adminId" INTEGER,
    "action" VARCHAR(30) NOT NULL,
    "reason" TEXT,
    "aiSpamScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustedReviewer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "approvedCount" INTEGER NOT NULL DEFAULT 0,
    "rejectedCount" INTEGER NOT NULL DEFAULT 0,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "trustedSince" TIMESTAMP(3),
    "lastAuditAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustedReviewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");

-- CreateIndex
CREATE INDEX "BlogPost_isPublished_idx" ON "BlogPost"("isPublished");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

-- CreateIndex
CREATE INDEX "AffiliateAuditLog_reviewId_idx" ON "AffiliateAuditLog"("reviewId");

-- CreateIndex
CREATE INDEX "AffiliateAuditLog_adminId_idx" ON "AffiliateAuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AffiliateAuditLog_action_idx" ON "AffiliateAuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedReviewer_userId_key" ON "TrustedReviewer"("userId");

-- CreateIndex
CREATE INDEX "TrustedReviewer_userId_idx" ON "TrustedReviewer"("userId");

-- CreateIndex
CREATE INDEX "TrustedReviewer_isTrusted_idx" ON "TrustedReviewer"("isTrusted");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_affiliateEnabled_affiliateStatus_idx" ON "Review"("affiliateEnabled", "affiliateStatus");

-- CreateIndex
CREATE INDEX "Review_affiliateStatus_idx" ON "Review"("affiliateStatus");

-- AddForeignKey
ALTER TABLE "AffiliateAuditLog" ADD CONSTRAINT "AffiliateAuditLog_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
