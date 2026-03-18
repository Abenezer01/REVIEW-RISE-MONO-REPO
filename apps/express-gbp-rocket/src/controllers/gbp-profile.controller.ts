import type { Request, Response } from 'express';
import axios from 'axios';

import { createErrorResponse, createSuccessResponse, SystemMessageCode } from '@platform/contracts';

import {
  createLocationSnapshot,
  getLocationBusinessProfile,
  getLocationSnapshotDetail,
  listLocationSnapshots,
  syncLocationBusinessProfile,
  updateLocationBusinessProfile
} from '../services/gbp-profile.service';
import { auditService } from '../services/audit.service';

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

export const getSnapshotAudit = async (req: Request, res: Response) => {
  try {
    const { locationId, snapshotId } = req.params;

    if (!isUuid(locationId) || !isUuid(snapshotId)) {
      const badRequest = createErrorResponse('Invalid locationId or snapshotId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);

      return res.status(badRequest.statusCode).json(badRequest);
    }

    let audit = await auditService.getAudit(snapshotId);

    if (!audit) {
      // If audit doesn't exist, try to run it on the fly
      try {
        audit = await auditService.runAudit(snapshotId);
      } catch (err: any) {
        if (err.message.includes('Snapshot') && err.message.includes('not found')) {
          const notFound = createErrorResponse('Snapshot not found', SystemMessageCode.NOT_FOUND, 404, undefined, req.id);
          return res.status(notFound.statusCode).json(notFound);
        }
        throw err;
      }
    }

    const response = createSuccessResponse(audit, 'GBP snapshot audit fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(
      error?.message || 'Failed to fetch GBP snapshot audit',
      SystemMessageCode.INTERNAL_SERVER_ERROR,
      500,
      undefined,
      req.id
    );

    return res.status(response.statusCode).json(response);
  }
};

export const runSnapshotAudit = async (req: Request, res: Response) => {
  try {
    const { locationId, snapshotId } = req.params;
    const { targetKeywords } = req.body;

    if (!isUuid(locationId) || !isUuid(snapshotId)) {
      const badRequest = createErrorResponse('Invalid locationId or snapshotId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);

      return res.status(badRequest.statusCode).json(badRequest);
    }

    const audit = await auditService.runAudit(snapshotId, targetKeywords);

    const response = createSuccessResponse(audit, 'GBP snapshot audit completed successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const message = error?.message || 'Failed to run GBP snapshot audit';
    const statusCode = message.includes('Snapshot') && message.includes('not found') ? 404 : 500;
    const code = statusCode === 404 ? SystemMessageCode.NOT_FOUND : SystemMessageCode.INTERNAL_SERVER_ERROR;

    const response = createErrorResponse(message, code, statusCode, undefined, req.id);

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
      message.includes('Active Google PlatformIntegration connection not found') ||
      message.includes('No Google connection found') ||
      message.includes('Access token is missing from connection') ||
      message.includes('Missing GBP locationName on platform integration') ||
      message.includes('Google OAuth credentials not configured')
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

export const updateBusinessProfile = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    if (!isUuid(locationId)) {
      const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);

      return res.status(badRequest.statusCode).json(badRequest);
    }

    const userId = (req as any)?.user?.id as string | undefined;
    const result = await updateLocationBusinessProfile(locationId, req.body || {}, { pushToGbp: false, userId: userId || null });
    const response = createSuccessResponse(result, 'GBP business profile updated locally', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const message = error?.message || 'Failed to update GBP business profile';
    let statusCode = 500;
    let code = SystemMessageCode.INTERNAL_SERVER_ERROR;

    if (message.includes('Location not found')) {
      statusCode = 404;
      code = SystemMessageCode.NOT_FOUND;
    } else if (message.includes('No valid fields provided')) {
      statusCode = 400;
      code = SystemMessageCode.VALIDATION_ERROR;
    }

    const response = createErrorResponse(message, code, statusCode, undefined, req.id);
    return res.status(response.statusCode).json(response);
  }
};

export const pushBusinessProfile = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    if (!isUuid(locationId)) {
      const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);

      return res.status(badRequest.statusCode).json(badRequest);
    }

    const userId = (req as any)?.user?.id as string | undefined;
    const result = await updateLocationBusinessProfile(locationId, req.body || {}, { pushToGbp: true, userId: userId || null });
    const response = createSuccessResponse(result, 'GBP business profile pushed to Google', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const message = error?.message || 'Failed to push GBP business profile';
    let statusCode = 500;
    let code = SystemMessageCode.INTERNAL_SERVER_ERROR;

    if (message.includes('Location not found')) {
      statusCode = 404;
      code = SystemMessageCode.NOT_FOUND;
    } else if (
      message.includes('Active Google PlatformIntegration connection not found') ||
      message.includes('No Google connection found') ||
      message.includes('Access token is missing from connection') ||
      message.includes('Missing GBP locationName on platform integration') ||
      message.includes('Google OAuth credentials not configured') ||
      message.includes('No valid fields provided')
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

export const createSnapshot = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    if (!isUuid(locationId)) {
      const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);

      return res.status(badRequest.statusCode).json(badRequest);
    }

    const userId = (req as any)?.user?.id as string | undefined;
    const suggestionRefs = req.body?.suggestionRefs;
    const snapshot = await createLocationSnapshot(locationId, userId || null, suggestionRefs);
    const response = createSuccessResponse(snapshot, 'GBP snapshot created successfully', 201, { requestId: req.id }, SystemMessageCode.SUCCESS);

    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const message = error?.message || 'Failed to create GBP snapshot';
    const statusCode = message.includes('Location not found') ? 404 : 500;
    const code = statusCode === 404 ? SystemMessageCode.NOT_FOUND : SystemMessageCode.INTERNAL_SERVER_ERROR;
    const response = createErrorResponse(message, code, statusCode, undefined, req.id);

    return res.status(response.statusCode).json(response);
  }
};

export const listSnapshots = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));

    if (!isUuid(locationId)) {
      const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);

      return res.status(badRequest.statusCode).json(badRequest);
    }

    const data = await listLocationSnapshots(locationId, limit, offset);
    const response = createSuccessResponse(data, 'GBP snapshots fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(
      error?.message || 'Failed to fetch GBP snapshots',
      SystemMessageCode.INTERNAL_SERVER_ERROR,
      500,
      undefined,
      req.id
    );

    return res.status(response.statusCode).json(response);
  }
};

export const getSnapshotDetail = async (req: Request, res: Response) => {
  try {
    const { locationId, snapshotId } = req.params;

    if (!isUuid(locationId) || !isUuid(snapshotId)) {
      const badRequest = createErrorResponse('Invalid locationId or snapshotId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);

      return res.status(badRequest.statusCode).json(badRequest);
    }

    const snapshot = await getLocationSnapshotDetail(locationId, snapshotId);

    if (!snapshot) {
      const notFound = createErrorResponse('Snapshot not found', SystemMessageCode.NOT_FOUND, 404, undefined, req.id);

      return res.status(notFound.statusCode).json(notFound);
    }

    const response = createSuccessResponse(snapshot, 'GBP snapshot fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const response = createErrorResponse(
      error?.message || 'Failed to fetch GBP snapshot',
      SystemMessageCode.INTERNAL_SERVER_ERROR,
      500,
      undefined,
      req.id
    );

    return res.status(response.statusCode).json(response);
  }
};
