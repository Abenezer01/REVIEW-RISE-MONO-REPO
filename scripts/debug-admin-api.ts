
const USER_ID = 'f7a1f85c-3a74-5578-9f21-742853572002'; // Jane Admin
const ADMIN_PORT = 3012; // Check if this port is correct in local

async function main() {
    console.log(`[Debug] Testing Admin Portal Users API on port ${ADMIN_PORT}...`);
    console.log(`[Debug] Target User ID: ${USER_ID}`);

    const url = `http://localhost:${ADMIN_PORT}/users/${USER_ID}/businesses`;
    console.log(`Testing: ${url}`);

    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);
        
        if (res.ok) {
            const json = await res.json();
            console.log('Success!', JSON.stringify(json, null, 2));
        } else {
            const text = await res.text();
            console.error('Error Body:', text);
        }
    } catch (e) {
        console.error(`[FAIL] Request failed:`, e.message);
    }
}

main();
