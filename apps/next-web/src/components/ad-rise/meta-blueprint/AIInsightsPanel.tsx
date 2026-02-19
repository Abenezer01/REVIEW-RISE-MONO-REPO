import { alpha, Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { MetaBlueprintAIInsights } from '@platform/contracts';

const PRIORITY_CONFIG = {
    high: { color: 'error', icon: <WarningAmberIcon fontSize="small" />, label: 'High Priority' },
    medium: { color: 'warning', icon: <TipsAndUpdatesIcon fontSize="small" />, label: 'Consider' },
    low: { color: 'info', icon: <CheckCircleOutlineIcon fontSize="small" />, label: 'Nice to Have' },
} as const;

interface Props {
    insights: MetaBlueprintAIInsights;
}

export default function AIInsightsPanel({ insights }: Props) {
    const scoreColor =
        (insights.overallScore ?? 0) >= 90 ? 'success' :
            (insights.overallScore ?? 0) >= 70 ? 'warning' : 'error';

    return (
        <Stack spacing={3}>
            {/* Header + Score */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon color="primary" fontSize="small" />
                    <Typography variant="h6" fontWeight="bold">AI Analysis</Typography>
                    <Chip label="Gemini-Powered" size="small" color="primary" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                </Box>
                {insights.overallScore !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">Agency Readiness</Typography>
                        <Chip
                            label={`${insights.overallScore}/100`}
                            color={scoreColor}
                            size="small"
                            sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                        />
                    </Box>
                )}
            </Box>
            {insights.scoreSummary && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
                    {insights.scoreSummary}
                </Typography>
            )}

            {/* Potential Optimizations */}
            {insights.optimizations.length > 0 && (
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        ⚠️ Potential Optimizations
                    </Typography>
                    <Stack spacing={1.5}>
                        {insights.optimizations.map((opt, i) => {
                            const cfg = PRIORITY_CONFIG[opt.priority] ?? PRIORITY_CONFIG.medium;
                            return (
                                <Paper
                                    key={i}
                                    variant="outlined"
                                    sx={(theme) => ({
                                        p: 2,
                                        borderColor: alpha(theme.palette[cfg.color as 'error'].main, 0.3),
                                        bgcolor: alpha(theme.palette[cfg.color as 'error'].main, 0.04),
                                        borderRadius: 2,
                                    })}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                        <Box sx={{ color: `${cfg.color}.main`, pt: 0.2 }}>{cfg.icon}</Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                                <Typography variant="body2" fontWeight="bold">{opt.title}</Typography>
                                                <Chip label={cfg.label} color={cfg.color as any} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">{opt.detail}</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Stack>
                </Box>
            )}

            {/* Key Takeaways */}
            {insights.takeaways.length > 0 && (
                <Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
                        🔥 Key Takeaways
                    </Typography>
                    <Stack spacing={1}>
                        {insights.takeaways.map((t, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mt: 0.15, flexShrink: 0 }} />
                                <Typography variant="body2" color="text.secondary">{t}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}
        </Stack>
    );
}
