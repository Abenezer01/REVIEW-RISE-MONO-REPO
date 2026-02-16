# Google Ads Blueprint Engine (V4) - System Architecture

## 1. Executive Summary
The **Blueprint Engine V4** is an autonomous system that transforms a business URL and 5-6 keywords into a production-ready Google Ads account structure. It uses a **deterministic rule engine** for core structure (safety/performance) augmented by an **LLM enhancement layer** for creative polish.

---

## 2. Core Architecture: The 5-Layer Model

The engine processes input through five distinct layers, ensuring that every campaign is built on solid fundamentals before creative assets are generated.

### Layer 1: Strategy Engine (`blueprint-strategy-engine.ts`)
*   **Input**: Budget, Industry, Goals.
*   **Logic**:
    *   Determines **Campaign Structure** (Simple vs. Standard vs. Segmented) based on budget thresholds.
    *   Selects **Bid Strategy** (Max Conversions vs. Max Clicks) based on historical data.
    *   Calculates **Click Capacity** to prevent budget starvation.

### Layer 2: Keyword Intelligence (`keyword-clustering-engine.ts`)
*   **Input**: Raw keywords (approx 5-10).
*   **Logic**:
    *   **Semantic Expansion**: Generates 100+ related terms.
    *   **Intent Clustering**: Groups keywords by user intent (e.g., "Emergency" vs. "Price" vs. "DIY").
    *   **Funnel Mapping**: Assigns every cluster to a funnel stage (TO/MO/BOF).

### Layer 3: Ad Group Construction (`ad-group-builder.ts`)
*   **Input**: Keyword Clusters.
*   **Logic**:
    *   Converts clusters into **SKAG-Hybrid Ad Groups** (Single Keyword Ad Groups + Semantic Matches).
    *   Generates **Match Types** (Phrase/Exact) based on intent confidence.
    *   **Asset Generation**: Creates 15 Headlines & 4 Descriptions per group using `rsa-copy-generator.ts`.
    *   *Constraint*: Ensures every ad group has at least 3 unique headlines and 2 unique descriptions.

### Layer 4: Budget & ROI Engine (`budget-allocator.ts`)
*   **Input**: Ad Groups + Total Budget.
*   **Logic**: [See Budget Engine Docs](./budget-engine.md)
*   **Output**: Dollar amount, %, and estimated ROI for every single ad group.

### Layer 5: AI Enhancement (`ai-enhancer.ts`)
*   **Input**: The "Skeleton Plan" from Layers 1-4.
*   **Logic**:
    *   Passes the plan to an LLM (Gemini/GPT-4) with a "Reviewer Persona".
    *   **Refines Copy**: Rewrites generic headlines to be more persuasive.
    *   **Expands Keywords**: Finds lateral thinking keywords the rule engine missed.
    *   **Validates**: Ensures character limits (30/90) are strictly enforced.

---

## 3. Key Concepts & Definitions

| Concept | Definition | Current Implementation |
| :--- | :--- | :--- |
| **Funnel Splits** | How budget is divided by intent. | Dynamic based on vertical (e.g., Local Service = 70% BOF). |
| **Safety Net** | Prevents wasted spend. | Global Negative Keyword Lists automatically applied based on vertical. |
| **Vertical Profile** | Configurations for specific industries. | `vertical-profiles.ts` contains CPC, CVR, and Negative Lists for 6+ industries. |

---

## 4. Input/Output Data Flow

### Input (`CampaignInput`)
```json
{
  "businessName": "Austin Plumbing Pros",
  "vertical": "Local Service",
  "budget": 3000,
  "geo": "Austin, TX",
  "offer": "10% Off First Service"
}
```

### Output (`CampaignPlan`)
```json
{
  "summary": { "budgetTier": "Standard", "clickCapacity": 240 },
  "campaigns": [
    { "name": "Brand Protection", "budget": "14%" },
    { "name": "General Leads", "budget": "86%" }
  ],
  "adGroups": [
    {
      "name": "Emergency Plumbing",
      "budgetAllocation": { "amount": 308, "estimatedConversions": 4 },
      "assets": { ... }
    }
  ]
}
```
