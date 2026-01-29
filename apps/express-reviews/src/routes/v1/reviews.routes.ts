import { Router } from 'express';
import * as reviewsController from '../../controllers/reviews.controller';
import * as authController from '../../controllers/auth.controller';
import * as reviewController from '../../controllers/review.controller';
import * as analyticsController from '../../controllers/analytics.controller';
import { validateRequest } from '@platform/middleware';
import {
  ListReviewsQuerySchema,
  PostReplyRequestSchema,
  AnalyticsQuerySchema,
  AddCompetitorDataSchema
} from '@platform/contracts';
import { z } from 'zod';

const router = Router();

const LocationIdParamSchema = z.object({ locationId: z.string().uuid() });
const ReviewIdParamSchema = z.object({ reviewId: z.string().uuid() });
const SourceIdParamSchema = z.object({ id: z.string().uuid() });

/**
 * @route GET /api/v1/reviews/location/:locationId
 * @desc List reviews by location with pagination and filters
 * @access Public (or as per auth policy)
 */
router.get('/location/:locationId', validateRequest(LocationIdParamSchema, 'params'), validateRequest(ListReviewsQuerySchema, 'query'), reviewController.listReviews);

// Review Sources
router.get('/locations/:locationId/sources', validateRequest(LocationIdParamSchema, 'params'), reviewsController.listReviewSources);
router.get('/locations/:locationId/reviews', validateRequest(LocationIdParamSchema, 'params'), validateRequest(ListReviewsQuerySchema, 'query'), reviewsController.listLocationReviews);
router.delete('/sources/:id', validateRequest(SourceIdParamSchema, 'params'), reviewsController.disconnectReviewSource);
router.post('/locations/:locationId/sync', validateRequest(LocationIdParamSchema, 'params'), reviewsController.syncReviews);
router.get('/locations/:locationId/stats', validateRequest(LocationIdParamSchema, 'params'), reviewsController.getReviewStats);
router.get('/locations/:locationId/keywords', validateRequest(LocationIdParamSchema, 'params'), reviewsController.getLocationKeywords);

// Review Actions
router.post('/:reviewId/reply', validateRequest(ReviewIdParamSchema, 'params'), validateRequest(PostReplyRequestSchema), reviewController.postReply);
router.post('/:reviewId/reject', validateRequest(ReviewIdParamSchema, 'params'), reviewController.rejectReply);

// Analytics
router.get('/analytics/rating-trend', validateRequest(AnalyticsQuerySchema, 'query'), analyticsController.getRatingTrend);
router.get('/analytics/volume', validateRequest(AnalyticsQuerySchema, 'query'), analyticsController.getReviewVolume);
router.get('/analytics/sentiment', validateRequest(AnalyticsQuerySchema, 'query'), analyticsController.getSentimentHeatmap);
router.get('/analytics/keywords', validateRequest(AnalyticsQuerySchema, 'query'), analyticsController.getTopKeywords);
router.get('/analytics/summary', validateRequest(AnalyticsQuerySchema, 'query'), analyticsController.getRecentSummary);
router.get('/analytics/competitor-comparison', validateRequest(AnalyticsQuerySchema, 'query'), analyticsController.getCompetitorComparison);
router.get('/analytics/metrics', validateRequest(AnalyticsQuerySchema, 'query'), analyticsController.getDashboardMetrics);
router.post('/analytics/competitors', validateRequest(AddCompetitorDataSchema), analyticsController.addCompetitorData);

// OAuth
router.get('/auth/google/connect', authController.connectGoogle);
router.get('/auth/google/callback', authController.googleCallback);

export default router;
