# AI-Guided Budget Optimization Engine: Technical Documentation

## 1. Overview
The **Budget Allocator** transforms a raw monthly budget (e.g., $3,000) into a granular, ROI-optimized investment strategy for every single Ad Group. It moves beyond simple "even split" logic to prioritize high-intent, bottom-of-funnel opportunities while protecting awareness layers.

---

## 2. Allocation Philosophy: "Bottom-Up" Intelligence
Unlike legacy systems that assign budgets to Campaigns first (e.g., "Give 20% to Brand"), our engine calculates the "worth" of every individual **Ad Group** first, then sums them up to determine Campaign budgets.

### The Problem with Top-Down
*   If you assign 50% to a "General" campaign but it has 20 ad groups, they all starve.
*   If you assign 50% to "Brand" but it has 1 ad group, it overspends.

### Our Solution: Weighted Additive Scoring
Every Ad Group competes for budget based on a sophisticated scoring model:

```typescript
Final Score = (0.5 × FunnelScore) + (0.3 × IntentScore) + (0.2 × DensityScore)
```

#### A. Funnel Score (50% Weight)
Where is the user in the buying journey?
*   **BOF (Bottom of Funnel)**: **10 points**. *Ready to buy.*
*   **MOF (Middle of Funnel)**: **6 points**. *Considering options.*
*   **TOF (Top of Funnel)**: **3 points**. *Researching problem.*

#### B. Intent Score (30% Weight)
How urgent/valuable is the specific keyword theme?
*   **High (Brand/Emergency)**: **10 points**.
*   **Medium (Service/Commercial)**: **7 points**.
*   **Low (Problem/Info)**: **4 points**.

#### C. Density Score (20% Weight)
How many keywords are in this group? Larger groups need more "fuel."
*   Score = `(KeywordCount / 20) * 10` (Capped at 10)

---

## 3. ROI & Financial Modeling
Once the budget is allocated, the engine projects the **financial outcome** for each group using Vertical Intelligence.

### Inputs
*   **Vertical Benchmarks**: Sourced from `vertical-profiles.ts` (e.g., Local Service BOF CVR = 15%).
*   **Average CPC**: Real-time market data or vertical average.

### Formulas
1.  **Estimated Clicks**: `Budget / AvgCPC`
2.  **Estimated Conversions**: `Est. Clicks × Vertical_CVR`
3.  **Estimated CPA (Cost Per Acquisition)**: `Budget / Est. Conversions`

*Note: For low-volume groups (<1 conversion), the engine falls back to a "Target CPA" display to avoid showing confusing metrics like "$1,500 CPA".*

---

## 4. Learning Phase Protection
Google Ads requires a minimum data volume to optimize (exit "Learning Phase"). The engine flags ad groups that are at risk of starving the AI.

| Status | Threshold | Meaning | Action |
| :--- | :--- | :--- | :--- |
| 🟢 **Healthy** | >5 Conversions OR >100 Clicks | Sufficient data for Smart Bidding. | **Target CPA / Max Conv** |
| 🟡 **Risk** | <5 Conversions AND >30 Clicks | Low volume, optimization may be slow. | **Max Clicks** recommended initially. |
| 🔴 **Starved** | <30 Clicks/mo | Insufficient data. | **Warning**: Increase budget or merge groups. |

---

## 5. Campaign Structure Logic (The "Tier" System)
To prevent budget fragmentation, the number of campaigns is strictly controlled by total budget:

*   **<$1,000 (Simple)**: **1 Campaign**. Consolidates all data.
*   **$1,000 - $5,000 (Standard)**: **2 Campaigns**. (Brand Protection + General Leads).
*   **>$5,000 (Segmented)**: **3+ Campaigns**. (Brand + High Intent + Research).
