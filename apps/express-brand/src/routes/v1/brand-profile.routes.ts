import { Router } from 'express'
import * as brandProfileController from '../../../src/controllers/brand-profile.controller'

const router = Router()

router.post('/onboard', brandProfileController.onboardBrandProfile)
router.get('/:id', brandProfileController.getBrandProfile)
router.patch('/:id', brandProfileController.updateBrandProfile)
router.post('/:id/re-extract', brandProfileController.reExtractBrandProfile)
router.post('/:id/confirm-extraction', brandProfileController.confirmBrandProfileExtraction)

export default router
