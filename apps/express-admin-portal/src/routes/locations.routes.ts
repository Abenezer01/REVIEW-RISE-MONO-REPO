import { Router } from 'express';
import * as locationsController from '../controllers/locations.controller';

const router = Router();

router.get('/', locationsController.getLocations);
router.get('/:id', locationsController.getLocation);
router.post('/', locationsController.createLocation);
router.patch('/:id', locationsController.updateLocation);
router.delete('/:id', locationsController.deleteLocation);

export default router;
