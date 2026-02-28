import { Router } from 'express';

import * as gbpProfileController from '../../controllers/gbp-profile.controller';
import * as gbpMetricsController from '../../controllers/gbp-metrics.controller';
import * as gbpCompetitorsController from '../../controllers/gbp-competitors.controller';
import * as gbpAiContentController from '../../controllers/gbp-ai-content.controller';
import gbpPhotosRoutes from './gbp-photos.routes';

const router = Router();
router.get('/locations/:locationId/business-profile', gbpProfileController.getBusinessProfile);
router.post('/locations/:locationId/business-profile/sync', gbpProfileController.syncBusinessProfile);
router.get('/locations/:locationId/business-profile/snapshots', gbpProfileController.listSnapshots);
router.get('/locations/:locationId/business-profile/snapshots/:snapshotId', gbpProfileController.getSnapshotDetail);
router.get('/locations/:locationId/business-profile/snapshots/:snapshotId/audit', gbpProfileController.getSnapshotAudit);
router.post('/locations/:locationId/business-profile/snapshots/:snapshotId/audit', gbpProfileController.runSnapshotAudit);
router.post('/locations/:locationId/business-profile/snapshots', gbpProfileController.createSnapshot);
router.post('/locations/:locationId/ai-content/generate', gbpAiContentController.generateAiContent);
router.post('/locations/:locationId/ai-content/suggestions', gbpAiContentController.saveAiSuggestion);

router.get('/locations/:locationId/metrics', gbpMetricsController.getMetrics);
router.post('/locations/:locationId/metrics/sync', gbpMetricsController.syncMetrics);
router.post('/locations/:locationId/metrics/backfill', gbpMetricsController.backfillMetrics);
router.get('/locations/:locationId/metrics/job-status', gbpMetricsController.getJobStatus);

router.get('/locations/:locationId/competitors', gbpCompetitorsController.getCompetitors);
router.post('/locations/:locationId/competitors', gbpCompetitorsController.addCompetitor);
router.put('/locations/:locationId/competitors/:competitorId', gbpCompetitorsController.updateCompetitor);
router.delete('/locations/:locationId/competitors/:competitorId', gbpCompetitorsController.removeCompetitor);

router.use('/locations', gbpPhotosRoutes);

export default router;
