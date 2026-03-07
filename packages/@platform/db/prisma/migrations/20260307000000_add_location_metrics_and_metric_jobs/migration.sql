-- CreateTable: location_metrics
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

-- CreateTable: location_competitors
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

-- CreateTable: metric_jobs
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

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "location_metrics_locationId_date_key" ON "location_metrics"("locationId", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "location_competitors_locationId_idx" ON "location_competitors"("locationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "metric_jobs_locationId_jobType_status_idx" ON "metric_jobs"("locationId", "jobType", "status");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'location_metrics_locationId_fkey'
  ) THEN
    ALTER TABLE "location_metrics" ADD CONSTRAINT "location_metrics_locationId_fkey"
      FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'location_competitors_locationId_fkey'
  ) THEN
    ALTER TABLE "location_competitors" ADD CONSTRAINT "location_competitors_locationId_fkey"
      FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'metric_jobs_locationId_fkey'
  ) THEN
    ALTER TABLE "metric_jobs" ADD CONSTRAINT "metric_jobs_locationId_fkey"
      FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
