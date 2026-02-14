import { BlueprintInput, Campaign, AdGroup, KeywordCluster } from '@platform/contracts';

export class StrategyCompiler {
    compile(input: BlueprintInput, clusters: KeywordCluster[], sourceAdGroups: AdGroup[]): Campaign[] {
        const structure = this.determineBudgetStructure(input.budgetTier || 'Mid');
        const campaigns: Campaign[] = [];

        // Helper to find ad group for a cluster by theme
        const getAdGroupsForIntent = (intents: string[]): AdGroup[] => {
            const relevantClusters = clusters.filter(c => intents.includes(c.intent || 'Service')); // Default to Service if missing
            const relevantThemes = relevantClusters.map(c => c.theme);

            // Find ad groups that match these themes
            // The LLM output usually matches adGroup.name to cluster.theme
            return sourceAdGroups.filter(ag => {
                return relevantThemes.some(t => ag.name === t || ag.name.includes(t));
            });
        };

        if (structure === 'Simple') {
            // Low Budget: 1 Campaign for everything
            const allAdGroups = sourceAdGroups;

            campaigns.push({
                name: `${input.offerOrService} - Core Campaign`,
                objective: input.objective || 'Leads',
                budgetRecommendation: '100%',
                adGroups: allAdGroups
            });
        } else if (structure === 'Standard') {
            // Mid Budget: Brand + Non-Brand
            const brandAdGroups = getAdGroupsForIntent(['Brand']);
            // Everything else
            const nonBrandAdGroups = sourceAdGroups.filter(ag => !brandAdGroups.includes(ag));

            if (brandAdGroups.length > 0) {
                campaigns.push({
                    name: `${input.businessName || 'Brand'} - Brand Protection`,
                    objective: 'Brand Awareness',
                    budgetRecommendation: '15%',
                    adGroups: brandAdGroups
                });
            }

            if (nonBrandAdGroups.length > 0) {
                campaigns.push({
                    name: `${input.offerOrService} - General Service`,
                    objective: input.objective || 'Leads',
                    budgetRecommendation: brandAdGroups.length > 0 ? '85%' : '100%',
                    adGroups: nonBrandAdGroups
                });
            }
        } else {
            // High Budget: Segmented by Intent
            const brandAdGroups = getAdGroupsForIntent(['Brand']);
            const highIntentAdGroups = getAdGroupsForIntent(['Commercial', 'Service']); // BOF/MOF
            const researchAdGroups = getAdGroupsForIntent(['Problem', 'Competitor']); // TOF

            // Fallback: any ad groups not caught by above logic (e.g. if intent is weird)
            const assigned = [...brandAdGroups, ...highIntentAdGroups, ...researchAdGroups];
            const unassigned = sourceAdGroups.filter(ag => !assigned.includes(ag));

            // Add unassigned to high intent by default
            highIntentAdGroups.push(...unassigned);

            if (brandAdGroups.length > 0) {
                campaigns.push({
                    name: `${input.businessName || 'Brand'} - Brand`,
                    objective: 'Brand Awareness',
                    budgetRecommendation: '10%',
                    adGroups: brandAdGroups
                });
            }

            if (highIntentAdGroups.length > 0) {
                campaigns.push({
                    name: `${input.offerOrService} - High Intent (BOF)`,
                    objective: 'Conversions',
                    budgetRecommendation: '60%',
                    adGroups: highIntentAdGroups
                });
            }

            if (researchAdGroups.length > 0) {
                campaigns.push({
                    name: `${input.offerOrService} - Research (TOF/MOF)`,
                    objective: 'Traffic',
                    budgetRecommendation: '30%',
                    adGroups: researchAdGroups
                });
            }
        }

        // Final check: ensure at least one campaign exists
        if (campaigns.length === 0) {
            campaigns.push({
                name: `${input.offerOrService} - Core Campaign`,
                objective: input.objective || 'Leads',
                budgetRecommendation: '100%',
                adGroups: sourceAdGroups
            });
        }

        return campaigns;
    }

    determineBudgetStructure(tier: 'Low' | 'Mid' | 'High'): 'Simple' | 'Standard' | 'Segmented' {
        switch (tier) {
            case 'Low': return 'Simple';
            case 'High': return 'Segmented';
            case 'Mid': default: return 'Standard';
        }
    }

    mapFunnelStage(intent: string): 'TOF' | 'MOF' | 'BOF' {
        switch (intent) {
            case 'Problem': return 'TOF';
            case 'Service': return 'MOF';
            case 'Commercial':
            case 'Competitor':
            case 'Brand': return 'BOF';
            default: return 'MOF';
        }
    }
}

export const strategyCompiler = new StrategyCompiler();
