import { Request, Response } from 'express';
import { aiIntegrationService } from '../services/ai-integration.service';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';

import { MetaBlueprintEngine } from '@platform/campaign-engine';

export class BlueprintController {
    private metaEngine = new MetaBlueprintEngine();

    async generate(req: Request, res: Response) {
        try {
            // Validation schema matching BlueprintInput
            // Validation schema matching BlueprintInput
            const schema = z.object({
                businessName: z.string().min(1),
                services: z.array(z.string()),
                offer: z.string().min(1),
                vertical: z.enum(['Local Service', 'E-commerce', 'SaaS', 'Healthcare', 'Restaurant', 'Other']),
                geo: z.string().min(1),
                painPoints: z.array(z.string()).optional(),
                landingPageUrl: z.string().optional().or(z.literal('')),
                objective: z.enum(['Leads', 'Sales', 'Awareness', 'Local Visits']),
                budget: z.number().positive(),
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
                landingPageUrl: z.union([z.string().url(), z.literal('')]).optional(),
                budget: z.number().optional().default(1500),
                objective: z.enum(['Leads', 'Sales', 'Awareness']).optional().default('Leads')
            });

            const input = schema.parse(req.body);

            // Map 'Other' vertical to a safe default if needed, or cast if engine supports it.
            // CampaignInput expects specific verticals.
            const sVertical = input.vertical === 'Other' ? 'Local Service' : input.vertical;

            const result = this.metaEngine.generateBlueprint({
                businessName: input.businessName || 'Your Business',
                services: [input.offerOrService],
                offer: input.offerOrService,
                vertical: sVertical as any, // Cast to satisfy type if exact enum match is tricky
                geo: input.geoTargeting.center,
                painPoints: input.painPoints || [],
                landingPageUrl: input.landingPageUrl || '',
                objective: input.objective,
                budget: input.budget,
                currency: 'USD',
                conversionTrackingEnabled: true
            });

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
