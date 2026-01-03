import { Router } from 'express';
import * as DNAController from '../../controllers/dna.controller';

const router = Router({ mergeParams: true });

router.get('/', DNAController.get);
router.post('/', DNAController.upsert);

export default router;
