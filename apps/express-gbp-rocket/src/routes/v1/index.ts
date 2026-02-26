import { Router } from 'express';

import * as gbpProfileController from '../../controllers/gbp-profile.controller';
import gbpPhotosRoutes from './gbp-photos.routes';

const router = Router();
router.get('/locations/:locationId/business-profile', gbpProfileController.getBusinessProfile);
router.post('/locations/:locationId/business-profile/sync', gbpProfileController.syncBusinessProfile);

router.use('/locations', gbpPhotosRoutes);

export default router;
