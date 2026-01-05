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
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const dna = await DNAService.getDNA(businessId);
        res.json(createSuccessResponse(dna, 'DNA fetched', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const upsert = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const validation = dnaSchema.safeParse(req.body);
        if(!validation.success) {
            return res.status(400).json(createErrorResponse('Invalid inputs', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }
        
        const result = await DNAService.upsertDNA(businessId, validation.data);
        res.json(createSuccessResponse(result, 'DNA saved', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};
