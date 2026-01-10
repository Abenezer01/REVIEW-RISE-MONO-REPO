import { Router } from 'express'
import * as brandProfileController from '../../../src/controllers/brand-profile.controller'

const router = Router()

router.get('/', brandProfileController.getAllBrandProfiles)
router.post('/onboard', brandProfileController.onboardBrandProfile)
router.get('/:id', brandProfileController.getBrandProfile)
router.get('/:id/logs', brandProfileController.getAuditLogs)
router.patch('/:id', brandProfileController.updateBrandProfile)
router.delete('/:id', brandProfileController.deleteBrandProfile)
router.post('/:id/re-extract', brandProfileController.reExtractBrandProfile)
router.post('/:id/confirm-extraction', brandProfileController.confirmBrandProfileExtraction)
router.post('/:id/generate-tone', brandProfileController.generateBrandTone)

export default router
