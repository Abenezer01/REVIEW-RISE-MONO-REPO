import { Router } from 'express'
import * as brandProfileController from '../../controllers/brand-profile.controller'
import { validateRequest } from '@platform/middleware'
import { BrandProfileSchema } from '@platform/contracts'
import { z } from 'zod'

const router = Router()

const IdParamSchema = z.object({ id: z.string().uuid() });

router.get('/', brandProfileController.getAllBrandProfiles)
router.post('/onboard', brandProfileController.onboardBrandProfile)
router.get('/:id', validateRequest(IdParamSchema, 'params'), brandProfileController.getBrandProfile)
router.patch('/:id', validateRequest(IdParamSchema, 'params'), validateRequest(BrandProfileSchema), brandProfileController.updateBrandProfile)
router.post('/:id/re-extract', validateRequest(IdParamSchema, 'params'), brandProfileController.reExtractBrandProfile)
router.post('/:id/confirm', validateRequest(IdParamSchema, 'params'), brandProfileController.confirmBrandProfileExtraction)
router.post('/:id/generate-tone', validateRequest(IdParamSchema, 'params'), brandProfileController.generateBrandTone)
router.get('/:id/audit-logs', validateRequest(IdParamSchema, 'params'), brandProfileController.getAuditLogs)
router.delete('/:id', validateRequest(IdParamSchema, 'params'), brandProfileController.deleteBrandProfile)

export default router
