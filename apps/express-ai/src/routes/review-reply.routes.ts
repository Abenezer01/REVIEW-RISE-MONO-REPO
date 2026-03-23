import { Router } from 'express';
import { generateReviewReply } from '../controllers/review-reply.controller';

const router = Router();

// POST /api/v1/review-reply/generate
router.post('/generate', generateReviewReply);

export default router;
