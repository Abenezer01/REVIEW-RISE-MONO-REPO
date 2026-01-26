import { Router } from 'express';
import { competitorClassifier } from '../services/competitor-classifier.service';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

const router = Router();

router.post('/classify-competitor', async (req, res) => {
    const requestId = req.id;
    try {
        const { domain, title, snippet, businessContext } = req.body;

        if (!domain) {
            return res.status(400).json(createErrorResponse('Domain is required', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }

        const result = await competitorClassifier.classify(domain, title || '', snippet || '', businessContext);
        res.json(createSuccessResponse(result, 'Competitor classified successfully', 200, { requestId }));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
});

router.post('/analyze-competitor', async (req, res) => {
    const requestId = req.id;
    try {
        const { domain, headline, uvp, serviceList, businessContext } = req.body;
        const result = await competitorClassifier.analyze(domain, headline, uvp, serviceList || [], businessContext);
        res.json(createSuccessResponse(result, 'Competitor analyzed successfully', 200, { requestId }));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
});

router.post('/generate-report', async (req, res) => {
    const requestId = req.id;
    try {
        const { competitors, businessType } = req.body;
        const result = await competitorClassifier.generateOpportunitiesReport(competitors, businessType);
        res.json(createSuccessResponse(result, 'Opportunities report generated successfully', 200, { requestId }));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
});

router.get('/provider-status', async (req, res) => {
    const requestId = req.id;
    try {
        const info = competitorClassifier.getProviderInfo();
        res.json(createSuccessResponse(info, 'Provider status fetched', 200, { requestId }));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
});

// Brand Strategist Routes
import { brandStrategist } from '../services/brand-strategist.service';
import { ReviewReplyGeneratorService } from '../services/review-reply-generator.service';

const replyGenerator = new ReviewReplyGeneratorService();

router.post('/generate-review-replies', async (req, res) => {
    const requestId = req.id;
    try {
        const { reviewId, options } = req.body;
        if (!reviewId) {
            return res.status(400).json(createErrorResponse('Missing reviewId', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }
        const result = await replyGenerator.generateReplyVariations(reviewId, options);
        res.json(createSuccessResponse(result, 'Review replies generated', 200, { requestId }));
    } catch (error: any) {
        console.error('Review Reply Generation Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
});

router.post('/generate-recommendations', async (req, res) => {
    const requestId = req.id;
    try {
        const { category, context } = req.body;
        if (!category || !context) {
            return res.status(400).json(createErrorResponse('Missing category or context', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }
        const result = await brandStrategist.generateRecommendations(category, context);
        res.json(createSuccessResponse(result, 'Recommendations generated', 200, { requestId }));
    } catch (error: any) {
        console.error('Recommendation Generation Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
});

router.post('/generate-visibility-plan', async (req, res) => {
    const requestId = req.id;
    try {
        const { context } = req.body;
        if (!context) {
            return res.status(400).json(createErrorResponse('Missing context', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }
        const result = await brandStrategist.generateVisibilityPlan(context);
        res.json(createSuccessResponse(result, 'Visibility plan generated', 200, { requestId }));
    } catch (error: any) {
        console.error('Visibility Plan Generation Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
});

// Review Sentiment Analysis Routes
import { reviewSentimentService } from '../services/review-sentiment.service';

router.post('/reviews/analyze', async (req, res) => {
    const requestId = req.id;
    try {
        const { content, rating } = req.body;
        
        if (rating === undefined || rating === null) {
            return res.status(400).json(createErrorResponse('Rating is required', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }

        const result = await reviewSentimentService.analyzeReview(content || '', rating);
        res.json(createSuccessResponse(result, 'Review analysis completed', 200, { requestId }));
    } catch (error: any) {
        console.error('Review Analysis Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
});

export default router;
