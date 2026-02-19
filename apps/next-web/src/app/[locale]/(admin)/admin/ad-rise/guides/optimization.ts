export interface OptimizationTask {
    id: string;
    day: number;
    platform: 'google' | 'meta' | 'both';
    title: string;
    description: string;
}

export const OPTIMIZATION_TASKS: OptimizationTask[] = [
    // Day 3
    {
        id: 'opt-d3-1',
        day: 3,
        platform: 'google',
        title: 'Search Terms Review (Google)',
        description: 'Open the Search Terms report. Add unrelated searches as negative keywords so you stop paying for bad clicks.',
    },
    {
        id: 'opt-d3-2',
        day: 3,
        platform: 'meta',
        title: 'Placement Review (Meta)',
        description: 'Check where your ads are showing. Pause placements that spend money but do not bring results.',
    },
    {
        id: 'opt-d3-3',
        day: 3,
        platform: 'both',
        title: 'Verify Tracking Integrity',
        description: 'Make sure conversions/events are being tracked correctly in Google and Meta. Confirm events are not firing twice.',
    },
    {
        id: 'opt-d3-4',
        day: 3,
        platform: 'both',
        title: 'Check Early Delivery Health',
        description: 'Check if spend, reach, and clicks look normal. Fix any ad disapprovals or delivery problems first.',
    },
    {
        id: 'opt-d3-5',
        day: 3,
        platform: 'both',
        title: 'Add Negative Keywords & Exclusions',
        description: 'Block clearly low-quality traffic: add negative keywords in Google and audience exclusions in Meta.',
    },

    // Day 7
    {
        id: 'opt-d7-1',
        day: 7,
        platform: 'both',
        title: 'Split Test Copy',
        description: 'Compare ad text performance. Pause weak ads and test new headlines.',
    },
    {
        id: 'opt-d7-2',
        day: 7,
        platform: 'both',
        title: 'Budget Adjustment',
        description: 'Move more budget to better-performing campaigns. Increase slowly (about 10-20%).',
    },
    {
        id: 'opt-d7-3',
        day: 7,
        platform: 'both',
        title: 'Creative Fatigue Check',
        description: 'Check if people are getting tired of the same ads. Replace weak creatives with fresh versions.',
    },
    {
        id: 'opt-d7-4',
        day: 7,
        platform: 'both',
        title: 'Landing Page Friction Review',
        description: 'Check landing page speed and mobile experience. Make sure the page message matches the ad.',
    },
    {
        id: 'opt-d7-5',
        day: 7,
        platform: 'both',
        title: 'Audience and Query Refinement',
        description: 'Refine keywords and audiences using conversion quality, not just click volume.',
    },

    // Day 14
    {
        id: 'opt-d14-1',
        day: 14,
        platform: 'both',
        title: 'Reallocate to Winners',
        description: 'Move budget from poor campaigns to the campaigns that are performing best.',
    },
    {
        id: 'opt-d14-2',
        day: 14,
        platform: 'both',
        title: 'Expand Keywords/Interests',
        description: 'Add new high-quality keywords (Google) and interests/lookalikes (Meta) based on what is working.',
    },
    {
        id: 'opt-d14-3',
        day: 14,
        platform: 'both',
        title: 'Scale with Guardrails',
        description: 'Scale winning campaigns slowly. Watch CPA/ROAS and stop scaling if performance drops too much.',
    },
    {
        id: 'opt-d14-4',
        day: 14,
        platform: 'both',
        title: 'Segment by Funnel Intent',
        description: 'Separate prospecting and retargeting budgets so performance is easier to track and control.',
    },
    {
        id: 'opt-d14-5',
        day: 14,
        platform: 'both',
        title: 'Document Learnings and Next Tests',
        description: 'Write down what worked and what did not. Plan the next tests with clear success goals.',
    },
];
