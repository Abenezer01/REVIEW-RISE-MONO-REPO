/* eslint-disable no-console */
import { normalizeGbpProfile } from '../gbp-types';
import { categoryEvaluator } from './category-evaluator';
import { photoEvaluator } from './photo-evaluator';
import { keywordEvaluator } from './keyword-evaluator';
import { AuditIssue } from './types';

// Mock Data
const mockRawProfile = {
    name: "locations/12345/business-profile",
    title: "Acme Consulting",
    languageCode: "en",
    storefrontAddress: {
        addressLines: ["123 Main St"],
        locality: "New York",
        postalCode: "10001"
    },
    categories: {
        primaryCategory: { displayName: "Consultant", categoryId: "gcid:consultant" }, // Generic warning
        additionalCategories: [{ displayName: "Marketing Agency", categoryId: "gcid:marketing_agency" }]
    },
    profile: {
        description: "We provide SEO and Google Ads services for local businesses. Contact us for a quote."
    },
    media: [
        {
            locationAssociation: { category: "LOGO" },
            createTime: "2023-01-01T00:00:00Z",
            dimensions: { widthPixels: 800, heightPixels: 800 }
        },
        {
            locationAssociation: { category: "COVER" },
            createTime: "2023-01-01T00:00:00Z",
            dimensions: { widthPixels: 400, heightPixels: 300 } // Low Res Warning
        },
        // Only 2 photos -> Critical count (< 5)
    ],
    serviceItems: [
        { serviceTypeId: "SEO Optimization" },
        { serviceTypeId: "PPC Management" }
    ],
    metadata: {
        updateTime: "2023-01-01T00:00:00Z" // Old update time -> Freshness Warning
    }
};

const targetKeywords = ["SEO Agency", "Digital Marketing", "Consultant", "PPC"];

// Helper to simulate AuditService freshness logic
function evaluateFreshness(rawProfile: any): { freshnessScore: number; freshnessIssues: AuditIssue[] } {
    const issues: AuditIssue[] = [];
    let score = 100;

    let lastUpdate: Date | null = null;
    if (rawProfile.metadata?.updateTime) {
        lastUpdate = new Date(rawProfile.metadata.updateTime);
    }
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

    if (!lastUpdate) return { freshnessScore: 50, freshnessIssues: [] };

    const now = new Date();
    // Force "now" to be much later than 2023-01-01 for testing
    // Or assume test runs in 2026 as per <env>
    // 2026-02-27 vs 2023-01-01 is > 3 years. Definitely stale.
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

async function runTest() {
    console.log("🚀 Running Audit Engine V2 Test (Integration Verify)...");

    const normalized = normalizeGbpProfile(mockRawProfile);

    // 1. Category Evaluation
    console.log("\n--- Category Intelligence ---");
    const catResult = categoryEvaluator.evaluate(normalized, mockRawProfile);
    console.log(`Score: ${catResult.score}`);
    catResult.issues.forEach(i => {
        console.log(`[${i.severity.toUpperCase()}] ${i.title}: ${i.recommendation}`);
        if (i.suggestedCategories) console.log(`   👉 Suggested: ${i.suggestedCategories.join(', ')}`);
    });

    // 2. Photo Quality
    console.log("\n--- Photo Quality ---");
    const photoResult = photoEvaluator.evaluate(mockRawProfile);
    console.log(`Score: ${photoResult.score}`);
    photoResult.issues.forEach(i => console.log(`[${i.severity.toUpperCase()}] ${i.title}: ${i.recommendation}`));
    console.log("Improvement Plan:", photoResult.improvementPlan);

    // 3. Keyword Optimization
    console.log("\n--- Keyword Optimization ---");
    const kwResult = keywordEvaluator.evaluate(normalized, mockRawProfile, targetKeywords);
    console.log(`Score: ${kwResult.score}`);
    console.log(`Missing Keywords: ${kwResult.gapSummary.missingCount}`);
    kwResult.issues.forEach(i => {
        console.log(`[${i.severity.toUpperCase()}] ${i.title}`);
        console.log(`   Why: ${i.whyItMatters}`);
        console.log(`   Action: ${i.nextAction}`);
        if (i.recommendedPlacement) console.log(`   Placement: ${i.recommendedPlacement.join(', ')}`);
    });

    // 4. Freshness (Simulated)
    console.log("\n--- Freshness (AuditService Logic) ---");
    const freshness = evaluateFreshness(mockRawProfile);
    console.log(`Freshness Score: ${freshness.freshnessScore}`);
    freshness.freshnessIssues.forEach(i => console.log(`[${i.severity.toUpperCase()}] ${i.title}: ${i.recommendation}`));

    console.log("\n✅ Test Complete");
}

runTest().catch(console.error);
