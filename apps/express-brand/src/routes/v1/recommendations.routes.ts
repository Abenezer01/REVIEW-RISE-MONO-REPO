import { Router } from 'express';
import { RecommendationsController } from '../../controllers/recommendations.controller';

const router = Router();
const controller = new RecommendationsController();

// Recommendations
router.post('/brands/:businessId/recommendations', controller.generate.bind(controller));
router.get('/brands/:businessId/recommendations', controller.findAll.bind(controller));
router.patch('/brands/:businessId/recommendations/:id', controller.updateStatus.bind(controller));

// Brand Scores
router.get('/brands/:businessId/scores', controller.getScores.bind(controller));

// Visibility Plan
router.post('/brands/:businessId/visibility-plan', controller.generatePlan.bind(controller));
router.get('/brands/:businessId/visibility-plan', controller.getPlan.bind(controller));

export default router;
