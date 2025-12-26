-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 100,
    "rules" JSONB,
    "owner" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIVisibilityMetric" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID,
    "visibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sentimentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shareOfVoice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "citationAuthority" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIVisibilityMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIPlatformData" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aIVisibilityMetricId" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "rank" INTEGER,
    "sentiment" TEXT NOT NULL,
    "mentioned" BOOLEAN NOT NULL DEFAULT false,
    "sourcesCount" INTEGER NOT NULL DEFAULT 0,
    "responseSnippet" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIPlatformData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT,
    "avgRank" DOUBLE PRECISION,
    "visibilityScore" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "rating" DOUBLE PRECISION,
    "gbpCompleteness" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorKeywordRank" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "competitorId" UUID NOT NULL,
    "keywordId" UUID NOT NULL,
    "rankPosition" INTEGER,
    "rankingUrl" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorKeywordRank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_name_key" ON "FeatureFlag"("name");

-- CreateIndex
CREATE INDEX "FeatureFlag_name_idx" ON "FeatureFlag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_key_idx" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "AIVisibilityMetric_businessId_idx" ON "AIVisibilityMetric"("businessId");

-- CreateIndex
CREATE INDEX "AIVisibilityMetric_locationId_idx" ON "AIVisibilityMetric"("locationId");

-- CreateIndex
CREATE INDEX "AIVisibilityMetric_periodStart_periodEnd_idx" ON "AIVisibilityMetric"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "AIPlatformData_aIVisibilityMetricId_idx" ON "AIPlatformData"("aIVisibilityMetricId");

-- CreateIndex
CREATE INDEX "AIPlatformData_platform_idx" ON "AIPlatformData"("platform");

-- CreateIndex
CREATE INDEX "Competitor_businessId_idx" ON "Competitor"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Competitor_businessId_domain_key" ON "Competitor"("businessId", "domain");

-- CreateIndex
CREATE INDEX "CompetitorKeywordRank_competitorId_idx" ON "CompetitorKeywordRank"("competitorId");

-- CreateIndex
CREATE INDEX "CompetitorKeywordRank_keywordId_idx" ON "CompetitorKeywordRank"("keywordId");

-- CreateIndex
CREATE INDEX "CompetitorKeywordRank_capturedAt_idx" ON "CompetitorKeywordRank"("capturedAt");

-- AddForeignKey
ALTER TABLE "AIVisibilityMetric" ADD CONSTRAINT "AIVisibilityMetric_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIVisibilityMetric" ADD CONSTRAINT "AIVisibilityMetric_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPlatformData" ADD CONSTRAINT "AIPlatformData_aIVisibilityMetricId_fkey" FOREIGN KEY ("aIVisibilityMetricId") REFERENCES "AIVisibilityMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorKeywordRank" ADD CONSTRAINT "CompetitorKeywordRank_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorKeywordRank" ADD CONSTRAINT "CompetitorKeywordRank_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
