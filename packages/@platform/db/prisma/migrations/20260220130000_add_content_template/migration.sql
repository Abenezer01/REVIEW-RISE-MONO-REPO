-- CreateTable
CREATE TABLE "ContentTemplate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "industry" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaPrompt" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentTemplate_industry_idx" ON "ContentTemplate"("industry");

-- CreateIndex
CREATE INDEX "ContentTemplate_objective_idx" ON "ContentTemplate"("objective");
