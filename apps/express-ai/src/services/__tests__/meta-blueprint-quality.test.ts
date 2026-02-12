import { MetaBlueprintService } from '../meta-blueprint.service';
import { MetaBlueprintInput } from '@platform/contracts';

describe('Meta Blueprint Quality Tests', () => {
    let service: MetaBlueprintService;

    beforeEach(() => {
        service = new MetaBlueprintService();
    });

    const localInput: MetaBlueprintInput = {
        businessName: 'Test Biz',
        offerOrService: 'Premium Plumbing',
        vertical: 'Local Service',
        geoTargeting: {
            center: 'Los Angeles, CA',
            radius: 10,
            unit: 'miles'
        },
        painPoints: ['Leaks', 'Burst Pipes'],
    };

    const ecommerceInput: MetaBlueprintInput = {
        businessName: 'Fashion Hub',
        offerOrService: 'Trendy Shoes',
        vertical: 'E-commerce',
        geoTargeting: {
            center: 'United States',
            radius: 0,
            unit: 'miles' // country wide usually ignores radius, but keeping schema valid
        },
        painPoints: ['Slow shipping', 'Poor quality'],
    };

    describe('Audience Framework', () => {
        it('should output both Prospecting and Retargeting audiences (Local)', async () => {
            const result = await service.generate(localInput);
            expect(result.audiences.length).toBeGreaterThanOrEqual(2);
            const types = result.audiences.map(a => a.type);
            expect(types).toContain('Prospecting');
            expect(types).toContain('Retargeting');
        });

        it('should output both Prospecting and Retargeting audiences (E-commerce)', async () => {
            const result = await service.generate(ecommerceInput);
            expect(result.audiences.length).toBeGreaterThanOrEqual(2);
            // E-commerce should have Interest clusters + Lookalike placeholders (manual creation)
            const prospecting = result.audiences.find(a => a.type === 'Prospecting');
            expect(prospecting).toBeDefined();
            // Retargeting commonly has lookalikes
            const retargeting = result.audiences.find(a => a.type === 'Retargeting');
            expect(retargeting?.lookalikeSources).toBeDefined();
            expect(retargeting!.lookalikeSources!.length).toBeGreaterThan(0);
        });

        it('should generate at least 3 Interest Clusters for Local Service', async () => {
            const result = await service.generate(localInput);
            expect(result.interestClusters.length).toBeGreaterThanOrEqual(3);
            result.interestClusters.forEach(cluster => {
                expect(cluster.theme).toBeDefined();
                expect(cluster.type).toMatch(/Primary|Secondary/);
            });
        });

        it('should generate at least 3 Interest Clusters for E-commerce', async () => {
            const result = await service.generate(ecommerceInput);
            expect(result.interestClusters.length).toBeGreaterThanOrEqual(3);
            const themes = result.interestClusters.map(c => c.theme);
            expect(themes).toContain('Shopping Behavior'); // Check implemented content
        });
    });

    describe('Copy Variations & Constraints', () => {
        it('should generate copy with safe lengths', async () => {
            const result = await service.generate(localInput);

            expect(result.copyVariations.length).toBeGreaterThan(0);

            result.copyVariations.forEach(copy => {
                // Primary text ~125 chars
                // Allow some buffer
                expect(copy.primaryText.length).toBeGreaterThan(10);
                expect(copy.primaryText.length).toBeLessThan(200);

                // Headline ~40 chars
                expect(copy.headline.length).toBeGreaterThan(5);
                expect(copy.headline.length).toBeLessThan(60);

                // Description ~25 chars
                expect(copy.description.length).toBeGreaterThan(5);
                expect(copy.description.length).toBeLessThan(50);
            });
        });

        it('should include CTAs', async () => {
            const result = await service.generate(localInput);
            result.copyVariations.forEach(copy => {
                expect(copy.ctas.length).toBeGreaterThan(0);
                expect(copy.tone).toBeDefined();
            });
        });
    });

    describe('Placement Recommendations', () => {
        it('should provide placement recommendations with rationale', async () => {
            const result = await service.generate(localInput);

            expect(result.placements.length).toBeGreaterThan(0);
            result.placements.forEach(p => {
                expect(p.platform).toBeDefined();
                expect(p.format).toBeDefined();
                expect(p.objective).toBeDefined(); // Awareness / Conversion
                expect(p.rationale).toBeDefined();
                expect(p.rationale.length).toBeGreaterThan(5);
                expect(p.recommended).toBe(true);
            });
        });

        it('should include Feed, Stories, and Reels', async () => {
            const result = await service.generate(localInput);
            const formats = result.placements.map(p => p.format);
            expect(formats).toContain('Feed');
            expect(formats).toContain('Stories');
            expect(formats).toContain('Reels');
        });
    });

    describe('Geo Targeting', () => {
        it('should respect input geo settings in naming or targeting', async () => {
            const result = await service.generate(localInput);

            // Should see city name in audience names or locations
            const center = localInput.geoTargeting.center;
            const hasLocation = result.audiences.some(a =>
                a.name.includes(center) || a.geoLocations.includes(center)
            );
            expect(hasLocation).toBe(true);
        });
    });
});
