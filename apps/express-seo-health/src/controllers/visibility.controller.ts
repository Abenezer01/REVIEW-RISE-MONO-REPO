import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { visibilityComputationService } from '../services/visibility-computation.service';
import { keywordRepository, keywordRankRepository, locationRepository } from '@platform/db';

export class VisibilityController {
  /**
   * GET /api/visibility/metrics - Get visibility metrics for a business
   */
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.query.businessId as string;
      const locationId = req.query.locationId as string;
      const periodType = (req.query.periodType as string) || 'daily';
      const limit = parseInt(req.query.limit as string) || 30;

      if (!businessId) {
        const errorResponse = createErrorResponse('businessId is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const metrics = await visibilityComputationService.getHistory(businessId, locationId || null, periodType, limit);

      const response = createSuccessResponse(metrics, 'Visibility metrics fetched successfully', 200, { requestId: req.id });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error('Error fetching visibility metrics:', error);
      const errorResponse = createErrorResponse('Failed to fetch metrics', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /api/visibility/heatmap - Get keyword ranking heatmap data
   */
  async getHeatmap(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.query.businessId as string;
      const locationId = req.query.locationId as string;
      const days = parseInt(req.query.days as string) || 7;
      const metric = req.query.metric || 'rank';

      if (!businessId) {
        const errorResponse = createErrorResponse('businessId is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      // Fetch keywords for this business/location
      const keywords = await keywordRepository.findByBusiness(businessId, { locationId });

      // Fetch ranks for these keywords in the last X days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const periods = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        periods.push(d.toISOString().split('T')[0]);
      }

      const allRanks = await keywordRankRepository.findMany({
        where: {
          keywordId: { in: keywords.map(k => k.id) },
          capturedAt: { gte: startDate, lte: endDate }
        },
        orderBy: { capturedAt: 'asc' }
      });

      // Format into a grid [keyword][period]
      const data = keywords.map(k => {
        const kwRanks = allRanks.filter(r => r.keywordId === k.id);
        return periods.map(dateStr => {
          const rank = kwRanks.find(r => r.capturedAt.toISOString().startsWith(dateStr));
          return rank?.rankPosition ?? null;
        });
      });

      const response = createSuccessResponse({
          businessId,
          locationId: locationId || undefined,
          keywords: keywords.map(k => k.keyword), // Names
          periods,
          data: data as number[][],
          metric: metric as string,
      }, 'Heatmap data fetched successfully', 200, { requestId: req.id });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error('Error generating heatmap data:', error);
      const errorResponse = createErrorResponse('Failed to fetch heatmap data', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * POST /api/visibility/compute - Manually trigger metric computation
   */
  async computeMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, locationId, periodType, periodStart, periodEnd } = req.body;

      if (!businessId || !periodType || !periodStart || !periodEnd) {
        const errorResponse = createErrorResponse('businessId, periodType, periodStart, and periodEnd are required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      await visibilityComputationService.computeAllMetrics(
        businessId,
        locationId || null,
        periodType,
        new Date(periodStart),
        new Date(periodEnd)
      );

      const response = createSuccessResponse({
          message: 'Metrics computed successfully',
          businessId,
          periodType,
      }, 'Metrics computed successfully', 200, { requestId: req.id });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error('Error computing metrics:', error);
      const errorResponse = createErrorResponse('Failed to trigger computation', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}

export const visibilityController = new VisibilityController();
