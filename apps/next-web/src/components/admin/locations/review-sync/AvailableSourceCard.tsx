
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import StarIcon from '@mui/icons-material/Star';

interface AvailableSourceCardProps {
    platform: 'facebook' | 'trustpilot' | 'yelp';
    onConnect?: () => void;
    disabled?: boolean;
}

const AvailableSourceCard = ({ platform, onConnect, disabled }: AvailableSourceCardProps) => {
    const isFacebook = platform === 'facebook';
    const isTrustpilot = platform === 'trustpilot';
    const isYelp = platform === 'yelp';

    let Icon = StarIcon;
    let iconColor = 'error';
    let name = '';
    let description = '';

    if (isFacebook) {
        Icon = FacebookIcon;
        iconColor = 'primary';
        name = 'Facebook Reviews';
        description = 'Sync reviews from Facebook Business Pages';
    } else if (isTrustpilot) {
        Icon = StarIcon;
        iconColor = 'success';
        name = 'Trustpilot';
        description = 'Import reviews from Trustpilot';
    } else if (isYelp) {
        Icon = StarIcon;
        iconColor = 'error';
        name = 'Yelp Business';
        description = 'Sync reviews from Yelp';
    }

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ p: 1 }}>
                        <Icon fontSize="large" color={iconColor as any} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{name}</Typography>
                        <Typography variant="caption" color="text.secondary">{description}</Typography>
                    </Box>
                </Box>
                <Button 
                    variant="contained" 
                    color={disabled ? "inherit" : "warning"} 
                    disabled={disabled} 
                    onClick={onConnect}
                    startIcon={disabled ? <Typography variant="caption">Coming Soon</Typography> : undefined}
                >
                    Connect
                </Button>
            </CardContent>
        </Card>
    );
};

export default AvailableSourceCard;
