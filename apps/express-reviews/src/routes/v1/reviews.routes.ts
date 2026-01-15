import { Router } from 'express';
import * as reviewsController from '../../controllers/reviews.controller';
import * as authController from '../../controllers/auth.controller';
import * as reviewController from '../../controllers/review.controller';

const router = Router();


/**
 * @route GET /api/v1/reviews/location/:locationId
 * @desc List reviews by location with pagination and filters
 * @access Public (or as per auth policy)
 */
router.get('/location/:locationId', reviewController.listReviews);

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
