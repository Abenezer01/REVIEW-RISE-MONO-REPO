import { Router } from 'express';
import * as ScheduledPostsController from '../../controllers/scheduled-posts.controller';

const router = Router({ mergeParams: true });

router.get('/logs', ScheduledPostsController.getLogs);
router.get('/', ScheduledPostsController.list);
router.post('/', ScheduledPostsController.create);
router.get('/:postId', ScheduledPostsController.get);
router.post('/:postId/duplicate', ScheduledPostsController.duplicate);
router.patch('/:postId', ScheduledPostsController.update);
router.delete('/:postId', ScheduledPostsController.remove);

export default router;
