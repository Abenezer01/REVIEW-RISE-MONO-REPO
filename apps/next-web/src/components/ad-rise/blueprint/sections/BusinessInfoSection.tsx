import { Box, Button, Chip, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import type { BlueprintInput } from '@platform/contracts';
import VerticalSelection from '@/components/ad-rise/shared/VerticalSelection';

export interface BusinessInfoSectionProps {
    formData: BlueprintInput;
    setFormData: (data: BlueprintInput | ((prev: BlueprintInput) => BlueprintInput)) => void;
    serviceInput: string;
    setServiceInput: (value: string) => void;
    onAddService: () => void;
    onRemoveService: (index: number) => void;
    t: (key: string) => string;
}

export function BusinessInfoSection({
    formData,
    setFormData,
    serviceInput,
    setServiceInput,
    onAddService,
    onRemoveService,
    t
}: BusinessInfoSectionProps) {
    return (
        <Paper
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 3,
                mb: 3
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('form.businessInfo')}
                </Typography>
                <Chip label={t('form.required')} color="primary" size="small" />
            </Stack>

            {/* Business Name */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Business Name
                </Typography>
                <TextField
                    fullWidth
                    placeholder="e.g., Austin Plumbing Pros"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.default'
                        }
                    }}
                />
            </Box>

            {/* Services */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Services Offered
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    Add the main services you provide (e.g., Plumbing, Water Heater Repair)
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter a service"
                        value={serviceInput}
                        onChange={(e) => setServiceInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddService())}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.default'
                            }
                        }}
                    />
                    <Button
                        variant="outlined"
                        onClick={onAddService}
                        disabled={!serviceInput.trim()}
                        sx={{ minWidth: 80 }}
                    >
                        Add
                    </Button>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {formData.services.map((service, i) => (
                        <Chip
                            key={i}
                            label={service}
                            onDelete={() => onRemoveService(i)}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '& .MuiChip-deleteIcon': {
                                    color: 'primary.contrastText'
                                }
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Offer */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Special Offer or Promotion
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    What makes your offer compelling? (e.g., "10% Off First Service")
                </Typography>
                <TextField
                    fullWidth
                    placeholder="e.g., Free Consultation, 10% Off"
                    value={formData.offer}
                    onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.default'
                        }
                    }}
                />
            </Box>

            {/* Budget & Objective Row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Monthly Budget ($)
                    </Typography>
                    <TextField
                        fullWidth
                        type="number"
                        placeholder="3000"
                        value={formData.budget || ''}
                        onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.default'
                            }
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Campaign Objective
                    </Typography>
                    <TextField
                        fullWidth
                        select
                        value={formData.objective}
                        onChange={(e) => setFormData({ ...formData, objective: e.target.value as any })}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.default'
                            }
                        }}
                        SelectProps={{ native: true }}
                    >
                        <option value="Leads">Leads</option>
                        <option value="Sales">Sales</option>
                        <option value="Awareness">Awareness</option>
                        <option value="Local Visits">Local Visits</option>
                    </TextField>
                </Grid>
            </Grid>

            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {t('form.industryVertical')}
                </Typography>
                <VerticalSelection
                    value={formData.vertical as any}
                    onChange={(v) => setFormData({ ...formData, vertical: v as any })}
                    tPrefix="form.verticals"
                />
            </Box>
        </Paper>
    );
}
