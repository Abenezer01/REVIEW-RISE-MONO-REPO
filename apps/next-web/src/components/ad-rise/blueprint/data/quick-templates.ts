import type { BlueprintInput } from '@platform/contracts';

export interface QuickTemplate {
    id: string;
    name: string;
    icon: string;
    data: Partial<BlueprintInput>;
}

export const QUICK_TEMPLATES: QuickTemplate[] = [
    {
        id: 'plumbing',
        name: 'Plumbing Service',
        icon: '🔧',
        data: {
            businessName: 'Austin Plumbing Pros',
            services: ['Emergency Plumbing', 'Water Heater Repair', 'Drain Cleaning', 'Pipe Repair'],
            offer: '10% Off First Service',
            budget: 3000,
            objective: 'Leads',
            vertical: 'Local Service',
            geo: 'Austin, TX',
            painPoints: ['Emergency repairs', 'High costs', 'Unreliable service'],
            conversionTrackingEnabled: true
        }
    },
    {
        id: 'law',
        name: 'Law Firm',
        icon: '⚖️',
        data: {
            businessName: 'Smith & Associates Law',
            services: ['Personal Injury', 'Family Law', 'Estate Planning', 'Business Law'],
            offer: 'Free Consultation',
            budget: 5000,
            objective: 'Leads',
            vertical: 'Legal',
            geo: 'Dallas, TX',
            painPoints: ['Legal complexity', 'High attorney fees', 'Case uncertainty'],
            conversionTrackingEnabled: true
        }
    },
    {
        id: 'dentist',
        name: 'Dental Practice',
        icon: '🦷',
        data: {
            businessName: 'Bright Smile Dental',
            services: ['Teeth Cleaning', 'Cosmetic Dentistry', 'Dental Implants', 'Emergency Care'],
            offer: 'New Patient Special - $99 Exam & Cleaning',
            budget: 4000,
            objective: 'Local Visits',
            vertical: 'Healthcare',
            geo: 'Houston, TX',
            painPoints: ['Dental anxiety', 'Cost concerns', 'Finding quality care'],
            conversionTrackingEnabled: true
        }
    },
    {
        id: 'restaurant',
        name: 'Restaurant',
        icon: '🍽️',
        data: {
            businessName: 'The Italian Kitchen',
            services: ['Dine-In', 'Takeout', 'Catering', 'Private Events'],
            offer: '15% Off First Online Order',
            budget: 2500,
            objective: 'Local Visits',
            vertical: 'Restaurant',
            geo: 'San Antonio, TX',
            painPoints: ['Finding authentic cuisine', 'Long wait times', 'Limited parking'],
            conversionTrackingEnabled: false
        }
    },
    {
        id: 'saas',
        name: 'SaaS Product',
        icon: '💻',
        data: {
            businessName: 'CloudFlow CRM',
            services: ['CRM Software', 'Sales Automation', 'Analytics Dashboard', 'API Integration'],
            offer: '14-Day Free Trial',
            budget: 8000,
            objective: 'Sales',
            vertical: 'SaaS',
            geo: 'United States',
            painPoints: ['Manual processes', 'Data silos', 'Poor customer insights'],
            conversionTrackingEnabled: true
        }
    },
    {
        id: 'ecommerce',
        name: 'E-commerce Store',
        icon: '🛒',
        data: {
            businessName: 'Outdoor Gear Co',
            services: ['Camping Equipment', 'Hiking Gear', 'Outdoor Apparel', 'Adventure Accessories'],
            offer: 'Free Shipping on Orders Over $50',
            budget: 6000,
            objective: 'Sales',
            vertical: 'E-commerce',
            geo: 'United States',
            painPoints: ['Finding quality gear', 'High prices', 'Shipping costs'],
            conversionTrackingEnabled: true
        }
    },
    {
        id: 'realestate',
        name: 'Real Estate',
        icon: '🏠',
        data: {
            businessName: 'Premier Realty Group',
            services: ['Home Buying', 'Home Selling', 'Property Management', 'Investment Properties'],
            offer: 'Free Home Valuation',
            budget: 4500,
            objective: 'Leads',
            vertical: 'Real Estate',
            geo: 'Phoenix, AZ',
            painPoints: ['Market uncertainty', 'Finding the right property', 'Complex paperwork'],
            conversionTrackingEnabled: true
        }
    }
];
