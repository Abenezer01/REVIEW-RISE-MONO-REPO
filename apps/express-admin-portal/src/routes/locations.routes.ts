import { Router } from 'express';
import * as locationsController from '../controllers/locations.controller';
import { validateRequest } from '@platform/middleware';
import {
  AdminLocationQuerySchema,
  AdminLocationCreateSchema,
  AdminLocationUpdateSchema
} from '@platform/contracts';
import { z } from 'zod';

const router = Router();

const IdParamSchema = z.object({ id: z.string().uuid() });

router.get('/', validateRequest(AdminLocationQuerySchema, 'query'), locationsController.getLocations);
router.get('/:id', validateRequest(IdParamSchema, 'params'), locationsController.getLocation);
router.post('/', validateRequest(AdminLocationCreateSchema), locationsController.createLocation);
router.patch('/:id', validateRequest(IdParamSchema, 'params'), validateRequest(AdminLocationUpdateSchema), locationsController.updateLocation);
router.delete('/:id', validateRequest(IdParamSchema, 'params'), locationsController.deleteLocation);

export default router;
