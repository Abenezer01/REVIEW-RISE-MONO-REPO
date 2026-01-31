import { Router } from 'express';
import * as ScheduledPostsController from '../../controllers/scheduled-posts.controller';
import { validateRequest } from '@platform/middleware';
import { ScheduledPostSchema, UpdateScheduledPostSchema } from '@platform/contracts';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const PostIdParamSchema = z.object({ postId: z.string().uuid() });

router.get('/logs', ScheduledPostsController.getLogs);
router.get('/', ScheduledPostsController.list);
router.post('/', validateRequest(ScheduledPostSchema), ScheduledPostsController.create);
router.get('/:postId', validateRequest(PostIdParamSchema, 'params'), ScheduledPostsController.get);
router.post('/:postId/duplicate', validateRequest(PostIdParamSchema, 'params'), ScheduledPostsController.duplicate);
router.patch('/:postId', validateRequest(PostIdParamSchema, 'params'), validateRequest(UpdateScheduledPostSchema), ScheduledPostsController.update);
router.delete('/:postId', validateRequest(PostIdParamSchema, 'params'), ScheduledPostsController.remove);

export default router;
