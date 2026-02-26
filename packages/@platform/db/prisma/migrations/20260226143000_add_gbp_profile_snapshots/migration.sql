-- CreateTable
CREATE TABLE "GbpProfileSnapshot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "captureType" TEXT NOT NULL DEFAULT 'sync',
    "snapshot" JSONB NOT NULL,
    "changedFields" JSONB,
    "diffBaseSnapshotId" UUID,
    "auditLogId" UUID,
    "suggestionRefs" JSONB,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GbpProfileSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GbpProfileSnapshot_businessId_idx" ON "GbpProfileSnapshot"("businessId");

-- CreateIndex
CREATE INDEX "GbpProfileSnapshot_locationId_idx" ON "GbpProfileSnapshot"("locationId");

-- CreateIndex
CREATE INDEX "GbpProfileSnapshot_capturedAt_idx" ON "GbpProfileSnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "GbpProfileSnapshot_auditLogId_idx" ON "GbpProfileSnapshot"("auditLogId");

-- AddForeignKey
ALTER TABLE "GbpProfileSnapshot" ADD CONSTRAINT "GbpProfileSnapshot_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GbpProfileSnapshot" ADD CONSTRAINT "GbpProfileSnapshot_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GbpProfileSnapshot" ADD CONSTRAINT "GbpProfileSnapshot_diffBaseSnapshotId_fkey" FOREIGN KEY ("diffBaseSnapshotId") REFERENCES "GbpProfileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GbpProfileSnapshot" ADD CONSTRAINT "GbpProfileSnapshot_auditLogId_fkey" FOREIGN KEY ("auditLogId") REFERENCES "AuditLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
