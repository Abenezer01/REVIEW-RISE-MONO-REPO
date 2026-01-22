export interface SocialConnection {
    id: string;
    platform: 'facebook' | 'instagram' | 'linkedin' | string;
    pageName: string;
    pageId: string;
    status: string;
    lastSyncAt?: string;
    createdAt?: string;
    errorMessage?: string;
    followers?: number;
    postsCount?: number;
    accessToken?: string;
    refreshToken?: string;
}

export interface FacebookPage {
    id: string;
    name: string;
    access_token: string;
    category: string;
    tasks: string[];
}

export interface InstagramAccount {
    id: string;
    name: string;
    username: string;
    profile_picture_url?: string;
}

export interface LinkedInOrg {
    id: string;
    localizedName: string;
    vanityName: string;
    logoUrl?: string;
}

export interface SocialConnectionListProps {
    businessId: string;
    locationId: string;
}
