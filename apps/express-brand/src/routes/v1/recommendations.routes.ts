import { Router } from 'express';
import { RecommendationsController } from '../../controllers/recommendations.controller';
import { validateRequest } from '@platform/middleware';
import { z } from 'zod';

const router = Router();
const controller = new RecommendationsController();

const BusinessIdParamSchema = z.object({ businessId: z.string().uuid() });
const RecommendationIdParamSchema = z.object({ businessId: z.string().uuid(), id: z.string().uuid() });

// Recommendations
router.post('/brands/:businessId/recommendations', validateRequest(BusinessIdParamSchema, 'params'), controller.generate.bind(controller));
router.get('/brands/:businessId/recommendations', validateRequest(BusinessIdParamSchema, 'params'), controller.findAll.bind(controller));
router.patch('/brands/:businessId/recommendations/:id', validateRequest(RecommendationIdParamSchema, 'params'), controller.updateStatus.bind(controller));

// Brand Scores
router.get('/brands/:businessId/scores', validateRequest(BusinessIdParamSchema, 'params'), controller.getScores.bind(controller));

// Visibility Plan
router.post('/brands/:businessId/visibility-plan', validateRequest(BusinessIdParamSchema, 'params'), controller.generatePlan.bind(controller));
router.get('/brands/:businessId/visibility-plan', validateRequest(BusinessIdParamSchema, 'params'), controller.getPlan.bind(controller));

export default router;
