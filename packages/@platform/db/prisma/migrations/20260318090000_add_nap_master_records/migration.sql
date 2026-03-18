-- CreateTable
CREATE TABLE "NapMasterRecord" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NapMasterRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NapMasterRecord_locationId_key" ON "NapMasterRecord"("locationId");

-- CreateIndex
CREATE INDEX "NapMasterRecord_businessId_idx" ON "NapMasterRecord"("businessId");

-- AddForeignKey
ALTER TABLE "NapMasterRecord" ADD CONSTRAINT "NapMasterRecord_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NapMasterRecord" ADD CONSTRAINT "NapMasterRecord_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
