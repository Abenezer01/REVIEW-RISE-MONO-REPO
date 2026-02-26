import axios from 'axios';
import { locationPhotoRepository, locationRepository, prisma } from '@platform/db';
import { gbpProfileService } from './gbp-profile.service';

const GOOGLE_GBP_MEDIA_URL_BASE = 'https://mybusiness.googleapis.com/v4';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class GbpPhotosService {

    /**
     * Sycns photos from Google Business Profile to the local database
     */
    async syncLocationPhotos(locationId: string) {
        const connection = await gbpProfileService.getConnection(locationId);

        if (!connection || connection.status !== 'active' || !connection.gbpLocationName) {
            throw new Error('Active Google PlatformIntegration connection with gbpLocationName not found for this location');
        }

        const accessToken = await gbpProfileService.getAccessToken(locationId);

        let pageToken: string | undefined;
        let syncedCount = 0;
        const photosToUpsert: any[] = [];

        do {
            const url = `${GOOGLE_GBP_MEDIA_URL_BASE}/${connection.gbpLocationName}/media`;
            const params: any = { pageSize: 100 };
            if (pageToken) {
                params.pageToken = pageToken;
            }

            try {
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params
                });

                const data = response.data;
                const mediaItems = data.mediaItems || [];

                for (const item of mediaItems) {
                    if (item.mediaFormat === 'PHOTO') {
                        photosToUpsert.push({
                            id: item.name, // e.g. "accounts/123/locations/456/media/789"
                            locationId,
                            accountId: connection.gbpAccountId,
                            googleUrl: item.googleUrl,
                            thumbnailUrl: item.thumbnailUrl,
                            category: item.locationAssociation?.category || null,
                            createTime: item.createTime ? new Date(item.createTime) : null,
                            updateTime: item.updateTime ? new Date(item.updateTime) : null,
                            sourceUrl: item.sourceUrl || null,
                            attribution: item.attribution?.attributionName || null,
                            mediaFormat: item.mediaFormat,
                            lastSyncedAt: new Date(),
                        });
                    }
                }

                pageToken = data.nextPageToken;

                // Rate Limiting: 1 request per second
                if (pageToken) {
                    await sleep(1000);
                }

                // If memory batch grows too large, flush it to DB
                if (photosToUpsert.length >= 500) {
                    await locationPhotoRepository.upsertPhotos(photosToUpsert);
                    syncedCount += photosToUpsert.length;
                    photosToUpsert.length = 0; // Clear array
                }

            } catch (error: any) {
                if (error.response?.status === 429) {
                    // Primitive backoff, wait 5 seconds and retry
                    await sleep(5000);
                    continue;
                }
                console.error(`Error fetching GBP photos for ${locationId}:`, error.response?.data || error.message);
                throw error;
            }

        } while (pageToken);

        // Flush remaining
        if (photosToUpsert.length > 0) {
            await locationPhotoRepository.upsertPhotos(photosToUpsert);
            syncedCount += photosToUpsert.length;
        }

        // Update Location's last sync time
        await locationRepository.update(locationId, { lastPhotoSyncAt: new Date() });

        return { syncedCount };
    }

    /**
     * Gets paginated photos from local DB for the UI
     */
    async getLocationPhotos(locationId: string, skip = 0, take = 100, category?: string) {
        const [photos, total] = await locationPhotoRepository.findByLocationId(locationId, { skip, take, category });
        const stats = await locationPhotoRepository.getStats(locationId);

        return {
            data: photos,
            meta: {
                total,
                skip,
                take,
                stats
            }
        };
    }

    /**
     * Proxy an image request to Google to avoid URL expiration and token exposure
     */
    async proxyPhotoStream(locationId: string, photoId: string) {
        const accessToken = await gbpProfileService.getAccessToken(locationId);

        // Verify photo exists in DB and belongs to location
        // Here photoId must be reconstructed or matched. 
        // We assume photoId might be URL encoded or just the ID part.
        const dbPhoto = await prisma.locationPhoto.findFirst({
            where: {
                locationId,
                id: { endsWith: photoId } // Safety match
            }
        });

        if (!dbPhoto) {
            throw new Error('Photo not found');
        }

        const response = await axios.get(dbPhoto.googleUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
            responseType: 'stream'
        });

        return {
            stream: response.data,
            contentType: response.headers['content-type'],
            contentLength: response.headers['content-length']
        };
    }
}

export const gbpPhotosService = new GbpPhotosService();
