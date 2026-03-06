# GBP Photos Architecture (Implemented)

The GBP Photos module is **already fully implemented** in the codebase. It successfully pulls a business location's photo library, stores metadata locally, and displays it in a performant React UI.

Here is the exact breakdown of how the existing implementation fulfills the core functional requirements.

## 1. Fetching Photos & Metadata
- **Backend Service:** `GbpPhotosService.syncLocationPhotos(locationId)` in `apps/express-gbp-rocket/src/services/gbp-photos.service.ts`.
- **Flow:** It connects to the GBP API `GET /v4/{gbpLocationName}/media`.
- **Metadata Captured:** It maps the API response to the local DB model, directly saving the `googleUrl`, `thumbnailUrl`, `category` (e.g., COVER, INTERIOR), `createTime`, `updateTime`, `sourceUrl`, and `attribution`.

## 2. Storing Photo References (Proxy Strategy)
Google’s raw photo URLs can expire or expose internal tokens if hotlinked directly on the frontend. 
- **Storage:** We do **not** download binary files. We store the references in the `LocationPhoto` Prisma table.
- **Proxy Strategy:** The backend provides a stream endpoint `GET /v1/:locationId/photos/proxy/:photoId`.
- **How it works:** `GbpPhotosService.proxyPhotoStream` fetches the raw image securely using the platform's active Google Access Token and pipes the binary stream directly to the Express `res` object.

## 3. Pagination, Limits & Caching
- **Ingestion Pagination:** The sync job uses `pageSize: 100` and iterates via `nextPageToken` until the entire library is downloaded.
- **UI Pagination:** The REST API `GET /v1/:locationId/photos` accepts `skip`, `take`, and `category` query parameters for cursor-free database pagination.
- **Caching:** The image proxy endpoint injects `res.setHeader('Cache-Control', 'public, max-age=86400')` (24 hours) to instruct the user's browser to aggressively cache the images, massively reducing server load for repeat visits.

## 4. Rate-Limit Friendly Fetch Behavior
The Google API restricts how fast you can download media lists.
- **Micro-delays:** Inside the `syncLocationPhotos` while-loop, the server calls `await sleep(1000)` between every page request.
- **429 Handling:** If a `429 Too Many Requests` is encountered, the service catches it, waits for 5 seconds (`await sleep(5000)`), and then retries the exact page.
- **Memory Batching:** It stores fetched photos in an array and flushes them to the DB using `LocationPhotoRepository.upsertPhotos` in chunks of `500` to prevent memory blowouts on accounts with 10k+ photos.

## 5. UI Implementation
- **Component:** `LocationPhotosGrid.tsx` in the frontend application.  
- **Features:** 
  - Uses `useGbpPhotos` hook to fetch data via SWR/React Query.
  - Implements category filtering (Interior, Food, Team, Exterior, Cover).
  - Displays images cleanly in a Masonry/Grid layout using the `getGbpPhotoProxyUrl` helper.
  - Contains a sidebar Drawer that opens onClick to display deeper metadata like resolution, source, and timestamps.
