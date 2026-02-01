import { Request, Response } from 'express';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';
import * as ContentService from '../services/content.service';

const contentSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    platform: z.string().min(1),
    status: z.string().optional(),
});

export const list = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const content = await ContentService.listContent(businessId);
        const response = createSuccessResponse(content, 'Content fetched', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const validation = contentSchema.safeParse(req.body);
        if(!validation.success) {
            const errorResponse = createErrorResponse('Invalid inputs', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }
        
        const result = await ContentService.createContent(businessId, validation.data);
        const response = createSuccessResponse(result, 'Content created', 201, { requestId: req.id }, SystemMessageCode.ITEM_CREATED);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const contentId = req.params.contentId;
        const validation = contentSchema.partial().safeParse(req.body);
        
        if(!validation.success) {
             const errorResponse = createErrorResponse('Invalid inputs', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
             return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const result = await ContentService.updateContent(contentId, businessId, validation.data);
        const response = createSuccessResponse(result, 'Content updated', 200, { requestId: req.id }, SystemMessageCode.ITEM_UPDATED);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const contentId = req.params.contentId;
        await ContentService.deleteContent(contentId, businessId);
        const response = createSuccessResponse(null, 'Content removed', 200, { requestId: req.id }, SystemMessageCode.ITEM_DELETED);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};
