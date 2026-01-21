
export const SERVICES = {
    auth: {
        url: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3010/api/v1/auth'
    },
    reviews: {
        url: process.env.NEXT_PUBLIC_REVIEWS_API_URL || 'http://localhost:3006/api/v1/reviews'
    },
    social: {
        url: process.env.NEXT_PUBLIC_SOCIAL_API_URL || 'http://localhost:3003'
    },
    ai: {
        url: process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:3002/api/v1/ai'
    },
    seo: {
        url: process.env.NEXT_PUBLIC_SEO_HEALTH_API_URL || 'http://localhost:3011/api/v1'
    },
    brand: {
        url: process.env.NEXT_PUBLIC_BRAND_API_URL || 'http://localhost:3007/api/v1/brand'
    }
}
