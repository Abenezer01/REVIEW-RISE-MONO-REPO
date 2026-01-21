import axios from 'axios';

async function main() {
    console.log('🔍 Starting API Connectivity Debug...');

    // 1. Test Express Reviews Health
    try {
        const health = await axios.get('http://localhost:3006/health');
        console.log(`✅ Reviews Service Health: ${health.status} ${JSON.stringify(health.data)}`);
    } catch (e: any) {
        console.error(`❌ Reviews Service Unreachable: ${e.message}`);
    }

    // 2. Simulate useBusinessId (Fetch Locations from Admin Portal)
    // We assume Admin Portal runs on 3012 based on docker-compose, but locally usually they share ports or have specific ones.
    // services.ts says: auth: 3010, reviews: 3006
    // Checks docker-compose: express-admin-portal: 3012
    
    let businessId = 'a1dd8e07-694c-499f-a01a-2b991c283921'; // Default backup from seed
    
    // Note: Admin Portal usually requires Auth. 
    // If we can't easily generate a token here, we might skip auth checks if possible or rely on the known seeded ID.
    // For this debug, we will assume we HAVE the ID and just test the Reviews API directly, 
    // as simulating full auth flow in a simple script is complex.
    
    console.log(`\nℹ️  Using Business ID: ${businessId} (from seed)`);

    // 3. Test Analytics Endpoint directly
    const endpoints = [
        '/api/v1/reviews/analytics/rating-trend',
        '/api/v1/reviews/analytics/summary',
        '/api/v1/reviews/analytics/metrics'
    ];

    for (const endpoint of endpoints) {
        const url = `http://localhost:3006${endpoint}?businessId=${businessId}&period=30`;
        console.log(`\nTesting: ${url}`);
        try {
            const res = await axios.get(url);
            console.log(`✅ Status: ${res.status}`);
            const data = res.data?.data;
            if (Array.isArray(data)) {
                console.log(`📊 Items returned: ${data.length}`);
                if (data.length > 0) console.log('Sample:', JSON.stringify(data[0]));
            } else {
                console.log(`📊 Data keys: ${Object.keys(data || {}).join(', ')}`);
                if (endpoint.includes('metrics')) {
                    console.log('Metrics:', JSON.stringify(data, null, 2));
                }
            }
        } catch (e: any) {
            console.error(`❌ Request Failed: ${e.message}`);
            if (e.response) {
                console.error('Response:', e.response.data);
            }
        }
    }
}

main();
