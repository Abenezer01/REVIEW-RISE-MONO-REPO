import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';
import { socialConnectionRepository } from '@platform/db';
import { facebookService } from '../services/facebook.service';
import { linkedInService } from '../services/linkedin.service';

export class SocialController {
  async publish(req: Request, res: Response) {
    try {
      const { platform, connectionId, content } = req.body;

      if (!platform || !connectionId || !content) {
        return res.status(400).json(createErrorResponse('Missing required fields', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id));
      }

      const connection = await socialConnectionRepository.findById(connectionId);
      if (!connection) {
        return res.status(404).json(createErrorResponse('Connection not found', SystemMessageCode.NOT_FOUND, 404, undefined, req.id));
      }

      let result;
      const platformLower = platform.toLowerCase();

      switch (platformLower) {
        case 'facebook': {
          result = await facebookService.publishPagePost(connection.pageId!, connection.accessToken, content);
          break;
        }
        case 'instagram': {
          result = await facebookService.publishInstagramPost(connection.profileId!, connection.accessToken, content);
          break;
        }
        case 'linkedin': {
          result = await linkedInService.publishOrganizationPost(connection.pageId!, connection.accessToken, content);
          break;
        }
        default:
          return res.status(400).json(createErrorResponse(`Platform ${platform} not supported for publishing`, SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id));
      }

      res.json(createSuccessResponse(result, 'Post published successfully', 200, { requestId: req.id }, SystemMessageCode.SOCIAL_POST_PUBLISHED));
    } catch (e: any) {
      console.error('Publishing error:', e.message);
      res.status(500).json(createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
    }
  }
}

export const socialController = new SocialController();
