import { Router } from 'express';
import seoRoutes from './seo.routes';
import keywordsRoutes from './keywords.routes';
import competitorsRoutes from './competitors.routes';
import visibilityRoutes from './visibility.routes';
import ranksRoutes from './ranks.routes';
import aiVisibilityRoutes from './ai-visibility.routes';

const router = Router();

router.use('/seo', seoRoutes);
router.use('/keywords', keywordsRoutes);
router.use('/competitors', competitorsRoutes);
router.use('/visibility', visibilityRoutes);
router.use('/ranks', ranksRoutes);
router.use('/ai-visibility', aiVisibilityRoutes);

export default router;

