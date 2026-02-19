
import GoogleIcon from '@mui/icons-material/Google';
import StarIcon from '@mui/icons-material/Star';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

// Actually, circular dependency if I import from Dashboard. I should create a types file or define interface locally.
// Let's define locally or shared.

interface ConnectSourceCardProps {
    source: {
        id: string;
        platform: string;
        status: string;
        locationId: string;
    };
    onDisconnect: (id: string) => void;
    onConfigure?: (id: string) => void;
}

const ConnectedSourceCard = ({ source, onDisconnect, onConfigure }: ConnectSourceCardProps) => {
    const t = useTranslations('locations.ReviewSources');
    const tc = useTranslations('common');
    const isGoogle = source.platform === 'google';
    const Icon = isGoogle ? GoogleIcon : StarIcon;
    const iconColor = isGoogle ? 'info' : 'error';
    const name = isGoogle ? t('googleBusiness') : t('yelp');

    return (
        <Card sx={{ mb: 2, border: '1px solid', borderColor: 'success.main', bgcolor: 'background.paper' }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Icon color={iconColor as any} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="success.main">{'●'} {tc('status.active')}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">{t('syncHealthy')}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="inherit" onClick={() => onConfigure && onConfigure(source.id)}>{t('configure')}</Button>
                    <Button variant="outlined" color="error" onClick={() => onDisconnect(source.id)}>{t('disconnect')}</Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ConnectedSourceCard;
