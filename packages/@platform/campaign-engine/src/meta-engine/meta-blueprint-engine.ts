import { CampaignInput } from '../schema/campaign-plan';
import { MetaBlueprint, MetaAdSet, MetaAudience } from '../schema/meta-plan';
import { metaAudienceBuilder } from './audience-builder';
import { metaRetargetingEngine } from './meta-retargeting-engine';
import { metaCopyGenerator } from './meta-copy-generator';
import { metaPlacementEngine } from './meta-placement-engine';
import { metaBudgetEngine } from './meta-budget-engine';

export class MetaBlueprintEngine {

    public generateBlueprint(input: CampaignInput): MetaBlueprint {
        // 1. Prospecting Strategy
        const prospectingAudiences = metaAudienceBuilder.buildAudiences(input);
        const prospectingAdSets = prospectingAudiences.map(audience => this.createAdSet(input, audience, 'Prospecting'));

        // 2. Retargeting Strategy
        const retargetingStrategy = metaRetargetingEngine.buildRetargetingStrategy(input);
        const retargetingAdSets = retargetingStrategy.audiences.map(audience => {
            const specializedLocalCreative = retargetingStrategy.creatives[audience.name];
            return this.createAdSet(input, audience, 'Retargeting', specializedLocalCreative);
        });

        // 3. Budget & Optimization
        const totalAdSets = prospectingAdSets.length + retargetingAdSets.length;
        const budgetRec = metaBudgetEngine.calculateBudget(input, totalAdSets);

        return {
            campaignName: `${input.businessName} - ${input.vertical} - ${input.objective} Campaign`,
            objective: input.objective,
            totalBudget: input.budget,
            structure: {
                prospecting: {
                    audiences: prospectingAudiences,
                    adSets: prospectingAdSets
                },
                retargeting: {
                    audiences: retargetingStrategy.audiences,
                    adSets: retargetingAdSets
                }
            },
            recommendations: {
                budgetStrategy: budgetRec.budgetType,
                dailySpend: budgetRec.recommendedDailyBudget,
                learningPhaseEstimate: `${budgetRec.learningPhaseEstimate.status} (${budgetRec.learningPhaseEstimate.eventsPerWeek} events/week)`
            }
        };
    }

    private createAdSet(input: CampaignInput, audience: MetaAudience, type: 'Prospecting' | 'Retargeting', overrideCreative?: any): MetaAdSet {
        // Creative
        let creatives = [];
        if (overrideCreative) {
            creatives = [overrideCreative];
        } else {
            // Generate based on funnel stage
            creatives = [metaCopyGenerator.generateCreative(input, audience.funnelStage)];
        }

        // Placement
        const placementRec = metaPlacementEngine.recommendPlacements(input, audience.funnelStage);

        // Budget Split (Simple: Equal split for now, real engine would weight by priority)
        // If CBO, ad set budget is 0 (auto). If ABO, we need to assign.
        // For plan display, we show "Auto" or estimated.

        return {
            name: `${type} - ${audience.name}`,
            optimizationGoal: input.objective === 'Awareness' ? 'Reach' : 'Conversions', // Simplified mapping
            budget: {
                amount: 0, // 0 implies CBO / Auto
                period: 'Daily',
                strategy: 'LowestCost'
            },
            placements: placementRec.placements,
            audience: audience,
            creatives: creatives,
            learningPhaseInfo: {
                minDailyBudget: 0, // TODO: granular calc
                estimatedWeeklyEvents: 0
            }
        };
    }
}

export const metaBlueprintEngine = new MetaBlueprintEngine();
