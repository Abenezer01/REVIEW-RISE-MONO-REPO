import { Router } from 'express';
import dashboardRoutes from './dashboard.routes';
import competitorRoutes from './competitor.routes';
import reportRoutes from './report.routes';
import dnaRoutes from './dna.routes';
import contentRoutes from './content.routes';
import reviewRoutes from './review.routes';

const router = Router();

router.use('/brands', dashboardRoutes); // has /:id/dashboards/overview
router.use('/brands/:id/competitors', competitorRoutes);
router.use('/brands/:id/reports', reportRoutes);
router.use('/brands/:id/dna', dnaRoutes);
router.use('/brands/:id/content', contentRoutes);
router.use('/brands/:id/reviews', reviewRoutes);

export default router;

