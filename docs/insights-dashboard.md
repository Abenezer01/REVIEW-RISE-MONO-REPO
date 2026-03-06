# Insights Dashboard Architecture

The GBP Rocket Insights Dashboard provides a comprehensive view of a location's performance by tracking daily Google Business Profile metrics, analyzing photo views, mapping visibility signals, and managing local competitors.

## 1. Goal & Requirements
- **Goal:** Provide actionable performance trends over time and benchmark against competitors.
- **Key Features:**
  - Metrics schema for daily/weekly ingestion and backfilling.
  - KPI cards + trend charts (Impressions, Photo Views, Discovery vs. Direct).
  - Derived Visibility Signals (Profile Completeness, Photo Freshness) replacing static mocks.
  - Competitor list CRUD operations and comparison table.
  - Observability logs and job status tracking.

---

## 2. Core Data Models

The Insights Dashboard relies on three core Prisma models to track history without constantly hitting the GBP API:

### `LocationMetric` (`@@map("location_metrics")`)
Stores the daily snapshots of performance data.
- **Fields:** `locationId`, `date` (Unique together for UPSERTs), `impressionsTotal`, `impressionsDiscovery`, `impressionsDirect`, `photoViews`, `visibilityScore`.
- **Usage:** Used by the dashboard to power the LineChart (trends over 7/30/90 days), PieChart (search breakdown), and period-over-period percentage comparisons.

### `LocationCompetitor` (`@@map("location_competitors")`)
Stores the user-defined baseline competitors.
- **Fields:** `competitorName`, `rating`, `reviewCount`, `photoCount`, `estimatedVisibility`.
- **Usage:** Powers the "Competitor Baseline" table, providing a visual benchmark against the user's current profile metrics.

### `MetricJob` (`@@map("metric_jobs")`)
Provides observability for asynchronous sync processes.
- **Fields:** `jobType`, `status` (pending, success, failed), `errorMessage`, `startedAt`, `finishedAt`.
- **Usage:** Displayed in the "System Health" card to assure the user that their data is fresh and the automated ingestion pipeline is running.

---

## 3. Backend Architecture (`GbpMetricsService`)

The backend service (`apps/express-gbp-rocket/src/services/gbp-metrics.service.ts`) handles the heavy lifting of data aggregation.

- **`syncLocationMetrics(locationId)`:**
  1. Calls the Google Business Profile Performance API.
  2. Extracts daily metrics for impressions and photo views.
  3. Uses raw SQL (`$executeRawUnsafe`) with an `ON CONFLICT ("locationId", "date") DO UPDATE` clause to safely upsert the daily metrics.
  4. Records the outcome in the `metric_jobs` table.

- **`getLocationMetrics(locationId, days)`:**
  1. Fetches the metrics for the requested period (e.g., last 30 days) AND the previous equivalent period (e.g., days 31-60).
  2. Aggregates data into `totals` (sum of the current period).
  3. Calculates `percentChanges` by comparing the two periods (e.g., Impressions are +12% vs previous period).
  4. Returns a time-series array formatting the data points for UI charting (Recharts).

---

## 4. Frontend Architecture (`GbpInsightsDashboard.tsx`)

Located at `apps/next-web/.../gbp-rocket/_components/GbpInsightsDashboard.tsx`, this 700+ line component integrates the backend data into a responsive UI.

### Key Components:
1. **KPI Cards:** Top-level metrics (Total Impressions, Photo Views, Discovery Split, Visibility Score) displaying the current total and a green/red percent change indicator.
2. **Chart Deck (Recharts):**
   - **LineChart:** Shows the time-series impressions baseline. Toggling "Compare to previous period" overlays a dashed line representing the past.
   - **PieChart:** Visualizes the "Discovery vs Direct" raw counts and percentage split.
   - **BarChart:** Visualizes exact photo views dynamically.
3. **Visibility Signals:**
   Translates raw numeric data into actionable UI chips (Strong / Moderate / Weak).
   - *Example:* `Profile Completeness` is derived dynamically from `visibilityScore` (≥75 = Strong).
   - *Example:* `Photo Freshness` is derived from the period-over-period photo view percent change.
4. **Competitor Table & CRUD:**
   - Displays the user's `visibilityScore` anchored at the top row.
   - Lists the `LocationCompetitor` entries below.
   - Includes a fully wired **Add Competitor Dialog** and in-line Edit/Delete capabilities (using `PUT` and `DELETE` endpoints).

---

## 5. Security & Stability Considerations
- **Date/Timezones:** All metric dates are stored in standard UTC to avoid graphing misalignment on the frontend charts.
- **Caching:** Time-series data is computationally expensive to calculate period-over-period. The backend limits the scopes to robust, pre-defined windows (7d, 30d, 90d) tailored for specific dashboard views.
