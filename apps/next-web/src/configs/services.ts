// Helper to determine if we're in production based on the current URL
const isProduction = () => {
    if (typeof window === 'undefined') {
        // Server-side: check NODE_ENV
        return process.env.NODE_ENV === 'production';
    }

    // Client-side: check the hostname
    return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
};

// Helper to get the base URL for client-side requests
const getClientBaseUrl = () => {
    if (typeof window === 'undefined') return '';

    return `${window.location.protocol}//${window.location.host}`;
};

export const SERVICES_CONFIG = {
    auth: {
        get url() {
            if (typeof window === 'undefined') {
                // Server-side
                return process.env.AUTH_SERVICE_URL || 'http://localhost:3010/api';
            }

            // Client-side: auth is always server-side, shouldn't be called from client
            return '/api/auth';
        },
    },
    brand: {
        get url() {
            if (typeof window === 'undefined') {
                // Server-side
                return process.env.EXPRESS_BRAND_URL || 'http://localhost:3007/api/v1';
            }

            // Client-side: use proxy through Next.js API routes
            return '/api/brands';
        },
    },
    seo: {
        get url() {
            if (typeof window === 'undefined') {
                // Server-side
                return process.env.NEXT_PUBLIC_SEO_HEALTH_API_URL || 'http://localhost:3011/api/v1';
            }

            // Client-side
            if (isProduction()) {
                return `${getClientBaseUrl()}/api/seo`;
            }

            return 'http://localhost:3011/api/v1';
        },
    },
    review: {
        get url() {
            if (typeof window === 'undefined') {
                // Server-side
                return process.env.EXPRESS_REVIEWS_URL || 'http://localhost:3006/api/v1';
            }

            // Client-side
            if (isProduction()) {
                // Return /api so hooks can append /reviews/analytics/* → /api/reviews/analytics/*
                return `${getClientBaseUrl()}/api`;
            }

            return 'http://localhost:3006/api/v1';
        },
    },
    ai: {
        get url() {
            if (typeof window === 'undefined') {
                // Server-side
                return process.env.EXPRESS_AI_URL || 'http://localhost:3002';
            }

            // Client-side: AI is server-side only
            return '/api/ai';
        },
    },
    social: {
        get url() {
            if (typeof window === 'undefined') {
                return process.env.EXPRESS_SOCIAL_URL || 'http://localhost:3003';
            }
            if (isProduction()) {
                return `${getClientBaseUrl()}/api/social`;
            }
            // Use proxy in dev as well to handle HttpOnly cookies
            return '/api/social';
        }
    },
    admin: {
        get url() {
            if (typeof window === 'undefined') {
                return process.env.EXPRESS_ADMIN_URL || 'http://localhost:3012';
            }
            if (isProduction()) {
                return `${getClientBaseUrl()}/api/admin`;
            }
            return 'http://localhost:3012';
        }
    }
};

export const SERVICES = SERVICES_CONFIG;
