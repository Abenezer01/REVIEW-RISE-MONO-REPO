import { Router } from 'express';
import * as reviewsController from '../../controllers/reviews.controller';
import * as authController from '../../controllers/auth.controller';

const router = Router();

// Review Sources
router.get('/locations/:locationId/sources', reviewsController.listReviewSources);
router.get('/locations/:locationId/reviews', reviewsController.listLocationReviews);
router.delete('/sources/:id', reviewsController.disconnectReviewSource);
router.post('/locations/:locationId/sync', reviewsController.syncReviews);
router.get('/locations/:locationId/stats', reviewsController.getReviewStats);

// OAuth
router.get('/auth/google/connect', authController.connectGoogle);
router.get('/auth/google/callback', authController.googleCallback);

export default router;
