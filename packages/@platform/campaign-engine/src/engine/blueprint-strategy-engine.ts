import { CampaignInput } from '../schema/campaign-plan';
import { VERTICAL_PROFILES, VerticalProfile } from '../config/vertical-profiles';

export interface StrategyOutput {
    clickCapacity: number;
    budgetTier: 'Low' | 'Medium' | 'High';
    recommendedCampaignCount: number;
    recommendedBidStrategy: string;
    funnelStrategy: FunnelAllocations;
    avgCpc: number; // For UI transparency
    warnings: string[];
}

export interface FunnelAllocations {
    TOF: boolean;
    MOF: boolean;
    BOF: boolean;
}

export class BlueprintStrategyEngine {

    public generateStrategy(input: CampaignInput): StrategyOutput {
        const warnings: string[] = [];
        const verticalProfile = VERTICAL_PROFILES[input.vertical];

        // 1. CPC Intelligence & Click Capacity
        const avgCpc = this.determineCpc(input, verticalProfile);
        const clickCapacity = Math.floor(input.budget / avgCpc);

        // 2. Budget Tier Logic
        const budgetTier = this.determineBudgetTier(clickCapacity);
        const recommendedCampaignCount = this.getRecommendedCampaignCount(budgetTier);

        // 3. Objective -> Bid Strategy
        const recommendedBidStrategy = this.mapBidStrategy(input);

        // 4. Funnel Mapping
        const funnelStrategy = this.generateFunnelStrategy(budgetTier);

        return {
            clickCapacity,
            budgetTier,
            recommendedCampaignCount,
            recommendedBidStrategy,
            funnelStrategy,
            avgCpc,
            warnings
        };
    }

    private determineCpc(input: CampaignInput, profile: VerticalProfile): number {
        if (profile.avgCpc) {
            return profile.avgCpc;
        }
        if (input.expectedAvgCpc) {
            return input.expectedAvgCpc;
        }
        throw new Error("CPC data required");
    }

    private determineBudgetTier(clicks: number): 'Low' | 'Medium' | 'High' {
        if (clicks < 100) return 'Low';
        if (clicks <= 500) return 'Medium';
        return 'High';
    }

    private getRecommendedCampaignCount(tier: 'Low' | 'Medium' | 'High'): number {
        switch (tier) {
            case 'Low': return 1; // 1 campaign, grouped services
            case 'Medium': return 2; // 1-2 campaigns
            case 'High': return 3; // Multi-campaign
        }
    }

    private mapBidStrategy(input: CampaignInput): string {
        if (input.objective === 'Leads') {
            return input.conversionTrackingEnabled ? 'Maximize Conversions' : 'Maximize Clicks';
        }
        if (input.objective === 'Sales') {
            return 'Target CPA';
        }
        if (input.objective === 'Awareness') {
            return 'Maximize Clicks';
        }
        // Traffic / Local Visits fallback
        return 'Maximize Clicks';
    }

    private generateFunnelStrategy(tier: 'Low' | 'Medium' | 'High'): FunnelAllocations {
        // BOF is always on (Emergency / Near Me / High Intent)
        const allocations = { TOF: false, MOF: false, BOF: true };

        if (tier === 'Medium') {
            allocations.MOF = true; // Service searches
        }
        if (tier === 'High') {
            allocations.MOF = true;
            allocations.TOF = true; // Problem searches
        }

        return allocations;
    }
}

export const blueprintStrategyEngine = new BlueprintStrategyEngine();
