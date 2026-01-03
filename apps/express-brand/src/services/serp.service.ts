import axios from 'axios';

export interface SerpResult {
    keyword: string;
    organic: Array<{
        domain: string;
        url: string;
        title: string;
        snippet: string;
        rank: number;
    }>;
}

export interface SerpProvider {
    fetchResults(keyword: string, location?: string): Promise<SerpResult>;
}

// Mock Provider for Development/Testing
class MockSerpProvider implements SerpProvider {
    async fetchResults(keyword: string, location?: string): Promise<SerpResult> {
        // Return realistic mock data
        return {
            keyword,
            organic: [
                {
                    domain: 'stripe.com',
                    url: 'https://stripe.com',
                    title: 'Stripe | Financial Infrastructure Platform for the Internet',
                    snippet: 'Stripe is a suite of APIs powering online payment processing...',
                    rank: 1
                },
                {
                    domain: 'vercel.com',
                    url: 'https://vercel.com',
                    title: 'Vercel: Develop. Preview. Ship.',
                    snippet: 'Vercel is the platform for frontend developers...',
                    rank: 2
                },
                {
                    domain: 'airbnb.com',
                    url: 'https://www.airbnb.com',
                    title: 'Airbnb | Vacation Rentals, Cabins, Beach Houses, & More',
                    snippet: 'Find vacation rentals, cabins, beach houses, unique homes...',
                    rank: 3
                },
                {
                    domain: 'github.com',
                    url: 'https://github.com',
                    title: 'GitHub: Let\'s build from here',
                    snippet: 'GitHub is where over 100 million developers shape the future of software...',
                    rank: 4
                },
                {
                    domain: 'linear.app',
                    url: 'https://linear.app',
                    title: 'Linear',
                    snippet: 'Linear is a better way to build products...',
                    rank: 5
                }
            ]
        };
    }
}

// DataForSEO Provider (Skeleton)
class DataForSeoProvider implements SerpProvider {
    async fetchResults(keyword: string, location?: string): Promise<SerpResult> {
        // TODO: Implement actual API call
        // const response = await axios.post(...)
        throw new Error('DataForSEO provider not yet configured');
    }
}

// Factory to get the configured provider
export const getSerpProvider = (): SerpProvider => {
    const provider = process.env.SERP_API_PROVIDER || 'mock';
    
    switch (provider) {
        case 'dataforseo':
            return new DataForSeoProvider();
        case 'mock':
        default:
            return new MockSerpProvider();
    }
};

export const fetchSerpResults = async (keyword: string, location?: string): Promise<SerpResult> => {
    const provider = getSerpProvider();
    return provider.fetchResults(keyword, location);
};

export const extractDomainsFromSerp = (result: SerpResult): string[] => {
    return result.organic.map(item => item.domain);
};
