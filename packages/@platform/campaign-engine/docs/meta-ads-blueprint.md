# Meta Ads Blueprint Engine (V4) - System Architecture

## 1. Executive Summary
The **Meta Ads Blueprint Engine** is an intelligent system designed to construct high-performing Facebook and Instagram campaigns. Unlike Google Ads (Search/Intent-based), this engine focuses on **Audience Discovery** and **Creative Impact**, leveraging Meta's machine learning capabilities through structured data inputs.

---

## 2. Core Architecture: The 4-Pillar Model

The engine operates on four key pillars to ensure comprehensive coverage of the social advertising ecosystem.

### Pillar 1: Audience Intelligence (`audience-builder.ts`)
*   **Philosophy**: "Broad but Guided". Meta's AI works best with room to breathe, but needs initial direction.
*   **Logic**:
    *   **Core Audiences**: Uses `Vertical Profile` data to inject high-relevance interests (e.g., "Home Improvement" for Plumbers).
    *   **Geo-Radius Logic**: Validates city/zip + radius to ensure service area coverage.
    *   **Lookalike Models**: Automatically builds 1% LALs (High Intent) and 5% LALs (Volume) if seed data exists.
    *   **Retargeting**: Auto-generates 30-day website visitor segments for "Safety Net" campaigns.

### Pillar 2: Creative Strategy (`creative-generator.ts`)
*   **Philosophy**: "Funnel-Matched Messaging".
*   **Logic**:
    *   **TOF (Top of Funnel)**: Hooks & Curiosity. *("Is your water heater making this noise?")*
    *   **MOF (Middle of Funnel)**: Benefits & Social Proof. *("Rated #1 in Austin. 500+ 5-Star Reviews.")*
    *   **BOF (Bottom of Funnel)**: Urgency & Offers. *("$50 Off First Service - Book Now.")*
    *   **Placements**: Maps assets dynamically to Feeds (1:1/4:5) vs. Stories/Reels (9:16).

### Pillar 3: Budget & Learning Intelligence (`budget-intelligence.ts`)
*   **The "50 Events" Rule**: Meta ad sets need ~50 conversion events per week to exit the "Learning Phase".
*   **Logic**:
    *   Calculates `MinWeeklySpend = TargetCPA * 50`.
    *   If `TotalBudget < MinWeeklySpend`, the engine consolidates ad sets to prevent "Learning Limited" status.
    *   **Split**: Typically allocates 70% to Prospecting and 30% to Retargeting (dynamic based on audience size).

### Pillar 4: Campaign Structure (`meta-blueprint-engine.ts`)
*   **Orchestration**:
    *   **CBO (Campaign Budget Optimization)**: Enabled by default for Prospecting to let Meta shift funds to the best audience.
    *   **ABO (Ad Set Budget Optimization)**: Used for Retargeting to ensure guaranteed delivery to warm leads.

---

## 3. Data Flow & Inputs

### Input (`CampaignInput`)
```json
{
  "businessName": "Austin Plumbing Pros",
  "vertical": "Local Service",
  "budget": 2000,
  "geo": "Austin, TX",
  "objective": "Leads"
}
```

### Output (`MetaCampaignPlan`)
```json
{
  "summary": { "estimatedReach": 45000, "recommendedBudget": "$2,000" },
  "adSets": [
    {
      "name": "Prospecting - Core Interests",
      "audience": { "interests": ["Home Improvement", "DIY"], "geo": "Austin + 25mi" },
      "budget": 1400,
      "creatives": [ ... ]
    },
    {
      "name": "Retargeting - All Visitors",
      "audience": { "retargeting": "30d PageView" },
      "budget": 600,
      "creatives": [ ... ]
    }
  ]
}
```

---

## 4. Key Configurations
*   **Vertical Profiles**: `src/config/vertical-profiles.ts` (Defines Interest Clusters).
*   **Benchmarks**: used to estimate Reach and CPM based on industry averages.
