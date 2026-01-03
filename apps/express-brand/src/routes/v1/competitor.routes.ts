import { Router } from 'express';
import * as CompetitorController from '../../controllers/competitor.controller';

const router = Router({ mergeParams: true }); // Important for accessing :id from parent router

router.post('/discover', CompetitorController.discover);
router.get('/', CompetitorController.list);
router.post('/', CompetitorController.add);
router.patch('/:competitorId', CompetitorController.update);
router.post('/:competitorId/extract', CompetitorController.extract);
router.post('/:competitorId/hide', CompetitorController.hide);
router.post('/:competitorId/unhide', CompetitorController.unhide);
router.delete('/:competitorId', CompetitorController.remove);

export default router;
