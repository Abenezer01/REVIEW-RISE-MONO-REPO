import { Request, Response } from 'express';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import * as DNAService from '../services/dna.service';

const dnaSchema = z.object({
    values: z.array(z.string()),
    voice: z.string().optional(),
    audience: z.string().optional(),
    mission: z.string().optional(),
});

export const get = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const dna = await DNAService.getDNA(businessId);
        const response = createSuccessResponse(dna, 'DNA fetched', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const upsert = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const validation = dnaSchema.safeParse(req.body);
        if(!validation.success) {
            const errorResponse = createErrorResponse('Invalid inputs', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }
        
        const result = await DNAService.upsertDNA(businessId, validation.data);
        const response = createSuccessResponse(result, 'DNA saved', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};
