import { 
    Box, 
    Typography, 
    LinearProgress,
    Stack,
    Paper,
    alpha
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export const DiscoveryProgress = () => {
    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: 3, 
                bgcolor: alpha('#9E69FD', 0.08), 
                borderRadius: 3,
                mb: 4
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white' }}>
                    Discovery in Progress
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#9E69FD' }}>
                    Analyzing SERP data...
                </Typography>
            </Box>

            <LinearProgress 
                variant="determinate" 
                value={60} 
                sx={{ 
                    height: 8, 
                    borderRadius: 4, 
                    bgcolor: alpha('#9E69FD', 0.2),
                    mb: 3,
                    '& .MuiLinearProgress-bar': {
                        bgcolor: '#9E69FD'
                    }
                }} 
            />

            <Stack direction="row" justifyContent="space-between">
                <Step label="Keywords analyzed" completed />
                <Step label="Domains extracted" completed />
                <Step label="Classifying competitors" active />
                <Step label="Ranking results" />
            </Stack>
        </Paper>
    );
};

const Step = ({ label, completed, active }: { label: string; completed?: boolean; active?: boolean }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {completed ? (
                <Box sx={{ 
                    bgcolor: '#28C76F', 
                    borderRadius: 1, 
                    width: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <CheckBoxIcon sx={{ color: 'white', fontSize: 18 }} />
                </Box>
            ) : active ? (
                <CircularProgress size={20} sx={{ color: '#28C76F' }} />
            ) : (
                <Box sx={{ 
                    bgcolor: '#28C76F', 
                    borderRadius: 1, 
                    width: 24, 
                    height: 24,
                    opacity: 0.5
                }} />
            )}
            <Typography 
                variant="caption" 
                sx={{ 
                    color: completed || active ? 'white' : 'text.disabled',
                    fontWeight: 500
                }}
            >
                {label}
            </Typography>
        </Box>
    );
};