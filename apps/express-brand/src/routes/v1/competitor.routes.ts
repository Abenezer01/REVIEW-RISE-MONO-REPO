import { Router } from 'express';
import * as CompetitorController from '../../controllers/competitor.controller';

const router = Router({ mergeParams: true }); // Important for accessing :id from parent router

router.get('/', CompetitorController.list);
router.post('/', CompetitorController.add);
router.delete('/:competitorId', CompetitorController.remove);

export default router;
