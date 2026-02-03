/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Grid,
  Chip,
  TextField,
  IconButton,
  CircularProgress,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import {
  AutoAwesome as MagicIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

import { SystemMessageCode } from '@platform/contracts';

import { useSystemMessages } from '@/shared/components/SystemMessageProvider';

import { BrandProfileService } from '@/services/brand-profile.service';
import type { BrandProfile } from '@/services/brand-profile.service';

interface ToneMessagingTabProps {
  profile: BrandProfile;
  onUpdate: (data: any) => Promise<void>;
  isUpdating?: boolean;
}

const ToneMessagingTab: React.FC<ToneMessagingTabProps> = ({ profile, onUpdate, isUpdating }) => {
  const t = useTranslations('BrandProfiles.tone');
  const { notify } = useSystemMessages();
  const theme = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  const [editedTone, setEditedTone] = useState(profile.tone || {
    descriptors: [],
    writingRules: { do: [], dont: [] },
    taglines: [],
    messagingPillars: []
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const newTone = await BrandProfileService.generateBrandTone(profile.id);
      
      setEditedTone(newTone);
      notify(SystemMessageCode.BRAND_TONE_GENERATED);
      await onUpdate({ tone: newTone });
    } catch (error) {
      notify(SystemMessageCode.GENERIC_ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSection = async (section: string) => {
    try {
      await onUpdate({ tone: editedTone });
      setEditingSection(null);
      notify(SystemMessageCode.SUCCESS);
    } catch (error) {
      notify(SystemMessageCode.GENERIC_ERROR);
    }
  };

  const handleCancelEdit = () => {
    setEditedTone(profile.tone || editedTone);
    setEditingSection(null);
  };

  const updateToneField = (field: string, value: any) => {
    setEditedTone(prev => ({ ...prev, [field]: value }));
  };

  const renderSectionHeader = (title: string, sectionId: string) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="h6" fontWeight="700">{title}</Typography>
      {editingSection === sectionId ? (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={handleCancelEdit} color="error">
            <CloseIcon />
          </IconButton>
          <IconButton size="small" onClick={() => handleSaveSection(sectionId)} color="primary" disabled={isUpdating}>
            {isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
          </IconButton>
        </Stack>
      ) : (
        <IconButton size="small" onClick={() => setEditingSection(sectionId)}>
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Stack>
  );

  if (!profile.tone && !isGenerating) {
    return (
      <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 4, borderStyle: 'dashed' }}>
        <MagicIcon sx={{ fontSize: 64, color: 'primary.main', mb: 3, opacity: 0.5 }} />
        <Typography variant="h5" fontWeight="700" gutterBottom>{t('generateTitle')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          {t('generateDesc')}
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<MagicIcon />} 
          onClick={handleGenerate}
          sx={{ borderRadius: 3, px: 4, py: 1.5 }}
        >
          {t('generateBtn')}
        </Button>
      </Paper>
    );
  }

  return (
    <Stack spacing={4}>
      <Grid container spacing={4}>
        {/* Left Column: Tone & Rules */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={4}>
            {/* Tone Descriptors */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                {renderSectionHeader(t('voiceTitle'), 'descriptors')}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {editingSection === 'descriptors' ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      variant="outlined"
                      placeholder={t('voicePlaceholder')}
                      value={editedTone.descriptors.join(', ')}
                      onChange={(e) => updateToneField('descriptors', e.target.value.split(',').map(s => s.trim()))}
                    />
                  ) : (
                    editedTone.descriptors.map((d, i) => (
                      <Chip 
                        key={i} 
                        label={d} 
                        variant="tonal" 
                        color="primary" 
                        sx={{ fontWeight: 600, borderRadius: 2 }} 
                      />
                    ))
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Writing Rules */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                {renderSectionHeader(t('rulesTitle'), 'writingRules')}
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" fontWeight="700" color="success.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon fontSize="small" /> {t('do')}
                    </Typography>
                    <Stack spacing={1}>
                      {editingSection === 'writingRules' ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          variant="outlined"
                          value={editedTone.writingRules.do.join('\n')}
                          onChange={(e) => updateToneField('writingRules', { ...editedTone.writingRules, do: e.target.value.split('\n') })}
                        />
                      ) : (
                        editedTone.writingRules.do.map((rule, i) => (
                          <Typography key={i} variant="body2" color="text.secondary">• {rule}</Typography>
                        ))
                      )}
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" fontWeight="700" color="error.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CloseIcon fontSize="small" /> {t('dont')}
                    </Typography>
                    <Stack spacing={1}>
                      {editingSection === 'writingRules' ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          variant="outlined"
                          value={editedTone.writingRules.dont.join('\n')}
                          onChange={(e) => updateToneField('writingRules', { ...editedTone.writingRules, dont: e.target.value.split('\n') })}
                        />
                      ) : (
                        editedTone.writingRules.dont.map((rule, i) => (
                          <Typography key={i} variant="body2" color="text.secondary">• {rule}</Typography>
                        ))
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Messaging Pillars */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                {renderSectionHeader(t('pillarsTitle'), 'messagingPillars')}
                <Stack spacing={3}>
                  {editingSection === 'messagingPillars' ? (
                    editedTone.messagingPillars.map((pillar, i) => (
                      <Box key={i} sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                        <TextField
                          fullWidth
                          label={t('pillarLabel')}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          value={pillar.pillar}
                          onChange={(e) => {
                            const newPillars = [...editedTone.messagingPillars];

                            newPillars[i] = { ...pillar, pillar: e.target.value };
                            updateToneField('messagingPillars', newPillars);
                          }}
                        />
                        <TextField
                          fullWidth
                          label={t('descriptionLabel')}
                          variant="outlined"
                          size="small"
                          multiline
                          rows={2}
                          sx={{ mb: 2 }}
                          value={pillar.description}
                          onChange={(e) => {
                            const newPillars = [...editedTone.messagingPillars];

                            newPillars[i] = { ...pillar, description: e.target.value };
                            updateToneField('messagingPillars', newPillars);
                          }}
                        />
                        <TextField
                          fullWidth
                          label={t('ctasLabel')}
                          variant="outlined"
                          size="small"
                          value={pillar.ctas.join(', ')}
                          onChange={(e) => {
                            const newPillars = [...editedTone.messagingPillars];

                            newPillars[i] = { ...pillar, ctas: e.target.value.split(',').map(s => s.trim()) };
                            updateToneField('messagingPillars', newPillars);
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    editedTone.messagingPillars.map((pillar, i) => (
                      <Box key={i} sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                        <Typography variant="subtitle1" fontWeight="700" gutterBottom>{pillar.pillar}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{pillar.description}</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {pillar.ctas.map((cta, ci) => (
                            <Chip key={ci} label={cta} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                          ))}
                        </Box>
                      </Box>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Taglines & Actions */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={4}>
            {/* Taglines */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                {renderSectionHeader(t('taglinesTitle'), 'taglines')}
                <Stack spacing={1.5}>
                  {editingSection === 'taglines' ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      variant="outlined"
                      value={editedTone.taglines.join('\n')}
                      onChange={(e) => updateToneField('taglines', e.target.value.split('\n'))}
                    />
                  ) : (
                    editedTone.taglines.map((tag, i) => (
                      <Paper 
                        key={i} 
                        variant="outlined" 
                        sx={{ p: 2, borderRadius: 2, borderStyle: 'dashed', bgcolor: 'transparent', transition: '0.2s', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                      >
                        <Typography variant="body2" fontWeight="600">{tag}</Typography>
                      </Paper>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight="700" gutterBottom>{t('actionsTitle')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('actionsDesc')}
                </Typography>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={isGenerating ? <CircularProgress size={20} /> : <MagicIcon />} 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}
                >
                  {isGenerating ? t('regenerating') : t('regenerateBtn')}
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ToneMessagingTab;
