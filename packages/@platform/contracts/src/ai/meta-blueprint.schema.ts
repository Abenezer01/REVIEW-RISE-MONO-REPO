export interface MetaBlueprintInput {
    businessName?: string;
    offerOrService: string;
    vertical: 'Local Service' | 'E-commerce' | 'SaaS' | 'Healthcare' | 'Other';
    geoTargeting: {
        center: string; // "San Francisco, CA" or zip
        radius: number; // in miles
        unit: 'miles' | 'km';
    };
    painPoints: string[];
    landingPageUrl?: string;
}

export interface MetaInterestCluster {
    name: string; // Display name for the cluster
    theme: string;
    interests: string[];
    exclusions: string[];
    type: 'Primary' | 'Secondary';
}

export interface MetaAudienceSet {
    type: 'Prospecting' | 'Retargeting';
    name: string;
    demographics: {
        ageRange: string;
        gender: 'All' | 'Men' | 'Women';
        parents?: boolean;
        homeowners?: boolean;
        languages?: string[]; // Added for UI
    };
    geoLocations: string[]; // Changed from 'geo' string to array
    interests?: string[]; // Simplified to string array for prospecting
    customAudiences?: string[]; // For retargeting
    lookalikeSources?: string[]; // Added for UI
    estimatedReach: string;
}

export interface MetaCopyVariation {
    id: string;
    primaryText: string; // ~125 chars
    headline: string; // ~40 chars
    description: string; // ~25 chars
    ctas: string[];
    tone: string;
}

export interface PlacementRecommendation {
    platform: 'Facebook' | 'Instagram' | 'Audience Network' | 'Messenger';
    format: 'Feed' | 'Stories' | 'Reels' | 'Right Column';
    objective: 'Awareness' | 'Traffic' | 'Conversion';
    rationale: string;
    recommended: boolean;
}

export interface MetaBlueprintOutput {
    audiences: MetaAudienceSet[];
    interestClusters: MetaInterestCluster[];
    copyVariations: MetaCopyVariation[];
    placements: PlacementRecommendation[];
}
