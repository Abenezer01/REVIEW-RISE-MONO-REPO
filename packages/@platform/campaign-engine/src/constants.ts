import { CampaignObjective } from './schema/campaign-plan';

// --- Budget Constants ---
export const BUDGET_THRESHOLDS = {
    SMALL: 1000,
    MEDIUM: 5000
};

export const BUDGET_TIERS = {
    SMALL: {
        tier: 'Small' as const,
        recommendation: 'Strict consolidation. 1 campaign per channel max.',
        campaignLimit: 2
    },
    MEDIUM: {
        tier: 'Medium' as const,
        recommendation: 'Segment by Service Category or simple Funnel.',
        campaignLimit: 5
    },
    LARGE: {
        tier: 'Large' as const,
        recommendation: 'Full segmentation: Geo, Match Type, Funnel Layers.',
        campaignLimit: 15
    }
};

// --- Channel Selection Constants ---
// Define a type for the rules structure if not exporting the interface from selector
// But better to keep the interface in the selector or schema if it's reused. 
// For now, we'll just export the data.

export const OBJECTIVE_CHANNEL_RULES: Record<CampaignObjective, { channels: Record<string, number>, rationale: string }> = {
    'Leads': {
        channels: {
            'Google Search': 0.7,
            'Meta (Facebook/Instagram)': 0.3
        },
        rationale: 'High intent searches prioritize Google Search. Meta provides support for retargeting.'
    },
    'Awareness': {
        channels: {
            'Meta (Facebook/Instagram)': 0.6,
            'TikTok': 0.2,
            'Google Search': 0.2
        },
        rationale: 'Visual platforms needed for reach. Search used for brand capture.'
    },
    'Sales': {
        channels: {
            'Meta (Facebook/Instagram)': 0.5,
            'Google Search': 0.3,
            'TikTok': 0.2
        },
        rationale: 'Multi-channel approach for e-commerce/sales. Meta for demand gen, Search for capture.'
    },
    'Local Visits': {
        channels: {
            'Google Search': 0.5,
            'Meta (Facebook/Instagram)': 0.5
        },
        rationale: 'Balanced approach. Search for intent, Meta for local awareness.'
    }
};

// --- Funnel Generation Constants ---
export const FUNNEL_DEFAULTS = {
    AWARENESS: {
        MESSAGE: 'Brand Story & Problem Awareness',
        CTA: 'Learn More',
        INTENT: 'Broad interest, Problem unaware/aware',
        LANDING: 'Blog, Video, or Home Page'
    },
    CONSIDERATION: {
        MESSAGE: 'USPs & Social Proof',
        CTA: 'View Services',
        INTENT: 'Solution aware, Comparing options',
        LANDING: 'Category Page, Feature Page, or Case Studies'
    },
    CONVERSION: {
        MESSAGE: 'Offer & Urgency',
        CTA: 'Contact Us',
        INTENT: 'High Intent, Ready to buy',
        LANDING: 'Product Page, Booking Form, or Signup Page'
    }
};

export const FUNNEL_OVERRIDES = {
    ECOMMERCE: {
        AWARENESS: { MESSAGE: 'Lifestyle & Visual Appeal', CTA: 'Shop the Collection' },
        CONSIDERATION: { MESSAGE: 'Best Sellers & Reviews', CTA: 'View Product' },
        CONVERSION: { MESSAGE: 'Discount or Limited Stock', CTA: 'Buy Now' }
    },
    SAAS: {
        AWARENESS: { MESSAGE: 'Industry Pain Points & Innovation' },
        CONSIDERATION: { MESSAGE: 'Features vs Competitors', CTA: 'See Features' },
        CONVERSION: { MESSAGE: 'Risk Reversal (No CC required)', CTA: 'Start Free Trial' }
    },
    RESTAURANT: {
        // Add if needed based on original logic implies mainly conversion overrides, keeping minimal for now to match current logic
    },
    HEALTHCARE: {
        CONVERSION: { MESSAGE: 'Availability & Expert Care', CTA: 'Book Appointment' }
    }
};
