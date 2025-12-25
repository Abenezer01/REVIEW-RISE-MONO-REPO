import { Router } from 'express';
import seoRoutes from './seo.routes';
import keywordsRoutes from './keywords.routes';
import visibilityRoutes from './visibility.routes';
import ranksRoutes from './ranks.routes';

const router = Router();

router.use('/seo', seoRoutes);
router.use('/keywords', keywordsRoutes);
router.use('/visibility', visibilityRoutes);
router.use('/ranks', ranksRoutes);

export default router;

