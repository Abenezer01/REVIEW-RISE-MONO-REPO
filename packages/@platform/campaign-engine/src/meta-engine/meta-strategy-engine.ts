import { MetaAdSet } from '../schema/meta-plan';
import { CampaignInput } from '../schema/campaign-plan';

/**
 * Budget Tier determines the entire campaign structure.
 * This is the most important decision in Meta advertising.
 *
 * CONSOLIDATE  < $600/mo  → 1 campaign, 1 ad set, broad, no retargeting
 * STANDARD     $600–$1500 → 1 prospecting campaign, 2 ad sets, no retargeting
 * FULL_FUNNEL  $1500+     → Prospecting (CBO) + Retargeting (ABO)
 */
export type BudgetTier = 'CONSOLIDATE' | 'STANDARD' | 'FULL_FUNNEL';

export interface MetaStrategyOutput {
    tier: BudgetTier;
    prospectingBudget: number;
    retargetingBudget: number;
    budgetStrategy: 'CBO' | 'ABO';
    dailyBudget: number;
    warnings: string[];
    adSetAllocations: Record<string, number>;
}

export class MetaStrategyEngine {

    // Thresholds
    private readonly CONSOLIDATE_THRESHOLD = 600;   // < $600/mo → consolidate
    private readonly STANDARD_THRESHOLD = 1500;     // < $1500/mo → standard
    private readonly MIN_DAILY_PER_ADSET = 20;      // $20/day hard floor per ad set

    // Priority multipliers for ad set scoring
    private readonly SCORING = {
        RETARGETING: 3.5,
        BOF_URGENCY: 3.0,
        INTENT: 2.0,
        BROAD: 1.0
    };

    /**
     * Classify budget into a tier. This drives everything else.
     */
    public classifyBudget(monthlyBudget: number): BudgetTier {
        if (monthlyBudget < this.CONSOLIDATE_THRESHOLD) return 'CONSOLIDATE';
        if (monthlyBudget < this.STANDARD_THRESHOLD) return 'STANDARD';
        return 'FULL_FUNNEL';
    }

    public generateStrategy(input: CampaignInput, adSets: MetaAdSet[]): MetaStrategyOutput {
        const totalBudget = input.budget;
        const dailyBudget = totalBudget / 30.4;
        const warnings: string[] = [];
        const tier = this.classifyBudget(totalBudget);

        // --- Tier-specific warnings ---
        if (tier === 'CONSOLIDATE') {
            warnings.push(
                `⚠️ Budget $${totalBudget}/mo ($${dailyBudget.toFixed(0)}/day) is below the viable threshold for multi-layer funnels. ` +
                `Running CONSOLIDATE mode: 1 campaign, 1 broad ad set. No retargeting. ` +
                `Increase to $1,500+/mo to unlock full funnel structure.`
            );
        } else if (tier === 'STANDARD') {
            warnings.push(
                `ℹ️ Budget $${totalBudget}/mo supports prospecting only. ` +
                `Retargeting requires $1,500+/mo to avoid audience burnout. ` +
                `Running 2 prospecting ad sets (Intent + Broad).`
            );
        }

        // --- Budget splits by tier ---
        let retargetingBudget = 0;
        let prospectingBudget = totalBudget;

        if (tier === 'FULL_FUNNEL') {
            // 80/20 split — retargeting gets 20%
            retargetingBudget = totalBudget * 0.20;
            prospectingBudget = totalBudget - retargetingBudget;
        }

        // --- Minimum viable check for ad sets ---
        const prospectingAdSets = adSets.filter(a => a.audience.type !== 'Retargeting');
        const retargetingAdSets = adSets.filter(a => a.audience.type === 'Retargeting');

        const prospectingDailyMin = prospectingAdSets.length * this.MIN_DAILY_PER_ADSET;
        const prospectingDailyActual = prospectingBudget / 30.4;

        if (prospectingDailyActual < prospectingDailyMin && prospectingAdSets.length > 0) {
            warnings.push(
                `⚠️ $${prospectingDailyActual.toFixed(0)}/day across ${prospectingAdSets.length} ad sets is below minimum vital threshold of $${prospectingDailyMin}/day. ` +
                `You will likely be stuck in 'Learning Limited'. Reduce ad sets or increase budget.`
            );
        }

        // --- Frequency protection for retargeting ---
        if (tier === 'FULL_FUNNEL' && retargetingBudget > 0) {
            const estimatedRetargetingAudienceSize = 2000; // conservative estimate
            if (estimatedRetargetingAudienceSize < 5000) {
                // Cap retargeting to prevent burnout on small audiences
                const cappedRetargeting = Math.min(retargetingBudget, totalBudget * 0.15);
                if (cappedRetargeting < retargetingBudget) {
                    warnings.push(
                        `⚠️ Retargeting audience estimated < 5,000. Capping retargeting budget at 15% ($${cappedRetargeting.toFixed(0)}/mo) to prevent frequency burnout.`
                    );
                    prospectingBudget = totalBudget - cappedRetargeting;
                    retargetingBudget = cappedRetargeting;
                }
            }
        }

        // --- Ad set budget allocations ---
        const allocations: Record<string, number> = {};
        this.allocateAdSetBudgets(prospectingAdSets, prospectingBudget, allocations);
        this.allocateAdSetBudgets(retargetingAdSets, retargetingBudget, allocations);

        return {
            tier,
            prospectingBudget,
            retargetingBudget,
            budgetStrategy: tier === 'FULL_FUNNEL' ? 'CBO' : 'ABO',
            dailyBudget,
            warnings,
            adSetAllocations: allocations
        };
    }

    private allocateAdSetBudgets(
        adSets: MetaAdSet[],
        totalPool: number,
        allocationMap: Record<string, number>
    ) {
        if (adSets.length === 0) return;

        const scores = adSets.map(adSet => {
            let score = 1.0;
            switch (adSet.audience.type) {
                case 'Retargeting': score = this.SCORING.RETARGETING; break;
                case 'Core':
                    score = adSet.audience.funnelStage === 'BOF'
                        ? this.SCORING.BOF_URGENCY
                        : this.SCORING.INTENT;
                    break;
                case 'Broad': score = this.SCORING.BROAD; break;
            }
            return { name: adSet.name, score };
        });

        const totalScore = scores.reduce((sum, item) => sum + item.score, 0);
        scores.forEach(item => {
            allocationMap[item.name] = totalPool * (item.score / totalScore);
        });
    }

    public estimateLearningPhase(dailySpend: number, cpaTarget: number): string {
        const weeklySpend = dailySpend * 7;
        const estimatedEvents = weeklySpend / cpaTarget;

        if (estimatedEvents >= 50) return 'Healthy — exits learning phase within 7 days';
        if (estimatedEvents >= 30) return 'At Risk — slow optimization, consider consolidating ad sets';
        return 'Learning Limited — insufficient budget for Meta to optimize delivery';
    }
}

export const metaStrategyEngine = new MetaStrategyEngine();
