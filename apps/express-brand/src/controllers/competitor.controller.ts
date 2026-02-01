import { Request, Response } from 'express';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';
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
    try {
        const businessId = req.params.id;
        const competitors = await CompetitorService.listCompetitors(businessId);
        const response = createSuccessResponse(competitors, 'Competitors fetched', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const get = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const competitorId = req.params.competitorId;
        const competitor = await CompetitorService.getCompetitor(competitorId, businessId);
        
        if (!competitor) {
            const errorResponse = createErrorResponse('Competitor not found', SystemMessageCode.NOT_FOUND, 404, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const response = createSuccessResponse(competitor, 'Competitor fetched', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const discover = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const validation = discoverSchema.safeParse(req.body);
        
        if (!validation.success) {
            const errorResponse = createErrorResponse('Invalid keywords', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }
        
        const { keywords } = validation.data;
        
        // This could be async/background job, but requirement implies sync or immediate feedback.
        // For MVP we await it.
        const competitors = await CompetitorDiscoveryService.runDiscoveryPipeline(businessId, keywords);
        
        const response = createSuccessResponse(competitors, 'Discovery completed', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        console.error(e);
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const extract = async (req: Request, res: Response) => {
    try {
        const competitorId = req.params.competitorId;
        const snapshot = await CompetitorExtractorService.createSnapshot(competitorId);
        const response = createSuccessResponse(snapshot, 'Snapshot extracted', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        // Map specific service errors to 400/404
        if (e.message.includes('not found') || e.message.includes('no website')) {
             const errorResponse = createErrorResponse(e.message, SystemMessageCode.NOT_FOUND, 404, undefined, req.id);
             return res.status(errorResponse.statusCode).json(errorResponse);
        }
        if (e.message.includes('Could not resolve domain') || e.message.includes('Access denied')) {
             const errorResponse = createErrorResponse(e.message, SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
             return res.status(errorResponse.statusCode).json(errorResponse);
        }
        
        console.error('Extraction Error:', e);
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const add = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const validation = addSchema.safeParse(req.body);
        if(!validation.success) {
            const errorResponse = createErrorResponse('Invalid inputs', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }
        const { name, website } = validation.data;
        const result = await CompetitorService.addCompetitor(businessId, name, website);
        const response = createSuccessResponse(result, 'Competitor added', 201, { requestId: req.id }, SystemMessageCode.ITEM_CREATED);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const competitorId = req.params.competitorId;
        const result = await CompetitorService.updateCompetitor(competitorId, businessId, req.body);
        const response = createSuccessResponse(result, 'Competitor updated', 200, { requestId: req.id }, SystemMessageCode.ITEM_UPDATED);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const hide = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const competitorId = req.params.competitorId;
        const result = await CompetitorService.hideCompetitor(competitorId, businessId);
        const response = createSuccessResponse(result, 'Competitor hidden', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const unhide = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const competitorId = req.params.competitorId;
        const result = await CompetitorService.unhideCompetitor(competitorId, businessId);
        const response = createSuccessResponse(result, 'Competitor unhidden', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const competitorId = req.params.competitorId;
        await CompetitorService.removeCompetitor(competitorId, businessId);
        const response = createSuccessResponse(null, 'Competitor removed', 200, { requestId: req.id }, SystemMessageCode.ITEM_DELETED);
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};
