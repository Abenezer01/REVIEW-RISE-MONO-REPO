/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Stack,
  Button,
  Paper,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

import {
  ContentCopy as CopyIcon,
  Image as AssetsIcon,
  Visibility as ViewIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Language as GlobeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import toast from 'react-hot-toast';

import type { BrandProfile } from '@/services/brand-profile.service';

interface BrandIdentityTabProps {
  profile: BrandProfile;
  onCopy: (text: string) => void;
  onCopyAllColors: () => void;
  onUpdate: (data: any) => Promise<void>;
  isUpdating?: boolean;
}

const BrandIdentityTab: React.FC<BrandIdentityTabProps> = ({ 
  profile, 
  onCopy, 
  onCopyAllColors,
  onUpdate,
  isUpdating
}) => {
  const theme = useTheme();
  const [editingSection, setEditingSection] = React.useState<string | null>(null);
  const [editedDescription, setEditedDescription] = React.useState(profile.description || '');
  const [editedColors, setEditedColors] = React.useState(profile.colors || []);
  const [editedAssets, setEditedAssets] = React.useState(profile.assets || []);
  const [editedFonts, setEditedFonts] = React.useState(profile.fonts || []);

  const handleSaveColors = async () => {
    try {
      await onUpdate({ colors: editedColors });
      setEditingSection(null);
      toast.success('Colors updated');
    } catch (error) {
      toast.error('Failed to update colors');
    }
  };

  const handleSaveAssets = async () => {
    try {
      await onUpdate({ assets: editedAssets });
      setEditingSection(null);
      toast.success('Assets updated');
    } catch (error) {
      toast.error('Failed to update assets');
    }
  };

  const handleSaveFonts = async () => {
    try {
      await onUpdate({ fonts: editedFonts });
      setEditingSection(null);
      toast.success('Typography updated');
    } catch (error) {
      toast.error('Failed to update typography');
    }
  };

  const handleCancelColors = () => {
    setEditedColors(profile.colors || []);
    setEditingSection(null);
  };

  const handleCancelAssets = () => {
    setEditedAssets(profile.assets || []);
    setEditingSection(null);
  };

  const handleCancelFonts = () => {
    setEditedFonts(profile.fonts || []);
    setEditingSection(null);
  };

  const handleSaveDescription = async () => {
    try {
      await onUpdate({ description: editedDescription });
      setEditingSection(null);
      toast.success('Description updated');
    } catch (error) {
      toast.error('Failed to update description');
    }
  };

  const handleCancelEdit = () => {
    setEditedDescription(profile.description || '');
    setEditingSection(null);
  };

  const renderSectionHeader = (title: string, sectionId: string, onSave: () => void, onCancel: () => void) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="h6" fontWeight="700">{title}</Typography>
      {editingSection === sectionId ? (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={onCancel} color="error">
            <CloseIcon />
          </IconButton>
          <IconButton size="small" onClick={onSave} color="primary" disabled={isUpdating}>
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

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();

    if (p.includes('facebook')) return <FacebookIcon />;
    if (p.includes('twitter') || p.includes('x.com')) return <TwitterIcon />;
    if (p.includes('instagram')) return <InstagramIcon />;
    if (p.includes('linkedin')) return <LinkedInIcon />;
    if (p.includes('youtube')) return <YouTubeIcon />;
    
    return <GlobeIcon />;
  };

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Stack spacing={4}>
          {/* Description Card */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {renderSectionHeader('Brand Description', 'description', handleSaveDescription, handleCancelEdit)}
              {editingSection === 'description' ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Enter brand description..."
                />
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {profile.description || profile.currentExtractedData?.description || 'No description available for this brand profile.'}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Colors Card */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {renderSectionHeader('Color Palette', 'colors', handleSaveColors, handleCancelColors)}
              {editingSection === 'colors' ? (
                <Stack spacing={2}>
                  {editedColors.map((color, index) => (
                    <Stack key={index} direction="row" spacing={2} alignItems="center">
                      <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: color.hexCode, border: '1px solid divider' }} />
                      <TextField
                        size="small"
                        label="HEX"
                        value={color.hexCode}
                        onChange={(e) => {
                          const newColors = [...editedColors];

                          newColors[index].hexCode = e.target.value;
                          setEditedColors(newColors);
                        }}
                        sx={{ width: 120 }}
                      />
                      <TextField
                        size="small"
                        label="Type"
                        value={color.type}
                        onChange={(e) => {
                          const newColors = [...editedColors];

                          newColors[index].type = e.target.value;
                          setEditedColors(newColors);
                        }}
                        sx={{ flexGrow: 1 }}
                      />
                      <IconButton color="error" onClick={() => {
                        setEditedColors(editedColors.filter((_, i) => i !== index));
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => setEditedColors([...editedColors, { hexCode: '#000000', type: 'primary' }])}>
                    Add Color
                  </Button>
                </Stack>
              ) : (
                <>
                  <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                    {profile.colors && profile.colors.length > 0 && (
                      <Button
                        size="small"
                        startIcon={<CopyIcon />}
                        onClick={onCopyAllColors}
                        sx={{ borderRadius: 2 }}
                      >
                        Copy All
                      </Button>
                    )}
                  </Stack>
                  <Grid container spacing={2}>
                    {profile.colors && profile.colors.length > 0 ? profile.colors.map((color, index) => (
                      <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: theme.shadows[4],
                              borderColor: 'primary.light'
                            }
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              height: 80,
                              bgcolor: color.hexCode,
                              borderRadius: 1.5,
                              mb: 2,
                              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              '&:hover .copy-overlay': { opacity: 1 }
                            }}
                            onClick={() => onCopy(color.hexCode)}
                          >
                            <Box
                              className="copy-overlay"
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: alpha('#000', 0.2),
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: '0.2s'
                              }}
                            >
                              <CopyIcon sx={{ color: '#fff' }} />
                            </Box>
                          </Box>
                          <Typography variant="subtitle2" fontWeight="700" align="center">{color.hexCode}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block" align="center" sx={{ textTransform: 'capitalize' }}>
                            {color.type.replace('_', ' ')}
                          </Typography>
                        </Box>
                      </Grid>
                    )) : (
                      <Grid size={{ xs: 12 }}>
                        <Typography color="text.secondary">No colors extracted.</Typography>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>


        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack spacing={4}>
          {/* Assets Card */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {renderSectionHeader('Brand Assets', 'assets', handleSaveAssets, handleCancelAssets)}
              {editingSection === 'assets' ? (
                <Stack spacing={2}>
                  {editedAssets.map((asset, index) => (
                    <Stack key={index} spacing={1} sx={{ p: 2, border: '1px solid divider', borderRadius: 2 }}>
                      <TextField
                        size="small"
                        label="Alt Text"
                        value={asset.altText || ''}
                        onChange={(e) => {
                          const newAssets = [...editedAssets];

                          newAssets[index].altText = e.target.value;
                          setEditedAssets(newAssets);
                        }}
                      />
                      <TextField
                        size="small"
                        label="URL"
                        value={asset.url}
                        onChange={(e) => {
                          const newAssets = [...editedAssets];
                          
                          newAssets[index].url = e.target.value;
                          setEditedAssets(newAssets);
                        }}
                      />
                      <IconButton color="error" size="small" onClick={() => {
                        setEditedAssets(editedAssets.filter((_, i) => i !== index));
                      }} sx={{ alignSelf: 'flex-end' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => setEditedAssets([...editedAssets, { altText: 'Logo', url: '', type: 'LOGO' }])}>
                    Add Asset
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {profile.assets && profile.assets.length > 0 ? profile.assets.map((asset, index) => (
                    <Paper
                      key={index}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <AssetsIcon color="action" />
                        </Box>
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Tooltip title={asset.altText || 'Brand Asset'}>
                            <Typography variant="subtitle2" fontWeight="700" noWrap>{asset.altText || 'Brand Asset'}</Typography>
                          </Tooltip>
                          <Typography variant="caption" color="text.secondary">{asset.type}</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            component="a"
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy URL">
                          <IconButton size="small" onClick={() => onCopy(asset.url)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Paper>
                  )) : (
                    <Typography color="text.secondary">No assets found.</Typography>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Typography Card */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {renderSectionHeader('Typography', 'fonts', handleSaveFonts, handleCancelFonts)}
              {editingSection === 'fonts' ? (
                <Stack spacing={2}>
                  {editedFonts.map((font, index) => (
                    <Stack key={index} spacing={1} sx={{ p: 2, border: '1px solid divider', borderRadius: 2 }}>
                      <TextField
                        size="small"
                        label="Font Family"
                        value={font.family}
                        onChange={(e) => {
                          const newFonts = [...editedFonts];

                          newFonts[index].family = e.target.value;
                          setEditedFonts(newFonts);
                        }}
                      />
                      <TextField
                        size="small"
                        label="Usage"
                        value={font.usage}
                        onChange={(e) => {
                          const newFonts = [...editedFonts];
                          
                          newFonts[index].usage = e.target.value;
                          setEditedFonts(newFonts);
                        }}
                      />
                      <IconButton color="error" size="small" onClick={() => {
                        setEditedFonts(editedFonts.filter((_, i) => i !== index));
                      }} sx={{ alignSelf: 'flex-end' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => setEditedFonts([...editedFonts, { family: '', usage: '' }])}>
                    Add Font
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={3}>
                  {profile.fonts && profile.fonts.length > 0 ? profile.fonts.map((font, index) => (
                    <Box key={index}>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        {font.usage}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: font.family,
                          fontWeight: 500,
                          mb: 1
                        }}
                      >
                        {font.family}
                      </Typography>
                      <Divider />
                    </Box>
                  )) : (
                    <Typography color="text.secondary">No fonts extracted.</Typography>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Social Links Card */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="700" gutterBottom>Social Presence</Typography>
              <Grid container spacing={1.5} sx={{ mt: 1 }}>
                {profile.socialLinks && profile.socialLinks.length > 0 ? profile.socialLinks.map((link, index) => (
                  <Grid size={{ xs: 12 }} key={index}>
                    <Button
                      variant="outlined"
                      component="a"
                      href={link.url}
                      target="_blank"
                      fullWidth
                      startIcon={getSocialIcon(link.platform)}
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'capitalize',
                        py: 1.5,
                        px: 2,
                        borderRadius: 2,
                        borderColor: alpha(theme.palette.divider, 0.5),
                        color: 'text.primary',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderColor: 'primary.main',
                          color: 'primary.main',
                        }
                      }}
                    >
                      <Box sx={{ flexGrow: 1, textAlign: 'left', minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight="700">{link.platform}</Typography>
                        <Tooltip title={link.url}>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: '100%' }}>
                            {link.url}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Button>
                  </Grid>
                )) : (
                  <Grid size={{ xs: 12 }}>
                    <Typography color="text.secondary">No social links found.</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default BrandIdentityTab;
