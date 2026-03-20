import { Router } from 'express';
import { getDashboardSummary } from '../../controllers/dashboard.controller';
import { getAnalyzerSummary } from '../../controllers/analyzer.controller';

const router = Router();

router.get('/summary/:locationId', getDashboardSummary);
router.get('/summary', getDashboardSummary);
router.get('/analyzer', getAnalyzerSummary);

export default router;
