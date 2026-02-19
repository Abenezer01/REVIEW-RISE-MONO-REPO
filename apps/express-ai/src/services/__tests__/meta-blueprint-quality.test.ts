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
        it('should output both Prospecting and Retargeting ad sets (Local Full Funnel)', async () => {
            // Local input has budget 0 in base, but generate() defaults to 1500 if not provided.
            // Tier 1500+ is FULL_FUNNEL.
            const result = await service.generate({ ...localInput, budget: 2000 });
            expect(result.structure.prospecting.adSets.length).toBeGreaterThanOrEqual(1);
            expect(result.structure.retargeting.adSets.length).toBeGreaterThanOrEqual(1);

            const prospectingAudienceTypes = result.structure.prospecting.adSets.map(as => as.audience.type);
            expect(prospectingAudienceTypes).toContain('Broad');
        });

        it('should output both Prospecting and Retargeting ad sets (E-commerce Full Funnel)', async () => {
            const result = await service.generate({ ...ecommerceInput, budget: 2000 });
            expect(result.structure.prospecting.adSets.length).toBeGreaterThanOrEqual(1);
            expect(result.structure.retargeting.adSets.length).toBeGreaterThanOrEqual(1);

            const retargetingAudienceTypes = result.structure.retargeting.adSets.map(as => as.audience.type);
            expect(retargetingAudienceTypes).toContain('Retargeting');
        });

        it('should generate interest clusters in ad sets for Local Service', async () => {
            const result = await service.generate({ ...localInput, budget: 2000 });
            const allAdSets = [...result.structure.prospecting.adSets, ...result.structure.retargeting.adSets];
            const interestBased = allAdSets.filter(as => as.audience.interests && as.audience.interests.length > 0);
            expect(interestBased.length).toBeGreaterThanOrEqual(1);

            interestBased.forEach(as => {
                as.audience.interests?.forEach(cluster => {
                    expect(cluster.theme).toBeDefined();
                    expect(cluster.interests.length).toBeGreaterThan(0);
                });
            });
        });
    });

    describe('Copy Variations & Constraints', () => {
        it('should generate copy with safe lengths in ad sets', async () => {
            const result = await service.generate(localInput);
            const allAdSets = [...result.structure.prospecting.adSets, ...result.structure.retargeting.adSets];
            expect(allAdSets.length).toBeGreaterThan(0);

            allAdSets.forEach(adSet => {
                adSet.creatives.forEach(creative => {
                    creative.primaryText.forEach(text => {
                        expect(text.length).toBeGreaterThan(10);
                        expect(text.length).toBeLessThan(300); // 125 is optimal but can be more
                    });

                    creative.headlines.forEach(headline => {
                        expect(headline.length).toBeGreaterThan(5);
                        expect(headline.length).toBeLessThan(60);
                    });
                });
            });
        });

        it('should include CTAs', async () => {
            const result = await service.generate(localInput);
            const allAdSets = [...result.structure.prospecting.adSets, ...result.structure.retargeting.adSets];
            allAdSets.forEach(adSet => {
                adSet.creatives.forEach(creative => {
                    expect(creative.callToAction).toBeDefined();
                });
            });
        });
    });

    describe('Placement Recommendations', () => {
        it('should provide placement recommendations in ad sets', async () => {
            const result = await service.generate(localInput);
            const allAdSets = [...result.structure.prospecting.adSets, ...result.structure.retargeting.adSets];

            expect(allAdSets.length).toBeGreaterThan(0);
            allAdSets.forEach(adSet => {
                expect(adSet.placements.length).toBeGreaterThan(0);
                expect(adSet.placementStrategy).toBeDefined();
                expect(adSet.placementRationale).toBeDefined();
                expect(adSet.placementRationale!.length).toBeGreaterThan(5);
            });
        });

        it('should include essential placements', async () => {
            const result = await service.generate(localInput);
            const allPlacements = result.structure.prospecting.adSets.flatMap(as => as.placements);
            expect(allPlacements).toContain('facebook_feed');
            expect(allPlacements).toContain('instagram_stories');
        });
    });

    describe('Geo Targeting', () => {
        it('should respect input geo settings in audiences', async () => {
            const result = await service.generate(localInput);
            const allAdSets = [...result.structure.prospecting.adSets, ...result.structure.retargeting.adSets];

            const center = localInput.geoTargeting.center;
            const hasLocation = allAdSets.some(as =>
                as.audience.geo?.city === center || as.name.includes(center)
            );
            expect(hasLocation).toBe(true);
        });
    });
});
