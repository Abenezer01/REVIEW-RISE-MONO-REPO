export interface Step {
    id: string;
    title: string;
    description: string;
}

export interface PlatformGuide {
    id: string;
    platform: 'google' | 'meta';
    sections: {
        title: string;
        steps: Step[];
    }[];
}

export const SETUP_TEMPLATES: PlatformGuide[] = [
    {
        id: 'google-setup',
        platform: 'google',
        sections: [
            {
                title: 'Campaign Level',
                steps: [
                    {
                        id: 'g-c-1',
                        title: 'Create New Campaign',
                        description: 'Select "Create a campaign without a goal\'s guidance" for maximum control, or choose based on your specific objective.',
                    },
                    {
                        id: 'g-c-2',
                        title: 'Set Budget & Bidding',
                        description: 'Enter your monthly budget divided by 30. Start with "Maximize Clicks" if you have no conversion data, or "Maximize Conversions" if you do.',
                    },
                    {
                        id: 'g-c-3',
                        title: 'Campaign Settings',
                        description: 'Disable Search/Display Networks if you want pure search. Set your location targeting and language.',
                    },
                ],
            },
            {
                title: 'Ad Group Level',
                steps: [
                    {
                        id: 'g-ag-1',
                        title: 'Define Ad Groups',
                        description: 'Group your keywords into tight, relevant themes. Each ad group should focus on one core service/offer.',
                    },
                    {
                        id: 'g-ag-2',
                        title: 'Input Keywords',
                        description: 'Use the Keyword Clusters from your Blueprint. Use Phrase Match ("keyword") or Exact Match ([keyword]) to avoid wasted spend.',
                    },
                ],
            },
            {
                title: 'Ads & Extensions',
                steps: [
                    {
                        id: 'g-a-1',
                        title: 'Create Responsive Search Ads (RSAs)',
                        description: 'Input the headlines and descriptions from your AI Blueprint. Use all 15 headlines for better optimization.',
                    },
                    {
                        id: 'g-a-2',
                        title: 'Set Up Assets (Extensions)',
                        description: 'Add Sitelinks, Callouts, and Call assets to increase your Ad Rank and CTR.',
                    },
                ],
            },
            {
                title: 'Conversion Tracking',
                steps: [
                    {
                        id: 'g-ct-1',
                        title: 'Verify Tag Installation',
                        description: 'Ensure the Google Tag or GTM is firing correctly on your landing page.',
                    },
                ],
            },
        ],
    },
    {
        id: 'meta-setup',
        platform: 'meta',
        sections: [
            {
                title: 'Campaign Level',
                steps: [
                    {
                        id: 'm-c-1',
                        title: 'Choose Objective',
                        description: 'Select "Sales" or "Leads" for direct ROI, or "Traffic" for engagement.',
                    },
                    {
                        id: 'm-c-2',
                        title: 'Advantage+ vs Manual',
                        description: 'Start with Manual setup to maintain control over targeting and placements.',
                    },
                ],
            },
            {
                title: 'Ad Set Level',
                steps: [
                    {
                        id: 'm-as-1',
                        title: 'Targeting & Audience',
                        description: 'Define your locations, age, and gender. Use Detailed Targeting for interests identified in your strategy.',
                    },
                    {
                        id: 'm-as-2',
                        title: 'Placements',
                        description: 'Select "Manual Placements" to focus on News Feed, Stories, and Reels if budget is tight.',
                    },
                ],
            },
            {
                title: 'Ad Level',
                steps: [
                    {
                        id: 'm-a-1',
                        title: 'Creative Setup',
                        description: 'Upload your AI-generated images/videos. Link to the correct Instagram and Facebook pages.',
                    },
                    {
                        id: 'm-a-2',
                        title: 'Ad Copy',
                        description: 'Use the primary text, headlines, and CTAs from your Meta Blueprint.',
                    },
                ],
            },
        ],
    },
];
