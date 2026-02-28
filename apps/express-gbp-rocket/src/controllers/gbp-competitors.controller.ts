import type { Request, Response } from 'express';
import { createErrorResponse, createSuccessResponse, SystemMessageCode } from '@platform/contracts';
import { gbpCompetitorsService } from '../services/gbp-competitors.service';

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const getCompetitors = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const data = await gbpCompetitorsService.getCompetitors(locationId);
        const response = createSuccessResponse(data, 'Competitors fetched successfully', 200, { requestId: req.id });
        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('getCompetitors error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error?.message, req.id);
        return res.status(response.statusCode).json(response);
    }
};

export const addCompetitor = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const { competitorName, rating, reviewCount, photoCount, estimatedVisibility } = req.body;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        if (!competitorName) {
            const badRequest = createErrorResponse('competitorName is required', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const data = await gbpCompetitorsService.addCompetitor(locationId, competitorName, rating, reviewCount, photoCount, estimatedVisibility);
        const response = createSuccessResponse(data, 'Competitor added successfully', 201, { requestId: req.id });
        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('addCompetitor error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error?.message, req.id);
        return res.status(response.statusCode).json(response);
    }
};

export const updateCompetitor = async (req: Request, res: Response) => {
    try {
        const { locationId, competitorId } = req.params;

        if (!isUuid(locationId) || !isUuid(competitorId)) {
            const badRequest = createErrorResponse('Invalid locationId or competitorId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const data = await gbpCompetitorsService.updateCompetitor(competitorId, locationId, req.body);
        const response = createSuccessResponse(data, 'Competitor updated successfully', 200, { requestId: req.id });
        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('updateCompetitor error:', error);
        const statusCode = error.message === 'Competitor not found' ? 404 : 500;
        const response = createErrorResponse(error.message || 'Internal server error', statusCode === 404 ? SystemMessageCode.NOT_FOUND : SystemMessageCode.INTERNAL_SERVER_ERROR, statusCode, undefined, req.id);
        return res.status(response.statusCode).json(response);
    }
};

export const removeCompetitor = async (req: Request, res: Response) => {
    try {
        const { locationId, competitorId } = req.params;

        if (!isUuid(locationId) || !isUuid(competitorId)) {
            const badRequest = createErrorResponse('Invalid locationId or competitorId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const success = await gbpCompetitorsService.removeCompetitor(competitorId, locationId);
        if (!success) {
            const notFound = createErrorResponse('Competitor not found', SystemMessageCode.NOT_FOUND, 404, undefined, req.id);
            return res.status(notFound.statusCode).json(notFound);
        }

        const response = createSuccessResponse({ success: true }, 'Competitor removed successfully', 200, { requestId: req.id });
        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('removeCompetitor error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error?.message, req.id);
        return res.status(response.statusCode).json(response);
    }
};
