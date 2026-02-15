import { BlueprintInput, Campaign, AdGroup, KeywordCluster } from '@platform/contracts';

export class StrategyCompiler {
    compile(input: BlueprintInput, clusters: KeywordCluster[], sourceAdGroups: AdGroup[]): Campaign[] {
        const structure = this.determineBudgetStructure(input.budget);
        const campaigns: Campaign[] = [];
        const offerName = input.offer || input.services[0] || input.businessName || 'Service';

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

        // Helper to calculate campaign budget from ad groups
        const calculateCampaignBudget = (adGroups: AdGroup[]): string => {
            const totalPercentage = adGroups.reduce((sum, ag) => {
                return sum + (ag.budgetAllocation?.percentage || 0);
            }, 0);
            return `${(totalPercentage * 100).toFixed(0)}%`;
        };

        if (structure === 'Simple') {
            // Low Budget: 1 Campaign for everything
            const allAdGroups = sourceAdGroups;

            campaigns.push({
                name: `${offerName} - Core Campaign`,
                objective: input.objective || 'Leads',
                budgetRecommendation: calculateCampaignBudget(allAdGroups),
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
                    budgetRecommendation: calculateCampaignBudget(brandAdGroups),
                    adGroups: brandAdGroups
                });
            }

            if (nonBrandAdGroups.length > 0) {
                campaigns.push({
                    name: `${offerName} - General Service`,
                    objective: input.objective || 'Leads',
                    budgetRecommendation: calculateCampaignBudget(nonBrandAdGroups),
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
                    budgetRecommendation: calculateCampaignBudget(brandAdGroups),
                    adGroups: brandAdGroups
                });
            }

            if (highIntentAdGroups.length > 0) {
                campaigns.push({
                    name: `${offerName} - High Intent (BOF)`,
                    objective: 'Conversions',
                    budgetRecommendation: calculateCampaignBudget(highIntentAdGroups),
                    adGroups: highIntentAdGroups
                });
            }

            if (researchAdGroups.length > 0) {
                campaigns.push({
                    name: `${offerName} - Research (TOF/MOF)`,
                    objective: 'Traffic',
                    budgetRecommendation: calculateCampaignBudget(researchAdGroups),
                    adGroups: researchAdGroups
                });
            }
        }

        // Final check: ensure at least one campaign exists
        if (campaigns.length === 0) {
            campaigns.push({
                name: `${offerName} - Core Campaign`,
                objective: input.objective || 'Leads',
                budgetRecommendation: calculateCampaignBudget(sourceAdGroups),
                adGroups: sourceAdGroups
            });
        }

        return campaigns;
    }

    determineBudgetStructure(budget: number): 'Simple' | 'Standard' | 'Segmented' {
        if (budget < 1000) return 'Simple';
        if (budget > 5000) return 'Segmented';
        return 'Standard';
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
