import { CampaignInput, CampaignPlan } from '../schema/campaign-plan';
import { VERTICAL_PROFILES } from '../config/vertical-profiles';
import { blueprintStrategyEngine } from './blueprint-strategy-engine';
import { keywordClusteringEngine } from './keyword-clustering-engine';
import { negativeKeywordEngine } from './negative-keyword-engine';
import { adGroupBuilder } from './ad-group-builder';
import { landingPageScorer } from './landing-page-scorer';
import { performanceEstimator } from './performance-estimator';

export class BlueprintEngineV4 {

    public async generateBlueprint(input: CampaignInput): Promise<CampaignPlan> {

        // 1. Strategy Layer
        const strategy = blueprintStrategyEngine.generateStrategy(input);

        // 2. Keyword Layer
        const clusters = keywordClusteringEngine.generateClusters(input);
        const negatives = negativeKeywordEngine.generateNegatives(input);

        // 3. Ad Layer
        let adGroups = adGroupBuilder.buildAdGroups(clusters, input);

        // 4. Budget Allocation (Weighted Additive Model)
        const { budgetAllocator } = require('./budget-allocator');
        const verticalProfile = VERTICAL_PROFILES[input.vertical] || VERTICAL_PROFILES['Other'];
        const cvrBenchmarks = verticalProfile.benchmarks?.cvr || { BOF: 0.05, MOF: 0.03, TOF: 0.01 };

        adGroups = budgetAllocator.allocateBudget(adGroups, input.budget, strategy.avgCpc, cvrBenchmarks);

        // 5. Advanced Analysis (with real website crawling)
        const landingPageAnalysis = await landingPageScorer.analyze(input);
        const performance = performanceEstimator.estimate(input, strategy.clickCapacity);

        // 5. Assembly (Mapping to CampaignPlan Schema)
        const plan: CampaignPlan = {
            summary: {
                goal: `Drive ${input.objective} for ${input.businessName}`,
                totalBudget: input.budget,
                vertical: input.vertical,
                clickCapacity: strategy.clickCapacity,
                budgetTier: strategy.budgetTier,
                recommendedCampaignCount: strategy.recommendedCampaignCount,
                bidStrategy: strategy.recommendedBidStrategy,
                avgCpc: strategy.avgCpc,
            },
            channels: [
                {
                    channel: 'Google Search',
                    allocationPercentage: 1, // 100% for this blueprint
                    budget: input.budget,
                    rationale: 'Core Search Blueprint'
                }
            ],
            campaigns: [], // Legacy field, can populate with strategy.funnelStrategy mapping if needed
            execution_steps: [
                'Review validated plan above.',
                `Check Landing Page score: ${landingPageAnalysis.messageMatchScore}/10`,
                'Push to Google Ads via API.'
            ],
            optimization_schedule: [
                'Day 3: Check Search Terms',
                'Day 7: Bid Adjustment',
                'Day 30: Full Audit'
            ],
            warnings: [
                ...strategy.warnings,
                ...landingPageAnalysis.missingElements.map(e => `Missing Landing Page Element: ${e}`)
            ],

            // V4 Fields
            keywordClusters: clusters,
            negativeKeywords: negatives.negativeKeywords,
            adGroups: adGroups,
            landingPageAnalysis: {
                score: (landingPageAnalysis.messageMatchScore + landingPageAnalysis.ctaStrengthScore + landingPageAnalysis.trustSignalScore) / 3, // Aggregate
                mobileOptimized: landingPageAnalysis.mobileReadinessFlag,
                trustSignalsDetected: landingPageAnalysis.trustSignalsDetected,
                warnings: landingPageAnalysis.missingElements,

                // New Strategy Metrics
                qualityScorePrediction: landingPageAnalysis.qualityScorePrediction,
                conversionReadinessScore: landingPageAnalysis.conversionReadinessScore,
                frictionScore: landingPageAnalysis.frictionScore,
                recommendations: landingPageAnalysis.recommendations,
                landingPageType: landingPageAnalysis.landingPageType,
                adToLandingConsistencyScore: landingPageAnalysis.adToLandingConsistencyScore
            },
            performanceAssumptions: {
                ctr: performance.expectedCtr,
                cpc: performance.expectedCpc,
                cvr: performance.expectedCvr
            }
        };

        return plan;
    }
}

export const blueprintEngineV4 = new BlueprintEngineV4();
