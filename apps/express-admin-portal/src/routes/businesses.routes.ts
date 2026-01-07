import { Router } from 'express';
import * as businessesController from '../controllers/businesses.controller';

const router = Router();

router.get('/', businessesController.getBusinesses);

export default router;
