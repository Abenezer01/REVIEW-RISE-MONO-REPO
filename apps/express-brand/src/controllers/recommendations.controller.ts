import { Request, Response } from 'express';
import { repositories } from '@platform/db';
import axios from 'axios';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

const WORKER_JOBS_URL = process.env.WORKER_JOBS_URL || 'http://localhost:3009';

export class RecommendationsController {
    /**
     * Trigger recommendation generation
     */
    async generate(req: Request, res: Response) {
        const { businessId } = req.params;

        try {
            // Create a job record
            const job = await repositories.job.create({
                type: 'GENERATE_VISIBILITY_RECOMMENDATIONS',
                status: 'pending',
                payload: { businessId },
                businessId,
            } as any);

            // Trigger worker
            await axios.post(`${WORKER_JOBS_URL}/jobs/brand-recommendations`, {
                jobId: job.id,
                businessId,
            });

            const response = createSuccessResponse({
                message: 'Recommendation generation started',
                jobId: job.id,
            }, 'Accepted', 202, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Failed to trigger generation:', error);
            const response = createErrorResponse('Failed to trigger recommendation generation', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    /**
     * Get recommendations for a business
     */
    async findAll(req: Request, res: Response) {
        const { businessId } = req.params;
        const { status, category } = req.query;

        try {
            const where: any = { businessId };

            if (status) where.status = status;
            if (category) where.category = category;

            const recommendations = await repositories.brandRecommendation.findMany({
                where,
                orderBy: { priorityScore: 'desc' },
            } as any);

            const response = createSuccessResponse(recommendations, 'Recommendations fetched', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Failed to fetch recommendations:', error);
            const response = createErrorResponse('Failed to fetch recommendations', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    /**
     * Update recommendation status
     */
    async updateStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const updated = await repositories.brandRecommendation.updateStatus(id, status);
            const response = createSuccessResponse(updated, 'Recommendation status updated', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Failed to update recommendation:', error);
            const response = createErrorResponse('Failed to update recommendation', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    /**
     * Trigger visibility plan generation
     */
    async generatePlan(req: Request, res: Response) {
        const { businessId } = req.params;

        try {
            const job = await repositories.job.create({
                type: 'GENERATE_30DAY_PLAN',
                status: 'pending',
                payload: { businessId },
                businessId,
            } as any);

            await axios.post(`${WORKER_JOBS_URL}/jobs/visibility-plan`, {
                jobId: job.id,
                businessId,
            });

            const response = createSuccessResponse({
                message: 'Plan generation started',
                jobId: job.id,
            }, 'Accepted', 202, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Failed to trigger plan generation:', error);
            const response = createErrorResponse('Failed to trigger plan generation', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    /**
     * Get latest visibility plan
     */
    async getPlan(req: Request, res: Response) {
        const { businessId } = req.params;

        try {
            const plan = await repositories.report.findFirst({
                where: {
                    businessId,
                    title: '30-Day Visibility Plan',
                },
                orderBy: { generatedAt: 'desc' },
            } as any);

            if (!plan) {
                const errorResponse = createErrorResponse('No plan found', ErrorCode.NOT_FOUND, 404, undefined, req.id);
                return res.status(errorResponse.statusCode).json(errorResponse);
            }

            const response = createSuccessResponse(plan, 'Plan fetched', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Failed to fetch plan:', error);
            const response = createErrorResponse('Failed to fetch plan', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    /**
     * Get brand scores
     */
    async getScores(req: Request, res: Response) {
        const { businessId } = req.params;

        try {
            const score = await repositories.brandScore.findLatestByBusinessId(businessId);
            const response = createSuccessResponse(score || { visibilityScore: 0, trustScore: 0, consistencyScore: 0 }, 'Scores fetched', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Failed to fetch scores:', error);
            const response = createErrorResponse('Failed to fetch scores', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }
}
