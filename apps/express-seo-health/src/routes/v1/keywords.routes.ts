import { Router } from 'express';
import { keywordController } from '../../controllers/keyword.controller';

const router = Router();

// Keyword management routes
router.get('/', keywordController.listKeywords.bind(keywordController));
router.post('/', keywordController.createKeyword.bind(keywordController));
router.post('/bulk', keywordController.bulkCreateKeywords.bind(keywordController));
router.put('/:id', keywordController.updateKeyword.bind(keywordController));
router.delete('/:id', keywordController.deleteKeyword.bind(keywordController));
router.get('/:id/ranks', keywordController.getKeywordRanks.bind(keywordController));

export default router;
