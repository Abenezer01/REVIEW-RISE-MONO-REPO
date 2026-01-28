
import { Router } from 'express';
import { contentStudioController } from '../controllers/content-studio.controller';

const router = Router();

// Platform: /api/ai/studio

router.post('/captions', (req, res) => contentStudioController.generateCaptions(req, res));
router.post('/hashtags', (req, res) => contentStudioController.generateHashtags(req, res));
router.post('/ideas', (req, res) => contentStudioController.generateIdeas(req, res));
router.post('/plan', (req, res) => contentStudioController.generatePlan(req, res));
router.post('/image-prompt', (req, res) => contentStudioController.generateImagePrompt(req, res));
router.post('/prompts/generate', (req, res) => contentStudioController.generatePromptIdeas(req, res));
router.post('/images', (req, res) => contentStudioController.generateImage(req, res));
router.post('/carousels', (req, res) => contentStudioController.generateCarousel(req, res));
router.post('/scripts', (req, res) => contentStudioController.generateScript(req, res));
router.post('/complete-post', (req, res) => contentStudioController.generateCompletePost(req, res));

export default router;
