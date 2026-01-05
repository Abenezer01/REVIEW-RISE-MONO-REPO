-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "address" TEXT,
    "timezone" TEXT,
    "platformIds" JSONB,
    "tags" TEXT[],
    "lastSync" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "businessId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBusinessRole" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UserBusinessRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "businessId" UUID NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSyncLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "reviewsSynced" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER,
    "requestData" JSONB,
    "responseData" JSONB,
    "jobId" UUID,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoSnapshot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "seoElements" JSONB NOT NULL,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID,
    "keyword" TEXT NOT NULL,
    "searchVolume" INTEGER,
    "difficulty" DOUBLE PRECISION,
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordRank" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "keywordId" UUID NOT NULL,
    "rankPosition" INTEGER,
    "mapPackPosition" INTEGER,
    "hasFeaturedSnippet" BOOLEAN NOT NULL DEFAULT false,
    "hasPeopleAlsoAsk" BOOLEAN NOT NULL DEFAULT false,
    "hasLocalPack" BOOLEAN NOT NULL DEFAULT false,
    "hasKnowledgePanel" BOOLEAN NOT NULL DEFAULT false,
    "hasImagePack" BOOLEAN NOT NULL DEFAULT false,
    "hasVideoCarousel" BOOLEAN NOT NULL DEFAULT false,
    "rankingUrl" TEXT,
    "searchLocation" TEXT,
    "device" TEXT NOT NULL DEFAULT 'desktop',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeywordRank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisibilityMetric" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "mapPackAppearances" INTEGER NOT NULL DEFAULT 0,
    "totalTrackedKeywords" INTEGER NOT NULL DEFAULT 0,
    "mapPackVisibility" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "top3Count" INTEGER NOT NULL DEFAULT 0,
    "top10Count" INTEGER NOT NULL DEFAULT 0,
    "top20Count" INTEGER NOT NULL DEFAULT 0,
    "shareOfVoice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "featuredSnippetCount" INTEGER NOT NULL DEFAULT 0,
    "localPackCount" INTEGER NOT NULL DEFAULT 0,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisibilityMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "businessId" UUID,
    "locationId" UUID,
    "payload" JSONB,
    "result" JSONB,
    "error" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 100,
    "rules" JSONB,
    "owner" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIVisibilityMetric" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID,
    "visibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sentimentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shareOfVoice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "citationAuthority" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIVisibilityMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIPlatformData" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aIVisibilityMetricId" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "rank" INTEGER,
    "sentiment" TEXT NOT NULL,
    "mentioned" BOOLEAN NOT NULL DEFAULT false,
    "sourcesCount" INTEGER NOT NULL DEFAULT 0,
    "responseSnippet" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIPlatformData_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "CompetitorType" AS ENUM ('DIRECT_LOCAL', 'CONTENT', 'AGGREGATOR', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Competitor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "domain" TEXT,
    "type" "CompetitorType" NOT NULL DEFAULT 'UNKNOWN',
    "source" TEXT,
    "relevanceScore" DOUBLE PRECISION,
    "ranking" INTEGER,
    "isUserAdded" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorSnapshot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "competitorId" UUID NOT NULL,
    
    "headline" TEXT,
    "uvp" TEXT,
    "serviceList" TEXT[],
    "pricingCues" TEXT[],
    "trustSignals" JSONB,
    "ctaStyles" TEXT[],
    "contentCategories" TEXT[],
    
    "differentiators" JSONB,
    "whatToLearn" TEXT[],
    "whatToAvoid" TEXT[],
    
    "techStack" JSONB,
    "trafficMetrics" JSONB,
    
    "metrics" JSONB,
    
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunitiesReport" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "positioningMap" JSONB NOT NULL,
    "gaps" JSONB NOT NULL,
    "strategies" JSONB NOT NULL,
    "suggestedTaglines" TEXT[],
    "contentIdeas" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "shareToken" TEXT,
    "pdfUrl" TEXT,

    CONSTRAINT "OpportunitiesReport_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "BrandAsset" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandProfileId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandColor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandProfileId" UUID NOT NULL,
    "hexCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandFont" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandProfileId" UUID NOT NULL,
    "family" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandFont_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandPage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandProfileId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandSocialLink" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandProfileId" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandSocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisibilitySnapshot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    
    "range" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    
    "breakdown" JSONB NOT NULL,
    
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisibilitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    
    "htmlContent" TEXT NOT NULL,
    "pdfUrl" TEXT,
    
    "generatedBy" UUID,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandDNA" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "values" TEXT[],
    "voice" TEXT,
    "audience" TEXT,
    "mission" TEXT,

    CONSTRAINT "BrandDNA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentIdea" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "locationId" UUID,
    "platform" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");
CREATE INDEX "Business_name_idx" ON "Business"("name");
CREATE INDEX "Business_status_idx" ON "Business"("status");
CREATE INDEX "Location_businessId_idx" ON "Location"("businessId");
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE UNIQUE INDEX "Permission_action_key" ON "Permission"("action");
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");
CREATE INDEX "UserBusinessRole_userId_idx" ON "UserBusinessRole"("userId");
CREATE INDEX "UserBusinessRole_businessId_idx" ON "UserBusinessRole"("businessId");
CREATE UNIQUE INDEX "UserBusinessRole_userId_businessId_roleId_key" ON "UserBusinessRole"("userId", "businessId", "roleId");
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
CREATE INDEX "Subscription_businessId_idx" ON "Subscription"("businessId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "ReviewSyncLog_businessId_idx" ON "ReviewSyncLog"("businessId");
CREATE INDEX "ReviewSyncLog_locationId_idx" ON "ReviewSyncLog"("locationId");
CREATE INDEX "ReviewSyncLog_platform_idx" ON "ReviewSyncLog"("platform");
CREATE INDEX "ReviewSyncLog_status_idx" ON "ReviewSyncLog"("status");
CREATE INDEX "ReviewSyncLog_createdAt_idx" ON "ReviewSyncLog"("createdAt");
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");
CREATE INDEX "SeoSnapshot_userId_idx" ON "SeoSnapshot"("userId");
CREATE INDEX "SeoSnapshot_url_idx" ON "SeoSnapshot"("url");
CREATE INDEX "Keyword_businessId_idx" ON "Keyword"("businessId");
CREATE INDEX "Keyword_locationId_idx" ON "Keyword"("locationId");
CREATE INDEX "Keyword_status_idx" ON "Keyword"("status");
CREATE INDEX "KeywordRank_keywordId_idx" ON "KeywordRank"("keywordId");
CREATE INDEX "KeywordRank_capturedAt_idx" ON "KeywordRank"("capturedAt");
CREATE INDEX "VisibilityMetric_businessId_idx" ON "VisibilityMetric"("businessId");
CREATE INDEX "VisibilityMetric_locationId_idx" ON "VisibilityMetric"("locationId");
CREATE INDEX "VisibilityMetric_periodStart_periodEnd_idx" ON "VisibilityMetric"("periodStart", "periodEnd");
CREATE UNIQUE INDEX "VisibilityMetric_businessId_locationId_periodStart_periodEn_key" ON "VisibilityMetric"("businessId", "locationId", "periodStart", "periodEnd", "periodType");
CREATE INDEX "Job_type_idx" ON "Job"("type");
CREATE INDEX "Job_status_idx" ON "Job"("status");
CREATE INDEX "Job_businessId_idx" ON "Job"("businessId");
CREATE INDEX "Job_locationId_idx" ON "Job"("locationId");
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt");

-- FeatureFlag Indexes
CREATE UNIQUE INDEX "FeatureFlag_name_key" ON "FeatureFlag"("name");
CREATE INDEX "FeatureFlag_name_idx" ON "FeatureFlag"("name");

-- SystemSetting Indexes
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");
CREATE INDEX "SystemSetting_key_idx" ON "SystemSetting"("key");

-- AIVisibility Indexes
CREATE INDEX "AIVisibilityMetric_businessId_idx" ON "AIVisibilityMetric"("businessId");
CREATE INDEX "AIVisibilityMetric_locationId_idx" ON "AIVisibilityMetric"("locationId");
CREATE INDEX "AIVisibilityMetric_periodStart_periodEnd_idx" ON "AIVisibilityMetric"("periodStart", "periodEnd");

-- AIPlatformData Indexes
CREATE INDEX "AIPlatformData_aIVisibilityMetricId_idx" ON "AIPlatformData"("aIVisibilityMetricId");
CREATE INDEX "AIPlatformData_platform_idx" ON "AIPlatformData"("platform");

-- Competitor Indexes
CREATE UNIQUE INDEX "Competitor_businessId_name_key" ON "Competitor"("businessId", "name");
CREATE UNIQUE INDEX "Competitor_businessId_domain_key" ON "Competitor"("businessId", "domain");
CREATE INDEX "Competitor_businessId_idx" ON "Competitor"("businessId");
CREATE INDEX "Competitor_type_idx" ON "Competitor"("type");

-- CompetitorSnapshot Indexes
CREATE INDEX "CompetitorSnapshot_competitorId_idx" ON "CompetitorSnapshot"("competitorId");
CREATE INDEX "CompetitorSnapshot_capturedAt_idx" ON "CompetitorSnapshot"("capturedAt");

-- OpportunitiesReport Indexes
CREATE UNIQUE INDEX "OpportunitiesReport_shareToken_key" ON "OpportunitiesReport"("shareToken");
CREATE INDEX "OpportunitiesReport_businessId_idx" ON "OpportunitiesReport"("businessId");
CREATE INDEX "OpportunitiesReport_shareToken_idx" ON "OpportunitiesReport"("shareToken");

-- BrandProfile Indexes
CREATE INDEX "BrandProfile_businessId_idx" ON "BrandProfile"("businessId");
CREATE INDEX "BrandProfile_status_idx" ON "BrandProfile"("status");

-- ExtractedDataVersion Indexes
CREATE INDEX "ExtractedDataVersion_brandProfileId_idx" ON "ExtractedDataVersion"("brandProfileId");

-- BrandAsset Indexes
CREATE INDEX "BrandAsset_brandProfileId_idx" ON "BrandAsset"("brandProfileId");

-- BrandColor Indexes
CREATE INDEX "BrandColor_brandProfileId_idx" ON "BrandColor"("brandProfileId");

-- BrandFont Indexes
CREATE INDEX "BrandFont_brandProfileId_idx" ON "BrandFont"("brandProfileId");

-- BrandPage Indexes
CREATE INDEX "BrandPage_brandProfileId_idx" ON "BrandPage"("brandProfileId");

-- BrandSocialLink Indexes
CREATE INDEX "BrandSocialLink_brandProfileId_idx" ON "BrandSocialLink"("brandProfileId");

-- VisibilitySnapshot Indexes
CREATE INDEX "VisibilitySnapshot_businessId_idx" ON "VisibilitySnapshot"("businessId");
CREATE INDEX "VisibilitySnapshot_capturedAt_idx" ON "VisibilitySnapshot"("capturedAt");

-- Report Indexes
CREATE INDEX "Report_businessId_idx" ON "Report"("businessId");
CREATE INDEX "Report_generatedAt_idx" ON "Report"("generatedAt");

-- BrandDNA Indexes
CREATE UNIQUE INDEX "BrandDNA_businessId_key" ON "BrandDNA"("businessId");

-- ContentIdea Indexes
CREATE INDEX "ContentIdea_businessId_idx" ON "ContentIdea"("businessId");

-- Review Indexes
CREATE UNIQUE INDEX "Review_platform_externalId_key" ON "Review"("platform", "externalId");
CREATE INDEX "Review_businessId_idx" ON "Review"("businessId");


-- AddForeignKey: Account
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Session
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: UserRole
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Location
ALTER TABLE "Location" ADD CONSTRAINT "Location_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: RolePermission
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: UserBusinessRole
ALTER TABLE "UserBusinessRole" ADD CONSTRAINT "UserBusinessRole_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBusinessRole" ADD CONSTRAINT "UserBusinessRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBusinessRole" ADD CONSTRAINT "UserBusinessRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Subscription
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: AuditLog
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ReviewSyncLog
ALTER TABLE "ReviewSyncLog" ADD CONSTRAINT "ReviewSyncLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewSyncLog" ADD CONSTRAINT "ReviewSyncLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReviewSyncLog" ADD CONSTRAINT "ReviewSyncLog_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: SeoSnapshot
ALTER TABLE "SeoSnapshot" ADD CONSTRAINT "SeoSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Keyword
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: KeywordRank
ALTER TABLE "KeywordRank" ADD CONSTRAINT "KeywordRank_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: VisibilityMetric
ALTER TABLE "VisibilityMetric" ADD CONSTRAINT "VisibilityMetric_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisibilityMetric" ADD CONSTRAINT "VisibilityMetric_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Job
ALTER TABLE "Job" ADD CONSTRAINT "Job_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: AIVisibilityMetric
ALTER TABLE "AIVisibilityMetric" ADD CONSTRAINT "AIVisibilityMetric_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIVisibilityMetric" ADD CONSTRAINT "AIVisibilityMetric_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: AIPlatformData
ALTER TABLE "AIPlatformData" ADD CONSTRAINT "AIPlatformData_aIVisibilityMetricId_fkey" FOREIGN KEY ("aIVisibilityMetricId") REFERENCES "AIVisibilityMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Competitor
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CompetitorSnapshot
ALTER TABLE "CompetitorSnapshot" ADD CONSTRAINT "CompetitorSnapshot_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: OpportunitiesReport
ALTER TABLE "OpportunitiesReport" ADD CONSTRAINT "OpportunitiesReport_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: BrandProfile
ALTER TABLE "BrandProfile" ADD CONSTRAINT "BrandProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ExtractedDataVersion
ALTER TABLE "ExtractedDataVersion" ADD CONSTRAINT "ExtractedDataVersion_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: BrandAsset
ALTER TABLE "BrandAsset" ADD CONSTRAINT "BrandAsset_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: BrandColor
ALTER TABLE "BrandColor" ADD CONSTRAINT "BrandColor_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: BrandFont
ALTER TABLE "BrandFont" ADD CONSTRAINT "BrandFont_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: BrandPage
ALTER TABLE "BrandPage" ADD CONSTRAINT "BrandPage_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: BrandSocialLink
ALTER TABLE "BrandSocialLink" ADD CONSTRAINT "BrandSocialLink_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: VisibilitySnapshot
ALTER TABLE "VisibilitySnapshot" ADD CONSTRAINT "VisibilitySnapshot_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Report
ALTER TABLE "Report" ADD CONSTRAINT "Report_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: BrandDNA
ALTER TABLE "BrandDNA" ADD CONSTRAINT "BrandDNA_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ContentIdea
ALTER TABLE "ContentIdea" ADD CONSTRAINT "ContentIdea_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Review
ALTER TABLE "Review" ADD CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
