
import { analyzeSEOHealth } from './src/services/seo-analyzer.service';

// Mock dependencies if needed or just run it (assuming env vars are set or we mock them)
// We need to set LLM_PROVIDER_API_KEY manually if not in env for this script, 
// but we'll assume the mock fallback works if key is missing.

// Set provider to gemini for testing
process.env.LLM_PROVIDER = 'gemini';

async function verify() {
    console.log('Starting verification with provider:', process.env.LLM_PROVIDER);
    try {
        const result = await analyzeSEOHealth('https://example.com');
        console.log('Health Score:', result.healthScore);

        console.log('Strategic Recommendations (AI):');
        if (result.strategicRecommendations && result.strategicRecommendations.length > 0) {
            console.log('✅ Strategic Recommendations found:', result.strategicRecommendations.length);
            console.log(JSON.stringify(result.strategicRecommendations, null, 2));
        } else {
            console.log('⚠️ No Strategic Recommendations found (Check Mock or API Key)');
        }

        console.log('Standard Recommendations:');
        if (result.recommendations && result.recommendations.length > 0) {
            console.log('✅ Standard Recommendations found:', result.recommendations.length);
        }

        if (result.summary) { // Checking if backend structure matches
            console.log('✅ Summary field present')
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    }
}

verify();
