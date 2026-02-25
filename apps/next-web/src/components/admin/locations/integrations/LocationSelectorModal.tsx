import { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    Box, 
    Typography, 
    IconButton, 
    Avatar, 
    Card, 
    ListItem, 
    ListItemText, 
    Radio, 
    Button, 
    CircularProgress,
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useTranslations } from 'next-intl';
import apiClient from '@/lib/apiClient';

interface LocationSelectorModalProps {
    open: boolean;
    pendingId: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface PendingData {
    locationId: string;
    accounts: any[];
    locations: any[];
}

export default function LocationSelectorModal({ open, pendingId, onClose, onSuccess }: LocationSelectorModalProps) {
    const t = useTranslations('locations.ReviewSources');
    const tc = useTranslations('common');

    const [loading, setLoading] = useState(true);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<PendingData | null>(null);
    const [selectedGbpName, setSelectedGbpName] = useState<string>('');

    useEffect(() => {
        if (!open || !pendingId) return;

        let isMounted = true;

        setLoading(true);
        setError(null);

        apiClient.get(`/auth/google/pending/${pendingId}`)
            .then(res => {
                if (!isMounted) return;
                setData(res.data.data);


                // Pre-select first if available
                if (res.data.data?.locations?.length > 0) {
                    setSelectedGbpName(res.data.data.locations[0].name);
                }

                setLoading(false);
            })
            .catch(err => {
                if (!isMounted) return;
                setError(err.response?.data?.message || 'Failed to load locations.');
                setLoading(false);
            });

        return () => { isMounted = false; };
    }, [open, pendingId]);

    const handleConfirm = async () => {
        if (!selectedGbpName || !data) return;

        setFinishing(true);
        setError(null);

        const gbpLocation = data.locations.find((l: any) => l.name === selectedGbpName);
        
        try {
            await apiClient.post('/auth/google/finalize', {
                pendingId,
                gbpLocationName: gbpLocation.name,
                gbpAccountId: gbpLocation.accountId,
                gbpLocationTitle: gbpLocation.title
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to connect location.');
            setFinishing(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={finishing ? undefined : onClose}
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, bgcolor: 'background.paper', backgroundImage: 'none' }
            }}
        >
            <Box sx={{ position: 'relative', p: 1 }}>
                {!finishing && (
                    <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, pb: 2 }}>
                    <Avatar sx={{ bgcolor: 'white', border: '1px solid #E0E0E0' }}>
                        <GoogleIcon sx={{ color: '#4285F4' }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">{t('selector.title')}</Typography>
                        <Typography variant="body2" color="text.secondary">{t('selector.subtitle')}</Typography>
                    </Box>
                </Box>
            </Box>

            <DialogContent sx={{ px: 4, pb: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                ) : (
                    <>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                            {t('selector.foundLocations', { count: data?.locations?.length || 0 })}
                        </Typography>

                        <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 4, pr: 1 }}>
                            {data?.locations?.map((loc: any) => (
                                <Card 
                                    key={loc.name}
                                    variant="outlined" 
                                    sx={{ 
                                        mb: 1.5, 
                                        cursor: 'pointer',
                                        border: '2px solid', 
                                        borderColor: selectedGbpName === loc.name ? 'primary.main' : 'divider',
                                        bgcolor: selectedGbpName === loc.name ? 'primary.light' : 'transparent',
                                        transition: 'all 0.2s',
                                        opacity: finishing && selectedGbpName !== loc.name ? 0.5 : 1
                                    }}
                                    onClick={() => !finishing && setSelectedGbpName(loc.name)}
                                >
                                    <ListItem sx={{ py: 1.5 }}>
                                        <Radio 
                                            checked={selectedGbpName === loc.name}
                                            color="primary"
                                        />
                                        <Avatar sx={{ bgcolor: 'background.paper', color: 'primary.main', mr: 2, border: '1px solid', borderColor: 'divider' }}>
                                            <StorefrontIcon />
                                        </Avatar>
                                        <ListItemText 
                                            primary={
                                                <Typography variant="subtitle1" fontWeight={selectedGbpName === loc.name ? 700 : 500}>
                                                    {loc.title}
                                                </Typography>
                                            }
                                            secondary={loc.storefrontAddress?.addressLines?.join(', ') || t('selector.noAddress')}
                                            secondaryTypographyProps={{ fontSize: '0.8rem', mt: 0.5 }}
                                        />
                                    </ListItem>
                                </Card>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button 
                                onClick={onClose} 
                                variant="text" 
                                color="inherit"
                                disabled={finishing}
                            >
                                {tc('cancel')}
                            </Button>
                            <Button 
                                onClick={handleConfirm} 
                                variant="contained" 
                                color="primary" 
                                size="large" 
                                disabled={!selectedGbpName || finishing}
                                startIcon={finishing ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {finishing ? t('selector.connecting') : t('selector.confirm')}
                            </Button>
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
