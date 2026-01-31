import { Request, Response } from 'express';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse, ErrorCode } from '@platform/contracts';
import * as DashboardService from '../services/dashboard.service';

const overviewSchema = z.object({
    id: z.string().uuid(),
});


export const getOverview = async (req: Request, res: Response) => {
    try {
        const validation = overviewSchema.safeParse(req.params);

        if (!validation.success) {
             const errors = validation.error.flatten().fieldErrors;
             const response = createValidationErrorResponse(errors, req.id);
             return res.status(response.statusCode).json(response);
        }

        const { id } = validation.data;
        const data = await DashboardService.getBrandOverview(id);

        const response = createSuccessResponse(data, 'Overview data fetched successfully', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error fetching overview:', error);
        const response = createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const getVisibility = async (req: Request, res: Response) => {
    try {
        const paramsValidation = z.string().uuid().safeParse(req.params.id);
        const queryValidation = z.enum(['7d', '30d', '90d']).optional().safeParse(req.query.range);

        if (!paramsValidation.success || !queryValidation.success) {
             const response = createErrorResponse('Invalid parameters', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id);
             return res.status(response.statusCode).json(response);
        }

        const businessId = req.params.id;
        const range = (req.query.range as '7d' | '30d' | '90d') || '30d';

        const data = await DashboardService.getVisibilityMetrics(businessId, range);

        const response = createSuccessResponse(data, 'Visibility metrics fetched successfully', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (error: any) {
         // eslint-disable-next-line no-console
        console.error('Error fetching visibility:', error);
        const response = createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};
