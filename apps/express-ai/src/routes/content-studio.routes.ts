import { Router } from 'express';
import { contentStudioController } from '../controllers/content-studio.controller';
import { validateRequest } from '@platform/middleware';
import {
    CaptionRequestSchema,
    HashtagRequestSchema,
    IdeaRequestSchema,
    PlanRequestSchema,
    ImagePromptRequestSchema,
    PromptIdeaRequestSchema,
    ImageGenerationRequestSchema,
    CarouselRequestSchema,
    ScriptRequestSchema
} from '@platform/contracts';

const router = Router();

// Platform: /api/ai/studio

router.post('/captions', validateRequest(CaptionRequestSchema), (req, res) => contentStudioController.generateCaptions(req, res));
router.post('/hashtags', validateRequest(HashtagRequestSchema), (req, res) => contentStudioController.generateHashtags(req, res));
router.post('/ideas', validateRequest(IdeaRequestSchema), (req, res) => contentStudioController.generateIdeas(req, res));
router.post('/plan', validateRequest(PlanRequestSchema), (req, res) => contentStudioController.generatePlan(req, res));
router.post('/image-prompt', validateRequest(ImagePromptRequestSchema), (req, res) => contentStudioController.generateImagePrompt(req, res));
router.post('/prompts/generate', validateRequest(PromptIdeaRequestSchema), (req, res) => contentStudioController.generatePromptIdeas(req, res));
router.post('/images', validateRequest(ImageGenerationRequestSchema), (req, res) => contentStudioController.generateImage(req, res));
router.post('/carousels', validateRequest(CarouselRequestSchema), (req, res) => contentStudioController.generateCarousel(req, res));
router.post('/scripts', validateRequest(ScriptRequestSchema), (req, res) => contentStudioController.generateScript(req, res));

export default router;
