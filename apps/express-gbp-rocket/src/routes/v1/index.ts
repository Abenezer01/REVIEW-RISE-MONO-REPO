import { Router } from 'express';

import * as gbpProfileController from '../../controllers/gbp-profile.controller';

const router = Router();
router.get('/locations/:locationId/business-profile', gbpProfileController.getBusinessProfile);
router.post('/locations/:locationId/business-profile/sync', gbpProfileController.syncBusinessProfile);

export default router;
