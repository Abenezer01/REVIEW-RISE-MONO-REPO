import { Router } from 'express';
import seoRoutes from './seo.routes';

const router = Router();

router.use('/seo', seoRoutes);

export default router;
