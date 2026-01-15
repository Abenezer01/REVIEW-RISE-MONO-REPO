import { Router } from 'express';
import reviewRoutes from './reviews.routes';

const router = Router();

router.use('/reviews', reviewRoutes);

export default router;
