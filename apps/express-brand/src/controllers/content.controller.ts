import { Request, Response } from 'express';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import * as ContentService from '../services/content.service';

const contentSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    platform: z.string().min(1),
    status: z.string().optional(),
});

export const list = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const content = await ContentService.listContent(businessId);
        res.json(createSuccessResponse(content, 'Content fetched', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const create = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const validation = contentSchema.safeParse(req.body);
        if(!validation.success) {
            return res.status(400).json(createErrorResponse('Invalid inputs', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }
        
        const result = await ContentService.createContent(businessId, validation.data);
        res.json(createSuccessResponse(result, 'Content created', 201, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const update = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const contentId = req.params.contentId;
        const validation = contentSchema.partial().safeParse(req.body);
        
        if(!validation.success) {
             return res.status(400).json(createErrorResponse('Invalid inputs', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }

        const result = await ContentService.updateContent(contentId, businessId, validation.data);
        res.json(createSuccessResponse(result, 'Content updated', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const remove = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const contentId = req.params.contentId;
        await ContentService.deleteContent(contentId, businessId);
        res.json(createSuccessResponse(null, 'Content removed', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};
