import axios from 'axios';
import { locationPhotoRepository, locationRepository, prisma } from '@platform/db';
import { GbpPhotoCategory } from '@platform/contracts';
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
        const locationPhotoDelegate = (prisma as any).locationPhoto;

        if (!locationPhotoDelegate?.findFirst) {
            throw new Error('Photo storage is not available yet');
        }

        // Verify photo exists in DB and belongs to location
        // Here photoId must be reconstructed or matched. 
        // We assume photoId might be URL encoded or just the ID part.
        const dbPhoto = await locationPhotoDelegate.findFirst({
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

    /**
     * Uploads a photo to Google Business Profile and saves it to the local database
     */
    async uploadPhoto(locationId: string, file: Express.Multer.File, category: string) {
        const connection = await gbpProfileService.getConnection(locationId);

        if (!connection || connection.status !== 'active' || !connection.gbpLocationName) {
            throw new Error('Active Google PlatformIntegration connection with gbpLocationName not found for this location');
        }

        const accessToken = await gbpProfileService.getAccessToken(locationId);

        // 1. Start the upload process
        const startUploadUrl = `${GOOGLE_GBP_MEDIA_URL_BASE}/${connection.gbpLocationName}/media:startUpload`;
        const startRes = await axios.post(startUploadUrl, {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const resourceName = startRes.data.resourceName;
        if (!resourceName) {
            throw new Error('Failed to start media upload: resourceName is missing');
        }

        // 2. Upload the file bytes
        const uploadUrl = `https://mybusiness.googleapis.com/upload/v1/media/${resourceName}?upload_type=media`;
        await axios.post(uploadUrl, file.buffer, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': file.mimetype,
                'Content-Length': file.size.toString()
            }
        });

        // 3. Create the media item in Google Business Profile
        const createUrl = `${GOOGLE_GBP_MEDIA_URL_BASE}/${connection.gbpLocationName}/media`;
        const createRes = await axios.post(createUrl, {
            mediaFormat: 'PHOTO',
            locationAssociation: { category: category || GbpPhotoCategory.COVER },
            dataRef: { resourceName }
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const item = createRes.data;

        // 4. Save to local database
        const photoData: any = {
            id: item.name,
            locationId,
            accountId: connection.gbpAccountId as string,
            googleUrl: item.googleUrl,
            thumbnailUrl: item.thumbnailUrl,
            category: item.locationAssociation?.category || category,
            createTime: item.createTime ? new Date(item.createTime) : new Date(),
            updateTime: item.updateTime ? new Date(item.updateTime) : new Date(),
            sourceUrl: item.sourceUrl || null,
            attribution: item.attribution?.attributionName || null,
            mediaFormat: item.mediaFormat,
            lastSyncedAt: new Date(),
        };

        await locationPhotoRepository.upsertPhotos([photoData]);

        return photoData;
    }

    /**
     * Deletes a photo from Google Business Profile and the local database
     */
    async deletePhoto(locationId: string, photoId: string) {
        const connection = await gbpProfileService.getConnection(locationId);

        if (!connection || connection.status !== 'active' || !connection.gbpLocationName) {
            throw new Error('Active Google PlatformIntegration connection with gbpLocationName not found for this location');
        }

        const accessToken = await gbpProfileService.getAccessToken(locationId);

        try {
            // Delete from Google Business Profile
            const photoUrl = `${GOOGLE_GBP_MEDIA_URL_BASE}/${photoId}`;
            await axios.delete(photoUrl, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
        } catch (error: any) {
            // If it's already deleted (404), we can ignore it and just delete from our DB
            if (error.response?.status !== 404) {
                throw error;
            }
        }

        // Delete from local database
        await locationPhotoRepository.delete(photoId);

        return { success: true };
    }
}

export const gbpPhotosService = new GbpPhotosService();
