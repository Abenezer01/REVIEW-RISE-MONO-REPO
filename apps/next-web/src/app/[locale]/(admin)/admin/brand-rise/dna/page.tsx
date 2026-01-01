'use client';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useBusinessId } from '@/hooks/useBusinessId';
import type { BrandDNA } from '@/services/brand.service';
import { BrandService } from '@/services/brand.service';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

const BrandDnaPage = () => {
  const t = useTranslations('dashboard');
  const { businessId } = useBusinessId();
  const [loading, setLoading] = useState(false);
  const [dna, setDna] = useState<BrandDNA | null>(null);

  useEffect(() => {
    const fetchDNA = async () => {
        if (!businessId) return;
        setLoading(true);
    
        try {
            const data = await BrandService.getDNA(businessId);
    
            setDna(data);
        } catch (error) {
            console.error('Failed to fetch DNA', error);
        } finally {
            setLoading(false);
        }
      };

    if (businessId) {
        fetchDNA();
    }
  }, [businessId]);

  const toneKeywords = dna?.values || [
    'Confident', 'Approachable', 'Clear',
    'Innovative', 'Supportive', 'Authentic',
    'Professional', 'Empowering', 'Trustworthy'
  ];

  const keyMessages = [
    dna?.mission || 'Empowering businesses with intelligent technology solutions',
    'Simplifying complexity without compromising power',
    'Your growth partner, not just a software provider',
    'Innovation meets reliability in every solution',
    'Customer success is our success'
  ];

  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress />
        </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold">{t('brandRise.dna.summary')}</Typography>
        <Typography variant="body1" color="text.secondary">Your brand&apos;s core identity, voice, and messaging guidelines at a glance</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Brand Voice */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Icon icon="tabler-microphone" fontSize={24} style={{ color: '#7367F0' }} />
                <Typography variant="h6">{t('brandRise.dna.voice')}</Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                {dna?.voice || 'Professional yet approachable. We communicate with clarity and confidence, making complex technology accessible to everyone. Our tone is friendly, knowledgeable, and empowering.'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We avoid jargon and speak directly to our customers&apos; needs, always maintaining authenticity and transparency in our communications.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Target Audience */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Icon icon="tabler-users" fontSize={24} style={{ color: '#28C76F' }} />
                <Typography variant="h6">{t('brandRise.dna.audience')}</Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {dna?.audience || 'Small to medium-sized businesses looking to streamline their operations and scale efficiently. Decision-makers who value innovation, reliability, and exceptional customer support.'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['SMB Owners', 'Tech Managers', 'Entrepreneurs'].map((tag) => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    sx={{ 
                      bgcolor: '#E8EAF6', 
                      color: '#7367F0',
                      fontWeight: 500
                    }} 
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Messages */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Icon icon="tabler-speakerphone" fontSize={24} style={{ color: '#FF9F43' }} />
                <Typography variant="h6">{t('brandRise.dna.messages')}</Typography>
              </Box>
              <List disablePadding>
                {keyMessages.map((msg, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1.5, alignItems: 'flex-start' }}>
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        bgcolor: '#7367F0', 
                        mt: 1, 
                        mr: 1.5,
                        flexShrink: 0
                      }} 
                    />
                    <ListItemText 
                      primary={msg} 
                      primaryTypographyProps={{ variant: 'body1', color: 'text.secondary' }} 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Tone Keywords */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Icon icon="tabler-palette" fontSize={24} style={{ color: '#7367F0' }} />
                <Typography variant="h6">Tone Keywords</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {toneKeywords.map((keyword) => (
                  <Chip 
                    key={keyword} 
                    label={keyword} 
                    sx={{ 
                      bgcolor: 'action.hover', 
                      color: 'text.primary',
                      fontWeight: 500,
                      borderRadius: 1
                    }} 
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Need More Details Footer */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ py: 4 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Need More Details?</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Access the complete Brand DNA document with detailed guidelines, examples, and best practices
              </Typography>
              <Button 
                variant="contained" 
                endIcon={<Icon icon="tabler-arrow-right" />}
                sx={{ 
                  bgcolor: '#7367F0', 
                  '&:hover': { bgcolor: '#665BE0' },
                  px: 4,
                  py: 1.5
                }}
              >
                {t('brandRise.dna.viewFull')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BrandDnaPage;
