import { Request, Response } from 'express';
import { visibilityMetricRepository, visibilityComputationService } from '@platform/db';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

export class VisibilityController {
  /**
   * GET /api/visibility/metrics - Get visibility metrics
   */
  async getMetrics(req: Request, res: Response): Promise<void> {
    const requestId = req.id;
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
        res.status(400).json(createErrorResponse('businessId is required', ErrorCode.BAD_REQUEST, 400, undefined, requestId));
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

      res.json(
        createSuccessResponse(
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
          { requestId }
        )
      );
    } catch (error) {
      console.error('Error fetching visibility metrics:', error);
      res.status(500).json(createErrorResponse('Failed to fetch visibility metrics', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
  }

  /**
   * GET /api/visibility/share-of-voice - Get Share of Voice data with breakdown
   */
  async getShareOfVoice(req: Request, res: Response): Promise<void> {
    const requestId = req.id;
    try {
      const { businessId, locationId, startDate, endDate } = req.query;

      if (!businessId || !startDate || !endDate) {
        res
          .status(400)
          .json(createErrorResponse('businessId, startDate, and endDate are required', ErrorCode.BAD_REQUEST, 400, undefined, requestId));
        return;
      }

      const sovData = await visibilityComputationService.computeShareOfVoice(
        businessId as string,
        (locationId as string) || null,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(
        createSuccessResponse({
          businessId,
          locationId: locationId || undefined,
          shareOfVoice: sovData.shareOfVoice,
          breakdown: sovData.breakdown,
          periodStart: (startDate as string),
          periodEnd: (endDate as string),
        }, 'Share of voice computed successfully', 200, { requestId })
      );
    } catch (error) {
      console.error('Error computing Share of Voice:', error);
      res.status(500).json(createErrorResponse('Failed to compute Share of Voice', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
  }

  /**
   * GET /api/visibility/serp-features - Get SERP feature presence data
   */
  async getSerpFeatures(req: Request, res: Response): Promise<void> {
    const requestId = req.id;
    try {
      const { businessId, locationId, startDate, endDate } = req.query;

      if (!businessId || !startDate || !endDate) {
        res
          .status(400)
          .json(createErrorResponse('businessId, startDate, and endDate are required', ErrorCode.BAD_REQUEST, 400, undefined, requestId));
        return;
      }

      const serpData = await visibilityComputationService.trackSerpFeatures(
        businessId as string,
        (locationId as string) || null,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(
        createSuccessResponse({
          businessId,
          locationId: locationId || undefined,
          periodStart: startDate,
          periodEnd: endDate,
          features: {
            featuredSnippet: serpData.featuredSnippetCount,
            localPack: serpData.localPackCount,
          },
        }, 'SERP features tracked successfully', 200, { requestId })
      );
    } catch (error) {
      console.error('Error fetching SERP features:', error);
      res.status(500).json(createErrorResponse('Failed to track SERP features', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
  }

  /**
   * GET /api/visibility/heatmap - Get heatmap data
   */
  async getHeatmapData(req: Request, res: Response): Promise<void> {
    const requestId = req.id;
    try {
      const { businessId, locationId, startDate, endDate, metric = 'rank' } = req.query;

      if (!businessId || !startDate || !endDate) {
        res
          .status(400)
          .json(createErrorResponse('businessId, startDate, and endDate are required', ErrorCode.BAD_REQUEST, 400, undefined, requestId));
        return;
      }

      // Fetch keywords first
      const { keywordRepository, keywordRankRepository } = await import('@platform/db');

      const keywords = await keywordRepository.findByBusiness(businessId as string, {
        limit: 50
      });

      if (keywords.length === 0) {
        res.json(createSuccessResponse({
          keywords: [],
          periods: [],
          data: [],
          metric: metric as string
        }, 'No keywords found', 200, { requestId }));
        return;
      }

      const keywordIds = keywords.map(k => k.id);
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const ranks = await keywordRankRepository.findRanksForKeywords(keywordIds, start, end);

      const periods: string[] = [];
      const current = new Date(start);
      while (current <= end) {
        periods.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }

      const data: (number | null)[][] = keywords.map(k => {
        const keywordRanks = ranks.filter(r => r.keywordId === k.id);

        return periods.map(dateStr => {
          const rank = keywordRanks.find(r => r.capturedAt.toISOString().startsWith(dateStr));
          return rank?.rankPosition ?? null;
        });
      });

      res.json(
        createSuccessResponse({
          businessId,
          locationId: locationId || undefined,
          keywords: keywords.map(k => k.keyword),
          periods,
          data: data as number[][],
          metric: metric as string,
        }, 'Heatmap data fetched successfully', 200, { requestId })
      );
    } catch (error) {
      console.error('Error generating heatmap data:', error);
      res.status(500).json(createErrorResponse('Failed to fetch heatmap data', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
  }

  /**
   * POST /api/visibility/compute - Manually trigger metric computation
   */
  async computeMetrics(req: Request, res: Response): Promise<void> {
    const requestId = req.id;
    try {
      const { businessId, locationId, periodType, periodStart, periodEnd } = req.body;

      if (!businessId || !periodType || !periodStart || !periodEnd) {
        res
          .status(400)
          .json(
            createErrorResponse(
              'businessId, periodType, periodStart, and periodEnd are required',
              ErrorCode.BAD_REQUEST,
              400,
              undefined,
              requestId
            )
          );
        return;
      }

      await visibilityComputationService.computeAllMetrics(
        businessId,
        locationId || null,
        periodType,
        new Date(periodStart),
        new Date(periodEnd)
      );

      res.json(
        createSuccessResponse({
          message: 'Metrics computed successfully',
          businessId,
          periodType,
        }, 'Computation triggered', 200, { requestId })
      );
    } catch (error) {
      console.error('Error computing metrics:', error);
      res.status(500).json(createErrorResponse('Failed to trigger computation', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
  }
}

export const visibilityController = new VisibilityController();
