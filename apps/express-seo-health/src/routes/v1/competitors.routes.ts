import { Router } from 'express';
import { competitorController } from '../../controllers/competitor.controller';

const router = Router();

/**
 * @route   GET /api/v1/competitors
 * @desc    List all competitors for a business
 * @access  Private
 * @query   businessId: string (required)
 */
router.get('/', competitorController.listCompetitors.bind(competitorController));

/** 
 * @route   GET /api/v1/competitors/:id
 * @desc    Get competitor details with rank history
 * @access  Private
 * @param   id: string (competitor ID)
 * @query   keywordId?: string, limit?: number
 */
router.get('/:id', competitorController.getCompetitorDetails.bind(competitorController));

/**
 * @route   GET /api/v1/competitors/:id/ranks
 * @desc    Get ranks history for a specific competitor
 * @access  Private
 * @param   id: string (competitor ID)
 * @query   keywordId?: string, startDate?: string, endDate?: string, limit?: number
 */
router.get('/:id/ranks', competitorController.getCompetitorRanks.bind(competitorController));

export default router;
