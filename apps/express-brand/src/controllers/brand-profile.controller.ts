import { Request, Response, NextFunction } from 'express'
import * as brandProfileService from '../services/brand-profile.service'
import {
  createSuccessResponse,
  createPaginatedResponse,
  createErrorResponse,
  ErrorCode,
  OnboardBrandProfileRequestSchema,
  UpdateBrandProfileRequestSchema,
  GenerateBrandToneRequestSchema,
  BrandProfileQuerySchema
} from '@platform/contracts';

export const getAllBrandProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = BrandProfileQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
    }

    const { page, limit, search, businessId, status } = parseResult.data;

    const result = await brandProfileService.getAllBrandProfiles({
      page,
      limit,
      search,
      businessId,
      status
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
      { requestId: req.id }
    );

    res.status(200).json(response)
  } catch (error) {
    next(error)
  }
}

export const onboardBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = OnboardBrandProfileRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
    }

    const { websiteUrl, businessId } = parseResult.data;
    const brandProfile = await brandProfileService.onboardBrandProfile(businessId, websiteUrl)

    res.status(202).json(createSuccessResponse(
      { brandProfileId: brandProfile.id },
      'Extraction initiated',
      202,
      { requestId: req.id }
    ));
  } catch (error) {
    next(error)
  }
}

export const getBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const brandProfile = await brandProfileService.getBrandProfile(id)
    if (!brandProfile) {
      return res.status(404).json(createErrorResponse('Brand profile not found', ErrorCode.NOT_FOUND, 404, undefined, req.id))
    }
    res.status(200).json(createSuccessResponse(brandProfile, 'Brand profile retrieved', 200, { requestId: req.id }))
  } catch (error) {
    next(error)
  }
}

export const updateBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const parseResult = UpdateBrandProfileRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
    }

    const brandProfile = await brandProfileService.updateBrandProfile(id, parseResult.data)
    if (!brandProfile) {
      return res.status(404).json(createErrorResponse('Brand profile not found', ErrorCode.NOT_FOUND, 404, undefined, req.id))
    }
    res.status(200).json(createSuccessResponse(brandProfile, 'Brand profile updated', 200, { requestId: req.id }))
  } catch (error) {
    next(error)
  }
}

export const reExtractBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const brandProfile = await brandProfileService.reExtractBrandProfile(id)
    if (!brandProfile) {
      return res.status(404).json(createErrorResponse('Brand profile not found', ErrorCode.NOT_FOUND, 404, undefined, req.id))
    }
    res.status(202).json(createSuccessResponse(
      { brandProfileId: brandProfile.id },
      'Re-extraction initiated',
      202,
      { requestId: req.id }
    ))
  } catch (error) {
    next(error)
  }
}

export const confirmBrandProfileExtraction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const brandProfile = await brandProfileService.confirmExtraction(id)
    if (!brandProfile) {
      return res.status(404).json(createErrorResponse('Brand profile not found', ErrorCode.NOT_FOUND, 404, undefined, req.id))
    }
    res.status(200).json(createSuccessResponse(brandProfile, 'Extraction confirmed', 200, { requestId: req.id }))
  } catch (error) {
    next(error)
  }
}

export const generateBrandTone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const parseResult = GenerateBrandToneRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
    }
    const { industry, location } = parseResult.data;
    const toneData = await brandProfileService.generateBrandTone(id, industry, location)
    res.status(200).json(createSuccessResponse(toneData, 'Brand tone generated', 200, { requestId: req.id }))
  } catch (error) {
    next(error)
  }
}

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const logs = await brandProfileService.getAuditLogs(id)
    res.status(200).json(createSuccessResponse(logs, 'Audit logs retrieved', 200, { requestId: req.id }))
  } catch (error) {
    next(error)
  }
}

export const deleteBrandProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    await brandProfileService.deleteBrandProfile(id)
    res.status(200).json(createSuccessResponse(null, 'Brand profile deleted successfully', 200, { requestId: req.id }))
  } catch (error) {
    next(error)
  }
}
