import { Router } from 'express';
import { blueprintController } from '../controllers/blueprint.controller';

const router = Router();

router.post('/generate', (req, res) => blueprintController.generate(req, res));
router.post('/meta/generate', (req, res) => blueprintController.generateMeta(req, res));

export default router;
