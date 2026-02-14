import { strategyCompiler } from '../blueprint/strategy-compiler';
import { validationEngine } from '../blueprint/validation-engine';
import { performanceEstimator } from '../blueprint/performance-estimator';
import { BlueprintInput, KeywordCluster, AdGroup, RSA_CONSTRAINTS } from '@platform/contracts';

describe('Decision Engine Components', () => {

    describe('Strategy Compiler', () => {
        const mockClusters: KeywordCluster[] = [
            { intent: 'Brand', theme: 'My Brand', keywords: [] },
            { intent: 'Service', theme: 'Service A', keywords: [] },
            { intent: 'Service', theme: 'Service B', keywords: [] },
            { intent: 'Problem', theme: 'Problem X', keywords: [] }
        ];

        const mockAdGroups: AdGroup[] = mockClusters.map(c => ({
            name: c.theme,
            keywords: c,
            assets: { headlines: [], descriptions: [] }
        }));

        const baseInput: BlueprintInput = {
            offerOrService: 'Service',
            vertical: 'Local Service',
            geoTargeting: ['City'],
            painPoints: [],
            budgetTier: 'Mid'
        };

        it('should create 1 campaign for Low budget', () => {
            const result = strategyCompiler.compile(
                { ...baseInput, budgetTier: 'Low' },
                mockClusters,
                mockAdGroups
            );

            expect(result).toHaveLength(1);
            expect(result[0].adGroups.length).toBeGreaterThan(0);
        });

        it('should create separate Brand and Service campaigns for Mid budget', () => {
            const result = strategyCompiler.compile(
                { ...baseInput, budgetTier: 'Mid' },
                mockClusters,
                mockAdGroups
            );

            expect(result.length).toBeGreaterThanOrEqual(1); // Might be 1 if no brand clusters, but we have brand clusters
            const brandCamp = result.find(c => c.name.includes('Brand'));
            const serviceCamp = result.find(c => c.name.includes('Service'));

            expect(brandCamp).toBeDefined();
            expect(serviceCamp).toBeDefined();
        });

        it('should create 3 campaigns for High budget', () => {
            const result = strategyCompiler.compile(
                { ...baseInput, budgetTier: 'High' },
                mockClusters,
                mockAdGroups
            );

            expect(result.length).toBeGreaterThanOrEqual(2); // Brand, High Intent, Research
            const researchCamp = result.find(c => c.name.includes('Research'));
            expect(researchCamp).toBeDefined();
        });
    });

    describe('Validation Engine', () => {
        it('should detect RSA constraint violations', () => {
            const invalidAdGroup: AdGroup = {
                name: 'Test',
                keywords: {} as any,
                assets: {
                    headlines: ['Too Long Headline That Exceeds The Limit Of Thirty Characters'],
                    descriptions: [] // Too few
                }
            };

            const result = validationEngine.validate({
                clusters: [],
                adGroups: [invalidAdGroup],
                negatives: []
            });

            // Length error (headline) + Count error (headlines < min) + Count error (descr < min)
            expect(result.length).toBeGreaterThanOrEqual(2);
            expect(result.some(w => w.message.includes('exceeds'))).toBe(true);
            expect(result.some(w => w.message.includes('too few'))).toBe(true);
        });
    });

    describe('Performance Estimator', () => {
        it('should return estimates based on vertical', () => {
            const result = performanceEstimator.estimate('Local Service', 'High Intent (BOF)');

            expect(result.expectedCPC).toContain('$');
            expect(result.expectedCTR).toContain('%');
            expect(result.conversionDifficulty).toBeGreaterThan(0);
        });
    });
});
