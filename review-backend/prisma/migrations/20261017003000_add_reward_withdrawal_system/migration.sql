-- AlterTable
ALTER TABLE "User" ADD COLUMN "upiId" VARCHAR(256);

-- AlterTable
ALTER TABLE "Review" ADD COLUMN "rewardStatus" VARCHAR(20),
ADD COLUMN "contentHash" VARCHAR(64),
ADD COLUMN "submissionIpHash" VARCHAR(64);

-- CreateTable
CREATE TABLE "RewardLedger" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "reviewId" INTEGER,
    "withdrawalId" INTEGER,
    "entryType" VARCHAR(30) NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "upiId" VARCHAR(256) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "openKey" VARCHAR(40),
    "rejectionReason" TEXT,
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardFlag" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "reviewId" INTEGER,
    "reason" VARCHAR(80) NOT NULL,
    "details" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clearedAt" TIMESTAMP(3),
    "clearedBy" INTEGER,

    CONSTRAINT "RewardFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_upiId_key" ON "User"("upiId");

-- CreateIndex
CREATE INDEX "Review_authorId_contentHash_idx" ON "Review"("authorId", "contentHash");

-- CreateIndex
CREATE INDEX "Review_rewardStatus_idx" ON "Review"("rewardStatus");

-- CreateIndex
CREATE INDEX "Review_submissionIpHash_idx" ON "Review"("submissionIpHash");

-- CreateIndex
CREATE UNIQUE INDEX "RewardLedger_reviewId_entryType_key" ON "RewardLedger"("reviewId", "entryType");

-- CreateIndex
CREATE INDEX "RewardLedger_userId_entryType_idx" ON "RewardLedger"("userId", "entryType");

-- CreateIndex
CREATE INDEX "RewardLedger_withdrawalId_idx" ON "RewardLedger"("withdrawalId");

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalRequest_openKey_key" ON "WithdrawalRequest"("openKey");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_userId_status_idx" ON "WithdrawalRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_status_createdAt_idx" ON "WithdrawalRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RewardFlag_userId_status_idx" ON "RewardFlag"("userId", "status");

-- CreateIndex
CREATE INDEX "RewardFlag_reviewId_idx" ON "RewardFlag"("reviewId");

-- AddForeignKey
ALTER TABLE "RewardLedger" ADD CONSTRAINT "RewardLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardLedger" ADD CONSTRAINT "RewardLedger_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardLedger" ADD CONSTRAINT "RewardLedger_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "WithdrawalRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardFlag" ADD CONSTRAINT "RewardFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
