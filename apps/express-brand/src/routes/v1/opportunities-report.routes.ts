import { Router } from 'express';
import * as ReportController from '../../controllers/report.controller';
import { validateRequest } from '@platform/middleware';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const IdParamSchema = z.object({ id: z.string().uuid() });
const ReportIdParamSchema = z.object({ reportId: z.string().uuid(), id: z.string().uuid() });

router.post('/', validateRequest(IdParamSchema, 'params'), ReportController.generateOpportunities);
router.get('/', validateRequest(IdParamSchema, 'params'), ReportController.listOpportunities);
router.get('/latest', validateRequest(IdParamSchema, 'params'), ReportController.getLatestOpportunities);
router.get('/:reportId/pdf', validateRequest(ReportIdParamSchema, 'params'), ReportController.downloadPdf);

export default router;
