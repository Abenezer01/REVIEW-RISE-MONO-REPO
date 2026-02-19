import { CampaignInput } from '../schema/campaign-plan';

export interface AdExtensions {
    sitelinks: Sitelink[];
    callouts: string[];
    structuredSnippets: StructuredSnippet[];
}

export interface Sitelink {
    text: string;
    description1?: string;
    description2?: string;
    finalUrl?: string; // Optional as we often don't have URLs yet
}

export interface StructuredSnippet {
    header: string;
    values: string[];
}

export class ExtensionsGenerator {

    public generateExtensions(input: CampaignInput): AdExtensions {
        return {
            sitelinks: this.generateSitelinks(input),
            callouts: this.generateCallouts(input),
            structuredSnippets: this.generateSnippets(input)
        };
    }

    private generateSitelinks(input: CampaignInput): Sitelink[] {
        const links: Sitelink[] = [];

        // Services
        if (input.services.length > 0) {
            links.push({
                text: 'Our Services',
                description1: `Explore our range of ${input.vertical} solutions.`,
                description2: 'Professional and reliable.'
            });
        }

        // Contact
        links.push({
            text: 'Contact Us',
            description1: 'Get in touch for a free consultation.',
            description2: 'We are here to help.'
        });

        // About
        links.push({
            text: 'About Us',
            description1: `Trusted local ${input.vertical} experts.`,
            description2: 'Serving the community for years.'
        });

        // Pricing (Generic if not e-commerce)
        if (input.vertical !== 'E-commerce') {
            links.push({
                text: 'Pricing',
                description1: 'Transparent and competitive rates.',
                description2: 'Get a quote today.'
            });
        }

        return links;
    }

    private generateCallouts(input: CampaignInput): string[] {
        const callouts = [
            '24/7 Service',
            'Certified Team',
            'Fast Response',
            'Free Consultation',
            'Licensed & Insured',
            'Top Rated',
            'Satisfaction Guaranteed'
        ];

        if (input.vertical === 'Local Service') {
            callouts.push('Locally Owned', 'Emergency Service');
        }

        return callouts;
    }

    private generateSnippets(input: CampaignInput): StructuredSnippet[] {
        const snippets: StructuredSnippet[] = [];

        if (input.services.length > 0) {
            snippets.push({
                header: 'Service Catalog', // Or "Services" depending on Google's allowed headers
                values: input.services.slice(0, 10)
            });
        }

        // Vertical specific
        if (input.vertical === 'E-commerce') {
            snippets.push({
                header: 'Brands',
                values: ['Top Brands', 'Premium Quality', 'Best Sellers']
            });
        }

        return snippets;
    }
}

export const extensionsGenerator = new ExtensionsGenerator();
