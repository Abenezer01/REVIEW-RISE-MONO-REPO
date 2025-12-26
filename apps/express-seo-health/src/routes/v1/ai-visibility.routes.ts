import express from 'express';
import { AIVisibilityController } from '../../controllers/ai-visibility.controller';

const router = express.Router();
const controller = new AIVisibilityController();

router.post('/analyze', controller.analyze.bind(controller));

export default router;
