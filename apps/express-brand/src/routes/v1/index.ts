import { Router } from 'express';
import dashboardRoutes from './dashboard.routes';
import competitorRoutes from './competitor.routes';
import reportRoutes from './report.routes';
import dnaRoutes from './dna.routes';
import contentRoutes from './content.routes';
import reviewRoutes from './review.routes';
import brandProfileRoutes from './brand-profile.routes';

import recommendationsRoutes from './recommendations.routes';

const router = Router();

router.use('/', recommendationsRoutes); // these routes handle their own /brands/:id/ paths
router.use('/brands', dashboardRoutes); // has /:id/dashboards/overview
router.use('/brands/:id/competitors', competitorRoutes);
router.use('/brands/:id/reports/opportunities', opportunitiesReportRoutes); // sub-resource
router.use('/brands/:id/reports', reportRoutes); // standard reports
router.use('/brands/:id/dna', dnaRoutes);
router.use('/brands/:id/content', contentRoutes);
router.use('/brands/:id/reviews', reviewRoutes);
router.use('/brand-profiles', brandProfileRoutes);

export default router;

