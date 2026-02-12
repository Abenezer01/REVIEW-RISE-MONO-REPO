
import { CreativeEngineService } from '../creative-engine.service';
import { prisma } from '@platform/db';

// Mock the prisma client from @platform/db
jest.mock('@platform/db', () => ({
    prisma: {
        creativeConcept: {
            create: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn()
        }
    }
}));

describe('Creative Engine Persistence Tests', () => {
    let service: CreativeEngineService;

    // Type casting for mock
    const mockCreate = prisma.creativeConcept.create as jest.Mock;
    const mockFindMany = prisma.creativeConcept.findMany as jest.Mock;

    beforeEach(() => {
        service = new CreativeEngineService();
        jest.clearAllMocks();
    });

    describe('saveConcept', () => {
        it('should save a concept successfully with all fields', async () => {
            const businessId = 'biz-123';
            const concept = {
                headline: 'Test Concept',
                primaryText: 'Test Text',
                visualIdea: 'Test Visual',
                cta: 'Sign Up',
                imagePrompt: 'A prompt',
                formatPrompts: { feed: 'feed text', story: 'story text', reel: 'reel text', carousel: 'carousel text' },
                imageUrl: 'http://image.url',
                tone: { toneType: 'Professional' }
            };

            mockCreate.mockResolvedValue({
                id: 'concept-1',
                businessId,
                createdAt: new Date(),
                ...concept
            });

            const result = await service.saveConcept(businessId, concept);

            expect(mockCreate).toHaveBeenCalledWith({
                data: {
                    businessId,
                    headline: concept.headline,
                    visualIdea: concept.visualIdea,
                    primaryText: concept.primaryText,
                    cta: concept.cta,
                    imagePrompt: concept.imagePrompt,
                    imageUrl: concept.imageUrl,
                    formatPrompts: concept.formatPrompts, // Should be passed as JSON if schema supports it, or object if handled by Prisma
                    tone: concept.tone // Should be passed as JSON
                }
            });
            expect(result.id).toBe('concept-1');
        });

        it('should handle missing optional fields gracefully', async () => {
            const businessId = 'biz-123';
            const concept = {
                headline: 'Minimal Concept',
                // Missing tone, imageUrl, etc.
            };

            mockCreate.mockResolvedValue({ id: 'concept-2', ...concept });

            await service.saveConcept(businessId, concept);

            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    headline: 'Minimal Concept',
                    businessId
                })
            }));
        });

        it('should throw error if save fails', async () => {
            mockCreate.mockRejectedValue(new Error('DB Error'));
            await expect(service.saveConcept('biz-1', {})).rejects.toThrow('Failed to save concept.');
        });
    });

    describe('getConcepts', () => {
        it('should return concepts ordered by createdAt desc', async () => {
            const businessId = 'biz-123';
            const mockConcepts = [
                { id: '1', headline: 'Concept 1', createdAt: new Date() },
                { id: '2', headline: 'Concept 2', createdAt: new Date() }
            ];
            mockFindMany.mockResolvedValue(mockConcepts);

            const result = await service.getConcepts(businessId);

            expect(mockFindMany).toHaveBeenCalledWith({
                where: { businessId },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('1');
        });

        it('should throw error if fetch fails', async () => {
            mockFindMany.mockRejectedValue(new Error('DB Error'));
            await expect(service.getConcepts('biz-1')).rejects.toThrow('Failed to fetch concepts.');
        });
    });
});
