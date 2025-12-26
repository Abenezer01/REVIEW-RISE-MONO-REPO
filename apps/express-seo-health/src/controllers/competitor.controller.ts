import { Request, Response } from 'express';
import { competitorRepository, competitorRankRepository } from '@platform/db';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

export class CompetitorController {
    /**
     * GET /api/competitors - List competitors for a business
     * @query businessId - Required business ID
     * @query keywordId - Optional keyword ID to filter competitors
     */
    async listCompetitors(req: Request, res: Response): Promise<void> {
        try {
            const { businessId, keywordId } = req.query;

            if (!businessId || typeof businessId !== 'string') {
                res.status(400).json(createErrorResponse('businessId is required', ErrorCode.BAD_REQUEST, 400));
                return;
            }

            let competitors;

            if (keywordId && typeof keywordId === 'string') {
                // Filter competitors by keyword - get competitors that rank for this keyword
                competitors = await competitorRepository.findByBusinessIdAndKeyword(businessId, keywordId);
            } else {
                // Get all competitors for the business
                competitors = await competitorRepository.findByBusinessId(businessId);
            }

            res.json(
                createSuccessResponse(
                    competitors.map((c) => ({
                        id: c.id,
                        businessId: c.businessId,
                        domain: c.domain,
                        name: c.name || c.domain,
                        avgRank: c.avgRank || undefined,
                        visibilityScore: c.visibilityScore || undefined,
                        reviewCount: c.reviewCount || undefined,
                        rating: c.rating || undefined,
                        gbpCompleteness: c.gbpCompleteness || undefined,
                        createdAt: c.createdAt.toISOString(),
                        updatedAt: c.updatedAt.toISOString(),
                    }))
                )
            );
        } catch (error) {
            console.error('Error listing competitors:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                businessId: req.query.businessId,
                keywordId: req.query.keywordId
            });
            res.status(500).json(createErrorResponse('Failed to list competitors', ErrorCode.INTERNAL_SERVER_ERROR, 500));
        }
    }

    /**
     * GET /api/competitors/:id - Get competitor details with rank history
     */
    async getCompetitorDetails(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const keywordId = req.query.keywordId ? String(req.query.keywordId) : undefined;
            const limitParam = req.query.limit;

            const competitor = await competitorRepository.findByIdWithRanks(id, {
                keywordId,
                limit: Number.isFinite(Number(limitParam)) ? Number(limitParam) : 50,
            });

            if (!competitor) {
                res.status(404).json(createErrorResponse('Competitor not found', ErrorCode.NOT_FOUND, 404));
                return;
            }

            res.json(
                createSuccessResponse({
                    id: competitor.id,
                    businessId: competitor.businessId,
                    domain: competitor.domain,
                    name: competitor.name || competitor.domain,
                    avgRank: competitor.avgRank || undefined,
                    visibilityScore: competitor.visibilityScore || undefined,
                    reviewCount: competitor.reviewCount || undefined,
                    rating: competitor.rating || undefined,
                    gbpCompleteness: competitor.gbpCompleteness || undefined,
                    createdAt: competitor.createdAt.toISOString(),
                    updatedAt: competitor.updatedAt.toISOString(),
                    ranks: competitor.ranks.map((r) => ({
                        id: r.id,
                        keywordId: r.keywordId,
                        keyword: (r as any).keyword?.keyword,
                        rankPosition: r.rankPosition || undefined,
                        rankingUrl: r.rankingUrl || undefined,
                        capturedAt: r.capturedAt.toISOString(),
                    })),
                })
            );
        } catch (error) {
            console.error('Error fetching competitor details:', error);
            res.status(500).json(createErrorResponse('Failed to fetch competitor details', ErrorCode.INTERNAL_SERVER_ERROR, 500));
        }
    }

    /**
     * GET /api/competitors/:id/ranks - Get rank history for a competitor
     */
    async getCompetitorRanks(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const keywordId = req.query.keywordId ? String(req.query.keywordId) : undefined;
            const startDateParam = req.query.startDate;
            const endDateParam = req.query.endDate;
            const limitParam = req.query.limit;

            const ranks = await competitorRankRepository.findByCompetitor(id, {
                keywordId,
                startDate: typeof startDateParam === 'string' ? new Date(startDateParam) : undefined,
                endDate: typeof endDateParam === 'string' ? new Date(endDateParam) : undefined,
                limit: Number.isFinite(Number(limitParam)) ? Number(limitParam) : 100,
            });

            res.json(
                createSuccessResponse(
                    ranks.map((r) => ({
                        id: r.id,
                        competitorId: r.competitorId,
                        keywordId: r.keywordId,
                        keyword: (r as any).keyword?.keyword,
                        rankPosition: r.rankPosition || undefined,
                        rankingUrl: r.rankingUrl || undefined,
                        capturedAt: r.capturedAt.toISOString(),
                    }))
                )
            );
        } catch (error) {
            console.error('Error fetching competitor ranks:', error);
            res.status(500).json(createErrorResponse('Failed to fetch competitor ranks', ErrorCode.INTERNAL_SERVER_ERROR, 500));
        }
    }
}

export const competitorController = new CompetitorController();
