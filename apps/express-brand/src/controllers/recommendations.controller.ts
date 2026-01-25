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
        const requestId = req.id;

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

            res.status(202).json(createSuccessResponse(
                { jobId: job.id },
                'Recommendation generation started',
                202,
                { requestId }
            ));
        } catch (error) {
            console.error('Failed to trigger generation:', error);
            res.status(500).json(createErrorResponse('Failed to trigger recommendation generation', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
        }
    }

    /**
     * Get recommendations for a business
     */
    async findAll(req: Request, res: Response) {
        const { businessId } = req.params;
        const { status, category } = req.query;
        const requestId = req.id;

        try {
            const where: any = { businessId };

            if (status) where.status = status;
            if (category) where.category = category;

            const recommendations = await repositories.brandRecommendation.findMany({
                where,
                orderBy: { priorityScore: 'desc' },
            } as any);

            res.json(createSuccessResponse(recommendations, 'Recommendations fetched', 200, { requestId }));
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
            res.status(500).json(createErrorResponse('Failed to fetch recommendations', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
        }
    }

    /**
     * Update recommendation status
     */
    async updateStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = req.body;
        const requestId = req.id;

        try {
            const updated = await repositories.brandRecommendation.updateStatus(id, status);
            res.json(createSuccessResponse(updated, 'Recommendation status updated', 200, { requestId }));
        } catch (error) {
            console.error('Failed to update recommendation:', error);
            res.status(500).json(createErrorResponse('Failed to update recommendation', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
        }
    }

    /**
     * Trigger visibility plan generation
     */
    async generatePlan(req: Request, res: Response) {
        const { businessId } = req.params;
        const requestId = req.id;

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

            res.status(202).json(createSuccessResponse(
                { jobId: job.id },
                'Plan generation started',
                202,
                { requestId }
            ));
        } catch (error) {
            console.error('Failed to trigger plan generation:', error);
            res.status(500).json(createErrorResponse('Failed to trigger plan generation', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
        }
    }

    /**
     * Get latest visibility plan
     */
    async getPlan(req: Request, res: Response) {
        const { businessId } = req.params;
        const requestId = req.id;

        try {
            const plan = await repositories.report.findFirst({
                where: {
                    businessId,
                    title: '30-Day Visibility Plan',
                },
                orderBy: { generatedAt: 'desc' },
            } as any);

            if (!plan) {
                return res.status(404).json(createErrorResponse('No plan found', ErrorCode.NOT_FOUND, 404, undefined, requestId));
            }

            res.json(createSuccessResponse(plan, 'Visibility plan fetched', 200, { requestId }));
        } catch (error) {
            console.error('Failed to fetch plan:', error);
            res.status(500).json(createErrorResponse('Failed to fetch plan', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
        }
    }

    /**
     * Get brand scores
     */
    async getScores(req: Request, res: Response) {
        const { businessId } = req.params;
        const requestId = req.id;

        try {
            const score = await repositories.brandScore.findLatestByBusinessId(businessId);
            res.json(createSuccessResponse(score || { visibilityScore: 0, trustScore: 0, consistencyScore: 0 }, 'Brand scores fetched', 200, { requestId }));
        } catch (error) {
            console.error('Failed to fetch scores:', error);
            res.status(500).json(createErrorResponse('Failed to fetch scores', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
        }
    }
}
