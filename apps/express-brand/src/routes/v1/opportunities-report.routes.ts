import { Router } from 'express';
import * as ReportController from '../../controllers/report.controller';

const router = Router({ mergeParams: true });

router.post('/', ReportController.generateOpportunities);
router.get('/', ReportController.listOpportunities);
router.get('/latest', ReportController.getLatestOpportunities);
// router.get('/:businessId/:reportId', ReportController.getOpportunities); // Deferred

export default router;
