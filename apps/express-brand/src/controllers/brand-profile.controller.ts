import { Request, Response, NextFunction } from 'express'
import { createSuccessResponse, createPaginatedResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts'
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

    const response = createPaginatedResponse(
      result.data,
      {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total
      },
      'Brand profiles retrieved successfully',
      200,
      { requestId: req.id },
      SystemMessageCode.SUCCESS
    )
    res.status(response.statusCode).json(response)
  } catch (error) {
    next(error)
  }
}

export const onboardBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { websiteUrl, businessId } = req.body
    const brandProfile = await brandProfileService.onboardBrandProfile(businessId, websiteUrl)
    const response = createSuccessResponse(
      { brandProfileId: brandProfile.id },
      'Extraction initiated',
      202,
      { requestId: req.id },
      SystemMessageCode.SUCCESS
    )
    res.status(response.statusCode).json(response)
  } catch (error) {
    next(error)
  }
}

export const getBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const brandProfile = await brandProfileService.getBrandProfile(id)
    if (!brandProfile) {
      const response = createErrorResponse('Brand profile not found', SystemMessageCode.BRAND_PROFILE_NOT_FOUND, 404, null, req.id)
      return res.status(response.statusCode).json(response)
    }
    const response = createSuccessResponse(brandProfile, 'Brand profile retrieved successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS)
    res.status(response.statusCode).json(response)
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
      const response = createErrorResponse('Brand profile not found', SystemMessageCode.BRAND_PROFILE_NOT_FOUND, 404, null, req.id)
      return res.status(response.statusCode).json(response)
    }
    const response = createSuccessResponse(brandProfile, 'Brand profile updated successfully', 200, { requestId: req.id }, SystemMessageCode.BRAND_PROFILE_UPDATED)
    res.status(response.statusCode).json(response)
  } catch (error) {
    next(error)
  }
}

export const reExtractBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const brandProfile = await brandProfileService.reExtractBrandProfile(id)
    if (!brandProfile) {
      const response = createErrorResponse('Brand profile not found', SystemMessageCode.BRAND_PROFILE_NOT_FOUND, 404, null, req.id)
      return res.status(response.statusCode).json(response)
    }
    const response = createSuccessResponse(
      { brandProfileId: brandProfile.id },
      'Re-extraction initiated',
      202,
      { requestId: req.id },
      SystemMessageCode.SUCCESS
    )
    res.status(response.statusCode).json(response)
  } catch (error) {
    next(error)
  }
}

export const confirmBrandProfileExtraction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const brandProfile = await brandProfileService.confirmExtraction(id)
    if (!brandProfile) {
      const response = createErrorResponse('Brand profile not found', SystemMessageCode.BRAND_PROFILE_NOT_FOUND, 404, null, req.id)
      return res.status(response.statusCode).json(response)
    }
    const response = createSuccessResponse(brandProfile, 'Extraction confirmed', 200, { requestId: req.id }, SystemMessageCode.SUCCESS)
    res.status(response.statusCode).json(response)
  } catch (error) {
    next(error)
  }
}

export const generateBrandTone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { industry, location } = req.body
    const toneData = await brandProfileService.generateBrandTone(id, industry, location)
    const response = createSuccessResponse(toneData, 'Brand tone generated successfully', 200, { requestId: req.id }, SystemMessageCode.BRAND_TONE_GENERATED)
    res.status(response.statusCode).json(response)
  } catch (error) {
    next(error)
  }
}

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const logs = await brandProfileService.getAuditLogs(id)
    const response = createSuccessResponse(logs, 'Audit logs retrieved successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS)
    res.status(response.statusCode).json(response)
  } catch (error) {
    next(error)
  }
}

export const deleteBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    await brandProfileService.deleteBrandProfile(id)
    const response = createSuccessResponse(null, 'Brand profile deleted successfully', 200, { requestId: req.id }, SystemMessageCode.BRAND_PROFILE_DELETED)
    res.status(response.statusCode).json(response)
  } catch (error) {
    next(error)
  }
}
