import { prisma } from '@platform/db';
import { categoryEvaluator } from './audit-engine/category-evaluator';
import { competitorEvaluator } from './audit-engine/competitor-evaluator';
import { keywordEvaluator } from './audit-engine/keyword-evaluator';
import { photoEvaluator } from './audit-engine/photo-evaluator';
import { reviewEvaluator } from './audit-engine/review-evaluator';
import {
    AuditBreakdown,
    AuditIssue,
    AuditResult,
    GroupedIssues
} from './audit-engine/types';
import { gbpCompetitorsService } from './gbp-competitors.service';
import { NormalizedGbpProfile, normalizeGbpProfile } from './gbp-types';

// 1. Scoring Rubric (Configurable Weights) — must sum to 100
const SCORING_WEIGHTS = {
    completeness: 20,
    description: 15,
    media: 8,
    freshness: 9,
    categories: 8,
    photoQuality: 8,
    keywordOptimization: 8,
    reputation: 12,
    competitorBenchmark: 12
};

const DEFAULT_TARGET_KEYWORDS = ["SEO", "Marketing", "Consultant", "Agency", "Google Ads"];

export class AuditService {
    async getAudit(snapshotId: string): Promise<AuditResult | null> {
        const audit = await prisma.gbpProfileAudit.findUnique({
            where: { snapshotId }
        });

        if (audit && audit.details) {
            return audit.details as unknown as AuditResult;
        }
        return null;
    }

    async runAudit(snapshotId: string, targetKeywords: string[] = DEFAULT_TARGET_KEYWORDS): Promise<AuditResult> {
        // Check if audit already exists - forcing recompute for V2 dev
        // In production, remove this check or add a 'force' flag
        /*
        const existingAudit = await prisma.gbpProfileAudit.findUnique({
            where: { snapshotId }
        });
        if (existingAudit && existingAudit.details) { ... }
        */

        const snapshot = await prisma.gbpProfileSnapshot.findUnique({
            where: { id: snapshotId }
        });

        if (!snapshot) {
            throw new Error(`Snapshot ${snapshotId} not found`);
        }

        const rawProfile = snapshot.snapshot;

        if (!rawProfile || typeof rawProfile !== 'object') {
            throw new Error('Invalid snapshot data');
        }

        let previousScore: number | undefined;
        try {
            const previousSnapshot = await prisma.gbpProfileSnapshot.findFirst({
                where: {
                    locationId: snapshot.locationId,
                    capturedAt: { lt: snapshot.capturedAt }
                },
                orderBy: { capturedAt: 'desc' }
            });

            if (previousSnapshot) {
                const previousAudit = await prisma.gbpProfileAudit.findUnique({
                    where: { snapshotId: previousSnapshot.id }
                });
                if (previousAudit) {
                    previousScore = previousAudit.score;
                }
            }
        } catch (e) {
            console.warn('Failed to fetch previous score', e);
        }

        let normalizedProfile: NormalizedGbpProfile;

        // Check if snapshot is already normalized (new format) or raw (legacy)
        if ((rawProfile as any).source === 'google_business_profile') {
            normalizedProfile = rawProfile as unknown as NormalizedGbpProfile;
        } else {
            normalizedProfile = normalizeGbpProfile(rawProfile);
        }

        // 2. Completeness Scoring & 3. Missing Fields
        const { completenessScore, completenessIssues } = this.calculateCompleteness(normalizedProfile);

        // 4. Description Analysis
        const { descriptionScore, descriptionIssues } = this.analyzeDescription(normalizedProfile);

        // 5. V2 Modules
        const { score: categoriesScore, issues: categoriesIssues, intelligence: categoryIntelligence } = categoryEvaluator.evaluate(normalizedProfile, rawProfile);

        const {
            basicScore: mediaScore,
            score: photoQualityScore,
            issues: photoIssues,
            improvementPlan: photoImprovementPlan,
            details: photoQualityDetails
        } = photoEvaluator.evaluate(rawProfile);

        const {
            score: keywordScore,
            issues: keywordIssues,
            gapSummary: keywordGapSummary
        } = keywordEvaluator.evaluate(normalizedProfile, rawProfile, targetKeywords);

        const {
            score: reputationScore,
            issues: reputationIssues,
            reputationDetails
        } = reviewEvaluator.evaluate(rawProfile);

        // Competitor Benchmarking
        let competitorScore = 100;
        let competitorIssues: any[] = [];
        let competitorInsights: any = undefined;
        try {
            const competitors = await gbpCompetitorsService.getCompetitors(snapshot.locationId);
            const compResult = competitorEvaluator.evaluate(rawProfile, competitors);
            competitorScore = compResult.score;
            competitorIssues = compResult.issues;
            competitorInsights = compResult.competitorInsights;
        } catch (e) {
            console.warn('[Audit] Competitor evaluator failed, skipping:', e);
        }

        // Freshness (Stub for now, or implement logic)
        const { freshnessScore, freshnessIssues } = this.evaluateFreshness(rawProfile);

        // 6. Score Calculation
        const totalScore = this.calculateTotalScore({
            completeness: completenessScore,
            description: descriptionScore,
            media: mediaScore,
            freshness: freshnessScore,
            categories: categoriesScore,
            photoQuality: photoQualityScore,
            keywordOptimization: keywordScore,
            reputation: reputationScore,
            competitorBenchmark: competitorScore
        });

        const allIssues = [
            ...completenessIssues,
            ...descriptionIssues,
            ...categoriesIssues,
            ...photoIssues,
            ...keywordIssues,
            ...freshnessIssues,
            ...reputationIssues,
            ...competitorIssues
        ].sort((a, b) => b.impactWeight - a.impactWeight);

        // 7. Severity Grouping
        const groupedIssues: GroupedIssues = {
            critical: allIssues.filter(i => i.severity === 'critical'),
            warning: allIssues.filter(i => i.severity === 'warning'),
            opportunity: allIssues.filter(i => i.severity === 'opportunity')
        };

        const result: AuditResult = {
            snapshotId,
            totalScore,
            breakdown: {
                completeness: completenessScore,
                description: descriptionScore,
                media: mediaScore,
                freshness: freshnessScore,
                categories: categoriesScore,
                photoQuality: photoQualityScore,
                keywordOptimization: keywordScore,
                reputation: reputationScore,
                competitorBenchmark: competitorScore
            },
            groupedIssues,
            issues: allIssues,
            keywordGapSummary,
            categoryIntelligence,
            photoQualityDetails,
            photoImprovementPlan,
            reputationDetails,
            competitorInsights,
            previousScore,
            createdAt: new Date()
        };

        // 8. Audit Result Storage
        await prisma.gbpProfileAudit.upsert({
            where: { snapshotId },
            create: {
                snapshotId,
                score: totalScore,
                details: result as any
            },
            update: {
                score: totalScore,
                details: result as any,
                updatedAt: new Date()
            }
        });

        // 9. Automated Health Alerts
        const hasCriticalIssues = groupedIssues.critical.length > 0;
        const scoreDrop = previousScore !== undefined ? (previousScore - totalScore) : 0;
        const isScoreUnderThreshold = totalScore < 70;
        const hasSignificantDrop = scoreDrop >= 5;

        if (isScoreUnderThreshold || hasCriticalIssues || hasSignificantDrop) {
            const alertReasons: string[] = [];
            if (isScoreUnderThreshold) alertReasons.push(`Score is below 70 (current: ${totalScore})`);
            if (hasCriticalIssues) alertReasons.push(`${groupedIssues.critical.length} critical issue(s) detected`);
            if (hasSignificantDrop) alertReasons.push(`Score dropped by ${scoreDrop} points vs last audit`);

            console.warn(
                `[Audit Health Alert] Location snapshot ${snapshotId}: ${alertReasons.join(' | ')}`
            );

            // TODO: Extend this with email/notification dispatch
            // await notificationService.sendHealthAlert({ locationId: snapshot.locationId, snapshotId, alertReasons, totalScore });
        }

        return result;
    }

    private calculateCompleteness(profile: NormalizedGbpProfile): { completenessScore: number; completenessIssues: AuditIssue[] } {
        const fields = [
            { key: 'locationTitle', label: 'Business Name', required: true },
            { key: 'category', label: 'Primary Category', required: true },
            { key: 'address', label: 'Address', required: true, check: (p: any) => !!p.address?.formatted },
            { key: 'phone', label: 'Phone', required: true },
            { key: 'website', label: 'Website', required: true },
            { key: 'hours', label: 'Business Hours', required: true, check: (p: any) => p.hours?.periods?.length > 0 },
            { key: 'description', label: 'Description', required: true }
        ];

        let presentCount = 0;
        const issues: AuditIssue[] = [];

        for (const field of fields) {
            const isPresent = field.check ? field.check(profile) : !!(profile as any)[field.key];
            if (isPresent) {
                presentCount++;
            } else {
                let severity: 'critical' | 'warning' | 'opportunity' = 'warning';
                let impactWeight = 5;

                if (field.key === 'phone') { severity = 'critical'; impactWeight = 10; }
                if (field.key === 'website') { severity = 'warning'; impactWeight = 5; }
                if (field.key === 'description') { severity = 'critical'; impactWeight = 10; }
                if (field.key === 'hours') { severity = 'warning'; impactWeight = 5; }
                if (field.key === 'category') { severity = 'critical'; impactWeight = 10; }
                if (field.key === 'locationTitle') { severity = 'critical'; impactWeight = 10; }
                if (field.key === 'address') { severity = 'critical'; impactWeight = 10; }

                issues.push({
                    code: `missing_${field.key}`,
                    severity,
                    title: `Missing ${field.label}`,
                    whyItMatters: `A missing ${field.label.toLowerCase()} significantly reduces your visibility and trustworthiness.`,
                    recommendation: `Add your ${field.label.toLowerCase()} to the profile.`,
                    impactWeight
                });
            }
        }

        const completenessScore = (presentCount / fields.length) * 100;
        return { completenessScore, completenessIssues: issues };
    }

    private analyzeDescription(profile: NormalizedGbpProfile): { descriptionScore: number; descriptionIssues: AuditIssue[] } {
        const desc = profile.description || '';
        const issues: AuditIssue[] = [];
        let score = 100;

        if (!desc) {
            return { descriptionScore: 0, descriptionIssues: [] };
        }

        const length = desc.length;
        if (length < 100) {
            score -= 40;
            issues.push({
                code: 'desc_length_critical',
                severity: 'critical',
                title: 'Description is too short',
                whyItMatters: 'Very short descriptions fail to convey your value proposition and rank poorly.',
                recommendation: 'Expand your description to at least 250 characters.',
                impactWeight: 9
            });
        } else if (length < 250) {
            score -= 20;
            issues.push({
                code: 'desc_length_warning',
                severity: 'warning',
                title: 'Description could be longer',
                whyItMatters: 'A detailed description (250+ chars) helps customers choose you over competitors.',
                recommendation: 'Add more details about your services and history.',
                impactWeight: 5
            });
        } else if (length > 750) {
            score -= 5;
            issues.push({
                code: 'desc_length_penalty',
                severity: 'opportunity',
                title: 'Description is very long',
                whyItMatters: 'Extremely long descriptions may not be fully read by users.',
                recommendation: 'Try to keep it concise (under 750 characters).',
                impactWeight: 1
            });
        }

        const ctaWords = ["call", "visit", "book", "contact", "order"];
        const lowerDesc = desc.toLowerCase();
        const hasCTA = ctaWords.some(word => lowerDesc.includes(word));
        if (!hasCTA) {
            score -= 10;
            issues.push({
                code: 'desc_missing_cta',
                severity: 'warning',
                title: 'Missing Call-to-Action (CTA)',
                whyItMatters: 'A CTA guides users on what to do next, increasing conversion rates.',
                recommendation: `Include a phrase like "Call us today" or "Visit our website".`,
                impactWeight: 4
            });
        }

        if (profile.category) {
            const categoryLower = profile.category.toLowerCase();
            const catKeywords = categoryLower.split(' ').filter(w => w.length > 3);
            const hasServiceTerm = catKeywords.some(kw => lowerDesc.includes(kw)) || lowerDesc.includes(categoryLower);

            if (!hasServiceTerm) {
                score -= 10;
                issues.push({
                    code: 'desc_missing_service_kw',
                    severity: 'opportunity',
                    title: 'Missing Service Keywords',
                    whyItMatters: 'Including your primary category in the description helps Google understand your business relevance.',
                    recommendation: `Mention "${profile.category}" in your description.`,
                    impactWeight: 3
                });
            }
        }

        const city = profile.address?.locality?.toLowerCase();
        if (city && !lowerDesc.includes(city)) {
            score -= 10;
            issues.push({
                code: 'desc_missing_location_kw',
                severity: 'warning',
                title: 'Missing Location Keyword',
                whyItMatters: 'Mentioning your city helps with local search ranking.',
                recommendation: `Include "${profile.address.locality}" in your description.`,
                impactWeight: 4
            });
        }

        return { descriptionScore: Math.max(0, score), descriptionIssues: issues };
    }

    private evaluateFreshness(rawProfile: any): { freshnessScore: number; freshnessIssues: AuditIssue[] } {
        const issues: AuditIssue[] = [];
        let score = 100;

        // Try to determine last update time from metadata or media
        let lastUpdate: Date | null = null;

        if (rawProfile.metadata?.updateTime) {
            lastUpdate = new Date(rawProfile.metadata.updateTime);
        }

        // Check media if metadata not available or older
        if (Array.isArray(rawProfile.media)) {
            const media = rawProfile.media;
            for (const m of media) {
                if (m.createTime) {
                    const d = new Date(m.createTime);
                    if (!lastUpdate || d > lastUpdate) {
                        lastUpdate = d;
                    }
                }
            }
        }

        if (!lastUpdate) {
            // If no date found, we can't penalize confidently, or we assume stale?
            // Let's assume stale if no metadata and no media (which is bad anyway)
            // But to be safe, we'll give a neutral score or check for empty media
            return { freshnessScore: 50, freshnessIssues: [] };
        }

        const now = new Date();
        const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);

        if (diffDays > 180) {
            score -= 50;
            issues.push({
                code: 'freshness_critical',
                severity: 'critical',
                title: 'Profile is Stale',
                whyItMatters: 'No updates in over 6 months signals to Google and customers that the business might be closed.',
                recommendation: 'Update your hours, add a photo, or create a post immediately.',
                nextAction: 'Make any update to your profile today.',
                impactWeight: 8
            });
        } else if (diffDays > 90) {
            score -= 20;
            issues.push({
                code: 'freshness_warning',
                severity: 'warning',
                title: 'No Recent Updates',
                whyItMatters: 'Regular activity (every 90 days) keeps your ranking high.',
                recommendation: 'Add a new photo or update your business description.',
                nextAction: 'Add a new photo or post.',
                impactWeight: 5
            });
        }

        return { freshnessScore: Math.max(0, score), freshnessIssues: issues };
    }

    private calculateTotalScore(scores: AuditBreakdown): number {
        let total = 0;
        total += scores.completeness * (SCORING_WEIGHTS.completeness / 100);
        total += scores.description * (SCORING_WEIGHTS.description / 100);
        total += scores.media * (SCORING_WEIGHTS.media / 100);
        total += scores.freshness * (SCORING_WEIGHTS.freshness / 100);
        total += scores.categories * (SCORING_WEIGHTS.categories / 100);
        total += scores.photoQuality * (SCORING_WEIGHTS.photoQuality / 100);
        total += scores.keywordOptimization * (SCORING_WEIGHTS.keywordOptimization / 100);
        total += scores.reputation * (SCORING_WEIGHTS.reputation / 100);
        total += (scores.competitorBenchmark ?? 100) * (SCORING_WEIGHTS.competitorBenchmark / 100);

        return Math.min(100, Math.max(0, Math.round(total)));
    }
}

export const auditService = new AuditService();
