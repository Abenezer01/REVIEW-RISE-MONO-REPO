import { Request, Response } from 'express';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import * as CompetitorService from '../services/competitor.service';

const addSchema = z.object({
   name: z.string().min(1),
   website: z.string().url().optional(),
});

export const list = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id; // Corrected route param based on index.ts structure
        const competitors = await CompetitorService.listCompetitors(businessId);
        res.json(createSuccessResponse(competitors, 'Competitors fetched', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const add = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const validation = addSchema.safeParse(req.body);
        if(!validation.success) {
            return res.status(400).json(createErrorResponse('Invalid inputs', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }
        const { name, website } = validation.data;
        const result = await CompetitorService.addCompetitor(businessId, name, website);
        res.json(createSuccessResponse(result, 'Competitor added', 201, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const remove = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const competitorId = req.params.competitorId;
        await CompetitorService.removeCompetitor(competitorId, businessId);
        res.json(createSuccessResponse(null, 'Competitor removed', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};
