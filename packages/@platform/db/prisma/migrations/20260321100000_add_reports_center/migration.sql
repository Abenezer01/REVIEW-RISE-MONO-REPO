-- CreateTable
CREATE TABLE "ReportsCenterConfig" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "preset" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "sectionOrder" JSONB NOT NULL,
    "whiteLabel" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportsCenterConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportsCenterSchedule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "configId" UUID NOT NULL,
    "frequency" TEXT NOT NULL,
    "recipients" JSONB NOT NULL,
    "triggerEnabled" BOOLEAN NOT NULL DEFAULT false,
    "seoDropThreshold" INTEGER NOT NULL DEFAULT 5,
    "nextRunAt" TIMESTAMP(3) NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportsCenterSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportsCenterRun" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "configId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "webUrl" TEXT,
    "shareToken" TEXT,
    "sharePasswordHash" TEXT,
    "meta" JSONB,

    CONSTRAINT "ReportsCenterRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportsCenterExportJob" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "resultUrl" TEXT,
    "error" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ReportsCenterExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportsCenterConfig_businessId_key" ON "ReportsCenterConfig"("businessId");

-- CreateIndex
CREATE INDEX "ReportsCenterConfig_businessId_idx" ON "ReportsCenterConfig"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportsCenterSchedule_configId_key" ON "ReportsCenterSchedule"("configId");

-- CreateIndex
CREATE INDEX "ReportsCenterSchedule_businessId_idx" ON "ReportsCenterSchedule"("businessId");

-- CreateIndex
CREATE INDEX "ReportsCenterSchedule_nextRunAt_idx" ON "ReportsCenterSchedule"("nextRunAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReportsCenterRun_shareToken_key" ON "ReportsCenterRun"("shareToken");

-- CreateIndex
CREATE INDEX "ReportsCenterRun_businessId_idx" ON "ReportsCenterRun"("businessId");

-- CreateIndex
CREATE INDEX "ReportsCenterRun_generatedAt_idx" ON "ReportsCenterRun"("generatedAt");

-- CreateIndex
CREATE INDEX "ReportsCenterRun_status_idx" ON "ReportsCenterRun"("status");

-- CreateIndex
CREATE INDEX "ReportsCenterExportJob_businessId_idx" ON "ReportsCenterExportJob"("businessId");

-- CreateIndex
CREATE INDEX "ReportsCenterExportJob_status_idx" ON "ReportsCenterExportJob"("status");

-- CreateIndex
CREATE INDEX "ReportsCenterExportJob_createdAt_idx" ON "ReportsCenterExportJob"("createdAt");

-- AddForeignKey
ALTER TABLE "ReportsCenterConfig" ADD CONSTRAINT "ReportsCenterConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportsCenterSchedule" ADD CONSTRAINT "ReportsCenterSchedule_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportsCenterSchedule" ADD CONSTRAINT "ReportsCenterSchedule_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ReportsCenterConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportsCenterRun" ADD CONSTRAINT "ReportsCenterRun_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportsCenterRun" ADD CONSTRAINT "ReportsCenterRun_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ReportsCenterConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportsCenterExportJob" ADD CONSTRAINT "ReportsCenterExportJob_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
