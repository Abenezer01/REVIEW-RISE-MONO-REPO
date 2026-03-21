import { Router } from 'express';
import * as ReportsCenterController from '../../controllers/reports-center.controller';

const router = Router();

router.get('/reports-center/share/:token', ReportsCenterController.getShare);
router.post('/reports-center/share/:token/verify', ReportsCenterController.verifyShare);

export default router;
