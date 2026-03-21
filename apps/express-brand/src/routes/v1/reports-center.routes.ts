import { Router } from 'express';
import * as ReportsCenterController from '../../controllers/reports-center.controller';

const router = Router({ mergeParams: true });

router.get('/:id/reports-center/config', ReportsCenterController.getConfig);
router.patch('/:id/reports-center/config', ReportsCenterController.updateConfig);
router.get('/:id/reports-center/schedule', ReportsCenterController.getSchedule);
router.patch('/:id/reports-center/schedule', ReportsCenterController.updateSchedule);
router.post('/:id/reports-center/runs', ReportsCenterController.generateRun);
router.get('/:id/reports-center/vault', ReportsCenterController.listVault);
router.post('/:id/reports-center/vault/:runId/rerun', ReportsCenterController.rerun);
router.get('/:id/reports-center/exports', ReportsCenterController.listExports);
router.post('/:id/reports-center/exports', ReportsCenterController.createExport);
router.get('/:id/reports-center/runs/:runId/pdf', ReportsCenterController.downloadPdf);
router.get('/:id/reports-center/exports/:jobId/download', ReportsCenterController.downloadExport);

export default router;
