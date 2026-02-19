export interface Step {
    id: string;
    title: string;
    description: string;
    checklist?: string[];
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
                title: 'Step 1: Create campaign',
                steps: [
                    {
                        id: 'g-c-1',
                        title: 'Create campaign',
                        description: 'In Google Ads click New campaign, choose your objective (Sales, Leads, Website traffic, Awareness), then choose campaign type (Search, Performance Max, Display, Video).',
                        checklist: [
                            'Open Google Ads and click New campaign.',
                            'Choose objective: Sales, Leads, Website traffic, or Awareness.',
                            'Choose campaign type: Search, Performance Max, Display, or Video.'
                        ],
                    },
                    {
                        id: 'g-c-2',
                        title: 'Set conversion goals',
                        description: 'Select the exact conversion actions this campaign should optimize for. Remove irrelevant account-default goals so optimization is not diluted.',
                        checklist: [
                            'Open campaign conversion goals.',
                            'Select only the conversion actions this campaign should optimize for.',
                            'Remove irrelevant account-default goals to avoid diluted optimization.'
                        ],
                    },
                    {
                        id: 'g-c-3',
                        title: 'Set budget and bidding strategy',
                        description: 'Set daily budget from your plan. Use Maximize Conversions (or tCPA/tROAS if stable history exists). Use Maximize Clicks only for early traffic learning.',
                        checklist: [
                            'Open campaign budget and bidding settings.',
                            'Set daily budget using your approved plan.',
                            'Choose bidding strategy: use Maximize Conversions by default.',
                            'Use tCPA or tROAS only when you have stable conversion history.',
                            'Use Maximize Clicks only for early traffic-learning phases.'
                        ],
                    },
                    {
                        id: 'g-c-4',
                        title: 'Choose network settings',
                        description: 'For Search campaigns, disable Display Network expansion unless intentionally testing it. Keep Search Partners on only if early results are efficient.',
                        checklist: [
                            'Open campaign network settings.',
                            'For Search campaigns, turn off Display Network expansion unless you are running a controlled test.',
                            'Enable Search Partners only if early performance is efficient.',
                            'Save settings and confirm they match your test plan.'
                        ],
                    },
                    {
                        id: 'g-c-5',
                        title: 'Configure location and language targeting',
                        description: 'Set exact countries/cities from your plan. Use Presence targeting (people in or regularly in your locations) to avoid irrelevant clicks.',
                        checklist: [
                            'Open location and language targeting settings.',
                            'Add the exact countries, cities, or regions from your plan.',
                            'Set location option to Presence (people in or regularly in your locations).',
                            'Set campaign language(s) to match your ad and landing page language.'
                        ],
                    },
                    {
                        id: 'g-c-6',
                        title: 'Set schedule and start/end dates',
                        description: 'Align campaign start/end with your strategy timeline. If you have peak dates, align ad schedule and budget pacing windows accordingly.',
                        checklist: [
                            'Open schedule and date settings.',
                            'Set campaign start and end dates based on your strategy timeline.',
                            'If you have peak dates, align ad schedule with those windows.',
                            'Confirm budget pacing supports ramp-up and ramp-down periods.'
                        ],
                    },
                    {
                        id: 'g-c-7',
                        title: 'Apply account-level safety settings',
                        description: 'Confirm brand safety, content exclusions, and account-level negative keyword lists. Add brand exclusions where needed for prospecting campaigns.',
                        checklist: [
                            'Open account-level safety and exclusions.',
                            'Review and apply brand safety controls and content exclusions.',
                            'Apply account-level negative keyword lists.',
                            'Add brand exclusions when running prospecting campaigns.'
                        ],
                    },
                ],
            },
            {
                title: 'Step 2: Ad group',
                steps: [
                    {
                        id: 'g-ag-1',
                        title: 'Define ad group theme',
                        description: 'Create tightly themed ad groups by service, intent, or offer. Keep each ad group focused on one search intent cluster.',
                        checklist: [
                            'Create ad groups around one service, offer, or intent cluster.',
                            'Name ad groups clearly based on intent.',
                            'Keep each ad group focused on one search intent.',
                            'Avoid mixing unrelated keyword themes in the same ad group.'
                        ],
                    },
                    {
                        id: 'g-ag-2',
                        title: 'Add primary keywords',
                        description: 'Start with Phrase and Exact match core terms from your strategy. Avoid broad match until enough negative keywords and conversion data exist.',
                        checklist: [
                            'Add core keywords from your strategy first.',
                            'Use Phrase and Exact match types at launch.',
                            'Avoid Broad match until negatives and conversion signals are strong.',
                            'Double-check that keywords align with ad group intent.'
                        ],
                    },
                    {
                        id: 'g-ag-3',
                        title: 'Add initial negative keywords',
                        description: 'Block clearly irrelevant modifiers (free, jobs, diy, cheap if not relevant, competitor names if excluded). Add at ad group and campaign level as needed.',
                        checklist: [
                            'Create an initial negative keyword list for irrelevant queries.',
                            'Include terms like free, jobs, diy, or cheap when not relevant.',
                            'Add exclusions at ad group level for precision and campaign level for broad filtering.',
                            'Review overlap so valid traffic is not blocked.'
                        ],
                    },
                    {
                        id: 'g-ag-4',
                        title: 'Set audience signals (if available)',
                        description: 'Apply in-market/custom segments as observation mode first. Use insights to refine copy and bid modifiers without over-constraining traffic.',
                        checklist: [
                            'Open audience settings for the ad group.',
                            'Add in-market or custom segments in Observation mode first.',
                            'Use audience insights to improve ad copy and bid adjustments.',
                            'Do not over-restrict delivery at launch.'
                        ],
                    },
                    {
                        id: 'g-ag-5',
                        title: 'Confirm device and geo bid adjustments',
                        description: 'Apply conservative adjustments only if you already have performance evidence; otherwise keep neutral during initial learning.',
                        checklist: [
                            'Review device and location performance data.',
                            'Apply bid adjustments only where clear evidence exists.',
                            'Keep adjustments conservative during early learning.',
                            'Leave neutral settings if data is still limited.'
                        ],
                    },
                ],
            },
            {
                title: 'Step 3: Ads',
                steps: [
                    {
                        id: 'g-a-1',
                        title: 'Create responsive search ads',
                        description: 'Add at least one strong RSA per ad group with varied headlines and descriptions that match the ad group intent and offer.',
                        checklist: [
                            'Create at least one responsive search ad per ad group.',
                            'Add multiple headline variations tied to intent and offer.',
                            'Add multiple description variations with clear value and CTA.',
                            'Check Ad Strength and improve weak assets before launch.'
                        ],
                    },
                    {
                        id: 'g-a-2',
                        title: 'Pin only where message control is critical',
                        description: 'Use pinning sparingly. Over-pinning limits machine learning combinations and can reduce ad strength.',
                        checklist: [
                            'Review whether any headline or description must always show.',
                            'Pin only critical legal, brand, or offer statements.',
                            'Avoid excessive pinning to preserve RSA flexibility.',
                            'Re-check ad strength after pinning.'
                        ],
                    },
                    {
                        id: 'g-a-3',
                        title: 'Align landing URL and message',
                        description: 'Use final URLs that directly match keyword intent. Ensure headline promise and landing page hero section are consistent.',
                        checklist: [
                            'Set final URL to the most relevant landing page for the ad group.',
                            'Match ad headline promise with the landing page hero message.',
                            'Confirm CTA and offer are consistent across ad and page.',
                            'Test URL and page load before publishing.'
                        ],
                    },
                    {
                        id: 'g-a-4',
                        title: 'Set up assets/extensions',
                        description: 'Add sitelinks, callouts, structured snippets, call asset, and image asset where eligible to improve CTR and ad rank.',
                        checklist: [
                            'Add sitelink assets for key destination pages.',
                            'Add callouts and structured snippets for benefits/features.',
                            'Add call asset and image asset where eligible.',
                            'Verify assets are relevant and approved.'
                        ],
                    },
                    {
                        id: 'g-a-5',
                        title: 'Validate ad policy readiness',
                        description: 'Check restricted claims, trademark usage, and destination compliance before launch to avoid disapprovals.',
                        checklist: [
                            'Review ad text for restricted or non-compliant claims.',
                            'Check trademark use and legal requirements.',
                            'Validate destination URL and page compliance.',
                            'Fix flagged risks before publishing.'
                        ],
                    },
                ],
            },
            {
                title: 'Step 4: Conversion tracking reminder',
                steps: [
                    {
                        id: 'g-ct-1',
                        title: 'Verify conversion tracking',
                        description: 'Confirm Google Tag/GTM fires on all required pages and that the selected conversion action records test events in real time.',
                        checklist: [
                            'Open Google Tag Manager or tag configuration.',
                            'Confirm tags fire on required pages and events.',
                            'Run test conversions and verify they appear in Google Ads.',
                            'Check that the campaign uses the correct conversion action.'
                        ],
                    },
                    {
                        id: 'g-ct-2',
                        title: 'Validate primary vs secondary conversions',
                        description: 'Mark only optimization-critical actions as Primary. Keep diagnostic actions (e.g., scroll, engaged visit) as Secondary.',
                        checklist: [
                            'Open conversion actions in Google Ads.',
                            'Mark optimization-critical actions as Primary.',
                            'Mark diagnostic or micro-actions as Secondary.',
                            'Confirm bidding is optimizing for Primary actions only.'
                        ],
                    },
                    {
                        id: 'g-ct-3',
                        title: 'Check attribution and values',
                        description: 'Set attribution model and conversion values correctly (fixed or dynamic). Verify currency and value pass-through for revenue goals.',
                        checklist: [
                            'Review attribution model for each key conversion action.',
                            'Set conversion values correctly (fixed or dynamic).',
                            'Confirm currency configuration is correct.',
                            'Validate value pass-through for revenue and ROAS reporting.'
                        ],
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
                title: 'Step 1: Create campaign',
                steps: [
                    {
                        id: 'm-c-1',
                        title: 'Create campaign',
                        description: 'In Ads Manager click Create, choose objective (Awareness, Traffic, Leads, Sales), then confirm campaign naming and reporting labels.',
                        checklist: [
                            'Open Meta Ads Manager and click Create.',
                            'Choose the campaign objective: Awareness, Traffic, Leads, or Sales.',
                            'Set clear campaign naming and reporting labels.',
                            'Confirm objective and naming before moving to the next step.'
                        ],
                    },
                    {
                        id: 'm-c-2',
                        title: 'Set buying type and campaign settings',
                        description: 'Use Auction buying type for most cases. Check Special Ad Category if applicable before proceeding.',
                        checklist: [
                            'Open campaign settings in Ads Manager.',
                            'Select Auction as the buying type for standard campaigns.',
                            'Check whether Special Ad Category applies to your offer.',
                            'Enable Special Ad Category only when required by policy.'
                        ],
                    },
                    {
                        id: 'm-c-3',
                        title: 'Decide budget structure (CBO vs ABO)',
                        description: 'Use campaign budget optimization (CBO) when testing multiple ad sets, or ad set budgets (ABO) when you need strict spend control.',
                        checklist: [
                            'Decide if budget control should happen at campaign or ad set level.',
                            'Use CBO when testing multiple ad sets and letting Meta optimize distribution.',
                            'Use ABO when you need fixed spend control per ad set.',
                            'Confirm budget structure matches your testing strategy.'
                        ],
                    },
                    {
                        id: 'm-c-4',
                        title: 'Set budget, schedule, and attribution window',
                        description: 'Set daily/lifetime budget per plan. Align start/end dates with your timeline and use attribution settings that match your sales cycle.',
                        checklist: [
                            'Set daily or lifetime budget based on your approved plan.',
                            'Set campaign start and end dates to match your timeline.',
                            'Choose attribution window based on your sales cycle length.',
                            'Verify budget pacing and attribution are aligned before publish.'
                        ],
                    },
                    {
                        id: 'm-c-5',
                        title: 'Choose conversion location and event',
                        description: 'For Leads/Sales choose website, instant forms, calls, or messaging, then select the exact optimization event.',
                        checklist: [
                            'Choose conversion location: website, instant forms, calls, or messaging.',
                            'Select the exact optimization event for this campaign objective.',
                            'Verify the selected event is tracked correctly in Events Manager.',
                            'Confirm campaign optimization is pointing to the intended event.'
                        ],
                    },
                ],
            },
            {
                title: 'Step 2: Ad group (Ad set)',
                steps: [
                    {
                        id: 'm-as-1',
                        title: 'Define audience targeting',
                        description: 'Set geo, age, and language based on your strategy. Use broad + constrained testing intentionally; avoid stacking too many filters at launch.',
                        checklist: [
                            'Set core targeting: location, age, and language from your strategy.',
                            'Choose a testing approach (broad vs constrained) intentionally.',
                            'Avoid stacking too many filters in the first launch.',
                            'Confirm audience definition matches campaign objective.'
                        ],
                    },
                    {
                        id: 'm-as-2',
                        title: 'Configure placements',
                        description: 'Start with Advantage+ placements unless your creative/offer is placement-specific. Use Manual placements only with a clear hypothesis.',
                        checklist: [
                            'Open placement settings in the ad set.',
                            'Start with Advantage+ placements for broad delivery learning.',
                            'Use Manual placements only when you have a clear test hypothesis.',
                            'Verify creative formats are compatible with selected placements.'
                        ],
                    },
                    {
                        id: 'm-as-3',
                        title: 'Set optimization and delivery',
                        description: 'Choose the correct optimization event (Landing Page Views, Leads, Purchases, etc.) and confirm delivery type settings.',
                        checklist: [
                            'Select the optimization event that matches your KPI.',
                            'Confirm delivery settings are appropriate for your objective.',
                            'Validate event selection against tracking configuration.',
                            'Save and review optimization setup before publishing.'
                        ],
                    },
                    {
                        id: 'm-as-4',
                        title: 'Apply exclusions and retargeting windows',
                        description: 'Exclude recent converters and overlapping audiences. Set recency windows (e.g., 7/14/30 days) aligned to funnel stage.',
                        checklist: [
                            'Exclude recent converters from prospecting ad sets.',
                            'Exclude overlapping audiences to reduce internal competition.',
                            'Set retargeting recency windows (for example 7/14/30 days).',
                            'Match each window to the correct funnel stage and intent level.'
                        ],
                    },
                    {
                        id: 'm-as-5',
                        title: 'Quality-check audience size',
                        description: 'Ensure estimated audience is neither too narrow nor too broad for budget. Adjust constraints before publishing.',
                        checklist: [
                            'Review estimated audience size in Ads Manager.',
                            'Check if audience is too narrow for your budget and delivery goals.',
                            'Check if audience is too broad for your targeting intent.',
                            'Adjust constraints before publishing the ad set.'
                        ],
                    },
                ],
            },
            {
                title: 'Step 3: Ads',
                steps: [
                    {
                        id: 'm-a-1',
                        title: 'Set identity and destination',
                        description: 'Connect correct Facebook Page and Instagram account. Confirm URL/instant form destination is correct for this ad set.',
                        checklist: [
                            'Select the correct Facebook Page and Instagram account identity.',
                            'Set the destination (website URL, instant form, call, or message).',
                            'Verify destination links to the right offer page or form.',
                            'Confirm identity and destination are consistent with the ad set intent.'
                        ],
                    },
                    {
                        id: 'm-a-2',
                        title: 'Upload creative assets',
                        description: 'Add feed/story/reel-ready assets and verify safe zones/cropping for each placement preview.',
                        checklist: [
                            'Upload creative assets for feed, story, and reel placements.',
                            'Preview each placement and check crop/safe zones.',
                            'Replace assets that do not fit placement requirements.',
                            'Confirm all placements display cleanly before publish.'
                        ],
                    },
                    {
                        id: 'm-a-3',
                        title: 'Write copy and CTA',
                        description: 'Use clear primary text, headline, and CTA aligned to objective. Ensure message matches landing page and offer.',
                        checklist: [
                            'Write primary text that clearly communicates value and intent.',
                            'Write headline and CTA aligned to campaign objective.',
                            'Ensure message matches the landing page and offer.',
                            'Proofread copy for clarity, consistency, and policy risk.'
                        ],
                    },
                    {
                        id: 'm-a-4',
                        title: 'Add tracking parameters',
                        description: 'Append UTM parameters and naming conventions for campaign/ad set/ad level so analytics and CRM attribution are clean.',
                        checklist: [
                            'Add UTM parameters to all destination URLs.',
                            'Use consistent naming for campaign, ad set, and ad identifiers.',
                            'Verify analytics and CRM can read tracking parameters.',
                            'Test a live preview URL to confirm parameters pass correctly.'
                        ],
                    },
                    {
                        id: 'm-a-5',
                        title: 'Run policy and preview checks',
                        description: 'Review policy risks (claims, restricted content), check all placement previews, and fix text/image issues before publish.',
                        checklist: [
                            'Open the ad-level preview and policy review area in Ads Manager.',
                            'Review ad copy and creative for policy-sensitive claims and restricted content.',
                            'Check every placement preview (feed, story, reel, and other selected placements).',
                            'Fix text truncation, crop/safe-zone issues, broken links, or low-quality assets.',
                            'Re-run previews and policy checks after edits.',
                            'Publish only when previews are clean and no policy risks remain.'
                        ],
                    },
                ],
            },
            {
                title: 'Step 4: Conversion tracking reminder',
                steps: [
                    {
                        id: 'm-ct-1',
                        title: 'Verify conversion tracking',
                        description: 'Confirm Pixel and/or Conversions API are active and receiving events with event match quality in Events Manager.',
                        checklist: [
                            'Open Events Manager and check Pixel/CAPI status.',
                            'Confirm required events are being received in real time.',
                            'Review event match quality and resolve low-quality signals.',
                            'Verify the campaign is optimizing toward a tracked event.'
                        ],
                    },
                    {
                        id: 'm-ct-2',
                        title: 'Validate prioritized events',
                        description: 'Ensure Aggregated Event Measurement priority order matches your objective and that the optimized event is correctly ranked.',
                        checklist: [
                            'Open Aggregated Event Measurement configuration.',
                            'Check priority order of events for your domain.',
                            'Ensure the optimized event is prioritized correctly.',
                            'Save and recheck that campaign optimization matches event ranking.'
                        ],
                    },
                    {
                        id: 'm-ct-3',
                        title: 'Run test conversions',
                        description: 'Use Meta Test Events to confirm lead/purchase events fire with expected parameters and values before scaling spend.',
                        checklist: [
                            'Open Test Events in Events Manager.',
                            'Run test lead or purchase actions end-to-end.',
                            'Verify event parameters and values are captured correctly.',
                            'Confirm successful test events before scaling budget.'
                        ],
                    },
                ],
            },
        ],
    },
];
