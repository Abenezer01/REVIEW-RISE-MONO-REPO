import { Request, Response } from 'express';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import * as CompetitorService from '../services/competitor.service';
import * as CompetitorDiscoveryService from '../services/competitor-discovery.service';
import * as CompetitorExtractorService from '../services/competitor-extractor.service';

const discoverSchema = z.object({
    keywords: z.array(z.string()).min(1).max(5), // Limit to 5 as per requirements
});

const addSchema = z.object({
   name: z.string().min(1),
   website: z.string().url().optional(),
});

export const list = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const competitors = await CompetitorService.listCompetitors(businessId);
        res.json(createSuccessResponse(competitors, 'Competitors fetched', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const discover = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const validation = discoverSchema.safeParse(req.body);
        
        if (!validation.success) {
            return res.status(400).json(createErrorResponse('Invalid keywords', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }
        
        const { keywords } = validation.data;
        
        // This could be async/background job, but requirement implies sync or immediate feedback.
        // For MVP we await it.
        const competitors = await CompetitorDiscoveryService.runDiscoveryPipeline(businessId, keywords);
        
        res.json(createSuccessResponse(competitors, 'Discovery completed', 200, { requestId }));
    } catch (e: any) {
        console.error(e);
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const extract = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const competitorId = req.params.competitorId;
        const snapshot = await CompetitorExtractorService.createSnapshot(competitorId);
        res.json(createSuccessResponse(snapshot, 'Snapshot extracted', 200, { requestId }));
    } catch (e: any) {
        // Map specific service errors to 400/404
        if (e.message.includes('not found') || e.message.includes('no website')) {
             return res.status(404).json(createErrorResponse(e.message, ErrorCode.NOT_FOUND, 404, undefined, requestId));
        }
        if (e.message.includes('Could not resolve domain') || e.message.includes('Access denied')) {
             return res.status(400).json(createErrorResponse(e.message, ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }
        
        console.error('Extraction Error:', e);
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

export const update = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const competitorId = req.params.competitorId;
        const result = await CompetitorService.updateCompetitor(competitorId, businessId, req.body);
        res.json(createSuccessResponse(result, 'Competitor updated', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const hide = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const competitorId = req.params.competitorId;
        const result = await CompetitorService.hideCompetitor(competitorId, businessId);
        res.json(createSuccessResponse(result, 'Competitor hidden', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const unhide = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const competitorId = req.params.competitorId;
        const result = await CompetitorService.unhideCompetitor(competitorId, businessId);
        res.json(createSuccessResponse(result, 'Competitor unhidden', 200, { requestId }));
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
