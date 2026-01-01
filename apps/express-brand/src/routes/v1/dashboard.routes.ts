import { Router } from 'express';
import * as DashboardController from '../../controllers/dashboard.controller';

const router = Router();

router.get('/:id/dashboards/overview', DashboardController.getOverview);
router.get('/:id/dashboards/visibility', DashboardController.getVisibility);

export default router;
