import { Router } from 'express';
import { studioDraftsController } from '../../controllers/studio-drafts.controller';

const router = Router({ mergeParams: true });

// GET /api/v1/brands/:id/caption-drafts
router.get('/caption-drafts', (req, res) => studioDraftsController.getCaptionDrafts(req, res));

// POST /api/v1/brands/:businessId/caption-drafts
router.post('/caption-drafts', (req, res) => studioDraftsController.saveCaptionDrafts(req, res));

// GET /api/v1/brands/:id/content-ideas
router.get('/content-ideas', (req, res) => studioDraftsController.getContentIdeas(req, res));

// POST /api/v1/brands/:businessId/content-ideas
router.post('/content-ideas', (req, res) => studioDraftsController.saveContentIdeas(req, res));

// POST /api/v1/brands/:businessId/image-prompts
router.post('/image-prompts', (req, res) => studioDraftsController.saveImagePrompt(req, res));

// POST /api/v1/brands/:businessId/carousel-drafts
router.post('/carousel-drafts', (req, res) => studioDraftsController.saveCarouselDraft(req, res));

// GET /api/v1/brands/:id/carousel-drafts
router.get('/carousel-drafts', (req, res) => studioDraftsController.getCarouselDrafts(req, res));

// POST /api/v1/brands/:businessId/script-drafts
router.post('/script-drafts', (req, res) => studioDraftsController.saveScriptDraft(req, res));

export default router;
