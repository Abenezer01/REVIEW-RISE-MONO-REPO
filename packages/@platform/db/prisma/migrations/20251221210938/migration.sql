/*
  Warnings:

  - The primary key for the `Subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSyncLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "reviewsSynced" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER,
    "requestData" JSONB,
    "responseData" JSONB,
    "jobId" UUID,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoSnapshot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "seoElements" JSONB NOT NULL,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID,
    "keyword" TEXT NOT NULL,
    "searchVolume" INTEGER,
    "difficulty" DOUBLE PRECISION,
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordRank" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "keywordId" UUID NOT NULL,
    "rankPosition" INTEGER,
    "mapPackPosition" INTEGER,
    "hasFeaturedSnippet" BOOLEAN NOT NULL DEFAULT false,
    "hasPeopleAlsoAsk" BOOLEAN NOT NULL DEFAULT false,
    "hasLocalPack" BOOLEAN NOT NULL DEFAULT false,
    "hasKnowledgePanel" BOOLEAN NOT NULL DEFAULT false,
    "hasImagePack" BOOLEAN NOT NULL DEFAULT false,
    "hasVideoCarousel" BOOLEAN NOT NULL DEFAULT false,
    "rankingUrl" TEXT,
    "searchLocation" TEXT,
    "device" TEXT NOT NULL DEFAULT 'desktop',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeywordRank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisibilityMetric" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "mapPackAppearances" INTEGER NOT NULL DEFAULT 0,
    "totalTrackedKeywords" INTEGER NOT NULL DEFAULT 0,
    "mapPackVisibility" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "top3Count" INTEGER NOT NULL DEFAULT 0,
    "top10Count" INTEGER NOT NULL DEFAULT 0,
    "top20Count" INTEGER NOT NULL DEFAULT 0,
    "shareOfVoice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "featuredSnippetCount" INTEGER NOT NULL DEFAULT 0,
    "localPackCount" INTEGER NOT NULL DEFAULT 0,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisibilityMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "businessId" UUID,
    "locationId" UUID,
    "payload" JSONB,
    "result" JSONB,
    "error" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "ReviewSyncLog_businessId_idx" ON "ReviewSyncLog"("businessId");

-- CreateIndex
CREATE INDEX "ReviewSyncLog_locationId_idx" ON "ReviewSyncLog"("locationId");

-- CreateIndex
CREATE INDEX "ReviewSyncLog_platform_idx" ON "ReviewSyncLog"("platform");

-- CreateIndex
CREATE INDEX "ReviewSyncLog_status_idx" ON "ReviewSyncLog"("status");

-- CreateIndex
CREATE INDEX "ReviewSyncLog_createdAt_idx" ON "ReviewSyncLog"("createdAt");

-- CreateIndex
CREATE INDEX "SeoSnapshot_userId_idx" ON "SeoSnapshot"("userId");

-- CreateIndex
CREATE INDEX "SeoSnapshot_url_idx" ON "SeoSnapshot"("url");

-- CreateIndex
CREATE INDEX "Keyword_businessId_idx" ON "Keyword"("businessId");

-- CreateIndex
CREATE INDEX "Keyword_locationId_idx" ON "Keyword"("locationId");

-- CreateIndex
CREATE INDEX "Keyword_status_idx" ON "Keyword"("status");

-- CreateIndex
CREATE INDEX "KeywordRank_keywordId_idx" ON "KeywordRank"("keywordId");

-- CreateIndex
CREATE INDEX "KeywordRank_capturedAt_idx" ON "KeywordRank"("capturedAt");

-- CreateIndex
CREATE INDEX "VisibilityMetric_businessId_idx" ON "VisibilityMetric"("businessId");

-- CreateIndex
CREATE INDEX "VisibilityMetric_locationId_idx" ON "VisibilityMetric"("locationId");

-- CreateIndex
CREATE INDEX "VisibilityMetric_periodStart_periodEnd_idx" ON "VisibilityMetric"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "VisibilityMetric_businessId_locationId_periodStart_periodEn_key" ON "VisibilityMetric"("businessId", "locationId", "periodStart", "periodEnd", "periodType");

-- CreateIndex
CREATE INDEX "Job_type_idx" ON "Job"("type");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_businessId_idx" ON "Job"("businessId");

-- CreateIndex
CREATE INDEX "Job_locationId_idx" ON "Job"("locationId");

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSyncLog" ADD CONSTRAINT "ReviewSyncLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSyncLog" ADD CONSTRAINT "ReviewSyncLog_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSyncLog" ADD CONSTRAINT "ReviewSyncLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoSnapshot" ADD CONSTRAINT "SeoSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordRank" ADD CONSTRAINT "KeywordRank_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisibilityMetric" ADD CONSTRAINT "VisibilityMetric_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisibilityMetric" ADD CONSTRAINT "VisibilityMetric_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
