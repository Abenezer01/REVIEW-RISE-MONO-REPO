import { Request, Response } from 'express';
import { aiIntegrationService } from '../services/ai-integration.service';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';

export class BlueprintController {

    async generate(req: Request, res: Response) {
        try {
            // Validation schema matching BlueprintInput
            const schema = z.object({
                businessName: z.string().optional(),
                offerOrService: z.string().min(1),
                vertical: z.enum(['Local Service', 'E-commerce', 'SaaS', 'Healthcare', 'Other']),
                geoTargeting: z.array(z.string()),
                painPoints: z.array(z.string()),
                landingPageUrl: z.union([z.string().url(), z.literal('')]).optional()
            });

            const input = schema.parse(req.body);

            const result = await aiIntegrationService.generateBlueprint(input as any);

            const response = createSuccessResponse(result, 'Blueprint generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error in BlueprintController:', error);
            const response = createErrorResponse(
                error.message || 'Failed to generate blueprint',
                SystemMessageCode.INTERNAL_SERVER_ERROR,
                500,
                error.stack,
                req.id
            );
            res.status(response.statusCode).json(response);
        }
    }

    async generateMeta(req: Request, res: Response) {
        try {
            // Validation schema matching MetaBlueprintInput
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
                landingPageUrl: z.union([z.string().url(), z.literal('')]).optional()
            });

            const input = schema.parse(req.body);

            const result = await aiIntegrationService.generateMetaBlueprint(input as any);

            const response = createSuccessResponse(result, 'Meta Blueprint generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error in BlueprintController (Meta):', error);
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
