
import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';
import { z } from 'zod';

export class AnalyticsController {

    private eventSchema = z.object({
        eventType: z.enum(['wizard_start', 'wizard_complete', 'plan_exported']),
        businessId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        metadata: z.record(z.string(), z.any()).optional()
    });

    async track(req: Request, res: Response) {
        try {
            const input = this.eventSchema.parse(req.body);
            
            // Log to console for verifying telemetry flows in dev
            console.log(`[Analytics] Tracking event: ${input.eventType}`, input.metadata);

            await prisma.creativeEngineAnalytics.create({
                data: {
                    eventType: input.eventType,
                    businessId: input.businessId,
                    userId: input.userId,
                    metadata: (input.metadata || {}) as any
                }
            });

            const response = createSuccessResponse({ tracked: true }, 'Event tracked successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error in AnalyticsController:', error);
            const response = createErrorResponse(
                'Failed to track event',
                SystemMessageCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(response.statusCode).json(response);
        }
    }
}

export const analyticsController = new AnalyticsController();
