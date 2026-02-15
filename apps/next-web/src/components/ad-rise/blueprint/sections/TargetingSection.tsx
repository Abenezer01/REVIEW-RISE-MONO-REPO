import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import type { BlueprintInput } from '@platform/contracts';

export interface TargetingSectionProps {
    formData: BlueprintInput;
    setFormData: (data: BlueprintInput | ((prev: BlueprintInput) => BlueprintInput)) => void;
    painPointInput: string;
    setPainPointInput: (value: string) => void;
    onAddPainPoint: () => void;
    onRemovePainPoint: (index: number) => void;
    t: (key: string) => string;
}

export function TargetingSection({
    formData,
    setFormData,
    painPointInput,
    setPainPointInput,
    onAddPainPoint,
    onRemovePainPoint,
    t
}: TargetingSectionProps) {
    return (
        <Paper
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 3,
                mb: 3
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                {t('form.targetingKeywords')}
            </Typography>

            {/* Geographic Targeting */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Geographic Location
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    Enter your primary target location (e.g., "Austin, TX" or "United States")
                </Typography>
                <TextField
                    fullWidth
                    placeholder="e.g., Austin, TX or United States"
                    value={formData.geo}
                    onChange={(e) => setFormData({ ...formData, geo: e.target.value })}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.default'
                        }
                    }}
                />
            </Box>

            {/* Customer Pain Points */}
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('form.painPoints')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    {t('form.painPointsHelp')}
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={t('form.painPointsPlaceholder')}
                    value={painPointInput}
                    onChange={(e) => setPainPointInput(e.target.value)}
                    sx={{
                        mb: 1.5,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.default'
                        }
                    }}
                />
                <Button
                    variant="outlined"
                    onClick={onAddPainPoint}
                    disabled={!painPointInput.trim()}
                    fullWidth
                >
                    {t('form.addPainPoint')}
                </Button>
                {formData.painPoints && formData.painPoints.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                        {formData.painPoints.map((pp, i) => (
                            <Chip
                                key={i}
                                label={pp}
                                onDelete={() => onRemovePainPoint(i)}
                                color="secondary"
                            />
                        ))}
                    </Stack>
                )}
            </Box>
        </Paper>
    );
}
