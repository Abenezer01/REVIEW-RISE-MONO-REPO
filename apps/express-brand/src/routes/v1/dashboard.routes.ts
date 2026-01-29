import { Router } from 'express';
import * as DashboardController from '../../controllers/dashboard.controller';
import { validateRequest } from '@platform/middleware';
import { BrandOverviewQuerySchema, BrandVisibilityQuerySchema } from '@platform/contracts';

const router = Router();

router.get('/:id/dashboards/overview', validateRequest(BrandOverviewQuerySchema, 'params'), DashboardController.getOverview);
router.get('/:id/dashboards/visibility', validateRequest(BrandOverviewQuerySchema, 'params'), validateRequest(BrandVisibilityQuerySchema, 'query'), DashboardController.getVisibility);

export default router;
