import { Router } from 'express';
import * as ContentController from '../../controllers/content.controller';
import { validateRequest } from '@platform/middleware';
import { BrandContentSchema, UpdateBrandContentSchema } from '@platform/contracts';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const ContentIdParamSchema = z.object({ contentId: z.string().uuid() });

router.get('/', ContentController.list);
router.post('/', validateRequest(BrandContentSchema), ContentController.create);
router.patch('/:contentId', validateRequest(ContentIdParamSchema, 'params'), validateRequest(UpdateBrandContentSchema), ContentController.update);
router.delete('/:contentId', validateRequest(ContentIdParamSchema, 'params'), ContentController.remove);

export default router;
