import { Router } from 'express';
import * as businessesController from '../controllers/businesses.controller';

const router = Router();

router.get('/', businessesController.getBusinesses);
router.get('/:id', businessesController.getBusiness);

export default router;
