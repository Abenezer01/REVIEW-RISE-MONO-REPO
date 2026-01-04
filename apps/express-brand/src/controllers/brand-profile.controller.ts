import { Request, Response, NextFunction } from 'express'
import * as brandProfileService from '../services/brand-profile.service'

export const getAllBrandProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, businessId, status } = req.query

    const result = await brandProfileService.getAllBrandProfiles({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      businessId: businessId as string,
      status: status as string
    })

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const onboardBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { websiteUrl, businessId } = req.body
    const brandProfile = await brandProfileService.onboardBrandProfile(businessId, websiteUrl)
    res.status(202).json({ message: 'Extraction initiated', brandProfileId: brandProfile.id })
  } catch (error) {
    next(error)
  }
}

export const getBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const brandProfile = await brandProfileService.getBrandProfile(id)
    if (!brandProfile) {
      return res.status(404).json({ message: 'Brand profile not found' })
    }
    res.status(200).json(brandProfile)
  } catch (error) {
    next(error)
  }
}

export const updateBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const updatedData = req.body
    const brandProfile = await brandProfileService.updateBrandProfile(id, updatedData)
    if (!brandProfile) {
      return res.status(404).json({ message: 'Brand profile not found' })
    }
    res.status(200).json(brandProfile)
  } catch (error) {
    next(error)
  }
}

export const reExtractBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const brandProfile = await brandProfileService.reExtractBrandProfile(id)
    if (!brandProfile) {
      return res.status(404).json({ message: 'Brand profile not found' })
    }
    res.status(202).json({ message: 'Re-extraction initiated', brandProfileId: brandProfile.id })
  } catch (error) {
    next(error)
  }
}

export const confirmBrandProfileExtraction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const brandProfile = await brandProfileService.confirmExtraction(id)
    if (!brandProfile) {
      return res.status(404).json({ message: 'Brand profile not found' })
    }
    res.status(200).json({ message: 'Extraction confirmed', brandProfile })
  } catch (error) {
    next(error)
  }
}

export const generateBrandTone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { industry, location } = req.body
    const toneData = await brandProfileService.generateBrandTone(id, industry, location)
    res.status(200).json(toneData)
  } catch (error) {
    next(error)
  }
}

export const deleteBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    await brandProfileService.deleteBrandProfile(id)
    res.status(200).json({ message: 'Brand profile deleted successfully' })
  } catch (error) {
    next(error)
  }
}
