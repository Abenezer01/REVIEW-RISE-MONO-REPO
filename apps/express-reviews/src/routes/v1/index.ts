import { Router } from 'express';
import reviewRoutes from './reviews.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/reviews', reviewRoutes);
router.use('/', reviewRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
