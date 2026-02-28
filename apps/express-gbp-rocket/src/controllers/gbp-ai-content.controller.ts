import type { Request, Response } from 'express';
import { createErrorResponse, createSuccessResponse, SystemMessageCode } from '@platform/contracts';
import { gbpAiContentService } from '../services/gbp-ai-content.service';

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const allowedTypes = new Set([
    'business_description',
    'service_descriptions',
    'category_recommendations',
    'post_generator',
    'qa_suggestions'
]);

export const generateAiContent = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const type = req.body?.type as string;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        if (!allowedTypes.has(type)) {
            const badRequest = createErrorResponse('Invalid AI content type', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const data = await gbpAiContentService.generate(locationId, type as any, req.body?.input || {});
        const response = createSuccessResponse(data, 'GBP AI content generated successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        const message = error?.message || 'Failed to generate GBP AI content';
        const statusCode = message.includes('Location not found') ? 404 : 500;
        const code = statusCode === 404 ? SystemMessageCode.NOT_FOUND : SystemMessageCode.INTERNAL_SERVER_ERROR;
        const response = createErrorResponse(message, code, statusCode, undefined, req.id);
        return res.status(response.statusCode).json(response);
    }
};

export const saveAiSuggestion = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const type = req.body?.type as string;
        const item = req.body?.item;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        if (!allowedTypes.has(type) || !item) {
            const badRequest = createErrorResponse('Invalid suggestion payload', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const data = await gbpAiContentService.saveSuggestion(locationId, { type: type as any, item });
        const response = createSuccessResponse(data, 'GBP AI suggestion saved successfully', 201, { requestId: req.id }, SystemMessageCode.SUCCESS);
        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        const message = error?.message || 'Failed to save GBP AI suggestion';
        const statusCode = message.includes('Location not found') ? 404 : 500;
        const code = statusCode === 404 ? SystemMessageCode.NOT_FOUND : SystemMessageCode.INTERNAL_SERVER_ERROR;
        const response = createErrorResponse(message, code, statusCode, undefined, req.id);
        return res.status(response.statusCode).json(response);
    }
};
