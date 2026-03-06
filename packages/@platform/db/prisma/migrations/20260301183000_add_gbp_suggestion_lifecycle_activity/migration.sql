ALTER TABLE "BrandRecommendation"
  ADD COLUMN IF NOT EXISTS "locationId" UUID,
  ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS "lifecycleState" TEXT NOT NULL DEFAULT 'SAVED',
  ADD COLUMN IF NOT EXISTS "auditSnapshotId" UUID,
  ADD COLUMN IF NOT EXISTS "auditFindingCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "appliedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "appliedByUserId" UUID,
  ADD COLUMN IF NOT EXISTS "appliedNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejectedReason" TEXT;

CREATE TABLE IF NOT EXISTS "GbpSuggestionActivity" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "recommendationId" UUID NOT NULL,
  "businessId" UUID NOT NULL,
  "locationId" UUID NOT NULL,
  "userId" UUID,
  "action" TEXT NOT NULL,
  "notes" TEXT,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GbpSuggestionActivity_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BrandRecommendation_locationId_fkey'
  ) THEN
    ALTER TABLE "BrandRecommendation"
      ADD CONSTRAINT "BrandRecommendation_locationId_fkey"
      FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BrandRecommendation_auditSnapshotId_fkey'
  ) THEN
    ALTER TABLE "BrandRecommendation"
      ADD CONSTRAINT "BrandRecommendation_auditSnapshotId_fkey"
      FOREIGN KEY ("auditSnapshotId") REFERENCES "GbpProfileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BrandRecommendation_appliedByUserId_fkey'
  ) THEN
    ALTER TABLE "BrandRecommendation"
      ADD CONSTRAINT "BrandRecommendation_appliedByUserId_fkey"
      FOREIGN KEY ("appliedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'GbpSuggestionActivity_recommendationId_fkey'
  ) THEN
    ALTER TABLE "GbpSuggestionActivity"
      ADD CONSTRAINT "GbpSuggestionActivity_recommendationId_fkey"
      FOREIGN KEY ("recommendationId") REFERENCES "BrandRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'GbpSuggestionActivity_businessId_fkey'
  ) THEN
    ALTER TABLE "GbpSuggestionActivity"
      ADD CONSTRAINT "GbpSuggestionActivity_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'GbpSuggestionActivity_locationId_fkey'
  ) THEN
    ALTER TABLE "GbpSuggestionActivity"
      ADD CONSTRAINT "GbpSuggestionActivity_locationId_fkey"
      FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'GbpSuggestionActivity_userId_fkey'
  ) THEN
    ALTER TABLE "GbpSuggestionActivity"
      ADD CONSTRAINT "GbpSuggestionActivity_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "BrandRecommendation_locationId_idx" ON "BrandRecommendation"("locationId");
CREATE INDEX IF NOT EXISTS "BrandRecommendation_source_idx" ON "BrandRecommendation"("source");
CREATE INDEX IF NOT EXISTS "BrandRecommendation_lifecycleState_idx" ON "BrandRecommendation"("lifecycleState");
CREATE INDEX IF NOT EXISTS "BrandRecommendation_auditSnapshotId_idx" ON "BrandRecommendation"("auditSnapshotId");
CREATE INDEX IF NOT EXISTS "BrandRecommendation_appliedByUserId_idx" ON "BrandRecommendation"("appliedByUserId");

CREATE INDEX IF NOT EXISTS "GbpSuggestionActivity_recommendationId_idx" ON "GbpSuggestionActivity"("recommendationId");
CREATE INDEX IF NOT EXISTS "GbpSuggestionActivity_businessId_idx" ON "GbpSuggestionActivity"("businessId");
CREATE INDEX IF NOT EXISTS "GbpSuggestionActivity_locationId_idx" ON "GbpSuggestionActivity"("locationId");
CREATE INDEX IF NOT EXISTS "GbpSuggestionActivity_action_idx" ON "GbpSuggestionActivity"("action");
CREATE INDEX IF NOT EXISTS "GbpSuggestionActivity_createdAt_idx" ON "GbpSuggestionActivity"("createdAt");
