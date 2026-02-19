'use client';

import { useState, useEffect } from 'react';

import { Box, Grid } from '@mui/material';
import type { CampaignInput, CampaignPlan } from '@platform/campaign-engine';
import { generateCampaignPlan } from '@platform/campaign-engine';

import { SimulatorControls } from './SimulatorControls';
import { SimulatorResults } from './SimulatorResults';

export const CampaignSimulator = () => {
    const [input, setInput] = useState<any>({
        vertical: 'SaaS',
        objective: 'Leads',
        budget: 5000,
        currency: 'USD'
    });

    const [plan, setPlan] = useState<CampaignPlan | null>(null);

    // Calculate plan whenever input changes
    useEffect(() => {
        try {
            const newPlan = generateCampaignPlan(input as CampaignInput);

            setPlan(newPlan);
        } catch (error) {
            console.error("Plan generation failed", error);
        }
    }, [input]);

    const handleInputChange = (field: string, value: any) => {
        setInput((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Box sx={{ flexGrow: 1, height: '100%', py: 2 }}>
            <Grid container spacing={3} sx={{ height: '100%' }}>
                {/* Left Panel: Controls */}
                <Grid size={{md:4,xs:12}} sx={{ height: '100%' }}>
                    <SimulatorControls
                        vertical={input.vertical}
                        objective={input.objective}
                        budget={input.budget}
                        onChange={handleInputChange}
                    />
                </Grid>

                {/* Right Panel: Results */}
                <Grid size={{xs:12,md:8}} sx={{ height: '100%' }}>
                    {plan && <SimulatorResults plan={plan} />}
                </Grid>
            </Grid>
        </Box>
    );
};
