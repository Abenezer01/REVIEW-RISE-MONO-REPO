import { Request, Response } from 'express';
import { blueprintService } from '../services/blueprint.service';
import { metaBlueprintService } from '../services/meta-blueprint.service';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';

export class BlueprintController {

    async generate(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessName: z.string().optional(),
                offerOrService: z.string().min(1),
                vertical: z.enum(['Local Service', 'E-commerce', 'SaaS', 'Healthcare', 'Other']),
                geoTargeting: z.array(z.string()),
                painPoints: z.array(z.string()),
                landingPageUrl: z.string().url().optional()
            });

            const input = schema.parse(req.body);

            const result = await blueprintService.generate(input);

            const response = createSuccessResponse(result, 'Blueprint generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error generating blueprint:', error);
            const response = createErrorResponse('Failed to generate blueprint', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    async generateMeta(req: Request, res: Response) {
        try {
            // Validation schema for Meta Blueprint
            const schema = z.object({
                businessName: z.string().optional(),
                offerOrService: z.string().min(1),
                vertical: z.enum(['Local Service', 'E-commerce', 'SaaS', 'Healthcare', 'Other']),
                geoTargeting: z.object({
                    center: z.string(),
                    radius: z.number(),
                    unit: z.enum(['miles', 'km'])
                }),
                painPoints: z.array(z.string()),
                landingPageUrl: z.string().url().optional().or(z.literal(''))
            });

            const input = schema.parse(req.body);

            // Use the new service
            const result = await metaBlueprintService.generate(input as any);

            const response = createSuccessResponse(result, 'Meta Blueprint generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);

        } catch (error: any) {
            console.error('=== META BLUEPRINT ERROR ===');
            console.error('Error generating meta blueprint:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('Request body:', req.body);
            console.error('===========================');
            const response = createErrorResponse(
                error.message || 'Failed to generate meta blueprint',
                SystemMessageCode.INTERNAL_SERVER_ERROR,
                500,
                error.stack,
                req.id
            );
            res.status(response.statusCode).json(response);
        }
    }
}

export const blueprintController = new BlueprintController();
