import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

// Note: If GoogleIcon is not available in mui/icons-material, use a custom SVG or just 'G' text. 
// Assuming it exists or I'll use a placeholder.

interface ConnectGoogleModalProps {
    open: boolean;
    onClose: () => void;
    onConnect: () => void;
}

const ConnectGoogleModal = ({ open, onClose, onConnect }: ConnectGoogleModalProps) => {
    const t = useTranslations('locations.ReviewSources.googleModal');
    const tc = useTranslations('common');

    // Hardcoded steps for display matching Image 0
    const steps = [
        { id: 1, title: t('step1Title'), description: t('step1Desc') },
        { id: 2, title: t('step2Title'), description: t('step2Desc') },
        { id: 3, title: t('step3Title'), description: t('step3Desc') }
    ];

    const permissions = [
        t('permission1'),
        t('permission2'),
        t('permission3')
    ];

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { 
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    backgroundImage: 'none' // Remove default elevation gradient
                }
            }}
        >
             <Box sx={{ position: 'relative', p: 1 }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, pb: 2 }}>
                    <Avatar sx={{ bgcolor: 'white', border: '1px solid #E0E0E0' }}>
                        <GoogleIcon sx={{ color: '#4285F4' }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">{t('title')}</Typography>
                        <Typography variant="body2" color="text.secondary">{t('subtitle')}</Typography>
                    </Box>
                </Box>
            </Box>

            <DialogContent sx={{ px: 4, pb: 4 }}>
                {/* Steps Section */}
                <Box sx={{ mb: 4 }}>
                     {steps.map((step) => (
                         <Box key={step.id} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                             <Avatar 
                                sx={{ 
                                    bgcolor: 'warning.main', // Using warning logic matching Image 0 orange/gold
                                    color: 'white',
                                    width: 32, 
                                    height: 32,
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {step.id}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">{step.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{step.description}</Typography>
                            </Box>
                         </Box>
                     ))}
                </Box>

                {/* Permissions Section */}
                <Card variant="outlined" sx={{ p: 2.5, mb: 4, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                         {/* Purple shield icon substitute */}
                         <CheckCircleIcon color="secondary" /> 
                         <Typography variant="h6">{t('permissionsTitle')}</Typography>
                     </Box>
                     {permissions.map((perm, idx) => (
                         <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                             <CheckCircleIcon color="success" fontSize="small" />
                             <Typography variant="body2">{perm}</Typography>
                         </Box>
                     ))}
                </Card>

                 <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">{t('secure')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={onClose} variant="text" color="inherit">{tc('common.cancel')}</Button>
                        <Button onClick={onConnect} variant="contained" color="primary" size="large" sx={{ fontWeight: 'bold' }}>
                            {t('connectBtn')}
                        </Button>
                    </Box>
                 </Box>

            </DialogContent>
        </Dialog>
    );
};

export default ConnectGoogleModal;
