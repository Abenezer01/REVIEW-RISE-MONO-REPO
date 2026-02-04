'use client';

import { useState } from 'react';

import { useParams, usePathname, useRouter } from 'next/navigation';

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';


const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number;[key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

const BrandingRiseLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();
  const t = useTranslations('dashboard');

  // Determine active tab based on path
  const getValue = () => {
    if (pathname.includes('/visibility')) return 'visibility';
    if (pathname.includes('/recommendations')) return 'recommendations';
    if (pathname.includes('/competitors')) return 'competitors';
    if (pathname.includes('/reports')) return 'reports';
    if (pathname.includes('/reviews')) return 'reviews';
    if (pathname.includes('/dna')) return 'dna';

    return 'overview';
  };

  const [value, setValue] = useState(getValue());
  const [dateRange, setDateRange] = useState('30d');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(`/${locale}/admin/brand-rise/${newValue}`);
  };

  const isContentTemplates = pathname.includes('/content-templates');
  const isSeasonalEvents = pathname.includes('/seasonal-events');

  if (isContentTemplates || isSeasonalEvents) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      {/* Header with Title and Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">{t('navigation.brand-rise')}</Typography>
          <Typography variant="body1" color="text.secondary">{t('brandRise.subtitle')}</Typography>
        </Box>

        {/* Controls: Company Dropdown & Date Range */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Company Selector (Mock) */}
          <Button
            variant="outlined"
            endIcon={<Icon icon="tabler-chevron-down" />}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderColor: 'divider',
              textTransform: 'none',
              minWidth: 160,
              justifyContent: 'space-between'
            }}
          >
            {t('accounts.accountDialog.fields.namePlaceholder')}
          </Button>

          {/* Date Range Toggles */}
          <ButtonGroup variant="outlined" aria-label={t('overview.dateRange')} sx={{ bgcolor: 'background.paper' }}>
            {['7d', '30d', '90d'].map((range) => (
              <Button
                key={range}
                onClick={() => setDateRange(range)}
                sx={{
                  textTransform: 'none',
                  color: dateRange === range ? 'white' : 'text.secondary',
                  bgcolor: dateRange === range ? 'primary.main' : 'transparent',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: dateRange === range ? 'primary.dark' : 'action.hover',
                  }
                }}
              >
                {range}
              </Button>
            ))}
          </ButtonGroup>

          {/* User Profile Avatar (Mock) */}
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <Box sx={{ width: '100%', height: '100%' }} />
          </Avatar>
        </Box>
      </Box>

      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <TabList onChange={handleChange} aria-label={t('navigation.brand-rise')}>
            <Tab label={t('brandRise.tabs.overview')} value="overview" />
            <Tab label={t('brandRise.tabs.recommendations')} value="recommendations" />
            <Tab label={t('brandRise.tabs.visibility')} value="visibility" />
            <Tab label={t('brandRise.tabs.dna')} value="dna" />
            <Tab label={t('brandRise.tabs.competitors')} value="competitors" />
            <Tab label={t('brandRise.tabs.reviews')} value="reviews" />
            <Tab label={t('brandRise.tabs.reports')} value="reports" />
          </TabList>
        </Box>
        {children}
      </TabContext>
    </Box>
  );
};

export default BrandingRiseLayout;
