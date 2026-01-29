import { Router } from 'express';
import { competitorClassifier } from '../services/competitor-classifier.service';
import { validateRequest } from '@platform/middleware';
import {
    ClassifyCompetitorRequestSchema,
    AnalyzeCompetitorRequestSchema,
    GenerateReportRequestSchema,
    GenerateReviewRepliesRequestSchema,
    GenerateRecommendationsRequestSchema,
    GenerateVisibilityPlanRequestSchema,
    AnalyzeReviewRequestSchema,
    createSuccessResponse,
    createErrorResponse
} from '@platform/contracts';

const router = Router();

router.post('/classify-competitor', validateRequest(ClassifyCompetitorRequestSchema), async (req, res) => {
    try {
        const { domain, title, snippet, businessContext } = req.body;
        const result = await competitorClassifier.classify(domain, title || '', snippet || '', businessContext);
        res.json(createSuccessResponse(result));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', 'INTERNAL_SERVER_ERROR', 500));
    }
});

router.post('/analyze-competitor', validateRequest(AnalyzeCompetitorRequestSchema), async (req, res) => {
    try {
        const { domain, headline, uvp, serviceList, businessContext } = req.body;
        const result = await competitorClassifier.analyze(domain, headline, uvp, serviceList || [], businessContext);
        res.json(createSuccessResponse(result));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', 'INTERNAL_SERVER_ERROR', 500));
    }
});

router.post('/generate-report', validateRequest(GenerateReportRequestSchema), async (req, res) => {
    try {
        const { competitors, businessType } = req.body;
        const result = await competitorClassifier.generateOpportunitiesReport(competitors, businessType);
        res.json(createSuccessResponse(result));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', 'INTERNAL_SERVER_ERROR', 500));
    }
});

router.get('/provider-status', async (req, res) => {
    try {
        const info = competitorClassifier.getProviderInfo();
        res.json(createSuccessResponse(info));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', 'INTERNAL_SERVER_ERROR', 500));
    }
});

// Brand Strategist Routes
import { brandStrategist } from '../services/brand-strategist.service';
import { ReviewReplyGeneratorService } from '../services/review-reply-generator.service';

const replyGenerator = new ReviewReplyGeneratorService();

router.post('/generate-review-replies', validateRequest(GenerateReviewRepliesRequestSchema), async (req, res) => {
    try {
        const { reviewId, options } = req.body;
        const result = await replyGenerator.generateReplyVariations(reviewId, options);
        res.json(createSuccessResponse(result));
    } catch (error: any) {
        console.error('Review Reply Generation Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', 500));
    }
});

router.post('/generate-recommendations', validateRequest(GenerateRecommendationsRequestSchema), async (req, res) => {
    try {
        const { category, context } = req.body;
        const result = await brandStrategist.generateRecommendations(category, context);
        res.json(createSuccessResponse(result));
    } catch (error: any) {
        console.error('Recommendation Generation Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', 500));
    }
});

router.post('/generate-visibility-plan', validateRequest(GenerateVisibilityPlanRequestSchema), async (req, res) => {
    try {
        const { context } = req.body;
        const result = await brandStrategist.generateVisibilityPlan(context);
        res.json(createSuccessResponse(result));
    } catch (error: any) {
        console.error('Visibility Plan Generation Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', 500));
    }
});

// Review Sentiment Analysis Routes
import { reviewSentimentService } from '../services/review-sentiment.service';

router.post('/reviews/analyze', validateRequest(AnalyzeReviewRequestSchema), async (req, res) => {
    try {
        const { content, rating } = req.body;
        const result = await reviewSentimentService.analyzeReview(content || '', rating);
        res.json(createSuccessResponse(result));
    } catch (error: any) {
        console.error('Review Analysis Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', 500));
    }
});

export default router;
