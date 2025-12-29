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

-- AddForeignKey
ALTER TABLE "AIVisibilityMetric" ADD CONSTRAINT "AIVisibilityMetric_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIVisibilityMetric" ADD CONSTRAINT "AIVisibilityMetric_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPlatformData" ADD CONSTRAINT "AIPlatformData_aIVisibilityMetricId_fkey" FOREIGN KEY ("aIVisibilityMetricId") REFERENCES "AIVisibilityMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
