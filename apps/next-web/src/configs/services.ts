export const SERVICES_CONFIG = {
    auth: {
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:3010/api',
    },
    brand: {
        url: process.env.EXPRESS_BRAND_URL || 'http://localhost:3007/api/v1',
    },
    seo: {
        url: process.env.NEXT_PUBLIC_SEO_HEALTH_API_URL || 'http://localhost:3011/api/v1',
    },
    review: {
        url: process.env.NEXT_PUBLIC_REVIEWS_API_URL || process.env.EXPRESS_REVIEWS_URL || 'http://localhost:3006/api/v1',
    },
    ai: {
        url: process.env.EXPRESS_AI_URL || 'http://localhost:3002',
    },
};
