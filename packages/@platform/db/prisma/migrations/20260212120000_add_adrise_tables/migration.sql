-- CreateTable
CREATE TABLE "AdriseSession" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "userId" UUID,
    "status" TEXT NOT NULL DEFAULT 'active',
    "mode" TEXT NOT NULL DEFAULT 'QUICK',
    "industryCode" TEXT,
    "objective" TEXT,
    "budgetMonthly" DOUBLE PRECISION,
    "geo" JSONB,
    "inputs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdriseSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdriseSessionVersion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "inputs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdriseSessionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdriseOutput" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL,
    "output" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdriseOutput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdriseSession_businessId_idx" ON "AdriseSession"("businessId");

-- CreateIndex
CREATE INDEX "AdriseSession_userId_idx" ON "AdriseSession"("userId");

-- CreateIndex
CREATE INDEX "AdriseSession_status_idx" ON "AdriseSession"("status");

-- CreateIndex
CREATE INDEX "AdriseSessionVersion_sessionId_idx" ON "AdriseSessionVersion"("sessionId");

-- CreateIndex
CREATE INDEX "AdriseOutput_sessionId_idx" ON "AdriseOutput"("sessionId");

-- AddForeignKey
ALTER TABLE "AdriseSession" ADD CONSTRAINT "AdriseSession_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdriseSession" ADD CONSTRAINT "AdriseSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdriseSessionVersion" ADD CONSTRAINT "AdriseSessionVersion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AdriseSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdriseOutput" ADD CONSTRAINT "AdriseOutput_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AdriseSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
