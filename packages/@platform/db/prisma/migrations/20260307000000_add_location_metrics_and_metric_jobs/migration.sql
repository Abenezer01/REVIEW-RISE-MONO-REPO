-- ============================================================
-- COMPREHENSIVE SCHEMA SYNC MIGRATION
-- Adds all columns and tables present in schema.prisma that
-- were never added via a formal migration.
-- All statements use IF NOT EXISTS / DO $$ blocks for idempotency.
-- ============================================================

-- ============================================================
-- 1. Location table: add missing lastPhotoSyncAt column
-- ============================================================
ALTER TABLE "Location"
  ADD COLUMN IF NOT EXISTS "lastPhotoSyncAt" TIMESTAMP(3);

-- ============================================================
-- 2. LocationPhoto table
-- ============================================================
CREATE TABLE IF NOT EXISTS "LocationPhoto" (
    "id" TEXT NOT NULL,
    "locationId" UUID NOT NULL,
    "accountId" TEXT,
    "googleUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "category" TEXT,
    "createTime" TIMESTAMP(3),
    "updateTime" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "attribution" TEXT,
    "mediaFormat" TEXT NOT NULL DEFAULT 'PHOTO',
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hash" TEXT,

    CONSTRAINT "LocationPhoto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LocationPhoto_locationId_idx" ON "LocationPhoto"("locationId");
CREATE INDEX IF NOT EXISTS "LocationPhoto_category_idx" ON "LocationPhoto"("category");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LocationPhoto_locationId_fkey'
  ) THEN
    ALTER TABLE "LocationPhoto" ADD CONSTRAINT "LocationPhoto_locationId_fkey"
      FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================
-- 3. GbpProfileAudit table
-- ============================================================
CREATE TABLE IF NOT EXISTS "GbpProfileAudit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "snapshotId" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GbpProfileAudit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GbpProfileAudit_snapshotId_key" ON "GbpProfileAudit"("snapshotId");
CREATE INDEX IF NOT EXISTS "GbpProfileAudit_snapshotId_idx" ON "GbpProfileAudit"("snapshotId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'GbpProfileAudit_snapshotId_fkey'
  ) THEN
    ALTER TABLE "GbpProfileAudit" ADD CONSTRAINT "GbpProfileAudit_snapshotId_fkey"
      FOREIGN KEY ("snapshotId") REFERENCES "GbpProfileSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================
-- 4. CreativeEngineAnalytics table
-- ============================================================
CREATE TABLE IF NOT EXISTS "CreativeEngineAnalytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "eventType" TEXT NOT NULL,
    "businessId" UUID,
    "userId" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreativeEngineAnalytics_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CreativeEngineAnalytics_businessId_idx" ON "CreativeEngineAnalytics"("businessId");
CREATE INDEX IF NOT EXISTS "CreativeEngineAnalytics_userId_idx" ON "CreativeEngineAnalytics"("userId");
CREATE INDEX IF NOT EXISTS "CreativeEngineAnalytics_eventType_idx" ON "CreativeEngineAnalytics"("eventType");
CREATE INDEX IF NOT EXISTS "CreativeEngineAnalytics_createdAt_idx" ON "CreativeEngineAnalytics"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CreativeEngineAnalytics_businessId_fkey'
  ) THEN
    ALTER TABLE "CreativeEngineAnalytics" ADD CONSTRAINT "CreativeEngineAnalytics_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CreativeEngineAnalytics_userId_fkey'
  ) THEN
    ALTER TABLE "CreativeEngineAnalytics" ADD CONSTRAINT "CreativeEngineAnalytics_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================
-- 5. CreativeConcept table
-- ============================================================
CREATE TABLE IF NOT EXISTS "CreativeConcept" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "headline" TEXT NOT NULL,
    "visualIdea" TEXT NOT NULL,
    "primaryText" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "imagePrompt" TEXT,
    "imageUrl" TEXT,
    "formatPrompts" JSONB NOT NULL,
    "tone" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreativeConcept_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CreativeConcept_businessId_idx" ON "CreativeConcept"("businessId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CreativeConcept_businessId_fkey'
  ) THEN
    ALTER TABLE "CreativeConcept" ADD CONSTRAINT "CreativeConcept_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================
-- 6. location_metrics table
-- ============================================================
CREATE TABLE IF NOT EXISTS "location_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "locationId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "impressionsTotal" INTEGER NOT NULL DEFAULT 0,
    "impressionsDiscovery" INTEGER NOT NULL DEFAULT 0,
    "impressionsDirect" INTEGER NOT NULL DEFAULT 0,
    "photoViews" INTEGER NOT NULL DEFAULT 0,
    "visibilityScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_metrics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "location_metrics_locationId_date_key" ON "location_metrics"("locationId", "date");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'location_metrics_locationId_fkey'
  ) THEN
    ALTER TABLE "location_metrics" ADD CONSTRAINT "location_metrics_locationId_fkey"
      FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================
-- 7. location_competitors table
-- ============================================================
CREATE TABLE IF NOT EXISTS "location_competitors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "locationId" UUID NOT NULL,
    "competitorName" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "photoCount" INTEGER,
    "estimatedVisibility" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_competitors_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "location_competitors_locationId_idx" ON "location_competitors"("locationId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'location_competitors_locationId_fkey'
  ) THEN
    ALTER TABLE "location_competitors" ADD CONSTRAINT "location_competitors_locationId_fkey"
      FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================
-- 8. metric_jobs table
-- ============================================================
CREATE TABLE IF NOT EXISTS "metric_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "locationId" UUID NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "metric_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "metric_jobs_locationId_jobType_status_idx" ON "metric_jobs"("locationId", "jobType", "status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'metric_jobs_locationId_fkey'
  ) THEN
    ALTER TABLE "metric_jobs" ADD CONSTRAINT "metric_jobs_locationId_fkey"
      FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
