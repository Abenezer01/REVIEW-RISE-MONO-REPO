import { Router } from 'express';
import * as businessesController from '../controllers/businesses.controller';
import { validateRequest } from '@platform/middleware';
import { AdminBusinessQuerySchema } from '@platform/contracts';

const router = Router();

router.get('/', validateRequest(AdminBusinessQuerySchema, 'query'), businessesController.getBusinesses);

export default router;
