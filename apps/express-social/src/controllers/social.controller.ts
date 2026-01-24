import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { socialConnectionRepository } from '@platform/db';
import { facebookService } from '../services/facebook.service';
import { linkedInService } from '../services/linkedin.service';

export class SocialController {
  async publish(req: Request, res: Response) {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
      const { platform, connectionId, content } = req.body;

      if (!platform || !connectionId || !content) {
        return res.status(400).json(createErrorResponse('Missing required fields', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
      }

      const connection = await socialConnectionRepository.findById(connectionId);
      if (!connection) {
        return res.status(404).json(createErrorResponse('Connection not found', ErrorCode.NOT_FOUND, 404, undefined, requestId));
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
          return res.status(400).json(createErrorResponse(`Platform ${platform} not supported for publishing`, ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
      }

      res.json(createSuccessResponse(result, 'Post published successfully', 200, { requestId }));
    } catch (e: any) {
      console.error('Publishing error:', e.message);
      res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
  }
}

export const socialController = new SocialController();
