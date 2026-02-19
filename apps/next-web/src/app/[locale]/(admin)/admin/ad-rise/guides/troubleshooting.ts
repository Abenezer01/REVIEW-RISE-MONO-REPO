export interface TroubleshootingNode {
    id: string;
    issue: string;
    suggestion: string;
    steps: string[];
}

export interface DiagnosticOption {
    label: string;
    nextId: string;
    type: 'question' | 'result';
}

export interface DiagnosticStep {
    id: string;
    question: string;
    description?: string;
    options: DiagnosticOption[];
}

export const DIAGNOSTIC_STEPS: DiagnosticStep[] = [
    {
        id: 'q-start',
        question: 'Are your ads being shown (Impressions)?',
        description: 'Check if the "Impressions" column in your ad platform shows a number greater than 0.',
        options: [
            { label: 'No, impressions are 0 or very low', nextId: 'tr-1', type: 'result' },
            { label: 'Yes, I see impressions', nextId: 'q-clicks', type: 'question' },
        ],
    },
    {
        id: 'q-clicks',
        question: 'Are people clicking on your ads (CTR)?',
        description: 'Check if your Click-Through Rate is below 1% for Google Search or below 0.5% for Meta.',
        options: [
            { label: 'No, CTR is low', nextId: 'tr-3', type: 'result' },
            { label: 'Yes, I am getting clicks', nextId: 'q-conversions', type: 'question' },
        ],
    },
    {
        id: 'q-conversions',
        question: 'Are those clicks turning into Leads/Sales?',
        description: 'Check if you are getting traffic but no conversion actions.',
        options: [
            { label: 'No, nobody is converting', nextId: 'tr-4', type: 'result' },
            { label: 'Yes, but the cost per result is too high', nextId: 'tr-2', type: 'result' },
        ],
    },
];

export const TROUBLESHOOTING_FLOWS: TroubleshootingNode[] = [
    {
        id: 'tr-1',
        issue: 'Low Impressions',
        suggestion: 'Broaden your horizon or increase visibility.',
        steps: [
            'Broaden targeting: expand geo, audience size, or age constraints if currently too narrow.',
            'Broaden keywords: move some terms from Exact to Phrase/Broad where relevant.',
            'Raise bids: increase Max CPC (Google) or Bid Cap (Meta) to improve auction competitiveness.',
            'Increase daily budget if campaigns are budget-limited and stopping delivery early.',
        ],
    },
    {
        id: 'tr-2',
        issue: 'High CPC / Cost Per Result',
        suggestion: 'Focus on efficiency and quality.',
        steps: [
            'Tighten intent: pause broad low-intent terms/audiences and focus on high-intent segments.',
            'Add negative keywords (Google) to block expensive irrelevant traffic.',
            'Improve Quality Score proxies: better ad-to-keyword relevance, stronger CTR signals, faster and more relevant landing page experience.',
            'Test a new Creative/Image on Meta to resolve "Creative Fatigue".',
            'Check landing page speed and mobile UX to reduce bounce and improve post-click quality.',
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
