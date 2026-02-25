import type { Request, Response } from 'express';
import axios from 'axios';

import { createErrorResponse, createSuccessResponse, SystemMessageCode } from '@platform/contracts';

import { getLocationBusinessProfile, syncLocationBusinessProfile } from '../services/gbp-profile.service';

// Accept canonical UUID strings without enforcing RFC variant/version bits.
// Seed/dev data can contain UUID-like ids that are still valid DB keys.
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const getBusinessProfile = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    if (!isUuid(locationId)) {
      const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);

      return res.status(badRequest.statusCode).json(badRequest);
    }

    const profile = await getLocationBusinessProfile(locationId);

    if (!profile) {
      const notFound = createErrorResponse('Location not found', SystemMessageCode.NOT_FOUND, 404, undefined, req.id);

      return res.status(notFound.statusCode).json(notFound);
    }

    const response = createSuccessResponse(profile, 'GBP business profile fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error?.message, req.id);

    return res.status(response.statusCode).json(response);
  }
};

export const syncBusinessProfile = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    if (!isUuid(locationId)) {
      const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);

      return res.status(badRequest.statusCode).json(badRequest);
    }

    const profile = await syncLocationBusinessProfile(locationId);

    const response = createSuccessResponse(profile, 'GBP business profile synced successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const message = error?.message || 'Failed to sync GBP business profile';
    let statusCode = 500;
    let code = SystemMessageCode.INTERNAL_SERVER_ERROR;

    if (message.includes('Location not found')) {
      statusCode = 404;
      code = SystemMessageCode.NOT_FOUND;
    } else if (
      message.includes('Active Google review source not found') ||
      message.includes('Missing GBP locationName metadata') ||
      message.includes('Google OAuth credentials missing')
    ) {
      statusCode = 400;
      code = SystemMessageCode.VALIDATION_ERROR;
    } else if (axios.isAxiosError(error) && error.response?.status) {
      statusCode = error.response.status;
      code = statusCode >= 500 ? SystemMessageCode.INTERNAL_SERVER_ERROR : SystemMessageCode.VALIDATION_ERROR;
    }

    const response = createErrorResponse(
      message,
      code,
      statusCode,
      axios.isAxiosError(error) ? error.response?.data : undefined,
      req.id
    );

    return res.status(response.statusCode).json(response);
  }
};
