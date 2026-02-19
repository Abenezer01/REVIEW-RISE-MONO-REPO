import { CreativeConceptOutput } from '@platform/contracts';
import { navGuardrailsService } from './nav-guardrails.service';
import { CREATIVE_ENGINE_PROMPTS } from '../prompts/creative-engine.prompts';
import { imageGenerationService } from './image/image-generation.service';
import { llmService } from './llm.service';
import { prisma } from '@platform/db';

export class CreativeEngineService {

    async generateConcepts(input: any): Promise<CreativeConceptOutput> {
        const prompt = CREATIVE_ENGINE_PROMPTS.GENERATE_CONCEPTS(input);

        try {
            const result = await llmService.generateJSON(prompt);
            const output = result as CreativeConceptOutput;

            // Generate images if enabled
            if (input.enableAiImages) {
                await Promise.all(output.concepts.map(async (concept) => {
                    try {
                        const imageUrl = await this.generateImage(concept.imagePrompt || concept.visualIdea);
                        concept.imageUrl = imageUrl;
                    } catch (imgError) {
                        console.error(`Failed to generate image for concept: ${concept.headline}`, imgError);
                        // Don't fail the whole request if image generation fails
                    }
                }));
            }

            // Validate and Filter Concepts
            output.concepts = output.concepts.map(concept => {
                const googleValidation = navGuardrailsService.validateGoogleAds(concept);
                const metaValidation = navGuardrailsService.validateMetaAds(concept);
                const safetyValidation = navGuardrailsService.validateSafety(concept); // Tone profile could be passed here if available

                // Attach warnings/errors to concept if contract supported it, 
                // for now we just log or could filter out invalid ones.
                // In a real app, we might tag them as "needs review".

                if (!googleValidation.isValid) {
                    console.warn(`Concept ${concept.id} failed Google validation:`, googleValidation.errors);
                }
                if (!metaValidation.isValid) {
                    // Meta validation currently always returns isValid: true, but if it changes
                    console.warn(`Concept ${concept.id} failed Meta validation:`, (metaValidation as any).errors);
                }
                if (!safetyValidation.isValid) {
                    console.warn(`Concept ${concept.id} failed safety validation:`, safetyValidation.errors);
                    // Filter out unsafe concepts? 
                    // For now, let's keep them but maybe flag them in future.
                }

                return concept;
            });

            return output;
        } catch (error) {
            console.error("Error generating creative concepts:", error);
            throw new Error("Failed to generate creative concepts.");
        }
    }

    async generateImage(prompt: string): Promise<string> {
        // Use a high-quality style by default for these marketing assets
        const result = await imageGenerationService.generate(prompt, {
            style: 'Photorealistic',
            quality: 'high',
            aspectRatio: '1:1', // Default to square for now, could be parameterized
            variations: 1
        });
        return result.urls[0];
    }


    async saveConcept(businessId: string, concept: any): Promise<any> {
        try {
            // Remove ID if it's a temp ID from frontend generator
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...conceptData } = concept;

            return await prisma.creativeConcept.create({
                data: {
                    businessId,
                    headline: conceptData.headline,
                    visualIdea: conceptData.visualIdea,
                    primaryText: conceptData.primaryText,
                    cta: conceptData.cta,
                    imagePrompt: conceptData.imagePrompt,
                    imageUrl: conceptData.imageUrl,
                    formatPrompts: conceptData.formatPrompts,
                    tone: conceptData.tone
                }
            });
        } catch (error) {
            console.error("Error saving creative concept:", error);
            throw new Error("Failed to save concept.");
        }
    }

    async getConcepts(businessId: string): Promise<any[]> {
        try {
            return await prisma.creativeConcept.findMany({
                where: { businessId },
                orderBy: { createdAt: 'desc' }
            });
        } catch (error) {
            console.error("Error fetching creative concepts:", error);
            throw new Error("Failed to fetch concepts.");
        }
    }

    async deleteConcept(id: string, businessId: string): Promise<void> {
        try {
            await prisma.creativeConcept.delete({
                where: { id, businessId }
            });
        } catch (error) {
            console.error("Error deleting concept:", error);
            throw new Error("Failed to delete concept.");
        }
    }
}

export const creativeEngineService = new CreativeEngineService();
