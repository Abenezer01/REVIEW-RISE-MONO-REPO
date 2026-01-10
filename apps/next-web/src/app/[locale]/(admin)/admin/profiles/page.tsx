/* eslint-disable import/no-unresolved */
'use client';

import { useState } from 'react';

import { Box, Tabs, Tab, Typography, Paper, Container, Stack } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { 
  Dashboard as DashboardIcon, 
  AddCircleOutline as AddIcon,
  Business as BusinessIcon 
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';

import WebsiteConnectWizard from './WebsiteConnectWizard';
import BrandProfilesList from './BrandProfilesList';

const Profiles = () => {
  const t = useTranslations('BrandProfiles');
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleWizardSuccess = () => {
    // Refresh the list and switch to "All Profiles" tab
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab(0);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'flex',
            }}
          >
            <BusinessIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h3" fontWeight="900" letterSpacing="-0.02em">
              {t('title') || 'Brand Profiles'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('description') || 'Manage and extract visual identities from brand websites.'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Main Content Area */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ 
              px: 3,
              '& .MuiTab-root': { 
                py: 2.5, 
                minHeight: 72,
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              }
            }}
          >
            <Tab 
              icon={<DashboardIcon sx={{ mr: 1 }} />} 
              iconPosition="start" 
              label={t('tabs.allProfiles')} 
            />
            <Tab 
              icon={<AddIcon sx={{ mr: 1 }} />} 
              iconPosition="start" 
              label={t('tabs.addNew')} 
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 0 }}>
          {activeTab === 0 && (
            <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
              <BrandProfilesList refreshTrigger={refreshTrigger} />
            </Box>
          )}
          {activeTab === 1 && (
            <Box sx={{ p: { xs: 3, md: 6 }, width: '100%', animation: 'fadeIn 0.3s ease-in-out' }}>
              <WebsiteConnectWizard onSuccess={handleWizardSuccess} />
            </Box>
          )}
        </Box>
      </Paper>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Container>
  );
};

export default Profiles;
