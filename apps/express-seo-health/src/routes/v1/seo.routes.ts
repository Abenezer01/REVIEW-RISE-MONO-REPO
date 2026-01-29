import { Router } from 'express';
import { analyzeSEO } from '../../controllers/seo.controller';
import { seoAnalysisLimiter } from '../../middleware/rate-limiter';
import { validateRequest } from '@platform/middleware';
import { SEOAnalysisRequestSchema } from '@platform/contracts';

const router = Router();

router.post('/analyze', seoAnalysisLimiter, validateRequest(SEOAnalysisRequestSchema), analyzeSEO);

export default router;
