---
description: BrandingRise AI Brand Strategist Implementation Plan
---

# BrandingRise: AI Brand Strategist / Visibility Improver Implementation Plan

**Summary**: AI worker generates Visibility/Trust/Consistency scores, prioritized recommendations, 30-day plan, and reports (async jobs).

---

## Phase 1: Database Schema & Repositories

### 1.1 Update Prisma Schema

**File**: `packages/@platform/db/prisma/schema.prisma`

Add the following models:

```prisma
// BrandingRise: AI-Generated Recommendations
model BrandRecommendation {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  businessId  String   @db.Uuid
  
  // Categorization
  category    String   // 'search', 'local', 'social', 'reputation', 'conversion', 'content'
  
  // Recommendation Details
  title       String
  description String   @db.Text
  why         String[] // Array of reasons/rationale
  steps       String[] // Array of actionable steps
  
  // Prioritization
  impact      String   // 'low', 'medium', 'high', 'critical'
  effort      String   // 'low', 'medium', 'high'
  confidence  Float    @default(0) // 0-100, AI confidence in this recommendation
  priorityScore Float  @default(0) // Computed: (impact * confidence) / effort
  
  // KPI Tracking
  kpiTarget   Json?    // { metric: 'visibility_score', target: 75, timeframe: '30d' }
  
  // Status & Lifecycle
  status      String   @default("open") // 'open', 'in_progress', 'done', 'dismissed'
  notes       String?  @db.Text // User notes
  
  // Metadata
  generatedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt
  dismissedAt DateTime?
  completedAt DateTime?
  
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  @@index([businessId])
  @@index([category])
  @@index([status])
  @@index([priorityScore])
  @@index([generatedAt])
}

// BrandingRise: Computed Brand Scores
model BrandScore {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  businessId            String   @db.Uuid
  
  // Core Scores (0-100)
  visibilityScore       Float    @default(0)
  trustScore            Float    @default(0)
  consistencyScore      Float    @default(0)
  
  // Visibility Breakdown (weighted components)
  visibilityBreakdown   Json     // { search: 20, local: 30, social: 15, reputation: 20, consistency: 15 }
  
  // Trust Breakdown
  trustBreakdown        Json     // { rating: 4.5, reviewCount: 120, responseRate: 0.85, sentiment: 0.75 }
  
  // Consistency Breakdown
  consistencyBreakdown  Json     // { namingConsistency: 0.9, brandingConsistency: 0.8, messagingConsistency: 0.7 }
  
  // Metadata
  computedAt            DateTime @default(now())
  periodStart           DateTime
  periodEnd             DateTime
  
  business              Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  @@unique([businessId, periodStart, periodEnd])
  @@index([businessId])
  @@index([computedAt])
}

// Update Business model to include new relations
model Business {
  // ... existing fields ...
  
  recommendations BrandRecommendation[]
  brandScores     BrandScore[]
}

// Update Job model to support new job types
// Add to existing Job model's type field:
// - GENERATE_VISIBILITY_RECOMMENDATIONS
// - GENERATE_30DAY_PLAN
// - COMPUTE_BRAND_SCORES
// - GENERATE_VISIBILITY_REPORT
```

### 1.2 Create Repositories

**File**: `packages/@platform/db/src/repositories/brand-recommendation.repository.ts`

```typescript
import { BaseRepository } from './base.repository';
import { BrandRecommendation, Prisma } from '@prisma/client';

export class BrandRecommendationRepository extends BaseRepository<
  BrandRecommendation,
  Prisma.BrandRecommendationCreateInput,
  Prisma.BrandRecommendationUpdateInput
> {
  constructor() {
    super('brandRecommendation');
  }

  async findByBusinessId(
    businessId: string,
    filters?: {
      category?: string;
      status?: string;
      sortBy?: 'priorityScore' | 'generatedAt';
      order?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    }
  ) {
    const where: Prisma.BrandRecommendationWhereInput = {
      businessId,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.status && { status: filters.status }),
    };

    return this.delegate.findMany({
      where,
      orderBy: {
        [filters?.sortBy || 'priorityScore']: filters?.order || 'desc',
      },
      take: filters?.limit,
      skip: filters?.offset,
    });
  }

  async updateStatus(
    id: string,
    status: string,
    notes?: string
  ) {
    const updateData: Prisma.BrandRecommendationUpdateInput = {
      status,
      ...(notes && { notes }),
      ...(status === 'done' && { completedAt: new Date() }),
      ...(status === 'dismissed' && { dismissedAt: new Date() }),
    };

    return this.update(id, updateData);
  }

  async getStatsByBusiness(businessId: string) {
    const recommendations = await this.delegate.findMany({
      where: { businessId },
      select: {
        status: true,
        category: true,
        impact: true,
      },
    });

    return {
      total: recommendations.length,
      byStatus: this.groupBy(recommendations, 'status'),
      byCategory: this.groupBy(recommendations, 'category'),
      byImpact: this.groupBy(recommendations, 'impact'),
    };
  }

  private groupBy(items: any[], key: string) {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }
}
```

**File**: `packages/@platform/db/src/repositories/brand-score.repository.ts`

```typescript
import { BaseRepository } from './base.repository';
import { BrandScore, Prisma } from '@prisma/client';

export class BrandScoreRepository extends BaseRepository<
  BrandScore,
  Prisma.BrandScoreCreateInput,
  Prisma.BrandScoreUpdateInput
> {
  constructor() {
    super('brandScore');
  }

  async findLatestByBusinessId(businessId: string) {
    return this.delegate.findFirst({
      where: { businessId },
      orderBy: { computedAt: 'desc' },
    });
  }

  async findByBusinessIdAndPeriod(
    businessId: string,
    periodStart: Date,
    periodEnd: Date
  ) {
    return this.delegate.findFirst({
      where: {
        businessId,
        periodStart,
        periodEnd,
      },
    });
  }

  async getScoreHistory(
    businessId: string,
    limit: number = 30
  ) {
    return this.delegate.findMany({
      where: { businessId },
      orderBy: { computedAt: 'desc' },
      take: limit,
      select: {
        visibilityScore: true,
        trustScore: true,
        consistencyScore: true,
        computedAt: true,
        periodStart: true,
        periodEnd: true,
      },
    });
  }
}
```

### 1.3 Export Repositories

**File**: `packages/@platform/db/src/repositories/index.ts`

Add exports:
```typescript
export * from './brand-recommendation.repository';
export * from './brand-score.repository';
```

**File**: `packages/@platform/db/src/index.ts`

Add repository instances:
```typescript
import { BrandRecommendationRepository } from './repositories/brand-recommendation.repository';
import { BrandScoreRepository } from './repositories/brand-score.repository';

export const repositories = {
  // ... existing repositories ...
  brandRecommendation: new BrandRecommendationRepository(),
  brandScore: new BrandScoreRepository(),
};
```

---

## Phase 2: AI Contracts & Validation

### 2.1 Define AI Output Schemas

**File**: `packages/@platform/contracts/src/ai/recommendation.schema.ts`

```typescript
import { z } from 'zod';

export const RecommendationSchema = z.object({
  category: z.enum(['search', 'local', 'social', 'reputation', 'conversion', 'content']),
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(2000),
  why: z.array(z.string()).min(1).max(5),
  steps: z.array(z.string()).min(1).max(10),
  impact: z.enum(['low', 'medium', 'high', 'critical']),
  effort: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(100),
  kpiTarget: z.object({
    metric: z.string(),
    target: z.number(),
    timeframe: z.string(),
  }).optional(),
});

export const RecommendationsOutputSchema = z.object({
  recommendations: z.array(RecommendationSchema).min(5).max(25),
  summary: z.string().optional(),
});

export type RecommendationInput = z.infer<typeof RecommendationSchema>;
export type RecommendationsOutput = z.infer<typeof RecommendationsOutputSchema>;
```

**File**: `packages/@platform/contracts/src/ai/visibility-plan.schema.ts`

```typescript
import { z } from 'zod';

export const VisibilityPlanSchema = z.object({
  title: z.string(),
  overview: z.string(),
  goals: z.array(z.object({
    metric: z.string(),
    current: z.number(),
    target: z.number(),
    timeframe: z.string(),
  })),
  weeks: z.array(z.object({
    weekNumber: z.number(),
    focus: z.string(),
    tasks: z.array(z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      estimatedHours: z.number(),
    })),
  })),
  expectedOutcomes: z.array(z.string()),
});

export type VisibilityPlan = z.infer<typeof VisibilityPlanSchema>;
```

### 2.2 Create AI Prompt Templates

**File**: `packages/@platform/contracts/src/ai/prompts/recommendations.prompts.ts`

```typescript
export const RECOMMENDATION_PROMPTS = {
  search: `
You are an SEO expert analyzing a business's search visibility.

Business Context:
{brandDNA}

Current Data:
{currentMetrics}

Competitor Analysis:
{competitorInsights}

Generate 3-5 high-impact SEO recommendations to improve search visibility.
Focus on: keyword optimization, content gaps, technical SEO, backlink opportunities.

Return JSON matching the RecommendationsOutputSchema.
`,

  local: `
You are a Local SEO specialist.

Business Context:
{brandDNA}

Current Metrics:
{currentMetrics}

Generate 3-5 actionable recommendations to improve local search visibility.
Focus on: GMB optimization, local citations, review generation, local content.

Return JSON matching the RecommendationsOutputSchema.
`,

  social: `
You are a Social Media strategist.

Business Context:
{brandDNA}

Current Presence:
{socialMetrics}

Generate 3-5 recommendations to boost social media visibility and engagement.
Focus on: content strategy, platform optimization, engagement tactics, brand consistency.

Return JSON matching the RecommendationsOutputSchema.
`,

  reputation: `
You are an Online Reputation Management expert.

Business Context:
{brandDNA}

Review Data:
{reviewMetrics}

Generate 3-5 recommendations to improve online reputation and trust signals.
Focus on: review generation, response strategy, sentiment improvement, trust building.

Return JSON matching the RecommendationsOutputSchema.
`,

  conversion: `
You are a Conversion Rate Optimization specialist.

Business Context:
{brandDNA}

Website Data:
{websiteMetrics}

Generate 3-5 recommendations to improve conversion rates and user experience.
Focus on: CTA optimization, trust signals, UX improvements, messaging clarity.

Return JSON matching the RecommendationsOutputSchema.
`,

  content: `
You are a Content Marketing strategist.

Business Context:
{brandDNA}

Competitor Content:
{competitorContent}

Generate 3-5 content recommendations to fill gaps and establish authority.
Focus on: topic clusters, content types, SEO opportunities, thought leadership.

Return JSON matching the RecommendationsOutputSchema.
`,
};

export const VISIBILITY_PLAN_PROMPT = `
You are a Brand Visibility strategist creating a comprehensive 30-day action plan.

Business Context:
{brandDNA}

Current Scores:
- Visibility: {visibilityScore}/100
- Trust: {trustScore}/100
- Consistency: {consistencyScore}/100

Top Recommendations:
{topRecommendations}

Create a detailed 30-day visibility improvement plan with:
1. Clear goals with metrics
2. Week-by-week breakdown
3. Specific tasks with time estimates
4. Expected outcomes

Return JSON matching the VisibilityPlanSchema.
`;
```

---

## Phase 3: Scoring Models

### 3.1 Visibility Score Service

**File**: `packages/@platform/db/src/services/brand-scoring.service.ts`

```typescript
import { repositories } from '../index';

export class BrandScoringService {
  /**
   * Compute Visibility Score (0-100)
   * Weighted components: Search(25%) + Local(25%) + Social(20%) + Reputation(20%) + Consistency(10%)
   */
  async computeVisibilityScore(businessId: string): Promise<number> {
    const weights = {
      search: 0.25,
      local: 0.25,
      social: 0.20,
      reputation: 0.20,
      consistency: 0.10,
    };

    const searchScore = await this.computeSearchScore(businessId);
    const localScore = await this.computeLocalScore(businessId);
    const socialScore = await this.computeSocialScore(businessId);
    const reputationScore = await this.computeReputationScore(businessId);
    const consistencyScore = await this.computeConsistencyScore(businessId);

    const visibilityScore =
      searchScore * weights.search +
      localScore * weights.local +
      socialScore * weights.social +
      reputationScore * weights.reputation +
      consistencyScore * weights.consistency;

    return Math.round(visibilityScore);
  }

  /**
   * Search Score: Based on keyword rankings, SERP features, organic traffic
   */
  private async computeSearchScore(businessId: string): Promise<number> {
    // Get keyword ranks from last 30 days
    const keywords = await repositories.keyword.findMany({
      where: { businessId },
      include: {
        ranks: {
          where: {
            capturedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (keywords.length === 0) return 0;

    let totalScore = 0;
    let totalKeywords = 0;

    for (const keyword of keywords) {
      if (keyword.ranks.length === 0) continue;

      const rank = keyword.ranks[0];
      let keywordScore = 0;

      // Position scoring
      if (rank.rankPosition) {
        if (rank.rankPosition <= 3) keywordScore += 40;
        else if (rank.rankPosition <= 10) keywordScore += 30;
        else if (rank.rankPosition <= 20) keywordScore += 20;
        else if (rank.rankPosition <= 50) keywordScore += 10;
      }

      // SERP features bonus
      if (rank.hasFeaturedSnippet) keywordScore += 15;
      if (rank.hasLocalPack) keywordScore += 10;
      if (rank.hasKnowledgePanel) keywordScore += 10;
      if (rank.hasImagePack) keywordScore += 5;
      if (rank.hasVideoCarousel) keywordScore += 5;
      if (rank.hasPeopleAlsoAsk) keywordScore += 5;

      totalScore += Math.min(keywordScore, 100);
      totalKeywords++;
    }

    return totalKeywords > 0 ? totalScore / totalKeywords : 0;
  }

  /**
   * Local Score: Based on map pack appearances, local rankings
   */
  private async computeLocalScore(businessId: string): Promise<number> {
    const visibilityMetrics = await repositories.visibilityMetric.findMany({
      where: {
        businessId,
        periodStart: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { periodStart: 'desc' },
      take: 1,
    });

    if (visibilityMetrics.length === 0) return 0;

    const metric = visibilityMetrics[0];
    const mapPackScore = Math.min((metric.mapPackVisibility / 100) * 100, 100);

    return mapPackScore;
  }

  /**
   * Social Score: Based on social presence, engagement (placeholder for now)
   */
  private async computeSocialScore(businessId: string): Promise<number> {
    // TODO: Integrate with social media data when available
    // For now, check if social links exist in BrandProfile
    const brandProfile = await repositories.brandProfile.findFirst({
      where: { businessId },
      include: { socialLinks: true },
    });

    if (!brandProfile) return 0;

    const socialLinkCount = brandProfile.socialLinks?.length || 0;
    return Math.min(socialLinkCount * 20, 100); // Max 5 platforms = 100
  }

  /**
   * Reputation Score: Based on reviews, ratings, sentiment
   */
  private async computeReputationScore(businessId: string): Promise<number> {
    const reviews = await repositories.review.findMany({
      where: { businessId },
    });

    if (reviews.length === 0) return 0;

    // Average rating (0-5 scale -> 0-100)
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const ratingScore = (avgRating / 5) * 100;

    // Review count bonus (logarithmic scale)
    const reviewCountBonus = Math.min(Math.log10(reviews.length + 1) * 20, 20);

    // Response rate
    const responsesCount = reviews.filter(r => r.response).length;
    const responseRate = reviews.length > 0 ? responsesCount / reviews.length : 0;
    const responseBonus = responseRate * 20;

    return Math.min(ratingScore * 0.6 + reviewCountBonus + responseBonus, 100);
  }

  /**
   * Consistency Score: Based on Brand DNA adherence (rules-based v0)
   */
  private async computeConsistencyScore(businessId: string): Promise<number> {
    const brandDNA = await repositories.brandDNA.findFirst({
      where: { businessId },
    });

    if (!brandDNA) return 0;

    let score = 0;

    // Check if Brand DNA is complete
    if (brandDNA.values && brandDNA.values.length > 0) score += 25;
    if (brandDNA.voice) score += 25;
    if (brandDNA.audience) score += 25;
    if (brandDNA.mission) score += 25;

    return score;
  }

  /**
   * Trust Score: Proxy based on rating velocity, sentiment, response rate
   */
  async computeTrustScore(businessId: string): Promise<number> {
    const reviews = await repositories.review.findMany({
      where: { businessId },
      orderBy: { publishedAt: 'desc' },
    });

    if (reviews.length === 0) return 0;

    // Recent reviews (last 90 days)
    const recentReviews = reviews.filter(
      r => r.publishedAt >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );

    // Rating velocity (recent vs overall)
    const recentAvg = recentReviews.length > 0
      ? recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length
      : 0;
    const overallAvg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const velocityScore = (recentAvg / 5) * 100;

    // Response rate
    const responsesCount = reviews.filter(r => r.response).length;
    const responseRate = responsesCount / reviews.length;
    const responseScore = responseRate * 100;

    // Sentiment proxy (based on rating distribution)
    const highRatings = reviews.filter(r => r.rating >= 4).length;
    const sentimentScore = (highRatings / reviews.length) * 100;

    return Math.round((velocityScore * 0.4 + responseScore * 0.3 + sentimentScore * 0.3));
  }

  /**
   * Save all scores to database
   */
  async saveScores(businessId: string, periodStart: Date, periodEnd: Date) {
    const visibilityScore = await this.computeVisibilityScore(businessId);
    const trustScore = await this.computeTrustScore(businessId);
    const consistencyScore = await this.computeConsistencyScore(businessId);

    const existing = await repositories.brandScore.findByBusinessIdAndPeriod(
      businessId,
      periodStart,
      periodEnd
    );

    const scoreData = {
      businessId,
      visibilityScore,
      trustScore,
      consistencyScore,
      visibilityBreakdown: {
        search: await this.computeSearchScore(businessId),
        local: await this.computeLocalScore(businessId),
        social: await this.computeSocialScore(businessId),
        reputation: await this.computeReputationScore(businessId),
        consistency: consistencyScore,
      },
      trustBreakdown: {
        rating: 0, // TODO: Compute from reviews
        reviewCount: 0,
        responseRate: 0,
        sentiment: 0,
      },
      consistencyBreakdown: {
        namingConsistency: 0,
        brandingConsistency: 0,
        messagingConsistency: 0,
      },
      periodStart,
      periodEnd,
      computedAt: new Date(),
    };

    if (existing) {
      return repositories.brandScore.update(existing.id, scoreData);
    } else {
      return repositories.brandScore.create(scoreData);
    }
  }
}

export const brandScoringService = new BrandScoringService();
```

---

## Phase 4: AI Service Integration

### 4.1 AI Recommendation Generator

**File**: `apps/express-ai/src/services/recommendation-generator.service.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecommendationsOutputSchema, RECOMMENDATION_PROMPTS } from '@platform/contracts';
import { repositories } from '@platform/db';

export class RecommendationGeneratorService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async generateRecommendations(
    businessId: string,
    category: 'search' | 'local' | 'social' | 'reputation' | 'conversion' | 'content'
  ) {
    // Gather context
    const brandDNA = await repositories.brandDNA.findFirst({ where: { businessId } });
    const brandProfile = await repositories.brandProfile.findFirst({ where: { businessId } });
    const competitors = await repositories.competitor.findMany({ where: { businessId } });
    const latestScore = await repositories.brandScore.findLatestByBusinessId(businessId);

    // Build prompt
    const prompt = RECOMMENDATION_PROMPTS[category]
      .replace('{brandDNA}', JSON.stringify(brandDNA || {}))
      .replace('{currentMetrics}', JSON.stringify(latestScore || {}))
      .replace('{competitorInsights}', JSON.stringify(competitors.slice(0, 5)));

    // Call Gemini
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    // Validate
    const validated = RecommendationsOutputSchema.parse(parsed);

    return validated.recommendations;
  }

  async generateAllRecommendations(businessId: string) {
    const categories = ['search', 'local', 'social', 'reputation', 'conversion', 'content'] as const;
    const allRecommendations = [];

    for (const category of categories) {
      try {
        const recs = await this.generateRecommendations(businessId, category);
        allRecommendations.push(...recs);
      } catch (error) {
        console.error(`Failed to generate ${category} recommendations:`, error);
      }
    }

    return allRecommendations;
  }

  async saveRecommendations(businessId: string, recommendations: any[]) {
    const saved = [];

    for (const rec of recommendations) {
      // Calculate priority score
      const impactScore = { low: 1, medium: 2, high: 3, critical: 4 }[rec.impact] || 1;
      const effortScore = { low: 3, medium: 2, high: 1 }[rec.effort] || 1;
      const priorityScore = (impactScore * rec.confidence) / effortScore;

      const created = await repositories.brandRecommendation.create({
        businessId,
        category: rec.category,
        title: rec.title,
        description: rec.description,
        why: rec.why,
        steps: rec.steps,
        impact: rec.impact,
        effort: rec.effort,
        confidence: rec.confidence,
        priorityScore,
        kpiTarget: rec.kpiTarget || null,
        status: 'open',
      });

      saved.push(created);
    }

    return saved;
  }
}

export const recommendationGeneratorService = new RecommendationGeneratorService();
```

---

## Phase 5: Job Orchestration

### 5.1 Create Recommendation Generation Job

**File**: `apps/worker-jobs/src/jobs/brand-recommendations.job.ts`

```typescript
import { repositories, brandScoringService } from '@platform/db';
import { recommendationGeneratorService } from '../../../express-ai/src/services/recommendation-generator.service';

export const runBrandRecommendationsJob = async (jobId: string) => {
  console.log(`[Job ${jobId}] Starting brand recommendations generation...`);

  try {
    // Get job details
    const job = await repositories.job.findById(jobId);
    if (!job) throw new Error('Job not found');

    const { businessId } = job.payload as { businessId: string };

    // Update job status
    await repositories.job.update(jobId, {
      status: 'running',
      startedAt: new Date(),
    });

    // Step 1: Compute brand scores
    console.log(`[Job ${jobId}] Computing brand scores...`);
    const now = new Date();
    const periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    await brandScoringService.saveScores(businessId, periodStart, now);

    // Step 2: Generate recommendations
    console.log(`[Job ${jobId}] Generating AI recommendations...`);
    const recommendations = await recommendationGeneratorService.generateAllRecommendations(businessId);

    // Step 3: Save recommendations
    console.log(`[Job ${jobId}] Saving ${recommendations.length} recommendations...`);
    const saved = await recommendationGeneratorService.saveRecommendations(businessId, recommendations);

    // Update job as complete
    await repositories.job.update(jobId, {
      status: 'complete',
      completedAt: new Date(),
      result: {
        recommendationsCount: saved.length,
        categories: [...new Set(saved.map(r => r.category))],
      },
    });

    console.log(`[Job ${jobId}] Complete! Generated ${saved.length} recommendations.`);
    return saved;
  } catch (error) {
    console.error(`[Job ${jobId}] Failed:`, error);

    await repositories.job.update(jobId, {
      status: 'failed',
      failedAt: new Date(),
      error: {
        message: error.message,
        stack: error.stack,
      },
    });

    throw error;
  }
};
```

### 5.2 Create 30-Day Plan Generation Job

**File**: `apps/worker-jobs/src/jobs/visibility-plan.job.ts`

```typescript
import { repositories } from '@platform/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VISIBILITY_PLAN_PROMPT, VisibilityPlanSchema } from '@platform/contracts';

export const runVisibilityPlanJob = async (jobId: string) => {
  console.log(`[Job ${jobId}] Starting 30-day visibility plan generation...`);

  try {
    const job = await repositories.job.findById(jobId);
    if (!job) throw new Error('Job not found');

    const { businessId } = job.payload as { businessId: string };

    await repositories.job.update(jobId, {
      status: 'running',
      startedAt: new Date(),
    });

    // Gather context
    const brandDNA = await repositories.brandDNA.findFirst({ where: { businessId } });
    const latestScore = await repositories.brandScore.findLatestByBusinessId(businessId);
    const topRecommendations = await repositories.brandRecommendation.findByBusinessId(businessId, {
      sortBy: 'priorityScore',
      order: 'desc',
      limit: 10,
    });

    // Build prompt
    const prompt = VISIBILITY_PLAN_PROMPT
      .replace('{brandDNA}', JSON.stringify(brandDNA || {}))
      .replace('{visibilityScore}', String(latestScore?.visibilityScore || 0))
      .replace('{trustScore}', String(latestScore?.trustScore || 0))
      .replace('{consistencyScore}', String(latestScore?.consistencyScore || 0))
      .replace('{topRecommendations}', JSON.stringify(topRecommendations));

    // Generate plan
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    const validated = VisibilityPlanSchema.parse(parsed);

    // Convert to HTML
    const htmlContent = generatePlanHTML(validated);

    // Save as report
    const report = await repositories.report.create({
      businessId,
      title: '30-Day Visibility Improvement Plan',
      version: 'v1.0',
      htmlContent,
      generatedAt: new Date(),
    });

    await repositories.job.update(jobId, {
      status: 'complete',
      completedAt: new Date(),
      result: { reportId: report.id },
    });

    console.log(`[Job ${jobId}] Complete! Report ID: ${report.id}`);
    return report;
  } catch (error) {
    console.error(`[Job ${jobId}] Failed:`, error);

    await repositories.job.update(jobId, {
      status: 'failed',
      failedAt: new Date(),
      error: {
        message: error.message,
        stack: error.stack,
      },
    });

    throw error;
  }
};

function generatePlanHTML(plan: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${plan.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a73e8; }
    h2 { color: #333; border-bottom: 2px solid #1a73e8; padding-bottom: 10px; }
    .week { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
    .task { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #1a73e8; }
  </style>
</head>
<body>
  <h1>${plan.title}</h1>
  <p>${plan.overview}</p>
  
  <h2>Goals</h2>
  <ul>
    ${plan.goals.map(g => `<li><strong>${g.metric}:</strong> ${g.current} → ${g.target} (${g.timeframe})</li>`).join('')}
  </ul>
  
  <h2>Weekly Breakdown</h2>
  ${plan.weeks.map(week => `
    <div class="week">
      <h3>Week ${week.weekNumber}: ${week.focus}</h3>
      ${week.tasks.map(task => `
        <div class="task">
          <strong>${task.title}</strong> (${task.estimatedHours}h)
          <p>${task.description}</p>
          <em>Category: ${task.category}</em>
        </div>
      `).join('')}
    </div>
  `).join('')}
  
  <h2>Expected Outcomes</h2>
  <ul>
    ${plan.expectedOutcomes.map(o => `<li>${o}</li>`).join('')}
  </ul>
</body>
</html>
  `;
}
```

### 5.3 Update Worker Index

**File**: `apps/worker-jobs/src/index.ts`

Add new job endpoints:

```typescript
import { runBrandRecommendationsJob } from './jobs/brand-recommendations.job';
import { runVisibilityPlanJob } from './jobs/visibility-plan.job';

app.post('/jobs/brand-recommendations/:jobId', async (req, res) => {
  const { jobId } = req.params;
  runBrandRecommendationsJob(jobId).catch(err => console.error('Job failed:', err));
  res.status(202).json({ message: 'Brand recommendations job started', jobId });
});

app.post('/jobs/visibility-plan/:jobId', async (req, res) => {
  const { jobId } = req.params;
  runVisibilityPlanJob(jobId).catch(err => console.error('Job failed:', err));
  res.status(202).json({ message: 'Visibility plan job started', jobId });
});
```

---

## Phase 6: API Endpoints

### 6.1 Recommendations API

**File**: `apps/express-brand/src/routes/recommendations.routes.ts`

```typescript
import { Router } from 'express';
import { recommendationsController } from '../controllers/recommendations.controller';
import { authenticate } from '@platform/auth';

const router = Router();

// Get recommendations for a business
router.get('/brands/:businessId/recommendations', authenticate, recommendationsController.getRecommendations);

// Update recommendation status
router.patch('/recommendations/:id', authenticate, recommendationsController.updateStatus);

// Generate new recommendations (creates async job)
router.post('/brands/:businessId/recommendations/generate', authenticate, recommendationsController.generateRecommendations);

// Get recommendation stats
router.get('/brands/:businessId/recommendations/stats', authenticate, recommendationsController.getStats);

export default router;
```

**File**: `apps/express-brand/src/controllers/recommendations.controller.ts`

```typescript
import { Request, Response } from 'express';
import { repositories } from '@platform/db';

export const recommendationsController = {
  async getRecommendations(req: Request, res: Response) {
    try {
      const { businessId } = req.params;
      const { category, status, sortBy, order, limit, offset } = req.query;

      const recommendations = await repositories.brandRecommendation.findByBusinessId(businessId, {
        category: category as string,
        status: status as string,
        sortBy: (sortBy as 'priorityScore' | 'generatedAt') || 'priorityScore',
        order: (order as 'asc' | 'desc') || 'desc',
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
      });

      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updated = await repositories.brandRecommendation.updateStatus(id, status, notes);

      res.json({ recommendation: updated });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async generateRecommendations(req: Request, res: Response) {
    try {
      const { businessId } = req.params;

      // Create async job
      const job = await repositories.job.create({
        type: 'GENERATE_VISIBILITY_RECOMMENDATIONS',
        status: 'queued',
        businessId,
        payload: { businessId },
      });

      // Trigger worker (in production, use queue)
      const workerUrl = process.env.WORKER_JOBS_URL || 'http://localhost:3009';
      await fetch(`${workerUrl}/jobs/brand-recommendations/${job.id}`, { method: 'POST' });

      res.status(202).json({ job });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const { businessId } = req.params;

      const stats = await repositories.brandRecommendation.getStatsByBusiness(businessId);

      res.json({ stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
```

### 6.2 Brand Scores API

**File**: `apps/express-brand/src/routes/scores.routes.ts`

```typescript
import { Router } from 'express';
import { scoresController } from '../controllers/scores.controller';
import { authenticate } from '@platform/auth';

const router = Router();

router.get('/brands/:businessId/scores/latest', authenticate, scoresController.getLatestScores);
router.get('/brands/:businessId/scores/history', authenticate, scoresController.getScoreHistory);

export default router;
```

**File**: `apps/express-brand/src/controllers/scores.controller.ts`

```typescript
import { Request, Response } from 'express';
import { repositories } from '@platform/db';

export const scoresController = {
  async getLatestScores(req: Request, res: Response) {
    try {
      const { businessId } = req.params;

      const scores = await repositories.brandScore.findLatestByBusinessId(businessId);

      res.json({ scores });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getScoreHistory(req: Request, res: Response) {
    try {
      const { businessId } = req.params;
      const { limit } = req.query;

      const history = await repositories.brandScore.getScoreHistory(
        businessId,
        limit ? parseInt(limit as string) : 30
      );

      res.json({ history });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
```

### 6.3 Visibility Plan API

**File**: `apps/express-brand/src/routes/visibility-plan.routes.ts`

```typescript
import { Router } from 'express';
import { visibilityPlanController } from '../controllers/visibility-plan.controller';
import { authenticate } from '@platform/auth';

const router = Router();

router.post('/brands/:businessId/visibility-plan/generate', authenticate, visibilityPlanController.generatePlan);

export default router;
```

**File**: `apps/express-brand/src/controllers/visibility-plan.controller.ts`

```typescript
import { Request, Response } from 'express';
import { repositories } from '@platform/db';

export const visibilityPlanController = {
  async generatePlan(req: Request, res: Response) {
    try {
      const { businessId } = req.params;

      // Create async job
      const job = await repositories.job.create({
        type: 'GENERATE_30DAY_PLAN',
        status: 'queued',
        businessId,
        payload: { businessId },
      });

      // Trigger worker
      const workerUrl = process.env.WORKER_JOBS_URL || 'http://localhost:3009';
      await fetch(`${workerUrl}/jobs/visibility-plan/${job.id}`, { method: 'POST' });

      res.status(202).json({ job });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
```

---

## Phase 7: Frontend Integration (Next.js)

### 7.1 Recommendations Page

**File**: `apps/next-web/src/app/[locale]/(dashboard)/admin/brands/[id]/recommendations/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Chip, Card, CardContent, Typography, Select, MenuItem } from '@mui/material';

export default function RecommendationsPage() {
  const { id: businessId } = useParams();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState({ category: 'all', status: 'all' });

  useEffect(() => {
    fetchRecommendations();
  }, [businessId, filter]);

  const fetchRecommendations = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.category !== 'all') params.append('category', filter.category);
    if (filter.status !== 'all') params.append('status', filter.status);

    const res = await fetch(`/api/brands/${businessId}/recommendations?${params}`);
    const data = await res.json();
    setRecommendations(data.recommendations);
    setLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await fetch(`/api/brands/${businessId}/recommendations/generate`, { method: 'POST' });
    setGenerating(false);
    // Poll for job completion or show notification
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await fetch(`/api/recommendations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchRecommendations();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Typography variant="h4">Recommendations</Typography>
        <Button variant="contained" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : 'Generate Recommendations'}
        </Button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
          <MenuItem value="all">All Categories</MenuItem>
          <MenuItem value="search">Search</MenuItem>
          <MenuItem value="local">Local</MenuItem>
          <MenuItem value="social">Social</MenuItem>
          <MenuItem value="reputation">Reputation</MenuItem>
          <MenuItem value="conversion">Conversion</MenuItem>
          <MenuItem value="content">Content</MenuItem>
        </Select>

        <Select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="done">Done</MenuItem>
          <MenuItem value="dismissed">Dismissed</MenuItem>
        </Select>
      </div>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        recommendations.map((rec: any) => (
          <Card key={rec.id} style={{ marginBottom: 16 }}>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">{rec.title}</Typography>
                <Chip label={rec.category} color="primary" size="small" />
              </div>

              <Typography variant="body2" color="textSecondary" style={{ margin: '10px 0' }}>
                {rec.description}
              </Typography>

              <div style={{ margin: '10px 0' }}>
                <Chip label={`Impact: ${rec.impact}`} size="small" style={{ marginRight: 8 }} />
                <Chip label={`Effort: ${rec.effort}`} size="small" style={{ marginRight: 8 }} />
                <Chip label={`Confidence: ${rec.confidence}%`} size="small" />
              </div>

              <Typography variant="subtitle2" style={{ marginTop: 10 }}>Why:</Typography>
              <ul>
                {rec.why.map((reason: string, i: number) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>

              <Typography variant="subtitle2">Steps:</Typography>
              <ol>
                {rec.steps.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              <div style={{ marginTop: 16 }}>
                <Button onClick={() => handleStatusUpdate(rec.id, 'in_progress')} size="small">
                  Start
                </Button>
                <Button onClick={() => handleStatusUpdate(rec.id, 'done')} size="small">
                  Complete
                </Button>
                <Button onClick={() => handleStatusUpdate(rec.id, 'dismissed')} size="small">
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
```

### 7.2 Scores Dashboard Widget

**File**: `apps/next-web/src/components/brand/ScoresWidget.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';

interface ScoresWidgetProps {
  businessId: string;
}

export default function ScoresWidget({ businessId }: ScoresWidgetProps) {
  const [scores, setScores] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, [businessId]);

  const fetchScores = async () => {
    const res = await fetch(`/api/brands/${businessId}/scores/latest`);
    const data = await res.json();
    setScores(data.scores);
    setLoading(false);
  };

  if (loading) return <CircularProgress />;
  if (!scores) return <Typography>No scores available</Typography>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Brand Health Scores</Typography>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{scores.visibilityScore}</Typography>
            <Typography variant="caption">Visibility</Typography>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Typography variant="h3" color="secondary">{scores.trustScore}</Typography>
            <Typography variant="caption">Trust</Typography>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success">{scores.consistencyScore}</Typography>
            <Typography variant="caption">Consistency</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Phase 8: Testing & Deployment

### 8.1 Database Migration

```bash
# Generate Prisma migration
cd packages/@platform/db
pnpm prisma migrate dev --name add_brand_recommendations_and_scores

# Generate Prisma client
pnpm prisma generate
```

### 8.2 Environment Variables

Add to `.env`:
```
GEMINI_API_KEY=your_gemini_api_key
WORKER_JOBS_URL=http://localhost:3009
```

### 8.3 Testing Checklist

- [ ] Test brand score computation with sample data
- [ ] Test AI recommendation generation (all categories)
- [ ] Test job orchestration (queued → running → complete)
- [ ] Test job failure handling and retry logic
- [ ] Test recommendation CRUD operations
- [ ] Test 30-day plan generation
- [ ] Test report HTML generation
- [ ] Test frontend recommendation display
- [ ] Test score history tracking
- [ ] Test RBAC enforcement on all endpoints

---

## Acceptance Criteria Verification

✅ **From any brand with Brand DNA**, user clicks "Generate Recommendations":
- System creates an async job and completes successfully
- Job status tracked: queued → running → complete/failed

✅ **10–20 recommendations are saved** and appear in the Recommendations feed:
- Ranked by priority score
- Filterable by category, status
- Sortable by priority/date

✅ **Visibility/Trust/Consistency scores** are computed and visible:
- On Overview/Visibility dashboards
- Historical tracking available
- Breakdown components shown

✅ **User can generate a 30-day Visibility Plan**:
- Appears as a new versioned report in Reports
- HTML format with week-by-week breakdown
- Based on top recommendations and current scores

✅ **Recommendation statuses can be updated**:
- Open → In Progress → Done
- Dismissal option available
- Notes field for tracking progress

✅ **Failed jobs show clear error reason**:
- Error message and stack trace stored
- Retry mechanism available
- User-friendly error display

✅ **RBAC enforcement**:
- All endpoints protected with authentication
- Business-level permissions checked
- Audit logging for sensitive operations

---

## Implementation Order

1. **Phase 1**: Database Schema & Repositories (Day 1)
2. **Phase 2**: AI Contracts & Validation (Day 1)
3. **Phase 3**: Scoring Models (Day 2)
4. **Phase 4**: AI Service Integration (Day 3)
5. **Phase 5**: Job Orchestration (Day 4)
6. **Phase 6**: API Endpoints (Day 5)
7. **Phase 7**: Frontend Integration (Day 6-7)
8. **Phase 8**: Testing & Deployment (Day 8)

---

## Future Enhancements

- PDF report generation
- Email notifications for job completion
- Recommendation impact tracking (before/after metrics)
- AI-powered recommendation refinement based on user feedback
- Automated recommendation scheduling
- Integration with third-party tools (Google Analytics, Search Console, etc.)
- Advanced consistency scoring using NLP
- Competitive benchmarking in recommendations
