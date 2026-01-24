
import { Router } from 'express';
import { postsController } from '../../controllers/posts.controller';

const router = Router();

router.post('/', (req, res) => postsController.create(req, res));
router.get('/', (req, res) => postsController.list(req, res));
router.post('/batch', (req, res) => postsController.createBatch(req, res));

export default router;
