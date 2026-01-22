-- CreateTable
CREATE TABLE "SocialConnection" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID,
    "platform" TEXT NOT NULL,
    "pageId" TEXT,
    "pageName" TEXT,
    "profileId" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "scopes" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "errorMessage" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialConnection_businessId_idx" ON "SocialConnection"("businessId");

-- CreateIndex
CREATE INDEX "SocialConnection_locationId_idx" ON "SocialConnection"("locationId");

-- CreateIndex
CREATE INDEX "SocialConnection_platform_idx" ON "SocialConnection"("platform");

-- CreateIndex
CREATE INDEX "SocialConnection_status_idx" ON "SocialConnection"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SocialConnection_businessId_locationId_platform_pageId_key" ON "SocialConnection"("businessId", "locationId", "platform", "pageId");

-- AddForeignKey
ALTER TABLE "SocialConnection" ADD CONSTRAINT "SocialConnection_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialConnection" ADD CONSTRAINT "SocialConnection_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
