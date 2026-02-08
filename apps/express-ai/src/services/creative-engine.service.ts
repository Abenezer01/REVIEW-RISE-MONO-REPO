import { CreativeConceptOutput } from '@platform/contracts';
import { navGuardrailsService } from './nav-guardrails.service';
import { CREATIVE_ENGINE_PROMPTS } from '../prompts/creative-engine.prompts';
import { imageGenerationService } from './image/image-generation.service';
import { llmService } from './llm.service';

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
}

export const creativeEngineService = new CreativeEngineService();
