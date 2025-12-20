const axios = require('axios');

async function testAnalysis() {
    try {
        console.log('Testing SEO Analysis Endpoint...');
        const response = await axios.post('http://localhost:3008/api/v1/seo/analyze', {
            url: 'https://example.com'
        });

        const result = response.data.data;
        console.log('✅ Analysis Successful');
        console.log('Health Score:', result.healthScore);
        if (result.snapshotId) {
            console.log('✅ Snapshot Persisted with ID:', result.snapshotId);
        } else {
            console.log('❌ Snapshot ID missing (Persistence failed)');
        }
        console.log('Category Scores:', JSON.stringify(result.categoryScores, null, 2));
        console.log('Recommendations Count:', result.recommendations.length);
        if (result.recommendations.length > 0) {
            console.log('Sample Recommendation:', result.recommendations[0]);
        }

    } catch (error) {
        console.error('❌ Analysis Failed:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testAnalysis();
