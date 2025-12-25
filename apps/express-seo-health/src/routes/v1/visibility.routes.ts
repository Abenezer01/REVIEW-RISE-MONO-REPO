import { Router } from 'express';
import { visibilityController } from '../../controllers/visibility.controller';

const router = Router();

// Visibility metrics routes
router.get('/metrics', visibilityController.getMetrics.bind(visibilityController));
router.get('/share-of-voice', visibilityController.getShareOfVoice.bind(visibilityController));
router.get('/serp-features', visibilityController.getSerpFeatures.bind(visibilityController));
router.get('/heatmap', visibilityController.getHeatmapData.bind(visibilityController));
router.post('/compute', visibilityController.computeMetrics.bind(visibilityController));

export default router;
