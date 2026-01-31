import { Request, Response } from 'express';
import { visibilityMetricRepository, visibilityComputationService } from '@platform/db';
import { createSuccessResponse, createErrorResponse } from '@platform/contracts';

export class VisibilityController {
  /**
   * GET /api/visibility/metrics - Get visibility metrics
   */
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const {
        businessId,
        locationId,
        periodType,
        startDate,
        endDate,
        limit = 30,
        offset = 0,
      } = req.query;

      if (!businessId) {
        const errorResponse = createErrorResponse('businessId is required', 'BAD_REQUEST', 400, undefined, req.id);
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const metrics = await visibilityMetricRepository.findByBusiness(
        businessId as string,
        {
          locationId: locationId as string | undefined,
          periodType: periodType as string | undefined,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        }
      );

      const successResponse = createSuccessResponse(
        metrics.map((m) => ({
          id: m.id,
          businessId: m.businessId,
          locationId: m.locationId || undefined,
          periodStart: m.periodStart.toISOString(),
          periodEnd: m.periodEnd.toISOString(),
          periodType: m.periodType,
          mapPackAppearances: m.mapPackAppearances,
          totalTrackedKeywords: m.totalTrackedKeywords,
          mapPackVisibility: m.mapPackVisibility,
          top3Count: m.top3Count,
          top10Count: m.top10Count,
          top20Count: m.top20Count,
          shareOfVoice: m.shareOfVoice,
          featuredSnippetCount: m.featuredSnippetCount,
          localPackCount: m.localPackCount,
          computedAt: m.computedAt.toISOString(),
          createdAt: m.createdAt.toISOString(),
        })),
        'Visibility metrics fetched successfully',
        200,
        { requestId: req.id }
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: any) {
      console.error('Error fetching visibility metrics:', error);
      const errorResponse = createErrorResponse('Failed to fetch visibility metrics', 'INTERNAL_SERVER_ERROR', 500, error.message, req.id);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /api/visibility/share-of-voice - Get Share of Voice data with breakdown
   */
  async getShareOfVoice(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, locationId, startDate, endDate } = req.query;

      if (!businessId || !startDate || !endDate) {
        const errorResponse = createErrorResponse('businessId, startDate, and endDate are required', 'BAD_REQUEST', 400, undefined, req.id);
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const sovData = await visibilityComputationService.computeShareOfVoice(
        businessId as string,
        (locationId as string) || null,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      const successResponse = createSuccessResponse({
        businessId,
        locationId: locationId || undefined,
        shareOfVoice: sovData.shareOfVoice,
        breakdown: sovData.breakdown,
        periodStart: (startDate as string),
        periodEnd: (endDate as string),
      }, 'Share of Voice computed successfully', 200, { requestId: req.id });
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: any) {
      console.error('Error computing Share of Voice:', error);
      const errorResponse = createErrorResponse('Failed to compute Share of Voice', 'INTERNAL_SERVER_ERROR', 500, error.message, req.id);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /api/visibility/serp-features - Get SERP feature presence data
   */
  async getSerpFeatures(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, locationId, startDate, endDate } = req.query;

      if (!businessId || !startDate || !endDate) {
        const errorResponse = createErrorResponse('businessId, startDate, and endDate are required', 'BAD_REQUEST', 400, undefined, req.id);
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const serpData = await visibilityComputationService.trackSerpFeatures(
        businessId as string,
        (locationId as string) || null,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      const successResponse = createSuccessResponse({
        businessId,
        locationId: locationId || undefined,
        periodStart: startDate,
        periodEnd: endDate,
        features: {
          featuredSnippet: serpData.featuredSnippetCount,
          localPack: serpData.localPackCount,
          // Add other SERP features if needed
        },
      }, 'SERP features fetched successfully', 200, { requestId: req.id });
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: any) {
      console.error('Error fetching SERP features:', error);
      const errorResponse = createErrorResponse('Failed to track SERP features', 'INTERNAL_SERVER_ERROR', 500, error.message, req.id);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /api/visibility/heatmap - Get heatmap data
   */
  async getHeatmapData(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, locationId, startDate, endDate, metric = 'rank' } = req.query;

      if (!businessId || !startDate || !endDate) {
        const errorResponse = createErrorResponse('businessId, startDate, and endDate are required', 'BAD_REQUEST', 400, undefined, req.id);
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      // Fetch keywords first
      const { keywordRepository, keywordRankRepository } = await import('@platform/db');

      const keywords = await keywordRepository.findByBusiness(businessId as string, {
        limit: 50 // Limit to top 50 keywords for heatmap to avoid overload
      });

      if (keywords.length === 0) {
        res.json(createSuccessResponse({
          keywords: [],
          periods: [],
          data: [],
          metric: metric as string
        }));
        return;
      }

      const keywordIds = keywords.map(k => k.id);
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      // Fetch all ranks for these keywords in the period
      const ranks = await keywordRankRepository.findRanksForKeywords(keywordIds, start, end);

      // Generate dates array (daily steps)
      const periods: string[] = [];
      const current = new Date(start);
      while (current <= end) {
        periods.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }

      // Build data matrix
      // periods x keywords? Or keywords x periods.
      // DTO says data: number[][] - usually rows x cols.
      // Heatmap component expects: keywords rows, dates columns.
      // So data[keywordIndex][dateIndex]

      const data: (number | null)[][] = keywords.map(k => {
        const keywordRanks = ranks.filter(r => r.keywordId === k.id);

        return periods.map(dateStr => {
          // Find rank for this date
          // capturedAt might include time, so match just date part
          const rank = keywordRanks.find(r => r.capturedAt.toISOString().startsWith(dateStr));
          return rank?.rankPosition ?? null;
        });
      });

      const successResponse = createSuccessResponse({
        businessId,
        locationId: locationId || undefined,
        keywords: keywords.map(k => k.keyword), // Names
        periods,
        data: data as number[][], // Cast to number[][] (nulls handled by frontend usually or need 0?)
        metric: metric as string,
      }, 'Heatmap data fetched successfully', 200, { requestId: req.id });
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: any) {
      console.error('Error generating heatmap data:', error);
      const errorResponse = createErrorResponse('Failed to fetch heatmap data', 'INTERNAL_SERVER_ERROR', 500, error.message, req.id);
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
        const errorResponse = createErrorResponse(
          'businessId, periodType, periodStart, and periodEnd are required',
          'BAD_REQUEST',
          400,
          undefined,
          req.id
        );
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

      const successResponse = createSuccessResponse({
        message: 'Metrics computed successfully',
        businessId,
        periodType,
      }, 'Metrics computed successfully', 200, { requestId: req.id });
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: any) {
      console.error('Error computing metrics:', error);
      const errorResponse = createErrorResponse('Failed to trigger computation', 'INTERNAL_SERVER_ERROR', 500, error.message, req.id);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}

export const visibilityController = new VisibilityController();
