import { Router } from 'express';
import { analyzeSEO } from '../../controllers/seo.controller';
import { seoAnalysisLimiter } from '../../middleware/rate-limiter';

const router = Router();

router.post('/analyze', seoAnalysisLimiter, analyzeSEO);

export default router;
