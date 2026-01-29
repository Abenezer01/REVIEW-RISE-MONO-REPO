import { Router } from 'express';
import { keywordController } from '../../controllers/keyword.controller';
import { validateRequest } from '@platform/middleware';
import { CreateKeywordSchema, BulkCreateKeywordsSchema, KeywordQuerySchema } from '@platform/contracts';
import { z } from 'zod';

const router = Router();

const IdParamSchema = z.object({ id: z.string().uuid() });

// Keyword management routes
router.get('/', validateRequest(KeywordQuerySchema, 'query'), keywordController.listKeywords.bind(keywordController));
router.post('/', validateRequest(CreateKeywordSchema), keywordController.createKeyword.bind(keywordController));
router.post('/bulk', validateRequest(BulkCreateKeywordsSchema), keywordController.bulkCreateKeywords.bind(keywordController));
router.get('/suggest', keywordController.suggestKeywords.bind(keywordController));
router.post('/harvest', keywordController.harvestCompetitor.bind(keywordController));
router.put('/:id', validateRequest(IdParamSchema, 'params'), keywordController.updateKeyword.bind(keywordController));
router.delete('/:id', validateRequest(IdParamSchema, 'params'), keywordController.deleteKeyword.bind(keywordController));
router.get('/:id/ranks', validateRequest(IdParamSchema, 'params'), keywordController.getKeywordRanks.bind(keywordController));

export default router;
