export interface OptimizationTask {
    id: string;
    day: number;
    title: string;
    description: string;
}

export const OPTIMIZATION_TASKS: OptimizationTask[] = [
    // Day 3
    {
        id: 'opt-d3-1',
        day: 3,
        title: 'Search Terms Review (Google)',
        description: 'Check "Search Terms" report. Add irrelevant queries as Negative Keywords to stop wasted spend.',
    },
    {
        id: 'opt-d3-2',
        day: 3,
        title: 'Placement Review (Meta)',
        description: 'Check which placements are eating budget without conversions. Pause poorly performing ones.',
    },

    // Day 7
    {
        id: 'opt-d7-1',
        day: 7,
        title: 'Split Test Copy',
        description: 'Compare CTR across ads. Pause the bottom 20-30% and test a new headline variation.',
    },
    {
        id: 'opt-d7-2',
        day: 7,
        title: 'Budget Adjustment',
        description: 'Increase budget by 10-20% on top-performing ad sets/campaigns. Do not change too quickly to avoid re-entering learning phase.',
    },

    // Day 14
    {
        id: 'opt-d14-1',
        day: 14,
        title: 'Reallocate to Winners',
        description: 'Strictly move budget from low-conversion campaigns to high-performing ones.',
    },
    {
        id: 'opt-d14-2',
        day: 14,
        title: 'Expand Keywords/Interests',
        description: 'Look for new keyword opportunities in the search terms report or expand into Lookalike audiences on Meta.',
    },
];
