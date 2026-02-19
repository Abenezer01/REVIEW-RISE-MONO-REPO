import { CampaignInput } from '../schema/campaign-plan';
import { MetaBlueprint, MetaAdSet, MetaCampaign, MetaAudience } from '../schema/meta-plan';
import { metaAudienceBuilder } from './audience-builder';
import { metaCreativeGenerator } from './creative-generator';
import { metaPlacementEngine } from './meta-placement-engine';
import { metaStrategyEngine, BudgetTier } from './meta-strategy-engine';

/**
 * Meta Blueprint Engine — Senior Media Buyer v3
 *
 * Routes to different output structures based on budget tier:
 *
 *   CONSOLIDATE  < $600/mo  → 1 campaign, 1 broad ad set, no retargeting
 *   STANDARD     $600–$1500 → 1 prospecting campaign, 2 ad sets, no retargeting
 *   FULL_FUNNEL  $1500+     → Prospecting (CBO) + Retargeting (ABO)
 *
 * Core rules:
 *   - Website Visitors NEVER appear in Prospecting
 *   - Retargeting ONLY exists in FULL_FUNNEL tier
 *   - Budget consolidation > fragmentation at low budgets
 */
export class MetaBlueprintEngine {

    public generateBlueprint(input: CampaignInput): MetaBlueprint {
        // 1. Classify budget — this drives everything
        const tier = metaStrategyEngine.classifyBudget(input.budget);

        // 2. Build audiences for this tier
        const allAudiences = metaAudienceBuilder.buildAudiences(input, tier);
        const prospectingAudiences = allAudiences.filter(a => a.type !== 'Retargeting');
        const retargetingAudiences = allAudiences.filter(a => a.type === 'Retargeting');

        // 3. Build ad sets
        const prospectingAdSets = prospectingAudiences.map(a => this.buildAdSet(input, a, 'Prospecting'));
        const retargetingAdSets = retargetingAudiences.map(a => this.buildAdSet(input, a, 'Retargeting'));

        // 4. Run strategy engine (budget allocation + warnings)
        const strategy = metaStrategyEngine.generateStrategy(input, [...prospectingAdSets, ...retargetingAdSets]);

        // 5. Apply budget allocations to ad sets
        this.applyBudgets(prospectingAdSets, strategy.adSetAllocations);
        this.applyBudgets(retargetingAdSets, strategy.adSetAllocations);

        // 6. Build campaign objects
        const prospectingCampaign: MetaCampaign = {
            name: this.buildCampaignName(input, 'PROSPECTING', tier),
            objective: this.mapObjective(input.objective),
            buyingType: 'AUCTION',
            budgetOptimization: strategy.budgetStrategy,
            totalBudget: strategy.prospectingBudget,
            adSets: prospectingAdSets
        };

        // Retargeting campaign only exists in FULL_FUNNEL
        const retargetingCampaign: MetaCampaign = {
            name: this.buildCampaignName(input, 'RETARGETING', tier),
            objective: this.mapObjective(input.objective),
            buyingType: 'AUCTION',
            budgetOptimization: 'ABO', // Always ABO for retargeting — force delivery
            totalBudget: strategy.retargetingBudget,
            adSets: retargetingAdSets
        };

        return {
            campaignName: `${input.businessName} — Meta Blueprint`,
            objective: input.objective,
            totalBudget: input.budget,
            structure: {
                prospecting: prospectingCampaign,
                retargeting: retargetingCampaign
            },
            recommendations: {
                budgetStrategy: this.buildBudgetStrategyLabel(tier, strategy.budgetStrategy),
                dailySpend: strategy.dailyBudget,
                learningPhaseEstimate: metaStrategyEngine.estimateLearningPhase(
                    strategy.dailyBudget,
                    50 // Conservative CPA target
                ),
                warnings: strategy.warnings,
                budgetTier: tier
            }
        };
    }

    private buildAdSet(
        input: CampaignInput,
        audience: MetaAudience,
        type: 'Prospecting' | 'Retargeting'
    ): MetaAdSet {
        const hasVideoAsset = false; // TODO: detect from input when asset library is added
        const creatives = metaCreativeGenerator.generateCreatives(input, audience.funnelStage, audience.name);
        const placement = metaPlacementEngine.recommendPlacements(input, type, hasVideoAsset);

        return {
            name: `${type} | ${audience.name}`,
            optimizationGoal: input.objective === 'Awareness' ? 'Reach' : 'Conversions',
            budget: {
                amount: 0, // Filled by applyBudgets()
                period: 'Daily',
                strategy: 'LowestCost'
            },
            placements: placement.placements,
            placementStrategy: placement.strategy,
            placementRationale: placement.rationale,
            placementNotes: placement.notes,
            audience,
            creatives,
            learningPhaseInfo: {
                minDailyBudget: 20,
                estimatedWeeklyEvents: 0,
                status: 'Pending'
            }
        };
    }

    private applyBudgets(adSets: MetaAdSet[], allocations: Record<string, number>) {
        adSets.forEach(adSet => {
            const monthlyAllocation = allocations[adSet.name];
            if (monthlyAllocation) {
                adSet.budget.amount = Math.round(monthlyAllocation / 30.4);
            }
        });
    }

    private buildCampaignName(input: CampaignInput, type: string, tier: BudgetTier): string {
        const tierLabel = tier === 'CONSOLIDATE' ? 'CONSOLIDATED' : type;
        return `[${tierLabel}] ${input.businessName} — ${input.objective}`;
    }

    private buildBudgetStrategyLabel(tier: BudgetTier, strategy: 'CBO' | 'ABO'): string {
        switch (tier) {
            case 'CONSOLIDATE':
                return 'CONSOLIDATE MODE — 1 Campaign, 1 Ad Set, Broad. Signal density over segmentation.';
            case 'STANDARD':
                return `STANDARD MODE — ${strategy}: 2 Prospecting Ad Sets (Intent + Broad). No retargeting.`;
            case 'FULL_FUNNEL':
                return `FULL FUNNEL — Prospecting (${strategy}/CBO) + Retargeting (ABO). Minimum $1,500/mo required.`;
        }
    }

    private mapObjective(objective: string): 'OUTCOME_LEADS' | 'OUTCOME_SALES' | 'OUTCOME_AWARENESS' {
        if (objective === 'Sales') return 'OUTCOME_SALES';
        if (objective === 'Awareness') return 'OUTCOME_AWARENESS';
        return 'OUTCOME_LEADS';
    }
}

export const metaBlueprintEngine = new MetaBlueprintEngine();
