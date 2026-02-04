import { generateCampaignPlan } from './index';
import { CampaignInput } from './schema/campaign-plan';

const runTest = (name: string, input: CampaignInput) => {
    console.log(`\n--- Test Case: ${name} ---`);
    try {
        const plan = generateCampaignPlan(input);
        console.log('✅ Plan Generated Successfully');
        console.log('Summary:', JSON.stringify(plan.summary, null, 2));
        console.log('Channels:', plan.channels.map(c => `${c.channel} (${c.allocationPercentage * 100}%)`).join(', '));
        console.log('Campaigns Created:', plan.campaigns.length);
        console.log('Execution Steps:', plan.execution_steps.length);
        console.log('Optimization Schedule:', plan.optimization_schedule[0]); // Show first item example
        console.log('Warnings:', plan.warnings);
    } catch (e: any) {
        console.error('❌ Error generated plan:', e instanceof Error ? e.message : e);
        if (e.issues) console.error('Validation Issues:', JSON.stringify(e.issues, null, 2));
    }
};

// Scenario 1: Small Local Service
runTest('Small Local Dentist', {
    vertical: 'Local Service',
    objective: 'Leads',
    budget: 800,
    currency: 'USD'
});

// Scenario 2: SaaS Scale
runTest('SaaS Platform Scale', {
    vertical: 'SaaS',
    objective: 'Leads',
    budget: 6000,
    currency: 'USD'
});

// Scenario 3: E-commerce Growth
runTest('Fashion Brand Growth', {
    vertical: 'E-commerce',
    objective: 'Sales',
    budget: 3000,
    currency: 'USD'
});
