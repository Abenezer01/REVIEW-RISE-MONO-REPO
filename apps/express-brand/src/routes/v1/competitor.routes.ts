import { Router } from 'express';
import * as CompetitorController from '../../controllers/competitor.controller';
import { validateRequest } from '@platform/middleware';
import { CompetitorSchema, UpdateCompetitorSchema } from '@platform/contracts';
import { z } from 'zod';

const router = Router({ mergeParams: true }); // Important for accessing :id from parent router

const CompetitorIdParamSchema = z.object({ competitorId: z.string().uuid() });

router.post('/discover', CompetitorController.discover);
router.get('/', CompetitorController.list);
router.post('/', validateRequest(CompetitorSchema), CompetitorController.add);
router.patch('/:competitorId', validateRequest(CompetitorIdParamSchema, 'params'), validateRequest(UpdateCompetitorSchema), CompetitorController.update);
router.post('/:competitorId/extract', validateRequest(CompetitorIdParamSchema, 'params'), CompetitorController.extract);
router.post('/:competitorId/hide', validateRequest(CompetitorIdParamSchema, 'params'), CompetitorController.hide);
router.post('/:competitorId/unhide', validateRequest(CompetitorIdParamSchema, 'params'), CompetitorController.unhide);
router.delete('/:competitorId', validateRequest(CompetitorIdParamSchema, 'params'), CompetitorController.remove);
router.get('/:competitorId', validateRequest(CompetitorIdParamSchema, 'params'), CompetitorController.get);

export default router;
