import type { MetaBlueprintInput } from '@platform/contracts';

export interface MetaQuickTemplate {
    id: string;
    name: string;
    icon: string;
    data: Partial<MetaBlueprintInput>;
}

export const META_QUICK_TEMPLATES: MetaQuickTemplate[] = [
    {
        id: 'plumbing',
        name: 'Plumbing Service',
        icon: '🔧',
        data: {
            businessName: 'Austin Plumbing Pros',
            offerOrService: 'Emergency Plumbing & Water Heater Repair',
            vertical: 'Local Service',
            geoTargeting: {
                center: 'Austin, TX',
                radius: 25,
                unit: 'miles'
            },
            painPoints: ['Emergency repairs', 'High costs', 'Unreliable service'],
            landingPageUrl: 'https://example.com'
        }
    },
    {
        id: 'law',
        name: 'Law Firm',
        icon: '⚖️',
        data: {
            businessName: 'Smith & Associates Law',
            offerOrService: 'Personal Injury & Family Law',
            vertical: 'Other',
            geoTargeting: {
                center: 'Dallas, TX',
                radius: 30,
                unit: 'miles'
            },
            painPoints: ['Legal complexity', 'High attorney fees', 'Case uncertainty'],
            landingPageUrl: 'https://example.com'
        }
    },
    {
        id: 'dentist',
        name: 'Dental Practice',
        icon: '🦷',
        data: {
            businessName: 'Bright Smile Dental',
            offerOrService: 'Teeth Cleaning & Cosmetic Dentistry',
            vertical: 'Healthcare',
            geoTargeting: {
                center: 'Houston, TX',
                radius: 20,
                unit: 'miles'
            },
            painPoints: ['Dental anxiety', 'Cost concerns', 'Finding quality care'],
            landingPageUrl: 'https://example.com'
        }
    },
    {
        id: 'restaurant',
        name: 'Restaurant',
        icon: '🍽️',
        data: {
            businessName: 'The Italian Kitchen',
            offerOrService: 'Authentic Italian Cuisine & Catering',
            vertical: 'Other',
            geoTargeting: {
                center: 'San Antonio, TX',
                radius: 15,
                unit: 'miles'
            },
            painPoints: ['Finding authentic cuisine', 'Long wait times', 'Limited parking'],
            landingPageUrl: 'https://example.com'
        }
    },
    {
        id: 'saas',
        name: 'SaaS Product',
        icon: '💻',
        data: {
            businessName: 'CloudFlow CRM',
            offerOrService: 'CRM Software & Sales Automation',
            vertical: 'SaaS',
            geoTargeting: {
                center: 'United States',
                radius: 50,
                unit: 'miles'
            },
            painPoints: ['Manual processes', 'Data silos', 'Poor customer insights'],
            landingPageUrl: 'https://example.com'
        }
    },
    {
        id: 'ecommerce',
        name: 'E-commerce Store',
        icon: '🛒',
        data: {
            businessName: 'Outdoor Gear Co',
            offerOrService: 'Premium Camping & Hiking Equipment',
            vertical: 'E-commerce',
            geoTargeting: {
                center: 'United States',
                radius: 50,
                unit: 'miles'
            },
            painPoints: ['Finding quality gear', 'High prices', 'Shipping costs'],
            landingPageUrl: 'https://example.com'
        }
    },
    {
        id: 'roofing',
        name: 'Roofing Service',
        icon: '🏠',
        data: {
            businessName: 'Premier Roofing Solutions',
            offerOrService: 'Roof Repair & Replacement',
            vertical: 'Local Service',
            geoTargeting: {
                center: 'Phoenix, AZ',
                radius: 25,
                unit: 'miles'
            },
            painPoints: ['Leaking roofs', 'Storm damage', 'High replacement costs'],
            landingPageUrl: 'https://example.com'
        }
    }
];
