-- CreateEnum
CREATE TYPE "CompetitorType" AS ENUM ('DIRECT_LOCAL', 'CONTENT', 'AGGREGATOR', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Competitor" ADD COLUMN IF NOT EXISTS "domain" TEXT,
ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "isUserAdded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "ranking" INTEGER,
ADD COLUMN IF NOT EXISTS "relevanceScore" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "source" TEXT,
ADD COLUMN IF NOT EXISTS "type" "CompetitorType" NOT NULL DEFAULT 'UNKNOWN';

-- AlterTable
ALTER TABLE "CompetitorSnapshot" ADD COLUMN IF NOT EXISTS "contentCategories" TEXT[],
ADD COLUMN IF NOT EXISTS "ctaStyles" TEXT[],
ADD COLUMN IF NOT EXISTS "differentiators" JSONB,
ADD COLUMN IF NOT EXISTS "headline" TEXT,
ADD COLUMN IF NOT EXISTS "pricingCues" TEXT[],
ADD COLUMN IF NOT EXISTS "serviceList" TEXT[],
ADD COLUMN IF NOT EXISTS "techStack" JSONB,
ADD COLUMN IF NOT EXISTS "trafficMetrics" JSONB,
ADD COLUMN IF NOT EXISTS "trustSignals" JSONB,
ADD COLUMN IF NOT EXISTS "uvp" TEXT,
ADD COLUMN IF NOT EXISTS "whatToAvoid" TEXT[],
ADD COLUMN IF NOT EXISTS "whatToLearn" TEXT[];

-- CreateTable
CREATE TABLE IF NOT EXISTS "OpportunitiesReport" (
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

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Competitor_businessId_domain_key" ON "Competitor"("businessId", "domain");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Competitor_type_idx" ON "Competitor"("type");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "OpportunitiesReport_shareToken_key" ON "OpportunitiesReport"("shareToken");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OpportunitiesReport_businessId_idx" ON "OpportunitiesReport"("businessId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OpportunitiesReport_shareToken_idx" ON "OpportunitiesReport"("shareToken");

-- AddForeignKey
ALTER TABLE "OpportunitiesReport" ADD CONSTRAINT "OpportunitiesReport_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
