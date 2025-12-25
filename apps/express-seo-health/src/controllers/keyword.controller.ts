import { Request, Response } from 'express';
import { keywordRepository, keywordRankRepository, rankTrackingService } from '@platform/db';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import type { CreateKeywordDTO, UpdateKeywordDTO } from '@platform/contracts';

export class KeywordController {
  /**
   * GET /api/keywords - List keywords for a business
   */
  async listKeywords(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, locationId, status, tags, limit = 50, offset = 0 } = req.query;

      if (!businessId) {
        res.status(400).json(createErrorResponse('businessId is required', 'BAD_REQUEST', 400));
        return;
      }

      const keywords = await keywordRepository.findByBusiness(
        businessId as string,
        {
          locationId: locationId as string | undefined,
          status: status as string | undefined,
          tags: tags ? (tags as string).split(',') : undefined,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        }
      );

      res.json(
        createSuccessResponse(
          await Promise.all(
            keywords.map(async (k) => {
              const daily = await rankTrackingService.computeRankChange(k.id, 'daily')
              const weekly = await rankTrackingService.computeRankChange(k.id, 'weekly')
              return {
                id: k.id,
                businessId: k.businessId,
                locationId: k.locationId || undefined,
                keyword: k.keyword,
                searchVolume: k.searchVolume || undefined,
                difficulty: k.difficulty || undefined,
                tags: k.tags,
                status: k.status,
                createdAt: k.createdAt.toISOString(),
                updatedAt: k.updatedAt.toISOString(),
                currentRank: (k as any).ranks?.[0]?.rankPosition || undefined,
                mapPackPosition: (k as any).ranks?.[0]?.mapPackPosition || undefined,
                lastChecked: (k as any).ranks?.[0]?.capturedAt?.toISOString() || undefined,
                dailyChange: daily.delta || undefined,
                weeklyChange: weekly.delta || undefined,
                significantChange: daily.significant || weekly.significant || false
              }
            })
          )
        )
      );
    } catch (error) {
      console.error('Error listing keywords:', error);
      res.status(500).json(createErrorResponse('Failed to list keywords', ErrorCode.INTERNAL_SERVER_ERROR, 500));
    }
  }

  /**
   * POST /api/keywords - Create a new keyword
   */
  async createKeyword(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateKeywordDTO = req.body;

      if (!data.businessId || !data.keyword) {
        res.status(400).json(createErrorResponse('businessId and keyword are required', 'BAD_REQUEST', 400));
        return;
      }

      const keyword = await keywordRepository.create({
        business: { connect: { id: data.businessId } },
        ...(data.locationId && { location: { connect: { id: data.locationId } } }),
        keyword: data.keyword,
        searchVolume: data.searchVolume,
        difficulty: data.difficulty,
        tags: data.tags || [],
      });

      res.status(201).json(createSuccessResponse(keyword));
    } catch (error) {
      console.error('Error creating keyword:', error);
      res.status(500).json(createErrorResponse('Failed to create keyword', ErrorCode.INTERNAL_SERVER_ERROR, 500));
    }
  }

  /**
   * PUT /api/keywords/:id - Update a keyword
   */
  async updateKeyword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateKeywordDTO = req.body;

      const keyword = await keywordRepository.update(id, data);

      res.json(createSuccessResponse(keyword));
    } catch (error) {
      console.error('Error updating keyword:', error);
      res.status(500).json(createErrorResponse('Failed to update keyword', ErrorCode.INTERNAL_SERVER_ERROR, 500));
    }
  }

  /**
   * DELETE /api/keywords/:id - Delete (soft) a keyword
   */
  async deleteKeyword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await keywordRepository.softDelete(id);

      res.json(createSuccessResponse({ message: 'Keyword deleted successfully' }));
    } catch (error) {
      console.error('Error deleting keyword:', error);
      res.status(500).json(createErrorResponse('Failed to delete keyword', ErrorCode.INTERNAL_SERVER_ERROR, 500));
    }
  }

  /**
   * GET /api/keywords/:id/ranks - Get rank history for a keyword
   */
  async getKeywordRanks(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate, device, limit = 100, offset = 0 } = req.query;

      const ranks = await keywordRankRepository.findByKeyword(id, {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        device: device as string | undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json(
        createSuccessResponse(
          ranks.map((r) => ({
            id: r.id,
            keywordId: r.keywordId,
            rankPosition: r.rankPosition || undefined,
            mapPackPosition: r.mapPackPosition || undefined,
            hasFeaturedSnippet: r.hasFeaturedSnippet,
            hasPeopleAlsoAsk: r.hasPeopleAlsoAsk,
            hasLocalPack: r.hasLocalPack,
            hasKnowledgePanel: r.hasKnowledgePanel,
            hasImagePack: r.hasImagePack,
            hasVideoCarousel: r.hasVideoCarousel,
            rankingUrl: r.rankingUrl || undefined,
            searchLocation: r.searchLocation || undefined,
            device: r.device,
            capturedAt: r.capturedAt.toISOString(),
          }))
        )
      );
    } catch (error) {
      console.error('Error fetching keyword ranks:', error);
      res.status(500).json(createErrorResponse('Failed to fetch keyword ranks', ErrorCode.INTERNAL_SERVER_ERROR, 500));
    }
  }

  /**
 * POST /api/keywords/bulk - Bulk create keywords
   */
  async bulkCreateKeywords(req: Request, res: Response): Promise<void> {
    try {
      const { keywords } = req.body;

      if (!Array.isArray(keywords) || keywords.length === 0) {
        res.status(400).json(createErrorResponse('keywords array is required', ErrorCode.BAD_REQUEST, 400));
        return;
      }

      const result = await keywordRepository.createManyKeywords(
        keywords.map((k: CreateKeywordDTO) => ({
          businessId: k.businessId,
          locationId: k.locationId,
          keyword: k.keyword,
          searchVolume: k.searchVolume,
          difficulty: k.difficulty,
          tags: k.tags || [],
        }))
      );

      res.status(201).json(
        createSuccessResponse({
          created: result.count,
          message: `${result.count} keywords created successfully`,
        })
      );
    } catch (error) {
      console.error('Error bulk creating keywords:', error);
      res.status(500).json(createErrorResponse('Failed to bulk create keywords', ErrorCode.INTERNAL_SERVER_ERROR, 500));
    }
  }
}

export const keywordController = new KeywordController();
