import { Router } from 'express';
import * as DNAController from '../../controllers/dna.controller';
import { validateRequest } from '@platform/middleware';
import { BrandDNASchema } from '@platform/contracts';

const router = Router({ mergeParams: true });

router.get('/', DNAController.get);
router.post('/', validateRequest(BrandDNASchema), DNAController.upsert);

export default router;
