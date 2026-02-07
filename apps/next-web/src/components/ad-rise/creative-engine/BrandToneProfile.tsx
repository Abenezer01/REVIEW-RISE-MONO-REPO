import { Box, Typography, Grid, Paper, TextField, useTheme } from '@mui/material';
import { SentimentSatisfiedAlt, BusinessCenter, Diamond, Bolt } from '@mui/icons-material';

interface BrandToneProfileProps {
    value: any;
    onChange: (value: any) => void;
}

const TONE_OPTIONS = [
    { value: 'Friendly', label: 'Friendly', Icon: SentimentSatisfiedAlt, description: 'Warm, approachable, conversational' },
    { value: 'Professional', label: 'Professional', Icon: BusinessCenter, description: 'Formal, authoritative, expert' },
    { value: 'Luxury', label: 'Luxury', Icon: Diamond, description: 'Premium, sophisticated, exclusive' },
    { value: 'Urgent', label: 'Urgent', Icon: Bolt, description: 'Time-sensitive, action-driven' },
];

export default function BrandToneProfile({ value, onChange }: BrandToneProfileProps) {
    const handleChangeTone = (toneType: string) => {
        onChange({ ...value, toneType });
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Brand Tone Profile
            </Typography>
            
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Select Tone
            </Typography>
            
            <Grid container spacing={2}>
                {TONE_OPTIONS.map((option) => {
                    const isSelected = value.toneType === option.value;
                    const Icon = option.Icon;
                    
                    return (
                        <Grid size={{ xs: 6, sm: 3 }} key={option.value}>
                            <Paper
                                onClick={() => handleChangeTone(option.value)}
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    border: '2px solid',
                                    borderColor: isSelected ? 'primary.main' : 'divider',
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    '&:hover': {
                                        borderColor: isSelected ? 'primary.main' : 'primary.light',
                                        bgcolor: 'action.hover',
                                        transform: 'translateY(-2px)'
                                    },
                                    bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                                    color: isSelected ? 'primary.main' : 'text.primary'
                                }}
                            >
                                <Icon sx={{ fontSize: 32, mb: 1.5, color: isSelected ? 'primary.main' : 'text.secondary' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>{option.label}</Typography>
                                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.3, color: 'text.secondary' }}>
                                    {option.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Word Preferences */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Preferred Words (comma separated)</Typography>
                     <TextField 
                        fullWidth 
                        placeholder="e.g. eco-friendly, natural, safe"
                        value={value.preferredWords?.join(', ') || ''}
                        onChange={(e) => onChange({ ...value, preferredWords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Banned Phrases (comma separated)</Typography>
                     <TextField 
                        fullWidth 
                        placeholder="e.g. cheap, toxic"
                        value={value.bannedPhrases?.join(', ') || ''}
                        onChange={(e) => onChange({ ...value, bannedPhrases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}