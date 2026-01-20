// Helper to get environment variable at runtime (works in both server and client)
const getEnv = (key: string) => {
    if (typeof window === 'undefined') {
        // Server-side
        return process.env[key];
    }


    // Client-side - only NEXT_PUBLIC_ vars are available
    return (process.env as any)[key];
};

export const SERVICES_CONFIG = {
    auth: {
        get url() {
            return getEnv('AUTH_SERVICE_URL') || 'http://localhost:3010/api';
        },
    },
    brand: {
        get url() {
            return getEnv('EXPRESS_BRAND_URL') || 'http://localhost:3007/api/v1';
        },
    },
    seo: {
        get url() {
            return getEnv('NEXT_PUBLIC_SEO_HEALTH_API_URL') || 'http://localhost:3011/api/v1';
        },
    },
    review: {
        get url() {
            return getEnv('NEXT_PUBLIC_REVIEWS_API_URL') || getEnv('EXPRESS_REVIEWS_URL') || 'http://localhost:3006/api/v1';
        },
    },
    ai: {
        get url() {
            return getEnv('EXPRESS_AI_URL') || 'http://localhost:3002';
        },
    },
};
