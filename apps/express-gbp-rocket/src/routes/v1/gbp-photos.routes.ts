import { Router } from 'express';
import multer from 'multer';
import { gbpPhotosService } from '../../services/gbp-photos.service';
import { createSuccessResponse, createErrorResponse } from '@platform/contracts';
import { getPhotos, syncPhotos, uploadPhoto, deletePhoto } from '../../controllers/gbp-photos.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Endpoint to trigger a photo sync
router.post('/:locationId/photos/sync', async (req: any, res) => {
    try {
        const { locationId } = req.params;
        const result = await gbpPhotosService.syncLocationPhotos(locationId);
        const response = createSuccessResponse(result, 'Photos synced successfully', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Error syncing photos:', error);
        const errResp = createErrorResponse(error.message || 'Failed to sync photos', 'SYNC_ERROR', 500, { requestId: req.id });
        res.status(errResp.statusCode).json(errResp);
    }
});

// Endpoint to get photos for a location (paginated)
router.get('/:locationId/photos', async (req: any, res) => {
    try {
        const { locationId } = req.params;
        const { skip, take, category } = req.query;

        const result = await gbpPhotosService.getLocationPhotos(
            locationId,
            skip ? parseInt(skip as string) : undefined,
            take ? parseInt(take as string) : undefined,
            category as string | undefined
        );

        const response = createSuccessResponse(result.data, 'Photos fetched successfully', 200, {
            requestId: req.id,
            meta: result.meta
        });
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Error getting photos:', error);
        const errResp = createErrorResponse(error.message || 'Failed to get photos', 'FETCH_ERROR', 500, { requestId: req.id });
        res.status(errResp.statusCode).json(errResp);
    }
});

// Proxy endpoint to stream photo directly avoiding URL expiration
router.get('/:locationId/photos/proxy/:photoId', async (req: any, res) => {
    try {
        const { locationId, photoId } = req.params;
        const streamData = await gbpPhotosService.proxyPhotoStream(locationId, photoId);

        if (streamData.contentType) res.setHeader('Content-Type', streamData.contentType);
        if (streamData.contentLength) res.setHeader('Content-Length', streamData.contentLength);

        // Cache indefinitely at browser level, 24h is good enough
        res.setHeader('Cache-Control', 'public, max-age=86400');

        streamData.stream.pipe(res);
    } catch (error: any) {
        console.error('Error proxying photo:', error);
        res.status(500).send('Failed to proxy photo stream');
    }
});

// Endpoint to upload a photo
router.post('/:locationId/photos', upload.single('photo'), uploadPhoto);

// Endpoint to delete a photo
router.delete('/:locationId/photos/:photoId', deletePhoto);

export default router;
