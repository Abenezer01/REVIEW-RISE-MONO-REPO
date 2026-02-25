-- CreateTable
CREATE TABLE "SeasonalEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" TIMESTAMP(3) NOT NULL,
    "market" TEXT NOT NULL DEFAULT 'Global',
    "region" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeasonalEvent_date_idx" ON "SeasonalEvent"("date");

-- CreateIndex
CREATE INDEX "SeasonalEvent_market_idx" ON "SeasonalEvent"("market");
