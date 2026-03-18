import axios from 'axios';
import { locationRepository, prisma } from '@platform/db';

type GeneratorType =
    | 'business_description'
    | 'service_descriptions'
    | 'category_recommendations'
    | 'post_generator'
    | 'qa_suggestions';

type ContentType = 'description' | 'category' | 'service' | 'post' | 'qa' | 'other';

type ComplianceMeta = {
    maxRecommended?: number;
    withinLimit: boolean;
    noSpam: boolean;
    formattingOk: boolean;
};

const AI_SERVICE_URL = process.env.EXPRESS_AI_URL || 'http://localhost:3002/api/v1';

const getText = (item: any): string => {
    if (typeof item?.text === 'string') return item.text;
    if (typeof item?.blurb === 'string') return item.blurb;
    if (typeof item?.reason === 'string') return item.reason;
    if (typeof item?.answer === 'string') return item.answer;
    return '';
};

const checkSpam = (text: string) => !/(best ever|guaranteed|100%|click now|!!!|free money|#\w{5,})/i.test(text);
const checkFormatting = (text: string) => text.trim().length > 0 && text.length < 2000;

const withCompliance = (type: GeneratorType, item: any) => {
    const text = getText(item);
    const charCount = text.length;

    const maxRecommended =
        type === 'business_description'
            ? 750
            : type === 'service_descriptions'
              ? 240
              : type === 'post_generator'
                ? 1400
                : type === 'qa_suggestions'
                  ? 300
                  : 500;

    const compliance: ComplianceMeta = {
        maxRecommended,
        withinLimit: charCount <= maxRecommended,
        noSpam: checkSpam(text),
        formattingOk: checkFormatting(text)
    };

    return {
        ...item,
        id: item?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        charCount,
        compliance
    };
};

const toContentType = (type: GeneratorType): ContentType => {
    if (type === 'business_description') return 'description';
    if (type === 'category_recommendations') return 'category';
    if (type === 'service_descriptions') return 'service';
    if (type === 'post_generator') return 'post';
    if (type === 'qa_suggestions') return 'qa';
    return 'other';
};

const fallbackItems = (type: GeneratorType, input: any) => {
    const businessName = input?.businessName || 'Your business';
    const category = input?.category || 'local services';

    if (type === 'business_description') {
        return [
            { title: 'Variation 1', text: `${businessName} helps customers with reliable ${category}. We focus on clear communication, consistent quality, and practical results.` },
            { title: 'Variation 2', text: `Looking for trusted ${category}? ${businessName} serves local customers with fast support, transparent service, and a friendly experience.` },
            { title: 'Variation 3', text: `${businessName} delivers dependable ${category} for local customers. We aim to make every visit simple, efficient, and valuable.` }
        ];
    }

    if (type === 'service_descriptions') {
        return [
            { serviceName: 'Primary Service', blurb: `Core ${category} service tailored to local customer needs.` },
            { serviceName: 'Consultation', blurb: 'Short consultation to understand goals and recommend next steps.' }
        ];
    }

    if (type === 'category_recommendations') {
        return [
            { category: category, reason: 'Matches your main service intent and local search demand.' },
            { category: 'Customer Service', reason: 'Highlights support-focused experience and trust.' }
        ];
    }

    if (type === 'post_generator') {
        return [
            { postType: 'update', text: `${businessName} is available this week for ${category}. Contact us to book your preferred time.`, cta: 'Call now' },
            { postType: 'offer', text: `This week at ${businessName}: limited-time support for ${category}. Reach out today to claim your slot.`, cta: 'Learn more' }
        ];
    }

    return [
        { question: `What does ${businessName} offer?`, answer: `${businessName} provides ${category} with a clear process and local support.` },
        { question: 'Do I need an appointment?', answer: 'Appointments are recommended to reduce waiting time.' }
    ];
};

export class GbpAiContentService {
    async generate(locationId: string, type: GeneratorType, input: any) {
        const location = await locationRepository.findWithBusiness(locationId);
        if (!location) {
            throw new Error('Location not found');
        }

        const mergedInput = {
            businessName: location.business?.name || input?.businessName || '',
            category: input?.category || '',
            location: location.name || '',
            services: input?.services || [],
            tone: input?.tone || 'Professional and friendly',
            objective: input?.objective || 'Increase local discovery',
            offer: input?.offer || '',
            postType: input?.postType || 'update',
            ...input
        };

        let items: any[] = [];
        try {
            const response = await axios.post(`${AI_SERVICE_URL}/generate-gbp-content`, {
                type,
                input: mergedInput
            });
            items = Array.isArray(response.data?.data?.items) ? response.data.data.items : [];
        } catch {
            items = fallbackItems(type, mergedInput);
        }

        if (items.length === 0) {
            items = fallbackItems(type, mergedInput);
        }

        return {
            type,
            items: items.map((item) => withCompliance(type, item))
        };
    }

    async saveSuggestion(locationId: string, payload: { type: GeneratorType; item: any; auditSnapshotId?: string; auditFindingCodes?: string[] }) {
        const location = await locationRepository.findWithBusiness(locationId);
        if (!location) {
            throw new Error('Location not found');
        }

        const title =
            payload.item?.title ||
            payload.item?.serviceName ||
            payload.item?.category ||
            payload.item?.question ||
            `GBP ${payload.type.replace(/_/g, ' ')}`;

        const body = payload.item?.text || payload.item?.blurb || payload.item?.answer || payload.item?.reason || '';
        const detailJson = JSON.stringify(payload.item);

        const suggestion = await prisma.brandRecommendation.create({
            data: {
                businessId: location.businessId,
                locationId,
                category: 'gbp_ai_content',
                source: 'ai_content',
                lifecycleState: 'SAVED',
                auditSnapshotId: payload.auditSnapshotId || null,
                auditFindingCodes: payload.auditFindingCodes || [],
                title,
                description: body || detailJson,
                why: ['AI-generated GBP suggestion', `Type: ${payload.type}`],
                steps: ['Review suggestion', 'Copy to GBP field or post', 'Publish on GBP'],
                impact: 'medium',
                effort: 'low',
                confidence: 0.75,
                priorityScore: 70,
                notes: detailJson,
                kpiTarget: {
                    contentType: toContentType(payload.type),
                    generatorType: payload.type
                },
                status: 'open'
            }
        });

        try {
            await prisma.gbpSuggestionActivity.create({
                data: {
                    recommendationId: suggestion.id,
                    businessId: location.businessId,
                    locationId,
                    action: 'created',
                    details: {
                        source: 'ai_content',
                        type: payload.type,
                        auditSnapshotId: payload.auditSnapshotId || null,
                        auditFindingCodes: payload.auditFindingCodes || []
                    }
                }
            });
        } catch {
            // Keep suggestion save resilient when activity table is not migrated yet.
        }

        return {
            id: suggestion.id,
            title: suggestion.title
        };
    }
}

export const gbpAiContentService = new GbpAiContentService();
