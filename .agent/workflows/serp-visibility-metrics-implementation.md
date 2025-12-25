---
description: SERP Visibility Metrics & Heatmaps Implementation Plan
---

# SERP Visibility Metrics & Heatmaps - Implementation Plan

## 🎯 Objective
Compute and surface SERP visibility metrics and heatmaps to help businesses track their search engine presence across tracked keywords.

## 📋 Pass Conditions
- ✅ Visibility metrics (Map Pack % and organic presence) are computed and stored for at least one account
- ✅ SERP feature presence flags are visible for relevant rank rows
- ✅ Share of Voice output is documented and returned via an API endpoint
- ✅ Heatmap UI renders correctly and updates with different filters (keyword set or location)

---

## 🏗️ Phase 1: Database Schema Design & Migration

### Step 1.1: Design Database Schema
**Goal**: Define the data models needed to store rank tracking, keyword data, and computed metrics.

**Actions**:
- Review existing schema in `packages/@platform/db/prisma/schema.prisma`
- Design new models for:
  - `Keyword` - Track keywords associated with businesses/locations
  - `KeywordRank` - Store rank data snapshots (position, SERP features, etc.)
  - `VisibilityMetric` - Store computed visibility metrics over time
  - `SerpFeature` - Enumeration or tracking of SERP features (Map Pack, Featured Snippet, FAQ, etc.)

**Schema additions**:
```prisma
// Keyword tracking
model Keyword {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  businessId      String    @db.Uuid
  locationId      String?   @db.Uuid
  keyword         String
  searchVolume    Int?      // Monthly search volume
  difficulty      Float?    // Keyword difficulty score (0-100)
  tags            String[]  // Categories/grouping
  status          String    @default("active") // active, paused, archived
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?
  
  business        Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)
  location        Location? @relation(fields: [locationId], references: [id], onDelete: SetNull)
  ranks           KeywordRank[]
  
  @@index([businessId])
  @@index([locationId])
  @@index([status])
}

// Historical rank data
model KeywordRank {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  keywordId             String    @db.Uuid
  rankPosition          Int?      // Organic rank position (null if not ranked in top 100)
  mapPackPosition       Int?      // Position in Map Pack (1-3, null if not present)
  
  // SERP features presence
  hasFeaturedSnippet    Boolean   @default(false)
  hasPeopleAlsoAsk      Boolean   @default(false)
  hasLocalPack          Boolean   @default(false)
  hasKnowledgePanel     Boolean   @default(false)
  hasImagePack          Boolean   @default(false)
  hasVideoCarousel      Boolean   @default(false)
  
  // URL that ranked
  rankingUrl            String?
  
  // Location/device context
  searchLocation        String?   // City, Country, or coordinate
  device                String    @default("desktop") // desktop, mobile, tablet
  
  // Metadata
  capturedAt            DateTime  @default(now())
  createdAt             DateTime  @default(now())
  
  keyword               Keyword   @relation(fields: [keywordId], references: [id], onDelete: Cascade)
  
  @@index([keywordId])
  @@index([capturedAt])
}

// Aggregated visibility metrics (computed)
model VisibilityMetric {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  businessId            String    @db.Uuid
  locationId            String?   @db.Uuid
  
  // Time period this metric covers
  periodStart           DateTime
  periodEnd             DateTime
  periodType            String    // daily, weekly, monthly
  
  // Map Pack visibility
  mapPackAppearances    Int       @default(0)
  totalTrackedKeywords  Int       @default(0)
  mapPackVisibility     Float     @default(0) // Percentage (0-100)
  
  // Organic rankings
  top3Count             Int       @default(0)
  top10Count            Int       @default(0)
  top20Count            Int       @default(0)
  
  // Share of Voice (weighted by search volume)
  shareOfVoice          Float     @default(0) // Percentage (0-100)
  
  // SERP feature counts
  featuredSnippetCount  Int       @default(0)
  localPackCount        Int       @default(0)
  
  // Metadata
  computedAt            DateTime  @default(now())
  createdAt             DateTime  @default(now())
  
  business              Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)
  location              Location? @relation(fields: [locationId], references: [id], onDelete: SetNull)
  
  @@unique([businessId, locationId, periodStart, periodEnd, periodType])
  @@index([businessId])
  @@index([locationId])
  @@index([periodStart, periodEnd])
}
```

### Step 1.2: Update Business and Location Models
**Goal**: Add relations to new models.

**Actions**:
- Add relations in `Business` model: `keywords Keyword[]`, `visibilityMetrics VisibilityMetric[]`
- Add relations in `Location` model: `keywords Keyword[]`, `visibilityMetrics VisibilityMetric[]`

### Step 1.3: Create and Run Migration
**Goal**: Apply schema changes to database.

**Actions**:
```bash
cd packages/@platform/db
pnpm prisma migrate dev --name add_serp_visibility_tracking
pnpm prisma generate
```

---

## 🏗️ Phase 2: Database Repositories & Data Access Layer

### Step 2.1: Create Keyword Repository
**File**: `packages/@platform/db/src/repositories/keyword.repository.ts`

**Methods**:
- `create(data)` - Create new keyword
- `findById(id)` - Get keyword by ID
- `findByBusiness(businessId, filters?)` - Get all keywords for a business
- `findByLocation(locationId, filters?)` - Get all keywords for a location
- `update(id, data)` - Update keyword
- `delete(id)` - Soft delete keyword
- `getActiveKeywords(businessId)` - Get active tracked keywords

### Step 2.2: Create KeywordRank Repository
**File**: `packages/@platform/db/src/repositories/keyword-rank.repository.ts`

**Methods**:
- `create(data)` - Record new rank snapshot
- `createBatch(data[])` - Bulk insert rank data
- `findByKeyword(keywordId, filters?)` - Get rank history for a keyword
- `findLatestRanks(keywordIds[])` - Get most recent rank for each keyword
- `findRanksBetween(keywordId, startDate, endDate)` - Get ranks in date range
- `getAveragePosition(keywordId, startDate, endDate)` - Calculate avg position

### Step 2.3: Create VisibilityMetric Repository
**File**: `packages/@platform/db/src/repositories/visibility-metric.repository.ts`

**Methods**:
- `create(data)` - Store computed metric
- `findByBusiness(businessId, filters?)` - Get metrics for business
- `findByPeriod(businessId, periodType, startDate, endDate)` - Get metrics in range
- `getLatestMetric(businessId, locationId?, periodType)` - Get most recent metric
- `upsert(data)` - Insert or update metric (to recompute)

### Step 2.4: Export Repositories
**File**: `packages/@platform/db/src/repositories/index.ts`

**Actions**:
- Export `KeywordRepository`
- Export `KeywordRankRepository`
- Export `VisibilityMetricRepository`

---

## 🏗️ Phase 3: Computation Services & Business Logic

### Step 3.1: Create Visibility Computation Service
**File**: `packages/@platform/db/src/services/visibility-computation.service.ts` or in a new service app

**Methods**:

#### `computeMapPackVisibility(businessId, locationId?, startDate, endDate)`
**Logic**:
1. Get all active keywords for the business/location
2. Get all rank snapshots in the date range
3. Count keywords with `mapPackPosition IS NOT NULL`
4. Calculate percentage: `(mapPackAppearances / totalTrackedKeywords) * 100`

#### `computeOrganicPresence(businessId, locationId?, startDate, endDate)`
**Logic**:
1. Get all rank snapshots in date range
2. Count keywords in:
   - Top 3: `rankPosition <= 3`
   - Top 10: `rankPosition <= 10`
   - Top 20: `rankPosition <= 20`
3. Return counts and percentages

#### `computeShareOfVoice(businessId, locationId?, startDate, endDate)`
**Logic**:
1. Get all keywords with search volume
2. For each keyword, get latest rank position
3. Apply position-to-CTR conversion (industry standard curve):
   - Position 1: ~31% CTR
   - Position 2: ~15% CTR
   - Position 3: ~10% CTR
   - Decay exponentially
4. Calculate weighted score: `sum(searchVolume * CTR_for_position) / sum(searchVolume)` * 100
5. Return as percentage

#### `trackSerpFeatures(businessId, locationId?, startDate, endDate)`
**Logic**:
1. Get all rank snapshots
2. Count occurrences of each SERP feature
3. Return aggregated counts

#### `computeAllMetrics(businessId, locationId?, periodType, periodStart, periodEnd)`
**Logic**:
1. Call all computation methods above
2. Aggregate results into a single `VisibilityMetric` object
3. Upsert to database
4. Return the metric

### Step 3.2: Create Scheduled Computation Job
**File**: `apps/worker-jobs/src/jobs/compute-visibility-metrics.job.ts`

**Logic**:
1. Run daily (cron: `0 2 * * *` - 2 AM)
2. Get all active businesses with tracked keywords
3. For each business:
   - Compute daily metrics for yesterday
   - Compute weekly metrics (if end of week)
   - Compute monthly metrics (if end of month)
4. Log results and errors

**Queue Integration**:
- Add job to BullMQ in `@platform/queues`
- Define job type in contracts

---

## 🏗️ Phase 4: API Endpoints (Backend)

### Step 4.1: Create Express Service for SEO/Visibility
**Option A**: Extend `express-seo-health` service
**Option B**: Create new `express-serp-visibility` service

**Decision**: Use `express-seo-health` since it's already SEO-focused

### Step 4.2: Create Routes
**File**: `apps/express-seo-health/src/routes/visibility.routes.ts`

**Endpoints**:
```typescript
GET    /api/visibility/metrics          - Get visibility metrics with filters
GET    /api/visibility/share-of-voice   - Get Share of Voice data
GET    /api/visibility/serp-features    - Get SERP feature presence data
GET    /api/visibility/heatmap          - Get heatmap data (keyword x time/location)
GET    /api/keywords                    - List tracked keywords
POST   /api/keywords                    - Add new keyword to track
PUT    /api/keywords/:id                - Update keyword
DELETE /api/keywords/:id                - Remove keyword from tracking
GET    /api/keywords/:id/ranks          - Get rank history for a keyword
POST   /api/keywords/bulk               - Bulk add keywords
```

### Step 4.3: Create Controllers
**File**: `apps/express-seo-health/src/controllers/visibility.controller.ts`

**Methods**:
- `getMetrics(req, res)` - Query and return visibility metrics
- `getShareOfVoice(req, res)` - Return SOV calculation
- `getSerpFeatures(req, res)` - Return SERP feature data
- `getHeatmapData(req, res)` - Return formatted heatmap data

**File**: `apps/express-seo-health/src/controllers/keyword.controller.ts`

**Methods**:
- `listKeywords(req, res)`
- `createKeyword(req, res)`
- `updateKeyword(req, res)`
- `deleteKeyword(req, res)`
- `getKeywordRanks(req, res)`
- `bulkCreateKeywords(req, res)`

### Step 4.4: Add DTOs to @platform/contracts
**File**: `packages/@platform/contracts/src/dtos/visibility.dto.ts`

**Types**:
```typescript
export interface VisibilityMetricDTO {
  id: string;
  businessId: string;
  locationId?: string;
  periodStart: string;
  periodEnd: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  mapPackVisibility: number;
  top3Count: number;
  top10Count: number;
  top20Count: number;
  shareOfVoice: number;
  featuredSnippetCount: number;
  totalTrackedKeywords: number;
}

export interface ShareOfVoiceDTO {
  businessId: string;
  shareOfVoice: number;
  breakdown: Array<{
    keyword: string;
    searchVolume: number;
    position: number;
    contribution: number;
  }>;
}

export interface HeatmapDataDTO {
  keywords: string[];
  periods: string[];
  data: number[][]; // 2D array of metric values
  metric: 'rank' | 'visibility' | 'sov';
}

export interface KeywordDTO {
  id: string;
  businessId: string;
  locationId?: string;
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  tags: string[];
  status: string;
  currentRank?: number;
  mapPackPosition?: number;
}
```

---

## 🏗️ Phase 5: Frontend UI Components

### Step 5.1: Create API Client Methods
**File**: `apps/next-web/src/lib/api/visibility.api.ts`

**Methods**:
```typescript
export const visibilityApi = {
  getMetrics: (params: VisibilityQueryParams) => apiClient.get('/visibility/metrics', { params }),
  getShareOfVoice: (businessId: string, params?: any) => apiClient.get('/visibility/share-of-voice', { params }),
  getSerpFeatures: (params: any) => apiClient.get('/visibility/serp-features', { params }),
  getHeatmapData: (params: HeatmapQueryParams) => apiClient.get('/visibility/heatmap', { params }),
};

export const keywordApi = {
  list: (businessId: string) => apiClient.get('/keywords', { params: { businessId } }),
  create: (data: CreateKeywordDTO) => apiClient.post('/keywords', data),
  update: (id: string, data: UpdateKeywordDTO) => apiClient.put(`/keywords/${id}`, data),
  delete: (id: string) => apiClient.delete(`/keywords/${id}`),
  getRanks: (id: string, params?: any) => apiClient.get(`/keywords/${id}/ranks`, { params }),
  bulkCreate: (data: CreateKeywordDTO[]) => apiClient.post('/keywords/bulk', data),
};
```

### Step 5.2: Create Visibility Dashboard Page
**File**: `apps/next-web/src/app/[locale]/(protected)/seo/visibility/page.tsx`

**Components**:
- Header with date range picker
- KPI cards showing:
  - Map Pack Visibility %
  - Top 3 Keywords Count
  - Top 10 Keywords Count
  - Share of Voice %
- Tabs for different views:
  - Overview
  - Keywords
  - Heatmap
  - SERP Features

### Step 5.3: Create Heatmap Component
**File**: `apps/next-web/src/components/seo/visibility-heatmap.tsx`

**Features**:
- Use a charting library (e.g., Recharts, D3, or specialized heatmap library)
- X-axis: Time periods OR locations
- Y-axis: Keywords
- Color scale: Rank position (green = top 3, yellow = top 10, red = 11+, gray = not ranked)
- Tooltips showing exact rank and SERP features
- Filters:
  - Date range
  - Location
  - Keyword tags/groups
  - Metric type (rank, visibility, SOV contribution)

**Library recommendation**: Use `react-heatmap-grid` or `@nivo/heatmap`

### Step 5.4: Create Metrics Chart Components
**File**: `apps/next-web/src/components/seo/visibility-metrics-chart.tsx`

**Charts**:
- Line chart showing visibility % over time
- Bar chart for organic presence distribution (top 3/10/20)
- Pie chart for SERP features distribution
- Trend indicators (up/down arrows with % change)

### Step 5.5: Create Keywords Management Component
**File**: `apps/next-web/src/components/seo/keywords-table.tsx`

**Features**:
- Data table with columns:
  - Keyword
  - Search Volume
  - Current Rank
  - Map Pack Position
  - SERP Features (chips/badges)
  - Trend (sparkline or indicator)
  - Actions (edit, delete)
- Add keyword button → modal/drawer
- Bulk import keywords (CSV upload)
- Filter by tags, status, rank range
- Sort by any column

### Step 5.6: Create SERP Features Display
**File**: `apps/next-web/src/components/seo/serp-features-badges.tsx`

**Features**:
- Badge/chip for each SERP feature
- Icons for each feature type
- Color coding (blue for owned, gray for present but not owned)
- Tooltip with explanation

---

## 🏗️ Phase 6: Data Ingestion & Integration

### Step 6.1: Create Rank Data Ingestion Endpoint
**File**: `apps/express-seo-health/src/controllers/rank-ingestion.controller.ts`

**Purpose**: Accept rank data from external rank tracking tools or scrapers

**Endpoint**:
```typescript
POST /api/ranks/ingest
{
  "keywords": [
    {
      "keywordId": "uuid",
      "rankPosition": 5,
      "mapPackPosition": null,
      "serpFeatures": {
        "hasFeaturedSnippet": false,
        "hasLocalPack": true,
        ...
      },
      "rankingUrl": "https://example.com/page",
      "capturedAt": "2025-12-20T22:00:00Z"
    }
  ]
}
```

**Validation**:
- Ensure keyword exists and belongs to authenticated business
- Validate rank positions (1-100 or null)
- Validate SERP feature flags

### Step 6.2: Integration Options

**Option A: Manual CSV Upload**
- UI for uploading CSV with rank data
- Parse and validate CSV
- Bulk insert via `KeywordRankRepository.createBatch()`

**Option B: External API Integration**
- Connect to rank tracking APIs (SEMrush, Ahrefs, BrightLocal, etc.)
- Create scheduled job to fetch and sync ranks daily
- Store API credentials securely per business

**Option C: Internal Scraper**
- Build scraper service to check ranks (use with caution - respect rate limits)
- Use SERP APIs (SerpApi, DataForSEO, etc.)
- Schedule periodic checks

**Recommendation**: Start with Option A (manual upload) and Option B (API integration) for MVP

### Step 6.3: Trigger Metric Computation After Ingestion
**Logic**:
After rank data is ingested:
1. Identify affected business/location
2. Queue a job to recompute metrics for the relevant period
3. Update frontend via websocket or polling

---

## 🏗️ Phase 7: Testing & Validation

### Step 7.1: Create Seed Data
**File**: `packages/@platform/db/scripts/seed-visibility-data.ts`

**Data to seed**:
- 1 test business
- 5-10 test keywords with varied search volumes
- 30 days of rank data with varying positions
- Mix of SERP features

### Step 7.2: Unit Tests
**Files**:
- `visibility-computation.service.test.ts` - Test all computation logic
- `keyword.repository.test.ts` - Test CRUD operations
- `visibility-metric.repository.test.ts` - Test metric storage

**Test cases**:
- Map Pack visibility calculation correctness
- Share of Voice weighted calculation
- SERP feature counting
- Edge cases (no ranks, all #1 ranks, missing search volumes)

### Step 7.3: Integration Tests
**Files**:
- `visibility.routes.test.ts` - Test API endpoints
- `visibility-computation-job.test.ts` - Test scheduled job

### Step 7.4: Manual Testing Checklist
- [ ] Add keywords via UI
- [ ] Upload rank data CSV
- [ ] Verify metrics are computed
- [ ] Check all metrics API endpoints return correct data
- [ ] Verify Share of Voice calculation
- [ ] Test heatmap rendering with filters
- [ ] Test date range selection
- [ ] Test location filtering
- [ ] Verify SERP feature badges display
- [ ] Test keyword management (CRUD)

---

## 🏗️ Phase 8: Documentation & Deployment

### Step 8.1: API Documentation
**File**: `apps/express-seo-health/README.md`

**Document**:
- All endpoint URLs and methods
- Request/response formats with examples
- Query parameters and filters
- Authentication requirements
- Rate limits

### Step 8.2: User Guide
**File**: `docs/user-guides/serp-visibility-tracking.md`

**Contents**:
- How to add keywords
- How to import rank data
- Understanding visibility metrics
- How to read the heatmap
- Share of Voice explanation
- SERP features glossary

### Step 8.3: Build & Deploy
**Actions**:
```bash
# Build all packages
pnpm build:all

# Run migrations in production
cd packages/@platform/db
pnpm prisma migrate deploy

# Deploy services (Docker/K8s)
# Update deployment configs as needed
```

### Step 8.4: Monitor & Iterate
**Monitoring**:
- Set up logging for computation jobs
- Track API response times
- Monitor database query performance
- Set up alerts for failed computations

---

## 📊 Pass Condition Validation

### ✅ Condition 1: Visibility metrics computed and stored
**Validation**:
```sql
SELECT * FROM "VisibilityMetric" WHERE "businessId" = '<test-business-id>' LIMIT 1;
```
Should return at least one row with valid `mapPackVisibility`, `top3Count`, `top10Count`, `shareOfVoice`.

### ✅ Condition 2: SERP feature presence visible
**Validation**:
- Query API: `GET /api/keywords/:id/ranks`
- Check response includes boolean flags for SERP features
- Verify UI displays badges/chips for features

### ✅ Condition 3: Share of Voice via API
**Validation**:
- Query API: `GET /api/visibility/share-of-voice?businessId=<id>`
- Response should include:
  - Overall SOV percentage
  - Breakdown by keyword with contribution scores
- Document in API README

### ✅ Condition 4: Heatmap UI renders and filters work
**Validation**:
- Navigate to `/seo/visibility` page
- Verify heatmap displays with keyword x time grid
- Change date range → heatmap updates
- Change location filter → heatmap updates
- Change keyword tag filter → heatmap updates

---

## 🚀 Recommended Execution Order

1. **Phase 1** (Steps 1.1 → 1.3): Database schema - Foundation
2. **Phase 2** (Steps 2.1 → 2.4): Repositories - Data access
3. **Phase 6.1**: Rank ingestion endpoint - Need data to compute
4. **Phase 6.3**: Seed test data - Create sample data
5. **Phase 3** (Steps 3.1 → 3.2): Computation services - Business logic
6. **Phase 4** (Steps 4.1 → 4.4): API endpoints - Expose data
7. **Phase 5** (Steps 5.1 → 5.6): Frontend UI - Visualization
8. **Phase 7** (Steps 7.1 → 7.4): Testing - Quality assurance
9. **Phase 8** (Steps 8.1 → 8.4): Documentation & deployment

---

## 🛠️ Technology Stack Summary

- **Database**: PostgreSQL + Prisma ORM
- **Backend**: Express + TypeScript
- **Frontend**: Next.js + React
- **Charts**: Recharts / Nivo / D3
- **Jobs**: BullMQ + Redis
- **Testing**: Jest + Supertest
- **Deployment**: Docker + Kubernetes

---

## 📝 Notes

- **Search Volume Data**: Consider integrating with Google Keyword Planner API or third-party services
- **Rank Tracking Frequency**: Balance cost vs. freshness (daily is standard)
- **Data Retention**: Define retention policy for historical ranks (e.g., keep daily for 90 days, weekly for 1 year)
- **Multi-location**: Design supports multiple locations per business
- **Caching**: Consider caching computed metrics (Redis) to reduce DB load
- **Real-time Updates**: Use WebSockets to push updates when new ranks are ingested

---

**Total Estimated Effort**: 3-4 weeks (1 developer)
- Phase 1-2: 3 days
- Phase 3: 4 days
- Phase 4: 3 days
- Phase 5: 7 days
- Phase 6: 3 days
- Phase 7: 3 days
- Phase 8: 2 days