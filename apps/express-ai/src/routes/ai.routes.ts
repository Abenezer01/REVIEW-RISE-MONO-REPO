import { Router } from 'express';
import { competitorClassifier } from '../services/competitor-classifier.service';
import { llmService } from '../services/llm.service';

const router = Router();

router.post('/classify-competitor', async (req, res) => {
    try {
        const { domain, title, snippet, businessContext } = req.body;

        if (!domain) {
            return res.status(400).json({ error: 'Domain is required' });
        }

        const result = await competitorClassifier.classify(domain, title || '', snippet || '', businessContext);
        res.json(result);
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/analyze-competitor', async (req, res) => {
    try {
        const { domain, headline, uvp, serviceList, businessContext } = req.body;
        const result = await competitorClassifier.analyze(domain, headline, uvp, serviceList || [], businessContext);
        res.json(result);
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/generate-report', async (req, res) => {
    try {
        const { competitors, businessType } = req.body;
        const result = await competitorClassifier.generateOpportunitiesReport(competitors, businessType);
        res.json(result);
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/provider-status', async (req, res) => {
    try {
        const info = competitorClassifier.getProviderInfo();
        res.json(info);
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Brand Strategist Routes
import { brandStrategist } from '../services/brand-strategist.service';
import { ReviewReplyGeneratorService } from '../services/review-reply-generator.service';

const replyGenerator = new ReviewReplyGeneratorService();

router.post('/generate-review-replies', async (req, res) => {
    try {
        const { reviewId, options } = req.body;
        if (!reviewId) {
            return res.status(400).json({ error: 'Missing reviewId' });
        }
        const result = await replyGenerator.generateReplyVariations(reviewId, options);
        res.json(result);
    } catch (error: any) {
        console.error('Review Reply Generation Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

router.post('/generate-recommendations', async (req, res) => {
    try {
        const { category, context } = req.body;
        if (!category || !context) {
            return res.status(400).json({ error: 'Missing category or context' });
        }
        const result = await brandStrategist.generateRecommendations(category, context);
        res.json(result);
    } catch (error: any) {
        console.error('Recommendation Generation Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

router.post('/generate-visibility-plan', async (req, res) => {
    try {
        const { context } = req.body;
        if (!context) {
            return res.status(400).json({ error: 'Missing context' });
        }
        const result = await brandStrategist.generateVisibilityPlan(context);
        res.json(result);
    } catch (error: any) {
        console.error('Visibility Plan Generation Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
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

router.post('/reviews/analyze', async (req, res) => {
    try {
        const { content, rating } = req.body;
        
        if (rating === undefined || rating === null) {
            return res.status(400).json({ error: 'Rating is required' });
        }

        const result = await reviewSentimentService.analyzeReview(content || '', rating);
        res.json(result);
    } catch (error: any) {
        console.error('Review Analysis Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default router;
