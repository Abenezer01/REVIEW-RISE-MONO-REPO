import { Router } from 'express';
import * as reviewsController from '../../controllers/reviews.controller';
import * as authController from '../../controllers/auth.controller';
import * as reviewController from '../../controllers/review.controller';
import * as analyticsController from '../../controllers/analytics.controller';

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
router.get('/locations/:locationId/keywords', reviewsController.getLocationKeywords);

// Review Actions
router.post('/:reviewId/reply', reviewController.postReply);
router.post('/:reviewId/reject', reviewController.rejectReply);

// Analytics
router.get('/analytics/rating-trend', analyticsController.getRatingTrend);
router.get('/analytics/volume', analyticsController.getReviewVolume);
router.get('/analytics/sentiment', analyticsController.getSentimentHeatmap);
router.get('/analytics/keywords', analyticsController.getTopKeywords);
router.get('/analytics/summary', analyticsController.getRecentSummary);
router.get('/analytics/competitor-comparison', analyticsController.getCompetitorComparison);
router.get('/analytics/metrics', analyticsController.getDashboardMetrics);
router.post('/analytics/competitors', analyticsController.addCompetitorData);

// OAuth
router.get('/auth/google/connect', authController.connectGoogle);
router.get('/auth/google/callback', authController.googleCallback);

export default router;
