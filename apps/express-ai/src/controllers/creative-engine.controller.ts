import { Request, Response } from 'express';
import { creativeEngineService } from '../services/creative-engine.service';
import { CreativeConceptInput } from '@platform/contracts';

export const generateConcepts = async (req: Request, res: Response) => {
    try {
        const input: CreativeConceptInput = req.body;
        
        // Basic validation
        if (!input.offer || !input.audience) {
            return res.status(400).json({ error: 'Offer and Audience are required.' });
        }

        const result = await creativeEngineService.generateConcepts(input);
        res.json(result);
    } catch (error) {
        console.error('Error in generateConcepts controller:', error);
        res.status(500).json({ error: 'Failed to generate concepts.' });
    }
};

export const generateCreativeImage = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Image prompt is required.' });
        }

        const imageUrl = await creativeEngineService.generateImage(prompt);
        res.json({ url: imageUrl });
    } catch (error) {
        console.error('Error in generateCreativeImage controller:', error);
        res.status(500).json({ error: 'Failed to generate image.' });
    }
};
