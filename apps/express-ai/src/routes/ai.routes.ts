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
    createErrorResponse,
    SystemMessageCode
} from '@platform/contracts';
import { llmService } from '../services/llm.service';

const router = Router();

router.post('/classify-competitor', validateRequest(ClassifyCompetitorRequestSchema), async (req, res) => {
    try {
        const { domain, title, snippet, businessContext } = req.body;
        const result = await competitorClassifier.classify(domain, title || '', snippet || '', businessContext);
        res.json(createSuccessResponse(result, 'Competitor classified', 200, {}, SystemMessageCode.SUCCESS));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500));
    }
});

router.post('/analyze-competitor', validateRequest(AnalyzeCompetitorRequestSchema), async (req, res) => {
    try {
        const { domain, headline, uvp, serviceList, businessContext } = req.body;
        const result = await competitorClassifier.analyze(domain, headline, uvp, serviceList || [], businessContext);
        res.json(createSuccessResponse(result, 'Competitor analyzed', 200, {}, SystemMessageCode.SUCCESS));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500));
    }
});

router.post('/generate-report', validateRequest(GenerateReportRequestSchema), async (req, res) => {
    try {
        const { competitors, businessType } = req.body;
        const result = await competitorClassifier.generateOpportunitiesReport(competitors, businessType);
        res.json(createSuccessResponse(result, 'Report generated', 200, {}, SystemMessageCode.SUCCESS));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500));
    }
});

router.get('/provider-status', async (req, res) => {
    try {
        const info = competitorClassifier.getProviderInfo();
        res.json(createSuccessResponse(info, 'Provider status fetched', 200, {}, SystemMessageCode.SUCCESS));
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json(createErrorResponse('Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500));
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
        res.json(createSuccessResponse(result, 'Replies generated', 200, {}, SystemMessageCode.SUCCESS));
    } catch (error: any) {
        console.error('Review Reply Generation Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500));
    }
});

router.post('/generate-recommendations', validateRequest(GenerateRecommendationsRequestSchema), async (req, res) => {
    try {
        const { category, context } = req.body;
        const result = await brandStrategist.generateRecommendations(category, context);
        res.json(createSuccessResponse(result, 'Recommendations generated', 200, {}, SystemMessageCode.SUCCESS));
    } catch (error: any) {
        console.error('Recommendation Generation Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500));
    }
});

router.post('/generate-visibility-plan', validateRequest(GenerateVisibilityPlanRequestSchema), async (req, res) => {
    try {
        const { context } = req.body;
        const result = await brandStrategist.generateVisibilityPlan(context);
        res.json(createSuccessResponse(result, 'Visibility plan generated', 200, {}, SystemMessageCode.SUCCESS));
    } catch (error: any) {
        console.error('Visibility Plan Generation Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500));
    }
});

router.post('/generate-tone', async (req, res) => {
    try {
        const { businessName, industry, location, extractedData } = req.body;
        if (!businessName) {
            return res.status(400).json({ error: 'Missing businessName' });
        }
        const result = await brandStrategist.generateTone({ businessName, industry, location, extractedData });
        res.json(result);
    } catch (error: any) {
        console.error('Tone Generation Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

router.post('/adapt-content', async (req, res) => {
    try {
        const { template, context } = req.body;
        if (!template || !context) {
            return res.status(400).json({ error: 'Missing template or context' });
        }

        const prompt = `Adapt the following content template for a specific brand.
        
        Template: "${template}"
        
        Brand Context:
        - Business Name: ${context.businessName}
        - Industry: ${context.industry}
        - Target Audience: ${context.audience || 'General'}
        - Brand Voice: ${context.voice || 'Professional'}
        - Mission/Values: ${context.mission || ''}
        ${context.seasonalHook ? `- Seasonal Event: ${context.seasonalHook} (${context.seasonalDescription || ''})` : ''}
        
        Adapt the copy to be engaging and specific to this brand while keeping the original intent of the template.
        ${context.seasonalHook ? 'Incorporate a natural hook for the seasonal event mentioned above.' : ''}
        Return ONLY the adapted text.`;

        const adaptedText = await llmService.generateText(prompt);
        res.json({ adaptedText });
    } catch (error: any) {
        console.error('Content Adaptation Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Review Sentiment Analysis Routes
import { reviewSentimentService } from '../services/review-sentiment.service';

router.post('/reviews/analyze', validateRequest(AnalyzeReviewRequestSchema), async (req, res) => {
    try {
        const { content, rating } = req.body;
        const result = await reviewSentimentService.analyzeReview(content || '', rating);
        res.json(createSuccessResponse(result, 'Review analyzed', 200, {}, SystemMessageCode.SUCCESS));
    } catch (error: any) {
        console.error('Review Analysis Error:', error);
        res.status(500).json(createErrorResponse(error.message || 'Internal Server Error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500));
    }
});

export default router;
