
import { blueprintService } from '../services/blueprint.service';
import { BlueprintInput } from '@platform/contracts';

const input: BlueprintInput = {
    businessName: 'Apex Plumbing',
    offer: 'Emergency Leak Repair',
    services: ['Pipe Repair', 'Leak Detection', 'Drain Cleaning'],
    vertical: 'Local Service',
    geo: 'Austin, TX',
    budget: 3000,
    objective: 'Leads',
    painPoints: ['Burst pipe', 'Flooded kitchen'],
    landingPageUrl: 'https://apexplumbing.com/emergency',
    expectedAvgCpc: 6.50,
    conversionTrackingEnabled: true
};

async function run() {
    try {
        console.log('Generating blueprint...');
        const blueprint = await blueprintService.generate(input);
        console.log('Generated blueprint:', JSON.stringify(blueprint, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
