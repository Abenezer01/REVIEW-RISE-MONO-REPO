import { Router } from 'express';
import * as ReviewController from '../../controllers/review.controller';

const router = Router({ mergeParams: true });

router.get('/', ReviewController.list);
router.get('/stats', ReviewController.getStats);
router.post('/:reviewId/reply', ReviewController.reply);

export default router;
