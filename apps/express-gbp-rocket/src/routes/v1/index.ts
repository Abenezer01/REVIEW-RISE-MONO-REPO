import { Router } from 'express';

import * as gbpProfileController from '../../controllers/gbp-profile.controller';
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

router.use('/locations', gbpPhotosRoutes);

export default router;
