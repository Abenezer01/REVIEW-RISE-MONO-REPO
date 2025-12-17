import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingSpinnerProps {
    size?: number;
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
}

const LoadingSpinner = ({ size = 40, color = 'primary' }: LoadingSpinnerProps) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
            <CircularProgress size={size} color={color} />
        </Box>
    );
};

export default LoadingSpinner;
