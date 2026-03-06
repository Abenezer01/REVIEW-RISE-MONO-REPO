# GBP Rocket — Audit Engine Documentation

**Service**: `apps/express-gbp-rocket`  
**Entry point**: `src/services/audit.service.ts`  
**Storage**: `GbpProfileAudit` (Prisma model, PostgreSQL)  
**REST API**: `GET|POST /v1/locations/:locationId/business-profile/snapshots/:snapshotId/audit`

---

## Overview

The audit engine evaluates a `GbpProfileSnapshot` against a set of weighted quality signals and produces a structured `AuditResult` that includes:

- A **total score** (0–100)
- A **breakdown** per dimension
- A **prioritised issues list** grouped by severity (`critical` / `warning` / `opportunity`)
- Rich metadata: category intelligence, photo quality details, keyword gap summary, photo improvement plan

Results are **upserted to the database** after each run so the same snapshot always returns the same result (reproducible), unless an explicit re-run is triggered.

---

## Scoring Rubric

| Dimension | Weight | Description |
|---|---|---|
| `completeness` | **25%** | Core profile fields present |
| `photoQuality` | **15%** | Photo count, types, recency, resolution |
| `description` | **15%** | Description quality rules |
| `keywordOptimization` | **15%** | Keyword gap vs. target keyword list |
| `media` | **10%** | Basic media presence (raw count signal) |
| `freshness` | **10%** | Last update recency |
| `categories` | **10%** | Category specificity and alignment |

**Total** = Σ (dimensionScore × weight / 100), clamped to [0, 100], rounded to nearest integer.

---

## V1 — Core Engine

The V1 modules are implemented directly inside `audit.service.ts`.

### 1. Completeness Scorer

Checks 7 required fields on the **normalized profile**. Each missing field generates an issue.

| Field | Severity | Impact Weight |
|---|---|---|
| `locationTitle` (Business Name) | critical | 10 |
| `category` (Primary Category) | critical | 10 |
| `address.formatted` | critical | 10 |
| `phone` | critical | 10 |
| `description` | critical | 10 |
| `website` | warning | 5 |
| `hours.periods` | warning | 5 |

**Score** = (presentCount / 7) × 100

Each issue contains:
- `code`: e.g. `missing_phone`
- `title`: e.g. `Missing Phone`
- `whyItMatters`: Contextual explanation
- `recommendation`: Actionable step
- `severity` + `impactWeight`

---

### 2. Description Analyser

Evaluates the profile's `description` field across four rules:

| Rule | Condition | Penalty | Severity |
|---|---|---|---|
| **Length – Critical** | `< 100 chars` | −40 pts | critical |
| **Length – Warning** | `< 250 chars` | −20 pts | warning |
| **Length – Too Long** | `> 750 chars` | −5 pts | opportunity |
| **CTA Missing** | None of: call, visit, book, contact, order | −10 pts | warning |
| **Service keyword** | Primary category not mentioned | −10 pts | opportunity |
| **Location keyword** | City/locality not mentioned | −10 pts | warning |

**Score** starts at 100 and deductions are applied. Floor is 0.

---

### 3. Freshness Evaluator

Determines the profile's **last update date** from:
1. `rawProfile.metadata.updateTime`
2. The most recent `media[].createTime` (whichever is later)

| Age | Penalty | Severity |
|---|---|---|
| > 180 days | −50 pts | critical — "Profile is Stale" |
| > 90 days | −20 pts | warning — "No Recent Updates" |
| No date found | 50 pts (neutral) | — |

---

## V2 — Extended Evaluators

V2 modules are **separate evaluator classes** in `src/services/audit-engine/`. They operate on both the normalized profile and the raw GBP API payload.

### 4. Category Evaluator (`category-evaluator.ts`)

Analyses the primary category for quality and alignment.

**Rule A — Generic Category Detection**  
Detects terms like: `Consultant`, `Business`, `Services`, `Company`, `Agency`

- Penalty: −30 pts
- Severity: `warning`
- Impact: 7
- Output: `suggestedCategories` with more specific alternatives

**Rule B — Category/Description Mismatch**  
If description mentions `seo` but category doesn't include `seo` or `internet marketing`:

- Penalty: −20 pts
- Severity: `opportunity`
- Impact: 6
- Suggests: `"Internet Marketing Service"`, `"SEO Agency"`

**Returns** an `intelligence` object (`CategoryIntelligence`):
```ts
{
  primaryCategory: string
  isGeneric: boolean
  suggestedAlternatives: string[]
}
```

---

### 5. Photo Quality Evaluator (`photo-evaluator.ts`)

Evaluates the `rawProfile.media[]` array across 4 dimensions.

| Rule | Condition | Penalty | Severity | Impact |
|---|---|---|---|---|
| **Count – Critical** | `< 5 photos` | −40 pts (quality) / −50 (basic) | critical | 9 |
| **Count – Warning** | `< 15 photos` | −20 pts / −20 (basic) | warning | 5 |
| **Missing Cover** | No `COVER` type | −20 pts | critical | 8 |
| **Missing Logo** | No `LOGO` type | −10 pts | warning | 6 |
| **Freshness – Critical** | No photo in last 6 months | −30 pts | critical | 8 |
| **Freshness – Warning** | No photo in last 90 days | −15 pts | warning | 5 |
| **Resolution** | Any photo `widthPixels < 720` | −10 pts | warning | 4 |

**Returns**:
- `score`: Photo quality score (0–100)
- `basicScore`: Media presence score (used for the `media` breakdown dimension)
- `improvementPlan`: Ordered list of action strings
- `details` (`PhotoQualityDetails`): `{ totalPhotos, hasCoverPhoto, hasLogo, recency: { last30Days, last30To90Days, older } }`

---

### 6. Keyword Gap Evaluator (`keyword-evaluator.ts`)

Compares a **target keyword list** against keywords extracted from the profile.

**Extraction (1-gram + 2-gram)**  
Source text = `description + category + serviceItems[].serviceTypeId`  
- Filters stop words: `this, that, with, from, your, have, best, and, the, for`
- Generates uni-grams and bi-grams from the cleaned token list

**Gap Analysis**  
For each target keyword not found in extracted keywords or raw text:
- Penalty: `100 / totalTargets` per missing keyword (capped at 10 pts each)
- Severity: `opportunity`
- Impact: 5

**Placement Guidance** (per missing keyword):
- If `description.length < 750` → suggest *Description*
- If `serviceItems` exist → suggest *Services*
- Always suggest *Posts*, *Q&A* as secondary options

**Returns**:
```ts
{
  score: number
  issues: AuditIssue[]
  gapSummary: {
    missingCount: number
    topPriorityKeywords: string[]   // top 5 missing
    extractedKeywords: string[]
  }
}
```

**Default target keywords** (used when none supplied via API):
`["SEO", "Marketing", "Consultant", "Agency", "Google Ads"]`

To pass custom keywords: `POST /audit` with body `{ "targetKeywords": ["coffee", "espresso", "wifi"] }`

---

## Data Model

```prisma
model GbpProfileAudit {
  id         String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  snapshotId String             @unique @db.Uuid
  score      Float              // 0–100 total score
  details    Json               // Full AuditResult serialised as JSON
  createdAt  DateTime           @default(now())
  updatedAt  DateTime           @updatedAt
  snapshot   GbpProfileSnapshot @relation(fields: [snapshotId], references: [id], onDelete: Cascade)
}
```

An **upsert** is performed after every audit run — so re-running an audit on the same snapshot always overwrites the previous result.

---

## API Reference

### GET `/v1/locations/:locationId/business-profile/snapshots/:snapshotId/audit`

Returns the stored audit result. If no audit exists yet, **automatically runs one** on the fly.

**Response** (200):
```json
{
  "data": {
    "snapshotId": "uuid",
    "totalScore": 74,
    "breakdown": { "completeness": 100, "description": 80, "media": 50, "freshness": 100, "categories": 70, "photoQuality": 60, "keywordOptimization": 80 },
    "groupedIssues": {
      "critical": [...],
      "warning": [...],
      "opportunity": [...]
    },
    "issues": [...],
    "keywordGapSummary": { "missingCount": 2, "topPriorityKeywords": ["..."], "extractedKeywords": ["..."] },
    "categoryIntelligence": { "primaryCategory": "...", "isGeneric": false, "suggestedAlternatives": [] },
    "photoQualityDetails": { "totalPhotos": 12, "hasCoverPhoto": true, "hasLogo": false, "recency": { ... } },
    "photoImprovementPlan": ["Upload your business logo.", "..."],
    "createdAt": "2026-03-02T..."
  }
}
```

### POST `/v1/locations/:locationId/business-profile/snapshots/:snapshotId/audit`

Forces a **fresh audit run** (overwrites any existing result).

**Body** (optional):
```json
{ "targetKeywords": ["coffee", "espresso", "wifi"] }
```

---

## Issue Schema

Every issue in `groupedIssues` and `issues` conforms to `AuditIssue`:

```ts
interface AuditIssue {
  code: string                          // e.g. "missing_phone", "desc_length_critical"
  severity: 'critical' | 'warning' | 'opportunity'
  title: string                         // Short display label
  whyItMatters: string                  // Customer-facing explanation
  recommendation: string               // Specific action to take
  impactWeight: number                 // 1–10, used to sort issues by priority
  nextAction?: string                  // Imperative CTA (e.g. "Upload your logo today")
  suggestedCategories?: string[]       // Category evaluator only
  recommendedPlacement?: string[]      // Keyword evaluator only (Description, Services, Posts, Q&A)
}
```

---

## Frontend Integration

| Component | Location |
|---|---|
| `AuditTab` | `apps/next-web/src/app/[locale]/(admin)/admin/gbp-rocket/_components/AuditTab.tsx` |
| `ScoreBreakdown` | `.../_components/ScoreBreakdown.tsx` |
| `SnapshotHistory` (wires AuditTab) | `.../_components/SnapshotHistory.tsx` |

**State flow in `AuditTab`**:
1. Mount → `fetchAudit()` (GET) → shows loading skeleton
2. If 404 / no stored audit → shows empty state with **Run Audit Now** button
3. User clicks → `runAudit()` (POST) → score + issues rendered
4. Next mount on same snapshot → cached result loads instantly (GET returns stored)

---

## Extending the Engine

To add a new evaluator:

1. Create `src/services/audit-engine/my-evaluator.ts`
2. Export a class with an `evaluate(profile, rawProfile): EvaluatorResult` method
3. Import and call it in `audit.service.ts` → `runAudit()`
4. Add its score to `AuditBreakdown` interface (both in `types.ts` and the frontend `AuditTab.tsx`)
5. Add a weight entry to `SCORING_WEIGHTS` (ensure all weights still sum to 100)
6. Add corresponding i18n keys in `en/gbp-rocket.json` and `ar/gbp-rocket.json`
