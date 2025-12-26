import { Request, Response } from 'express';
import { keywordRepository, keywordRankRepository, locationRepository, rankTrackingService } from '@platform/db';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import type {
  CreateKeywordDTO,
  HarvestCompetitorDTO,
  UpdateKeywordDTO,
} from '@platform/contracts';

export class KeywordController {
  /**
   * GET /api/keywords - List keywords for a business
   */
  async listKeywords(req: Request, res: Response): Promise<void> {
    try {
      const { businessId } = req.query;
      const locationId = typeof req.query.locationId === 'string' ? req.query.locationId : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const tagsParam = req.query.tags;
      const limitParam = req.query.limit;
      const offsetParam = req.query.offset;

      if (!businessId || typeof businessId !== 'string') {
        res.status(400).json(createErrorResponse('businessId is required', ErrorCode.BAD_REQUEST, 400));
        return;
      }

      const keywords = await keywordRepository.findByBusiness(
        businessId,
        {
          locationId,
          status,
          tags: Array.isArray(tagsParam)
            ? tagsParam.filter((t): t is string => typeof t === 'string')
            : typeof tagsParam === 'string'
              ? tagsParam.split(',').map((t) => t.trim()).filter(Boolean)
              : undefined,
          limit: Number.isFinite(Number(limitParam)) ? Number(limitParam) : 50,
          offset: Number.isFinite(Number(offsetParam)) ? Number(offsetParam) : 0,
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

      const computedTags = Array.from(
        new Set([
          ...(data.tags || []),
          ...(data.language ? [`lang:${data.language}`] : []),
          ...(data.city ? [`city:${data.city}`] : []),
          ...(data.country ? [`country:${data.country}`] : []),
          ...(data.deviceType ? [`device:${data.deviceType}`] : [])
        ])
      );

      const keyword = await keywordRepository.create({
        business: { connect: { id: data.businessId } },
        ...(data.locationId && { location: { connect: { id: data.locationId } } }),
        keyword: data.keyword,
        searchVolume: data.searchVolume,
        difficulty: data.difficulty,
        tags: computedTags,
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
      const startDateParam = req.query.startDate;
      const endDateParam = req.query.endDate;
      const device = typeof req.query.device === 'string' ? req.query.device : undefined;
      const limitParam = req.query.limit;
      const offsetParam = req.query.offset;

      const ranks = await keywordRankRepository.findByKeyword(id, {
        startDate:
          typeof startDateParam === 'string' ? new Date(startDateParam) : undefined,
        endDate:
          typeof endDateParam === 'string' ? new Date(endDateParam) : undefined,
        device,
        limit: Number.isFinite(Number(limitParam)) ? Number(limitParam) : 100,
        offset: Number.isFinite(Number(offsetParam)) ? Number(offsetParam) : 0,
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
          tags: Array.from(
            new Set([
              ...(k.tags || []),
              ...(k.language ? [`lang:${k.language}`] : []),
              ...(k.city ? [`city:${k.city}`] : []),
              ...(k.country ? [`country:${k.country}`] : []),
              ...(k.deviceType ? [`device:${k.deviceType}`] : [])
            ])
          ),
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

  /**
   * GET /api/keywords/suggest - Auto-suggest local keywords (mocked)
   */
  async suggestKeywords(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.query.businessId;
      const locationId = typeof req.query.locationId === 'string' ? req.query.locationId : undefined;
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const seedTermsParam = req.query.seedTerms;
      const limitParam = req.query.limit;
      if (!businessId || typeof businessId !== 'string') {
        res.status(400).json(createErrorResponse('businessId is required', ErrorCode.BAD_REQUEST, 400));
        return;
      }
      const locName =
        locationId ? (await locationRepository.findById(locationId))?.name || 'Local' : 'Local';
      const baseCategory = category || 'services';
      const seeds = Array.isArray(seedTermsParam)
        ? seedTermsParam
        : typeof seedTermsParam === 'string'
          ? seedTermsParam.split(',').map((s) => s.trim()).filter(Boolean)
          : ['near me', 'best', 'top'];

      const variants = ['cheap', 'best', 'top rated', 'open now', 'near me', '24/7'];
      const suggestions: { keyword: string; tags: string[] }[] = [];
      for (const v of variants) {
        suggestions.push({
          keyword: `${baseCategory} ${v} ${locName}`.toLowerCase(),
          tags: [`city:${locName}`, 'device:mobile', 'intent:local']
        });
      }
      for (const s of seeds.slice(0, 5)) {
        suggestions.push({
          keyword: `${baseCategory} ${s} ${locName}`.toLowerCase(),
          tags: [`city:${locName}`, 'device:mobile', 'intent:seed']
        });
      }
      const limit = Number.isFinite(Number(limitParam)) ? Number(limitParam) : 20;
      res.json(createSuccessResponse({ suggestions: suggestions.slice(0, limit) }));
    } catch (error) {
      console.error('Error suggesting keywords:', error);
      res.status(500).json(createErrorResponse('Failed to suggest keywords', ErrorCode.INTERNAL_SERVER_ERROR, 500));
    }
  }

  /**
   * POST /api/keywords/harvest - Harvest competitor keywords (mocked)
   */
  async harvestCompetitor(req: Request, res: Response): Promise<void> {
    try {
      const data: HarvestCompetitorDTO = req.body;
      if (!data.businessId || (!data.competitorDomain && !data.competitorGbpId)) {
        res.status(400).json(createErrorResponse('businessId and competitorDomain or competitorGbpId are required', ErrorCode.BAD_REQUEST, 400));
        return;
      }
      const brand =
        data.competitorDomain?.split('.').slice(0, 1)[0].replace(/[^a-z0-9]/gi, ' ') ||
        data.competitorGbpId ||
        'competitor';
      const services = ['repair', 'installation', 'consultation', 'pricing', 'reviews'];
      const cityTag = 'city:Local';
      const harvested = services.map(s => ({
        keyword: `${brand} ${s}`.toLowerCase(),
        tags: [cityTag, 'branded', 'intent:competitor']
      }));
      res.json(createSuccessResponse({ keywords: harvested.slice(0, data.limit || 20) }));
    } catch (error) {
      console.error('Error harvesting competitor keywords:', error);
      res.status(500).json(createErrorResponse('Failed to harvest competitor keywords', ErrorCode.INTERNAL_SERVER_ERROR, 500));
    }
  }
}

export const keywordController = new KeywordController();
