import { Router } from 'express';
import { studioDraftsController } from '../../controllers/studio-drafts.controller';
import { validateRequest } from '@platform/middleware';
import { StudioDraftSchema } from '@platform/contracts';

const router = Router({ mergeParams: true });

// GET /api/v1/brands/:id/caption-drafts
router.get('/caption-drafts', (req, res) => studioDraftsController.getCaptionDrafts(req, res));

// POST /api/v1/brands/:businessId/caption-drafts
router.post('/caption-drafts', validateRequest(StudioDraftSchema), (req, res) => studioDraftsController.saveCaptionDrafts(req, res));

// GET /api/v1/brands/:id/content-ideas
router.get('/content-ideas', (req, res) => studioDraftsController.getContentIdeas(req, res));

// POST /api/v1/brands/:businessId/content-ideas
router.post('/content-ideas', validateRequest(StudioDraftSchema), (req, res) => studioDraftsController.saveContentIdeas(req, res));

// POST /api/v1/brands/:businessId/image-prompts
router.post('/image-prompts', validateRequest(StudioDraftSchema), (req, res) => studioDraftsController.saveImagePrompt(req, res));

// POST /api/v1/brands/:businessId/carousel-drafts
router.post('/carousel-drafts', validateRequest(StudioDraftSchema), (req, res) => studioDraftsController.saveCarouselDraft(req, res));

// GET /api/v1/brands/:id/carousel-drafts
router.get('/carousel-drafts', (req, res) => studioDraftsController.getCarouselDrafts(req, res));

// POST /api/v1/brands/:businessId/script-drafts
router.post('/script-drafts', validateRequest(StudioDraftSchema), (req, res) => studioDraftsController.saveScriptDraft(req, res));

export default router;
