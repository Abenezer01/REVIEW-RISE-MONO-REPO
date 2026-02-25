-- AlterTable
ALTER TABLE "ReviewSource" DROP COLUMN "accessToken",
DROP COLUMN "connectedAt",
DROP COLUMN "expiresAt",
DROP COLUMN "gbpAccountId",
DROP COLUMN "gbpLocationName",
DROP COLUMN "gbpLocationTitle",
DROP COLUMN "metadata",
DROP COLUMN "refreshToken";

-- CreateTable
CREATE TABLE "PlatformIntegration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "locationId" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "gbpAccountId" TEXT,
    "gbpLocationName" TEXT,
    "gbpLocationTitle" TEXT,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformIntegration_locationId_idx" ON "PlatformIntegration"("locationId");

-- CreateIndex
CREATE INDEX "PlatformIntegration_status_idx" ON "PlatformIntegration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformIntegration_locationId_platform_key" ON "PlatformIntegration"("locationId", "platform");

-- AddForeignKey
ALTER TABLE "PlatformIntegration" ADD CONSTRAINT "PlatformIntegration_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
