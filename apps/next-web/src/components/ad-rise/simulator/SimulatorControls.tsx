'use client';

import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    ToggleButton,
    ToggleButtonGroup,
    Stack,
    Paper
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useFormatter } from 'next-intl';
import * as CampaignEngine from '@platform/campaign-engine';

interface SimulatorControlsProps {
    vertical: string;
    objective: string;
    budget: number;
    onChange: (field: string, value: any) => void;
}

export const SimulatorControls = ({ vertical, objective, budget, onChange }: SimulatorControlsProps) => {
    const t = useTranslations('simulator.controls');
    const format = useFormatter();

    const handleVerticalChange = (event: any) => {
        onChange('vertical', event.target.value);
    };

    const handleObjectiveChange = (event: any, newValue: string | null) => {
        if (newValue) onChange('objective', newValue);
    };

    const handleBudgetChange = (event: Event, newValue: number | number[]) => {
        onChange('budget', newValue as number);
    };

    return (
        <Paper sx={{ p: 4, height: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                Configuration
            </Typography>

            <Stack spacing={4}>
                {/* Vertical Selection */}
                <FormControl fullWidth>
                    <InputLabel id="vertical-label">{t('vertical_label')}</InputLabel>
                    <Select
                        labelId="vertical-label"
                        value={vertical}
                        label={t('vertical_label')}
                        onChange={handleVerticalChange}
                    >
                        {['SaaS', 'E-commerce', 'Local Service', 'Restaurant', 'Healthcare'].map((v) => (
                            <MenuItem key={v} value={v}>{v}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Objective Selection */}
                <Box>
                    <Typography gutterBottom variant="subtitle2" color="text.secondary">
                        {t('objective_label')}
                    </Typography>
                    <ToggleButtonGroup
                        color="primary"
                        value={objective}
                        exclusive
                        onChange={handleObjectiveChange}
                        fullWidth
                        size="small"
                        sx={{ mt: 1 }}
                    >
                        {['Leads', 'Awareness', 'Sales', 'Local Visits'].map((obj) => (
                            <ToggleButton key={obj} value={obj}>
                                {obj}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                {/* Budget Slider */}
                <Box>
                    <Typography gutterBottom variant="subtitle2" color="text.secondary">
                        {t('budget_label')} ({format.number(budget, { style: 'currency', currency: 'USD' })})
                    </Typography>
                    <Slider
                        value={budget}
                        min={500}
                        max={20000}
                        step={100}
                        onChange={handleBudgetChange}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(val) => format.number(val, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                        sx={{ mt: 2 }}
                    />
                    <Typography variant="caption" color="text.disabled">
                        Recommended: $3k - $8k for best results
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
};
