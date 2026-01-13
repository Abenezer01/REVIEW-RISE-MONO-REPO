/*
  Warnings:

  - You are about to drop the `ExtractedDataVersion` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CompetitorType" AS ENUM ('DIRECT_LOCAL', 'CONTENT', 'AGGREGATOR', 'UNKNOWN');

-- DropForeignKey
ALTER TABLE "ExtractedDataVersion" DROP CONSTRAINT "ExtractedDataVersion_brandProfileId_fkey";

-- DropTable
DROP TABLE "ExtractedDataVersion";

-- CreateTable
CREATE TABLE "BrandAsset" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandProfileId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandColor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandProfileId" UUID NOT NULL,
    "hexCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandFont" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandProfileId" UUID NOT NULL,
    "family" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandFont_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandPage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandProfileId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandSocialLink" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandProfileId" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandSocialLink_pkey" PRIMARY KEY ("id")
);

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
    "name" TEXT NOT NULL,
    "website" TEXT,
    "domain" TEXT,
    "type" "CompetitorType" NOT NULL DEFAULT 'UNKNOWN',
    "source" TEXT,
    "relevanceScore" DOUBLE PRECISION,
    "ranking" INTEGER,
    "isUserAdded" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorSnapshot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "competitorId" UUID NOT NULL,
    "headline" TEXT,
    "uvp" TEXT,
    "serviceList" TEXT[],
    "pricingCues" TEXT[],
    "trustSignals" JSONB,
    "ctaStyles" TEXT[],
    "contentCategories" TEXT[],
    "differentiators" JSONB,
    "whatToLearn" TEXT[],
    "whatToAvoid" TEXT[],
    "techStack" JSONB,
    "trafficMetrics" JSONB,
    "metrics" JSONB,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisibilitySnapshot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "range" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "breakdown" JSONB NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisibilitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "generatedBy" UUID,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunitiesReport" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "positioningMap" JSONB NOT NULL,
    "gaps" JSONB NOT NULL,
    "strategies" JSONB NOT NULL,
    "suggestedTaglines" TEXT[],
    "contentIdeas" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "shareToken" TEXT,
    "pdfUrl" TEXT,

    CONSTRAINT "OpportunitiesReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandDNA" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "values" TEXT[],
    "voice" TEXT,
    "audience" TEXT,
    "mission" TEXT,

    CONSTRAINT "BrandDNA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentIdea" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID,
    "platform" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandRecommendation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "why" TEXT[],
    "steps" TEXT[],
    "impact" TEXT NOT NULL,
    "effort" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priorityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kpiTarget" JSONB,
    "status" TEXT NOT NULL DEFAULT 'open',
    "notes" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dismissedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BrandRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandScore" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "visibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consistencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "visibilityBreakdown" JSONB NOT NULL,
    "trustBreakdown" JSONB NOT NULL,
    "consistencyBreakdown" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandAsset_brandProfileId_idx" ON "BrandAsset"("brandProfileId");

-- CreateIndex
CREATE INDEX "BrandColor_brandProfileId_idx" ON "BrandColor"("brandProfileId");

-- CreateIndex
CREATE INDEX "BrandFont_brandProfileId_idx" ON "BrandFont"("brandProfileId");

-- CreateIndex
CREATE INDEX "BrandPage_brandProfileId_idx" ON "BrandPage"("brandProfileId");

-- CreateIndex
CREATE INDEX "BrandSocialLink_brandProfileId_idx" ON "BrandSocialLink"("brandProfileId");

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
CREATE INDEX "Competitor_type_idx" ON "Competitor"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Competitor_businessId_name_key" ON "Competitor"("businessId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Competitor_businessId_domain_key" ON "Competitor"("businessId", "domain");

-- CreateIndex
CREATE INDEX "CompetitorSnapshot_competitorId_idx" ON "CompetitorSnapshot"("competitorId");

-- CreateIndex
CREATE INDEX "CompetitorSnapshot_capturedAt_idx" ON "CompetitorSnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "VisibilitySnapshot_businessId_idx" ON "VisibilitySnapshot"("businessId");

-- CreateIndex
CREATE INDEX "VisibilitySnapshot_capturedAt_idx" ON "VisibilitySnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "Report_businessId_idx" ON "Report"("businessId");

-- CreateIndex
CREATE INDEX "Report_generatedAt_idx" ON "Report"("generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OpportunitiesReport_shareToken_key" ON "OpportunitiesReport"("shareToken");

-- CreateIndex
CREATE INDEX "OpportunitiesReport_businessId_idx" ON "OpportunitiesReport"("businessId");

-- CreateIndex
CREATE INDEX "OpportunitiesReport_shareToken_idx" ON "OpportunitiesReport"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "BrandDNA_businessId_key" ON "BrandDNA"("businessId");

-- CreateIndex
CREATE INDEX "ContentIdea_businessId_idx" ON "ContentIdea"("businessId");

-- CreateIndex
CREATE INDEX "Review_businessId_idx" ON "Review"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_platform_externalId_key" ON "Review"("platform", "externalId");

-- CreateIndex
CREATE INDEX "BrandRecommendation_businessId_idx" ON "BrandRecommendation"("businessId");

-- CreateIndex
CREATE INDEX "BrandRecommendation_category_idx" ON "BrandRecommendation"("category");

-- CreateIndex
CREATE INDEX "BrandRecommendation_status_idx" ON "BrandRecommendation"("status");

-- CreateIndex
CREATE INDEX "BrandRecommendation_priorityScore_idx" ON "BrandRecommendation"("priorityScore");

-- CreateIndex
CREATE INDEX "BrandRecommendation_generatedAt_idx" ON "BrandRecommendation"("generatedAt");

-- CreateIndex
CREATE INDEX "BrandScore_businessId_idx" ON "BrandScore"("businessId");

-- CreateIndex
CREATE INDEX "BrandScore_computedAt_idx" ON "BrandScore"("computedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BrandScore_businessId_periodStart_periodEnd_key" ON "BrandScore"("businessId", "periodStart", "periodEnd");

-- AddForeignKey
ALTER TABLE "BrandAsset" ADD CONSTRAINT "BrandAsset_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandColor" ADD CONSTRAINT "BrandColor_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandFont" ADD CONSTRAINT "BrandFont_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandPage" ADD CONSTRAINT "BrandPage_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandSocialLink" ADD CONSTRAINT "BrandSocialLink_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIVisibilityMetric" ADD CONSTRAINT "AIVisibilityMetric_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIVisibilityMetric" ADD CONSTRAINT "AIVisibilityMetric_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPlatformData" ADD CONSTRAINT "AIPlatformData_aIVisibilityMetricId_fkey" FOREIGN KEY ("aIVisibilityMetricId") REFERENCES "AIVisibilityMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorSnapshot" ADD CONSTRAINT "CompetitorSnapshot_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisibilitySnapshot" ADD CONSTRAINT "VisibilitySnapshot_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunitiesReport" ADD CONSTRAINT "OpportunitiesReport_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandDNA" ADD CONSTRAINT "BrandDNA_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentIdea" ADD CONSTRAINT "ContentIdea_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandRecommendation" ADD CONSTRAINT "BrandRecommendation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandScore" ADD CONSTRAINT "BrandScore_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
