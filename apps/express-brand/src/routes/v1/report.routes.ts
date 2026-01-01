import { Router } from 'express';
import * as ReportController from '../../controllers/report.controller';

const router = Router({ mergeParams: true });

router.get('/', ReportController.list);
router.get('/:reportId', ReportController.get);

export default router;
