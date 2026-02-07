export interface TroubleshootingNode {
    id: string;
    issue: string;
    suggestion: string;
    steps: string[];
}

export const TROUBLESHOOTING_FLOWS: TroubleshootingNode[] = [
    {
        id: 'tr-1',
        issue: 'Low Impressions',
        suggestion: 'Broaden your horizon or increase visibility.',
        steps: [
            'Increase your Daily Budget.',
            'Change Keyword Match types from Exact to Phrase or Broad.',
            'Check if your targeting location is too small.',
            'Increase your Max CPC bid (Google) or Bid Cap (Meta).',
        ],
    },
    {
        id: 'tr-2',
        issue: 'High CPC / Cost Per Result',
        suggestion: 'Focus on efficiency and quality.',
        steps: [
            'Improve Ad Relevance (headlines must match keywords).',
            'Add Negative Keywords (Google) to filter out high-cost, low-intent traffic.',
            'Test a new Creative/Image on Meta to resolve "Creative Fatigue".',
            'Check Landing Page load speed and mobile experience.',
        ],
    },
    {
        id: 'tr-3',
        issue: 'Low CTR (Click-Through Rate)',
        suggestion: 'Make your ads more enticing.',
        steps: [
            'Use stronger CTAs in headlines (e.g., "Get 20% Off Today").',
            'Ensure the main offer is visible in the first 3 headlines (Google).',
            'Try high-contrast images or videos with a hook in the first 3 seconds (Meta).',
            'A/B test different primary text variations.',
        ],
    },
    {
        id: 'tr-4',
        issue: 'Low Conversions (High Traffic, No Leads)',
        suggestion: 'Fix the conversion bridge.',
        steps: [
            'Audit your Landing Page: Is there a clear contact form/button?',
            'Ensure the "Message-Match": Does the ad promise exactly what the page delivers?',
            'Set up retargeting for people who visited but didn\'t convert.',
            'Verify that your Conversion Tracking is actually working.',
        ],
    },
];
