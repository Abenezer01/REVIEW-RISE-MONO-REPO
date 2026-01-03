import { Router } from 'express';
import { competitorClassifier } from '../services/competitor-classifier.service';

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

export default router;
