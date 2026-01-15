import { Router } from 'express';
import reviewRoutes from './review.routes';

const router = Router();

router.use('/reviews', reviewRoutes);

export default router;
