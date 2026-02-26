import { Router } from 'express';

import * as gbpProfileController from '../../controllers/gbp-profile.controller';

const router = Router();
router.get('/locations/:locationId/business-profile', gbpProfileController.getBusinessProfile);
router.post('/locations/:locationId/business-profile/sync', gbpProfileController.syncBusinessProfile);
router.get('/locations/:locationId/business-profile/snapshots', gbpProfileController.listSnapshots);
router.get('/locations/:locationId/business-profile/snapshots/:snapshotId', gbpProfileController.getSnapshotDetail);
router.post('/locations/:locationId/business-profile/snapshots', gbpProfileController.createSnapshot);

export default router;
