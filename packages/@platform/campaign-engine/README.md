# @platform/campaign-engine

The **Campaign Plan Engine** is a deterministic logic core designed to convert raw business inputs into a sophisticated, multi-channel advertising strategy. It standardizes how campaign structures are generated across different industry verticals, ensuring consistent, best-practice strategy application.

## 🚀 What It Does

This engine takes three simple inputs:
1.  **Vertical** (e.g., SaaS, E-commerce, Local Service)
2.  **Objective** (e.g., Leads, Sales, Awareness)
3.  **Budget** (Monthly Ad Spend)

And outputs a **Campaign Plan JSON** containing:
*   **Channel Mix**: Percentage split between Google, Meta, LinkedIn, etc.
*   **Campaign Structure**: Specific campaigns for Awareness, Consideration, and Conversion stages.
*   **Messaging Strategy**: Recommended angles and CTAs for each stage.
*   **Budget Allocation**: Exact spend per campaign.
*   **Warnings**: Strategic flags (e.g., "Budget too small for full funnel").

## ⚙️ How It Works

The engine operates in 4 sequential phases:

### 1. Vertical Profiling
It first looks up the "Vertical Profile".
*   *Example*: **E-commerce** requires a "Top-Heavy" funnel (40% Awareness) to drive new demand.
*   *Example*: **Local Service** requires a "Bottom-Heavy" funnel (70% Conversion) to capture high-intent "near me" searches.

### 2. Channel Selection
It maps the **Objective** to the best performing channels.
*   **Leads** → Heavily prioritizes **Google Search**.
*   **Awareness** → Heavily prioritizes **Meta (IG/FB)** & **TikTok**.
*   *Heuristic*: If Vertical is **SaaS** and Objective is **Leads**, it automatically mixes in **LinkedIn**.

### 3. Budget Tiering & Calibration
It analyzes the **Budget** to determine complexity.
*   **Small (<$1k)**: "Consolidation Mode". Forces 1 campaign per channel, focuses strictly on Conversion/Retargeting to maximize ROI.
*   **Medium/Large**: "Full Funnel Mode". Splits budget across Awareness, Consideration, and Conversion layers allows for finer segmentation.

### 4. Funnel Generation
It builds the specific nodes (campaigns) based on the inputs above.
*   **Awareness Layer**: Focuses on "Story" & "Reach".
*   **Consideration Layer**: Focuses on "Social Proof" & "USPs".
*   **Conversion Layer**: Focuses on "Offer" & "Urgency".

## 🏗️ Architecture & Integration

This package is a **Shared Logic Library**. It is designed to be consumed by the **Ad-Rise Microservice** (`apps/express-ad-rise`).

### Why separate the package?
*   **Pure Logic**: The engine contains no HTTP, Database, or Framework code. It is easily unit-tested and verified.
*   **Reusability**: Can be imported by scripts, CLI tools, or other services if needed.
*   **Clean Architecture**: `apps/express-ad-rise` handles the API, Authentication, and Persistence, while this package handles the *Business Logic* of campaign strategy.

### Integration Flow
1. User requests a campaign via API (`POST /campaigns/plan`).
2. `apps/express-ad-rise` receives the request.
3. Service calls `generateCampaignPlan(input)` from this package.
4. Service saves the result to DB and returns it to the Frontend.

## 📦 Usage


```typescript
import { generateCampaignPlan } from '@platform/campaign-engine';

const input = {
  vertical: 'SaaS',       // Industry
  objective: 'Leads',     // Goal
  budget: 5000,           // $5k Monthly
  currency: 'USD'
};

const plan = generateCampaignPlan(input);

console.log(plan);
```

### Example Output (Simplified)

```json
{
  "summary": {
    "goal": "Maximize Leads for SaaS",
    "funnelSplit": { "awareness": 0.3, "consideration": 0.3, "conversion": 0.4 }
  },
  "channels": [
    { "channel": "Google Search", "allocationPercentage": 0.6, "budget": 3000 },
    { "channel": "LinkedIn", "allocationPercentage": 0.4, "budget": 2000 }
  ],
  "campaigns": [
    {
      "name": "Google Search - SaaS - Conversion",
      "budget": 1200,
      "stage": "Conversion",
      "description": "Risk Reversal (No CC required) | Target: High Intent"
    },
    // ... more campaigns
  ],
  "execution_steps": [
    "Connect Google Ads Account",
    "Setup Conversion Actions (Leads/Purchases)",
    "Create Search Campaign Structure",
    "Connect LinkedIn Campaign Manager",
    "Install Insight Tag"
  ],
  "optimization_schedule": [
    "Day 3: Check for zero-impression ads and broken links.",
    "Day 7: Bid adjustment review. Pause keywords/ads with high CPA.",
    "Day 14: Refresh creative for low-performing ad groups. Review Search Terms report.",
    "Day 30: Full Monthly Performance Review & Funnel Analysis."
  ]
}
```

## 🛠️ Configuration

Logic is centrally managed in:
*   `src/config/vertical-profiles.ts`: Industry definitions.
*   `src/engine/channel-selector.ts`: Objective-to-Channel mapping rules.
*   `src/engine/budget-allocator.ts`: Budget tier thresholds.
