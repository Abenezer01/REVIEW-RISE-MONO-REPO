
import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

router.post('/track', (req, res) => analyticsController.track(req, res));

export default router;
