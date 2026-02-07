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
import { generateConcepts, generateCreativeImage } from '../controllers/creative-engine.controller';

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

// Creative Engine Routes
router.post('/creative-engine/concepts', generateConcepts);
router.post('/creative-engine/image', generateCreativeImage);

router.post('/extract-offer', async (req, res) => {
    try {
        const { html, businessContext } = req.body;
        if (!html) {
            return res.status(400).json({ error: 'Missing html content' });
        }

        const prompt = `
        You are a conversion optimization expert. Analyze the following website HTML and extract any current promotional offers, discounts, or incentives (e.g., "$50 off", "Buy 1 Get 1 Free", "Free Consultation", "Join for $1").
        
        Business Context: ${businessContext || 'Local Business'}
        
        HTML Content:
        ${html.substring(0, 15000)} // Truncate to avoid token limits
        
        Rules:
        1. Identify the most prominent offer.
        2. Describe it in a concise (1-2 sentences), high-converting way suitable for an ad campaign.
        3. If no specific offer is found, summarize the core value proposition of the service.
        4. Return ONLY the extracted text. No JSON, no preamble.
        `;

        const extractedOffer = await llmService.generateText(prompt, { temperature: 0.3 });
        res.json({ extractedOffer: extractedOffer.trim() });
    } catch (error: any) {
        console.error('Offer Extraction Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

router.post('/recommend-goal', async (req, res) => {
    try {
        const { offer, industry, businessContext } = req.body;
        if (!offer) {
            return res.status(400).json({ error: 'Missing offer content' });
        }

        const prompt = `
        You are a digital marketing strategist. Based on the following offer and industry, recommend the most appropriate campaign goal from the list: [traffic, leads, sales, awareness].
        
        Industry: ${industry || 'Not specified'}
        Offer: ${offer}
        Business Context: ${businessContext || 'Local Business'}
        
        Rules:
        1. Choose exactly one from: [traffic, leads, sales, awareness].
        2. 'sales' is for direct purchases.
        3. 'leads' is for service-based businesses or complex products requiring contact.
        4. 'traffic' is for educational content or getting people to a physical store/detailed page.
        5. 'awareness' is for new brands or reaching the widest audience possible.
        
        Return ONLY the chosen goal word.
        `;

        const recommendedGoal = await llmService.generateText(prompt, { temperature: 0.1 });
        const cleanGoal = recommendedGoal.trim().toLowerCase();

        // Validate output
        const validGoals = ['traffic', 'leads', 'sales', 'awareness'];
        res.json({ recommendedGoal: validGoals.includes(cleanGoal) ? cleanGoal : 'leads' });
    } catch (error: any) {
        console.error('Goal Recommendation Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default router;
