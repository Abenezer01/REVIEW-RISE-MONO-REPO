import { Router } from 'express';
import * as reviewController from '../../controllers/review.controller';

const router = Router();

/**
 * @route GET /api/v1/reviews/location/:locationId
 * @desc List reviews by location with pagination and filters
 * @access Public (or as per auth policy)
 */
router.get('/location/:locationId', reviewController.listReviews);

export default router;
