import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { socialConnectionRepository } from '@platform/db';
import { facebookService } from '../services/facebook.service';
import { linkedInService } from '../services/linkedin.service';

export class SocialController {
  async publish(req: Request, res: Response) {
    try {
      const { platform, connectionId, content } = req.body;

      if (!platform || !connectionId || !content) {
        const errorResponse = createErrorResponse('Missing required fields', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id);
        return res.status(errorResponse.statusCode).json(errorResponse);
      }

      const connection = await socialConnectionRepository.findById(connectionId);
      if (!connection) {
        const errorResponse = createErrorResponse('Connection not found', ErrorCode.NOT_FOUND, 404, undefined, req.id);
        return res.status(errorResponse.statusCode).json(errorResponse);
      }

      let result;
      const platformLower = platform.toLowerCase();

      switch (platformLower) {
        case 'facebook':
          result = await facebookService.publishPagePost(connection.pageId!, connection.accessToken, content);
          break;
        case 'instagram':
          result = await facebookService.publishInstagramPost(connection.profileId!, connection.accessToken, content);
          break;
        case 'linkedin':
          result = await linkedInService.publishOrganizationPost(connection.pageId!, connection.accessToken, content);
          break;
        default:
          const errorResponse = createErrorResponse(`Platform ${platform} not supported for publishing`, ErrorCode.VALIDATION_ERROR, 400, undefined, req.id);
          return res.status(errorResponse.statusCode).json(errorResponse);
      }

      const successResponse = createSuccessResponse(result, 'Post published successfully', 200, { requestId: req.id });
      res.status(successResponse.statusCode).json(successResponse);
    } catch (e: any) {
      console.error('Publishing error:', e.message);
      const errorResponse = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}

export const socialController = new SocialController();
