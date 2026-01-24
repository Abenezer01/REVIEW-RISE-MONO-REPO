import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';



export class LLMService {
    private getOpenAI() {
        const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_PROVIDER_API_KEY;
        if (!apiKey) {
            console.warn('OPENAI_API_KEY is not set. Requests to OpenAI will fail.');
        }
        return new OpenAI({ apiKey });
    }

    private getGemini() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
             throw new Error('GEMINI_API_KEY is not set.');
        }
        return new GoogleGenerativeAI(apiKey);
    }

    /**
     * Generates text based on a prompt.
     * Supports 'json' mode to force JSON output (provider dependent).
     */
    async generateText(prompt: string, options: { jsonMode?: boolean; temperature?: number; model?: string } = {}): Promise<string> {
        const { jsonMode = false, temperature = 0.7 } = options;
        const provider = process.env.AI_PROVIDER || 'gemini';

        if (provider === 'gemini') {
            try {
                const genAI = this.getGemini();
                // Default to 1.5-flash for speed/efficiency
                // Ensure we don't pass an OpenAI model name to Gemini
                const modelName = exactGeminiModel(options.model) || "gemini-3-flash-preview";  
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: {
                        temperature,
                        responseMimeType: jsonMode ? "application/json" : "text/plain"
                    }
                });

                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();
                
                if (!text) throw new Error('No content generated from Gemini');
                return text;
            } catch (error) {
                console.error('Gemini Generation Error:', error);
                throw error;
            }
        } 
        
        // Default to OpenAI
        try {
            const openai = this.getOpenAI();
            const modelName = exactOpenAIModel(options.model) || 'gpt-4-turbo-preview';
            
            const completion = await openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: modelName, 
                response_format: jsonMode ? { type: 'json_object' } : undefined,
                temperature,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No content generated from OpenAI');
            return content;
        } catch (error) {
             console.error('OpenAI Generation Error:', error);
             throw error;
        }
    }

    /**
     * Helper to generate JSON and parse it reliably.
     */
    async generateJSON<T = any>(prompt: string, options: { temperature?: number } = {}): Promise<T> {
        // Reinforce JSON instruction for weaker models or backup
        const jsonPrompt = prompt.includes('JSON') ? prompt : `${prompt}\n\nReturn valid JSON only.`;
        const text = await this.generateText(jsonPrompt, { ...options, jsonMode: true });
        try {
            return JSON.parse(text) as T;
        } catch {
            console.error('Failed to parse JSON from AI response:', text);
            // Attempt to clean markdown code blocks often returned by LLMs
            const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
            try {
                return JSON.parse(cleaned) as T;
            } catch {
                throw new Error('Invalid JSON response from AI');
            }
        }
    }
}

// Helpers to sanitize model names between providers used by this service
function exactGeminiModel(model?: string): string | undefined {
    if (!model) return undefined;
    return model.startsWith('gemini') ? model : undefined;
}

function exactOpenAIModel(model?: string): string | undefined {
    if (!model) return undefined;
    return model.startsWith('gpt') ? model : undefined;
}

export const llmService = new LLMService();
