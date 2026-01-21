
const BUSINESS_ID = 'a1dd8e07-694c-499f-a01a-2b991c283921'; // From seed.ts
const PORT = 3006;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

async function main() {
    console.log(`[Debug] Testing Review API on port ${PORT}...`);
    console.log(`[Debug] Target Business ID: ${BUSINESS_ID}`);

    // 1. Health Check
    try {
        const healthVals = await fetch(`http://localhost:${PORT}/health`).then(r => r.json());
        console.log(`[PASS] Health Check:`, healthVals);
    } catch (e) {
        console.error(`[FAIL] Health Check failed:`, e.message);
        process.exit(1);
    }

    // 2. Test Analytics Endpoints
    const endpoints = [
        { name: 'Dashboard Metrics', path: `/reviews/analytics/metrics?periodDays=30&businessId=${BUSINESS_ID}` },
        { name: 'Rating Trend', path: `/reviews/analytics/rating-trend?periodDays=30&businessId=${BUSINESS_ID}` },
        { name: 'Volume', path: `/reviews/analytics/volume?periodDays=30&businessId=${BUSINESS_ID}` }
    ];

    for (const ep of endpoints) {
        console.log(`\nTesting ${ep.name}...`);
        const url = `${BASE_URL}${ep.path}`;
        try {
            const res = await fetch(url);
            console.log(`Status: ${res.status} ${res.statusText}`);
            
            if (res.ok) {
                const json = await res.json();
                const data = json.data;
                console.log(`Data Type: ${Array.isArray(data) ? 'Array' : typeof data}`);
                
                if (Array.isArray(data)) {
                    console.log(`Count: ${data.length}`);
                    if (data.length > 0) console.log('Sample:', data[0]);
                } else {
                    console.log('Keys:', Object.keys(data || {}));
                    console.log('Content:', JSON.stringify(data, null, 2));
                }
            } else {
                const text = await res.text();
                console.error(`Error Body:`, text);
            }
        } catch (e) {
            console.error(`[FAIL] Request failed:`, e.message);
        }
    }
}

main();
