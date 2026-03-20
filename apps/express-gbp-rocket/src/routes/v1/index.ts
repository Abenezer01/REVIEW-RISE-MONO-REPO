import { Router } from 'express';
import multer from 'multer';
import dashboardRoutes from './dashboard.routes';

import * as gbpProfileController from '../../controllers/gbp-profile.controller';
import * as gbpMetricsController from '../../controllers/gbp-metrics.controller';
import * as gbpCompetitorsController from '../../controllers/gbp-competitors.controller';
import * as gbpAiContentController from '../../controllers/gbp-ai-content.controller';
import * as gbpSuggestionsController from '../../controllers/gbp-suggestions.controller';
import * as gbpPhotosController from '../../controllers/gbp-photos.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/locations/:locationId/business-profile', gbpProfileController.getBusinessProfile);
router.patch('/locations/:locationId/business-profile', gbpProfileController.updateBusinessProfile);
router.post('/locations/:locationId/business-profile/sync', gbpProfileController.syncBusinessProfile);
router.patch('/locations/:locationId/business-profile', gbpProfileController.updateBusinessProfile);
router.post('/locations/:locationId/business-profile/push', gbpProfileController.pushBusinessProfile);
router.get('/locations/:locationId/business-profile/snapshots', gbpProfileController.listSnapshots);
router.get('/locations/:locationId/business-profile/snapshots/:snapshotId', gbpProfileController.getSnapshotDetail);
router.get('/locations/:locationId/business-profile/snapshots/:snapshotId/audit', gbpProfileController.getSnapshotAudit);
router.post('/locations/:locationId/business-profile/snapshots/:snapshotId/audit', gbpProfileController.runSnapshotAudit);
router.post('/locations/:locationId/business-profile/snapshots', gbpProfileController.createSnapshot);
router.post('/locations/:locationId/ai-content/generate', gbpAiContentController.generateAiContent);
router.post('/locations/:locationId/ai-content/suggestions', gbpAiContentController.saveAiSuggestion);
router.get('/locations/:locationId/suggestions', gbpSuggestionsController.listSuggestions);
router.post('/locations/:locationId/suggestions', gbpSuggestionsController.createSuggestion);
router.patch('/locations/:locationId/suggestions/:suggestionId/state', gbpSuggestionsController.updateSuggestionState);
router.get('/locations/:locationId/suggestions/activity', gbpSuggestionsController.listSuggestionActivity);

router.get('/locations/:locationId/metrics', gbpMetricsController.getMetrics);
router.post('/locations/:locationId/metrics/sync', gbpMetricsController.syncMetrics);
router.post('/locations/:locationId/metrics/backfill', gbpMetricsController.backfillMetrics);
router.get('/locations/:locationId/metrics/job-status', gbpMetricsController.getJobStatus);

router.get('/locations/:locationId/competitors', gbpCompetitorsController.getCompetitors);
router.post('/locations/:locationId/competitors', gbpCompetitorsController.addCompetitor);
router.put('/locations/:locationId/competitors/:competitorId', gbpCompetitorsController.updateCompetitor);
router.delete('/locations/:locationId/competitors/:competitorId', gbpCompetitorsController.removeCompetitor);

router.get('/locations/:locationId/photos', gbpPhotosController.getPhotos);
router.post('/locations/:locationId/photos/sync', gbpPhotosController.syncPhotos);
router.post('/locations/:locationId/photos', upload.single('photo'), gbpPhotosController.uploadPhoto);
router.delete('/locations/:locationId/photos/:photoId', gbpPhotosController.deletePhoto);

router.use('/dashboard', dashboardRoutes);

export default router;
