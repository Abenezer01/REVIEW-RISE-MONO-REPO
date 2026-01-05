import { Request, Response } from 'express';
import { repositories } from '@platform/db';
import axios from 'axios';

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

            res.status(202).json({
                message: 'Recommendation generation started',
                jobId: job.id,
            });
        } catch (error) {
            console.error('Failed to trigger generation:', error);
            res.status(500).json({ error: 'Failed to trigger recommendation generation' });
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

            res.json(recommendations);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
            res.status(500).json({ error: 'Failed to fetch recommendations' });
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
            res.json(updated);
        } catch (error) {
            console.error('Failed to update recommendation:', error);
            res.status(500).json({ error: 'Failed to update recommendation' });
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

            res.status(202).json({
                message: 'Plan generation started',
                jobId: job.id,
            });
        } catch (error) {
            console.error('Failed to trigger plan generation:', error);
            res.status(500).json({ error: 'Failed to trigger plan generation' });
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
                return res.status(404).json({ error: 'No plan found' });
            }

            res.json(plan);
        } catch (error) {
            console.error('Failed to fetch plan:', error);
            res.status(500).json({ error: 'Failed to fetch plan' });
        }
    }

    /**
     * Get brand scores
     */
    async getScores(req: Request, res: Response) {
        const { businessId } = req.params;

        try {
            const score = await repositories.brandScore.findLatestByBusinessId(businessId);
            res.json(score || { visibilityScore: 0, trustScore: 0, consistencyScore: 0 });
        } catch (error) {
            console.error('Failed to fetch scores:', error);
            res.status(500).json({ error: 'Failed to fetch score' });
        }
    }
}
