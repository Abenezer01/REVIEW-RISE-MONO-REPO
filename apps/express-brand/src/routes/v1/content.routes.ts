import { Router } from 'express';
import * as ContentController from '../../controllers/content.controller';

const router = Router({ mergeParams: true });

router.get('/', ContentController.list);
router.post('/', ContentController.create);
router.patch('/:contentId', ContentController.update);
router.delete('/:contentId', ContentController.remove);

export default router;
