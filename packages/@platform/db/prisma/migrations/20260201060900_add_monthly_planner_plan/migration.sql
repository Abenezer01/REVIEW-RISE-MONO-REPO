-- CreateTable
CREATE TABLE "MonthlyPlannerPlan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "industry" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "config" JSONB NOT NULL,
    "days" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyPlannerPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyPlannerPlan_businessId_idx" ON "MonthlyPlannerPlan"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyPlannerPlan_businessId_month_year_key" ON "MonthlyPlannerPlan"("businessId", "month", "year");

-- AddForeignKey
ALTER TABLE "MonthlyPlannerPlan" ADD CONSTRAINT "MonthlyPlannerPlan_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
