import type { Request, Response } from 'express';
import { createErrorResponse, createSuccessResponse, SystemMessageCode } from '@platform/contracts';
import { gbpSuggestionsService } from '../services/gbp-suggestions.service';

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const listSuggestions = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    if (!isUuid(locationId)) {
      const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
      return res.status(badRequest.statusCode).json(badRequest);
    }

    const lifecycleState = typeof req.query.lifecycleState === 'string' ? req.query.lifecycleState : undefined;
    const data = await gbpSuggestionsService.list(locationId, lifecycleState);
    const response = createSuccessResponse({ items: data }, 'GBP suggestions fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch GBP suggestions';
    const statusCode = message.includes('Invalid lifecycleState') ? 400 : message.includes('Location not found') ? 404 : 500;
    const code = statusCode === 500 ? SystemMessageCode.INTERNAL_SERVER_ERROR : statusCode === 404 ? SystemMessageCode.NOT_FOUND : SystemMessageCode.VALIDATION_ERROR;
    const response = createErrorResponse(message, code, statusCode, undefined, req.id);
    return res.status(response.statusCode).json(response);
  }
};

export const createSuggestion = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    if (!isUuid(locationId)) {
      const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
      return res.status(badRequest.statusCode).json(badRequest);
    }

    if (!req.body?.title || !req.body?.description) {
      const badRequest = createErrorResponse('title and description are required', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
      return res.status(badRequest.statusCode).json(badRequest);
    }

    const userId = (req as any)?.user?.id as string | undefined;
    const data = await gbpSuggestionsService.create(locationId, req.body, userId || null);
    const response = createSuccessResponse(data, 'GBP suggestion saved successfully', 201, { requestId: req.id }, SystemMessageCode.SUCCESS);
    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const message = error?.message || 'Failed to save GBP suggestion';
    const statusCode = message.includes('Invalid lifecycleState') ? 400 : message.includes('Location not found') ? 404 : 500;
    const code = statusCode === 500 ? SystemMessageCode.INTERNAL_SERVER_ERROR : statusCode === 404 ? SystemMessageCode.NOT_FOUND : SystemMessageCode.VALIDATION_ERROR;
    const response = createErrorResponse(message, code, statusCode, undefined, req.id);
    return res.status(response.statusCode).json(response);
  }
};

export const updateSuggestionState = async (req: Request, res: Response) => {
  try {
    const { locationId, suggestionId } = req.params;
    if (!isUuid(locationId) || !isUuid(suggestionId)) {
      const badRequest = createErrorResponse('Invalid locationId or suggestionId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
      return res.status(badRequest.statusCode).json(badRequest);
    }

    if (!req.body?.lifecycleState) {
      const badRequest = createErrorResponse('lifecycleState is required', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
      return res.status(badRequest.statusCode).json(badRequest);
    }

    const userId = (req as any)?.user?.id as string | undefined;
    const data = await gbpSuggestionsService.updateState(locationId, suggestionId, req.body, userId || null);
    const response = createSuccessResponse(data, 'GBP suggestion state updated successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const message = error?.message || 'Failed to update GBP suggestion state';
    const statusCode = message.includes('Invalid lifecycleState') ? 400 : message.includes('not found') ? 404 : 500;
    const code = statusCode === 500 ? SystemMessageCode.INTERNAL_SERVER_ERROR : statusCode === 404 ? SystemMessageCode.NOT_FOUND : SystemMessageCode.VALIDATION_ERROR;
    const response = createErrorResponse(message, code, statusCode, undefined, req.id);
    return res.status(response.statusCode).json(response);
  }
};

export const listSuggestionActivity = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    if (!isUuid(locationId)) {
      const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
      return res.status(badRequest.statusCode).json(badRequest);
    }

    const suggestionId = typeof req.query.suggestionId === 'string' ? req.query.suggestionId : undefined;
    const data = await gbpSuggestionsService.activity(locationId, suggestionId);
    const response = createSuccessResponse({ items: data }, 'GBP suggestion activity fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch GBP suggestion activity';
    const statusCode = message.includes('Location not found') ? 404 : 500;
    const code = statusCode === 500 ? SystemMessageCode.INTERNAL_SERVER_ERROR : SystemMessageCode.NOT_FOUND;
    const response = createErrorResponse(message, code, statusCode, undefined, req.id);
    return res.status(response.statusCode).json(response);
  }
};
