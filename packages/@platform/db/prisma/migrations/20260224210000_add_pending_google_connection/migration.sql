-- AlterTable: Update ReviewSource with new GBP metadata columns
ALTER TABLE "ReviewSource"
    ADD COLUMN IF NOT EXISTS "gbpAccountId" TEXT,
    ADD COLUMN IF NOT EXISTS "gbpLocationName" TEXT,
    ADD COLUMN IF NOT EXISTS "gbpLocationTitle" TEXT,
    ADD COLUMN IF NOT EXISTS "connectedAt" TIMESTAMP(3);

-- CreateIndex for status on ReviewSource
CREATE INDEX IF NOT EXISTS "ReviewSource_status_idx" ON "ReviewSource"("status");

-- CreateTable: PendingGoogleConnection for 3-phase OAuth flow
CREATE TABLE IF NOT EXISTS "PendingGoogleConnection" (
    "id"                    TEXT NOT NULL,
    "locationId"            UUID NOT NULL,
    "nonce"                 TEXT NOT NULL,
    "encryptedAccessToken"  TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "expiryDate"            BIGINT NOT NULL,
    "accountsJson"          JSONB NOT NULL,
    "locationsJson"         JSONB NOT NULL,
    "expiresAt"             TIMESTAMP(3) NOT NULL,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PendingGoogleConnection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey for PendingGoogleConnection -> Location
ALTER TABLE "PendingGoogleConnection"
    ADD CONSTRAINT "PendingGoogleConnection_locationId_fkey"
    FOREIGN KEY ("locationId")
    REFERENCES "Location"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateUniqueIndex on nonce
CREATE UNIQUE INDEX IF NOT EXISTS "PendingGoogleConnection_nonce_key" ON "PendingGoogleConnection"("nonce");

-- CreateIndex on locationId
CREATE INDEX IF NOT EXISTS "PendingGoogleConnection_locationId_idx" ON "PendingGoogleConnection"("locationId");

-- CreateIndex on expiresAt (for cleanup queries)
CREATE INDEX IF NOT EXISTS "PendingGoogleConnection_expiresAt_idx" ON "PendingGoogleConnection"("expiresAt");
