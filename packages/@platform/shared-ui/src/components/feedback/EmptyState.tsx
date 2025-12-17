import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/* 
  Simple EmptyState. 
  Can be enhanced with illustrations later.
*/

interface EmptyStateProps {
    title?: string;
    description?: string;
}

const EmptyState = ({ title = 'No Data Found', description = 'There is no data available to display.' }: EmptyStateProps) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 5, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
        </Box>
    );
};

export default EmptyState;
