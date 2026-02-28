import type { Request, Response } from 'express';
import { createErrorResponse, createSuccessResponse, SystemMessageCode } from '@platform/contracts';
import { gbpMetricsService } from '../services/gbp-metrics.service';

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const getMetrics = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const { start_date, end_date, granularity = 'daily', compare = 'false' } = req.query;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        if (!start_date || !end_date) {
            const badRequest = createErrorResponse('start_date and end_date are required', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const data = await gbpMetricsService.getLocationMetrics(
            locationId,
            start_date as string,
            end_date as string,
            granularity as 'daily' | 'weekly',
            compare === 'true'
        );

        const response = createSuccessResponse(data, 'Metrics fetched successfully', 200, { requestId: req.id });
        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('getMetrics error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error?.message, req.id);
        return res.status(response.statusCode).json(response);
    }
};

export const syncMetrics = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const data = await gbpMetricsService.ingestLocationMetrics(locationId);
        const response = createSuccessResponse(data, 'Metrics synced successfully', 200, { requestId: req.id });
        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('syncMetrics error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error?.message, req.id);
        return res.status(response.statusCode).json(response);
    }
};

export const backfillMetrics = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const { start_date, end_date } = req.body;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        if (!start_date || !end_date) {
            const badRequest = createErrorResponse('start_date and end_date are required', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const data = await gbpMetricsService.backfillLocationMetrics(locationId, start_date, end_date);
        const response = createSuccessResponse(data, 'Backfill completed', 200, { requestId: req.id });
        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('backfillMetrics error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error?.message, req.id);
        return res.status(response.statusCode).json(response);
    }
};

export const getJobStatus = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const data = await gbpMetricsService.getLatestJobStatus(locationId);
        const response = createSuccessResponse(data, 'Job status fetched successfully', 200, { requestId: req.id });
        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('getJobStatus error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error?.message, req.id);
        return res.status(response.statusCode).json(response);
    }
};
