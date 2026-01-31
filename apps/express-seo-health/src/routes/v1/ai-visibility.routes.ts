import express from 'express';
import { AIVisibilityController } from '../../controllers/ai-visibility.controller';
import { validateRequest } from '@platform/middleware';
import { AIVisibilityAnalyzeSchema, AIVisibilityValidateSchema } from '@platform/contracts';

const router = express.Router();
const controller = new AIVisibilityController();

router.post('/analyze', validateRequest(AIVisibilityAnalyzeSchema), controller.analyze.bind(controller));
router.post('/validate', validateRequest(AIVisibilityValidateSchema), controller.validate.bind(controller));

export default router;
