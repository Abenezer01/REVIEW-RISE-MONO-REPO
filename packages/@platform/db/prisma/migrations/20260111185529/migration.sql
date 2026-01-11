/*
  Warnings:

  - A unique constraint covering the columns `[userId,businessId,roleId,locationId]` on the table `UserBusinessRole` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserBusinessRole_userId_businessId_roleId_key";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "BrandProfile" ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "tone" JSONB;

-- AlterTable
ALTER TABLE "UserBusinessRole" ADD COLUMN     "locationId" UUID;

-- CreateTable
CREATE TABLE "ExtractedDataVersion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandProfileId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "extractedData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtractedDataVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExtractedDataVersion_brandProfileId_idx" ON "ExtractedDataVersion"("brandProfileId");

-- CreateIndex
CREATE INDEX "UserBusinessRole_locationId_idx" ON "UserBusinessRole"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBusinessRole_userId_businessId_roleId_locationId_key" ON "UserBusinessRole"("userId", "businessId", "roleId", "locationId");

-- AddForeignKey
ALTER TABLE "UserBusinessRole" ADD CONSTRAINT "UserBusinessRole_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedDataVersion" ADD CONSTRAINT "ExtractedDataVersion_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
