import React from 'react';

import { Box, Tabs, Tab } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Palette as PaletteIcon,
  History as HistoryIcon,
  RecordVoiceOver as VoiceIcon
} from '@mui/icons-material';

import type { BrandProfile } from '@/services/brand-profile.service';

import BrandIdentityTab from './BrandIdentityTab';
import AuditLogTab from './AuditLogTab';
import ToneMessagingTab from './ToneMessagingTab';

interface ProfileTabsProps {
  profile: BrandProfile;
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  onCopy: (text: string) => void;
  onCopyAllColors: () => void;
  onUpdateProfile: (data: any) => Promise<void>;
  isUpdating?: boolean;
  auditLogs: any[];
  isLoadingLogs?: boolean;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  profile,
  activeTab,
  onTabChange,
  onCopy,
  onCopyAllColors,
  onUpdateProfile,
  isUpdating,
  auditLogs,
  isLoadingLogs
}) => {
  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={onTabChange}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              px: 4,
              minHeight: 64,
              fontSize: '0.95rem',
              color: 'text.secondary',
              transition: 'all 0.2s',
              '&.Mui-selected': {
                color: 'primary.main',
              },
              '&:hover': {
                color: 'primary.main',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            }
          }}
        >
          <Tab label="Brand Identity" icon={<PaletteIcon />} iconPosition="start" />
          <Tab label="Tone & Messaging" icon={<VoiceIcon />} iconPosition="start" />
          <Tab label="Activity History" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <BrandIdentityTab
          profile={profile}
          onCopy={onCopy}
          onCopyAllColors={onCopyAllColors}
          onUpdate={onUpdateProfile}
          isUpdating={isUpdating}
        />
      )}
      {activeTab === 1 && (
        <ToneMessagingTab
          profile={profile}
          onUpdate={onUpdateProfile}
          isUpdating={isUpdating}
        />
      )}
      {activeTab === 2 && (
        <AuditLogTab
          logs={auditLogs}
          isLoading={isLoadingLogs}
        />
      )}
    </Box>
  );
};

export default ProfileTabs;
