-- CreateTable
CREATE TABLE "BrandProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "currentExtractedData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandProfile_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "BrandProfile_businessId_idx" ON "BrandProfile"("businessId");

-- CreateIndex
CREATE INDEX "BrandProfile_status_idx" ON "BrandProfile"("status");

-- CreateIndex
CREATE INDEX "ExtractedDataVersion_brandProfileId_idx" ON "ExtractedDataVersion"("brandProfileId");

-- AddForeignKey
ALTER TABLE "BrandProfile" ADD CONSTRAINT "BrandProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedDataVersion" ADD CONSTRAINT "ExtractedDataVersion_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
