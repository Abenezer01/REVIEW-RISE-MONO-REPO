import { Router } from 'express';
import { visibilityController } from '../../controllers/visibility.controller';
import { validateRequest } from '@platform/middleware';
import { VisibilityQuerySchema, HeatmapQuerySchema, ComputeMetricsRequestSchema } from '@platform/contracts';

const router = Router();

// Visibility metrics routes
router.get('/metrics', validateRequest(VisibilityQuerySchema, 'query'), visibilityController.getMetrics.bind(visibilityController));
router.get('/share-of-voice', validateRequest(VisibilityQuerySchema, 'query'), visibilityController.getShareOfVoice.bind(visibilityController));
router.get('/serp-features', validateRequest(VisibilityQuerySchema, 'query'), visibilityController.getSerpFeatures.bind(visibilityController));
router.get('/heatmap', validateRequest(HeatmapQuerySchema, 'query'), visibilityController.getHeatmapData.bind(visibilityController));
router.post('/compute', validateRequest(ComputeMetricsRequestSchema), visibilityController.computeMetrics.bind(visibilityController));

export default router;
