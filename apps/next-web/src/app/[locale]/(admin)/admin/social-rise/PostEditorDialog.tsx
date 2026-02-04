/* eslint-disable import/no-unresolved */
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';
import type { ScheduledPost } from '@/services/brand.service';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />;
};

const PLATFORMS = [
  { value: 'INSTAGRAM', key: 'instagram', icon: 'tabler-brand-instagram', color: '#E4405F' },
  { value: 'FACEBOOK', key: 'facebook', icon: 'tabler-brand-facebook', color: '#1877F2' },
  { value: 'LINKEDIN', key: 'linkedin', icon: 'tabler-brand-linkedin', color: '#0A66C2' },
  { value: 'TWITTER', key: 'twitter', icon: 'tabler-brand-x', color: '#000000' },
  { value: 'GOOGLE_BUSINESS', key: 'google', icon: 'tabler-brand-google', color: '#4285F4' }
];

interface PostEditorDialogProps {
  open: boolean;
  onClose: () => void;
  post: ScheduledPost | null;
  initialDate?: Date;
  onSave: (data: Partial<ScheduledPost>) => Promise<void>;
  onDelete?: (postId: string) => Promise<void>;
  onDuplicate?: (postId: string) => Promise<void>;
}

const PostEditorDialog = ({ open, onClose, post, initialDate, onSave, onDelete, onDuplicate }: PostEditorDialogProps) => {
  const t = useTranslations('studio.editor');
  const tc = useTranslations('common');
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);

  const STATUS_OPTIONS = useMemo(() => [
    { value: 'draft', label: t('status.draft') },
    { value: 'scheduled', label: t('status.scheduled') },
    { value: 'published', label: t('status.published') },
    { value: 'failed', label: t('status.failed') },
    { value: 'cancelled', label: t('status.cancelled') }
  ], [t]);

  const [formData, setFormData] = useState({
    title: '',
    text: '',
    hashtags: '',
    platforms: ['INSTAGRAM'] as string[],
    scheduledAt: new Date(),
    status: 'scheduled' as ScheduledPost['status'],
    media: [] as { url: string; type: 'image' | 'video'; name: string }[]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post) {
      const ALL_SUPPORTED_PLATFORMS = ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'GOOGLE_BUSINESS'];

      const platforms = (post.platforms || []).reduce((acc: string[], curr: string) => {
        if (typeof curr === 'string' && (curr.toUpperCase() === 'ALL PLATFORMS' || curr.toUpperCase() === 'ALL_PLATFORMS')) {
          return [...acc, ...ALL_SUPPORTED_PLATFORMS];
        }

        if (typeof curr === 'string' && curr.includes(',')) {
          const split = curr.split(',').map(p => p.trim());

          return [...acc, ...split.reduce((pAcc: string[], p) => {
            if (p.toUpperCase() === 'ALL PLATFORMS' || p.toUpperCase() === 'ALL_PLATFORMS') {
              return [...pAcc, ...ALL_SUPPORTED_PLATFORMS];
            }

            const normalized = p.toUpperCase().replace(/\s+/g, '_');
            const finalPlatform = normalized === 'X' ? 'TWITTER' : normalized;

            return [...pAcc, finalPlatform];
          }, [])];
        }

        const normalized = curr.toUpperCase().replace(/\s+/g, '_');
        const finalPlatform = normalized === 'X' ? 'TWITTER' : normalized;

        return [...acc, finalPlatform];
      }, []);

      setFormData({
        title: post.content.title || '',
        text: post.content.text || '',
        hashtags: post.content.hashtags || '',
        platforms: Array.from(new Set(platforms)) as string[],
        scheduledAt: new Date(post.scheduledAt),
        status: post.status,
        media: (post.content.media as any) || []
      });
    } else if (initialDate) {
      setFormData(prev => ({
        ...prev,
        scheduledAt: initialDate,
        title: '',
        text: '',
        hashtags: '',
        platforms: ['INSTAGRAM'],
        status: 'scheduled',
        media: []
      }));
    } else {
      setFormData({
        title: '',
        text: '',
        hashtags: '',
        platforms: ['INSTAGRAM'],
        scheduledAt: new Date(),
        status: 'scheduled',
        media: []
      });
    }
  }, [post, initialDate, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    const newMedia = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...newMedia]
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.text || formData.platforms.length === 0) {
      alert(t('provideCaptionError'));

      return;
    }

    setLoading(true);

    try {
      await onSave({
        content: {
          title: formData.title,
          text: formData.text,
          hashtags: formData.hashtags,
          media: formData.media as any
        },
        platforms: formData.platforms,
        scheduledAt: formData.scheduledAt.toISOString(),
        status: formData.status,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      onClose();
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !onDelete) return;

    if (window.confirm(t('confirmDelete'))) {
      setLoading(true);

      try {
        await onDelete(post.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete post', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDuplicate = async () => {
    if (!post || !onDuplicate) return;

    setLoading(true);

    try {
      await onDuplicate(post.id);
      onClose();
    } catch (error) {
      console.error('Failed to duplicate post', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartStudio = () => {
      const date = formData.scheduledAt || new Date();
      const dateStr = date.toISOString().split('T')[0];

      router.push(`/admin/studio/smart-create?date=${dateStr}`);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '24px', 
          boxShadow: isDark ? 'none' : '0 25px 80px rgba(0,0,0,0.15)',
          border: `1px solid ${isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.6)}`,
          overflow: 'hidden',
          backgroundImage: 'none',
          bgcolor: 'background.paper'
        }
      }}
    >
      <DialogTitle component="div" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: { xs: 6, md: 10 },
        py: 8,
        bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.common.black, 0.01),
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-1px', lineHeight: 1.2 }}>
            {post ? t('editPostStudio') : t('newContentStudio')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, opacity: 0.7, fontWeight: 500 }}>
            {post ? t('refiningContent') : t('architectingArt')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
            {!post && (
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Icon icon="tabler-wand" />}
                    onClick={handleSmartStudio}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                >
                    {t('useSmartStudio')}
                </Button>
            )}
            <IconButton 
            size="small" 
            onClick={onClose} 
            sx={{ 
                color: 'text.secondary',
                bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.04),
                borderRadius: '12px',
                '&:hover': {
                bgcolor: isDark ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.08),
                transform: 'rotate(90deg)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            >
            <Icon icon="tabler-x" fontSize={20} />
            </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ px: { xs: 6, md: 10 }, py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Platforms Selection */}
          <Box>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '1px', mb: 2, mt:5, display: 'block' }}>
              {t('distributionChannels')}
            </Typography>
            <FormControl fullWidth>
              <Select
                id="post-platforms-select"
                multiple
                displayEmpty
                value={formData.platforms}
                onChange={(e) => setFormData({ ...formData, platforms: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                input={
                  <OutlinedInput 
                    sx={{ 
                      borderRadius: '16px',
                      bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02),
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'background.paper',
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                      transition: 'all 0.2s'
                    }} 
                  />
                }
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <Typography color="text.disabled" fontWeight={500}>{t('selectPlatforms')}</Typography>;
                  }

                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {selected.map((value) => {
                        const platform = PLATFORMS.find(p => p.value === value);

                        return (
                          <Chip 
                            key={value} 
                            label={platform ? tc(`channel.${platform.key}`) : value}
                            size="small" 
                            icon={<Icon icon={platform?.icon || 'tabler-world'} fontSize={16} style={{ color: platform?.color }} />}
                            sx={{ 
                              borderRadius: '10px',
                              bgcolor: isDark ? alpha(platform?.color || '#000', 0.15) : alpha(platform?.color || '#000', 0.08),
                              color: platform?.color || 'inherit',
                              fontWeight: 700,
                              border: `1px solid ${alpha(platform?.color || '#000', 0.1)}`,
                              '& .MuiChip-icon': { ml: 2 }
                            }}
                          />
                        );
                      })}
                    </Box>
                  );
                }}
              >
                {PLATFORMS.map((platform) => (
                  <MenuItem key={platform.value} value={platform.value} sx={{ borderRadius: '12px', mx: 2, my: 0.5 }}>
                    <Checkbox 
                      checked={formData.platforms.indexOf(platform.value) > -1} 
                      size="small"
                      sx={{ '&.Mui-checked': { color: platform.color } }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '10px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: isDark ? alpha(platform.color, 0.2) : alpha(platform.color, 0.1),
                          color: platform.color,
                          border: `1px solid ${alpha(platform.color, 0.2)}`
                        }}
                      >
                        <Icon icon={platform.icon} fontSize={18} />
                      </Box>
                      <ListItemText 
                        primary={tc(`channel.${platform.key}`)}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Title & Caption */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
             <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '1px', mb: 2, display: 'block' }}>
                    {t('contentCore')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 4 }}>
                <TextField
                    id="post-title-input"
                    fullWidth
                    label={t('campaignName')}
                    placeholder={t('campaignPlaceholder')}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    sx={{ 
                    flex: 1,
                    minWidth: 280,
                    '& .MuiOutlinedInput-root': { 
                        borderRadius: '16px',
                        bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02),
                        '& fieldset': { border: 'none' },
                        '&.Mui-focused': {
                            bgcolor: 'background.paper',
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }
                    },
                    '& .MuiInputLabel-root': { fontWeight: 600 }
                    }}
                />

                <TextField
                    id="post-hashtags-input"
                    fullWidth
                    label={t('smartHashtags')}
                    placeholder={t('hashtagsPlaceholder')}
                    value={formData.hashtags}
                    onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                    sx={{ 
                    flex: 1,
                    minWidth: 280,
                    '& .MuiOutlinedInput-root': { 
                        borderRadius: '16px',
                        bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02),
                        '& fieldset': { border: 'none' },
                        '&.Mui-focused': {
                            bgcolor: 'background.paper',
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }
                    },
                    '& .MuiInputLabel-root': { fontWeight: 600 }
                    }}
                />
                </Box>

                <TextField
                id="post-caption-input"
                fullWidth
                multiline
                rows={6}
                label={t('postCaption')}
                placeholder={t('composePlaceholder')}
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                sx={{ 
                    '& .MuiOutlinedInput-root': { 
                    borderRadius: '16px',
                    bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02),
                    '& fieldset': { border: 'none' },
                    '&.Mui-focused': {
                        bgcolor: 'background.paper',
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }
                    },
                    '& .MuiInputLabel-root': { fontWeight: 600 }
                }}
                />
            </Box>
          </Box>

          {/* Media Section */}
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '1px', mb: 2, display: 'block' }}>
              {t('visualAssets')}
            </Typography>
            
            {/* Hidden File Input */}
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileSelect}
            />

            {/* Media Grid */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {formData.media.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 120,
                    height: 120,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                    }
                  }}
                >
                  {item.type === 'image' ? (
                    <Box
                      component="img"
                      src={item.url}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                      }}
                    >
                      <Icon icon="tabler-video" fontSize={32} color={theme.palette.primary.main} />
                    </Box>
                  )}
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: alpha(theme.palette.error.main, 0.9),
                      color: 'white',
                      padding: '5px',
                      borderRadius: '10px',
                      '&:hover': { 
                          bgcolor: theme.palette.error.main,
                          transform: 'scale(1.1)'
                      }
                    }}
                    onClick={() => removeMedia(index)}
                  >
                    <Icon icon="tabler-trash" fontSize={14} />
                  </IconButton>
                </Box>
              ))}

              {/* Add Media Button */}
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  bgcolor: isDark ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.primary.main, 0.02),
                  color: 'primary.main',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05),
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)',
                    boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.15)}`
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    mb: 1
                }}>
                    <Icon icon="tabler-cloud-upload" fontSize={24} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.5px' }}>{t('upload')}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Scheduling & Status */}
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '1px', mb: 2, display: 'block' }}>
              {t('logistics')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 260 }}>
                <AppReactDatepicker
                    selected={formData.scheduledAt}
                    onChange={(date: Date | null) => {
                    if (date) setFormData({ ...formData, scheduledAt: date });
                    }}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    customInput={
                    <TextField 
                        id="post-scheduled-at-input" 
                        fullWidth 
                        label={t('publishSchedule')}
                        sx={{ 
                        '& .MuiOutlinedInput-root': { 
                            borderRadius: '16px',
                            bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02),
                            '& fieldset': { border: 'none' },
                            '&.Mui-focused': {
                                bgcolor: 'background.paper',
                                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                            }
                        },
                        '& .MuiInputLabel-root': { fontWeight: 600 }
                        }} 
                    />
                    }
                />
                </Box>

                <Box sx={{ flex: 1, minWidth: 260 }}>
                <FormControl fullWidth>
                    <Select
                    id="post-status-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ScheduledPost['status'] })}
                    input={
                        <OutlinedInput 
                          sx={{ 
                            borderRadius: '16px',
                            bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02),
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&.Mui-focused': {
                                bgcolor: 'background.paper',
                                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                            }
                          }} 
                        />
                      }
                    >
                    {STATUS_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value} sx={{ borderRadius: '10px', mx: 2, my: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>{opt.label}</Typography>
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        justifyContent: 'space-between', 
        px: { xs: 6, md: 10 }, 
        py: 8,
        bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.common.black, 0.01),
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', gap: 3, mt:5 }}>
          {post && (
            <>
              <Button 
                variant="tonal" 
                color="error" 
                startIcon={<Icon icon="tabler-trash" fontSize={18} />}
                onClick={handleDelete} 
                disabled={loading}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
              >
                {t('delete')}
              </Button>
              <Button 
                variant="tonal" 
                color="primary" 
                startIcon={<Icon icon="tabler-copy" fontSize={18} />}
                onClick={handleDuplicate} 
                disabled={loading}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
              >
                {t('duplicate')}
              </Button>
            </>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 4, mt:5 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={onClose} 
            disabled={loading}
            sx={{ borderRadius: '10px', px: 6, textTransform: 'none', fontWeight: 600 }}
          >
            {t('cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            disabled={loading || !formData.text || formData.platforms.length === 0}
            sx={{ 
              borderRadius: '10px', 
              px: 8,
              py: 2.5,
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: theme.palette.primary.main,
              '&:hover': { 
                bgcolor: theme.palette.primary.dark,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`
              },
              transition: 'all 0.2s',
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            {loading ? t('saving') : post ? t('updatePost') : t('schedulePost')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PostEditorDialog;
