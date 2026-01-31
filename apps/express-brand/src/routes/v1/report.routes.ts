import { Router } from 'express';
import * as ReportController from '../../controllers/report.controller';
import { validateRequest } from '@platform/middleware';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const IdParamSchema = z.object({ id: z.string().uuid() });
const ReportIdParamSchema = z.object({ reportId: z.string().uuid(), id: z.string().uuid() });

router.get('/', validateRequest(IdParamSchema, 'params'), ReportController.list);
router.get('/:reportId', validateRequest(ReportIdParamSchema, 'params'), ReportController.get);

export default router;
