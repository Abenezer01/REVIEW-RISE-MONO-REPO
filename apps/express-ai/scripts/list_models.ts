import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_PROVIDER_API_KEY;
    if (!apiKey) {
        console.error('No API Key found');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('Error fetching models:', data.error);
            return;
        }

        console.log('Available Models:');
        if (data.models) {
            data.models.forEach((model: any) => {
                console.log(`- ${model.name}`);
                console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
            });
        }
    } catch (error) {
        console.error('Request failed:', error);
    }
}

listModels();
