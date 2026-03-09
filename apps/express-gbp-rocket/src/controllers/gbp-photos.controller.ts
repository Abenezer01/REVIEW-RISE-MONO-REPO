import type { Request, Response } from 'express';
import { createErrorResponse, createSuccessResponse, SystemMessageCode } from '@platform/contracts';
import { gbpPhotosService } from '../services/gbp-photos.service';

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const getPhotos = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
        const take = req.query.take ? parseInt(req.query.take as string, 10) : 100;
        const category = req.query.category as string | undefined;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const result = await gbpPhotosService.getLocationPhotos(locationId, skip, take, category);

        const response = createSuccessResponse(result, 'GBP photos fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        const response = createErrorResponse(
            error?.message || 'Failed to fetch GBP photos',
            SystemMessageCode.INTERNAL_SERVER_ERROR,
            500,
            undefined,
            req.id
        );

        return res.status(response.statusCode).json(response);
    }
};

export const syncPhotos = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        await gbpPhotosService.syncLocationPhotos(locationId);

        const response = createSuccessResponse(null, 'GBP photos synced successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        const message = error?.message || 'Failed to sync GBP photos';
        const statusCode = 500;

        const response = createErrorResponse(
            message,
            SystemMessageCode.INTERNAL_SERVER_ERROR,
            statusCode,
            undefined,
            req.id
        );

        return res.status(response.statusCode).json(response);
    }
};
