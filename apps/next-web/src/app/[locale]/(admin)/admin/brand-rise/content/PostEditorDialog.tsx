'use client';

import { useEffect, useState, useRef } from 'react';

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
import FormHelperText from '@mui/material/FormHelperText';

import AppReactDatepicker from '../../../../../../libs/styles/AppReactDatepicker';
import type { ScheduledPost } from '@/services/brand.service';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />;
};

interface PostEditorDialogProps {
  open: boolean;
  onClose: () => void;
  post: ScheduledPost | null;
  initialDate?: Date;
  onSave: (data: Partial<ScheduledPost>) => Promise<void>;
  onDelete?: (postId: string) => Promise<void>;
  onDuplicate?: (postId: string) => Promise<void>;
}

const PLATFORMS = [
  { value: 'INSTAGRAM', label: 'Instagram', icon: 'tabler-brand-instagram', color: '#E4405F' },
  { value: 'FACEBOOK', label: 'Facebook', icon: 'tabler-brand-facebook', color: '#1877F2' },
  { value: 'LINKEDIN', label: 'LinkedIn', icon: 'tabler-brand-linkedin', color: '#0A66C2' },
  { value: 'TWITTER', label: 'Twitter (X)', icon: 'tabler-brand-x', color: '#000000' },
  { value: 'GOOGLE_BUSINESS', label: 'Google Business', icon: 'tabler-brand-google', color: '#4285F4' }
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const PostEditorDialog = ({ open, onClose, post, initialDate, onSave, onDelete, onDuplicate }: PostEditorDialogProps) => {
  const [loading, setLoading] = useState(false);

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
      setFormData({
        title: post.content.title || '',
        text: post.content.text || '',
        hashtags: post.content.hashtags || '',
        platforms: post.platforms || [],
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
      alert('Please provide a caption and select at least one platform.');

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

    if (window.confirm('Are you sure you want to delete this scheduled post?')) {
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: '0 10px 40px 0 rgba(0,0,0,0.1)' }
      }}
    >
      <DialogTitle component="div" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 6,
        py: 4
      }}>
        <Typography variant="h5" fontWeight="bold">
          {post ? 'Edit Scheduled Post' : 'Create Scheduled Post'}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <Icon icon="tabler-x" fontSize={20} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ px: 6, py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Platforms Selection */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Select Platforms</Typography>
            <FormControl fullWidth>
              <Select
                id="post-platforms-select"
                multiple
                displayEmpty
                value={formData.platforms}
                onChange={(e) => setFormData({ ...formData, platforms: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                input={<OutlinedInput sx={{ borderRadius: 1.5 }} />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <Typography color="text.disabled">Choose platforms...</Typography>;
                  }

                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {selected.map((value) => {
                        const platform = PLATFORMS.find(p => p.value === value);

                        return (
                          <Chip 
                            key={value} 
                            label={platform?.label || value} 
                            size="small" 
                            icon={<Icon icon={platform?.icon || 'tabler-world'} fontSize={16} style={{ color: platform?.color }} />}
                            sx={{ 
                              borderRadius: 1,
                              bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.100' : 'background.default',
                              fontWeight: 500
                            }}
                          />
                        );
                      })}
                    </Box>
                  );
                }}
              >
                {PLATFORMS.map((platform) => (
                  <MenuItem key={platform.value} value={platform.value}>
                    <Checkbox checked={formData.platforms.indexOf(platform.value) > -1} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Icon icon={platform.icon} fontSize={18} style={{ color: platform.color }} />
                      <ListItemText primary={platform.label} />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Title & Caption */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <TextField
              id="post-title-input"
              fullWidth
              label="Internal Title (Optional)"
              placeholder="E.g., Summer Campaign Launch"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />

            <TextField
              id="post-caption-input"
              fullWidth
              multiline
              rows={4}
              label="Caption"
              placeholder="Write your post content here..."
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />

            <TextField
              id="post-hashtags-input"
              fullWidth
              label="Hashtags"
              placeholder="#marketing #business #growth"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </Box>

          {/* Media Section */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Media (Images/Videos)</Typography>
            
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {formData.media.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.05)'
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
                        bgcolor: 'action.hover'
                      }}
                    >
                      <Icon icon="tabler-video" fontSize={24} />
                    </Box>
                  )}
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      padding: '2px',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                    }}
                    onClick={() => removeMedia(index)}
                  >
                    <Icon icon="tabler-x" fontSize={14} />
                  </IconButton>
                </Box>
              ))}

              {/* Add Media Button */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  border: '1px dashed',
                  borderColor: 'primary.main',
                  borderRadius: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'primary.lightOpacity' : 'background.default',
                  color: 'primary.main',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    bgcolor: (theme) => theme.palette.mode === 'light' ? 'primary.mainOpacity' : 'action.hover',
                    borderColor: 'primary.dark'
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon icon="tabler-plus" fontSize={24} />
                <Typography variant="caption" sx={{ mt: 1, fontWeight: 600 }}>Add Media</Typography>
              </Box>
            </Box>
          </Box>

          {/* Scheduling & Status */}
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Scheduled Date & Time</Typography>
              <AppReactDatepicker
                selected={formData.scheduledAt}
                onChange={(date: Date | null) => {
                  if (date) setFormData({ ...formData, scheduledAt: date });
                }}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                customInput={<TextField id="post-scheduled-at-input" fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />}
              />
            </Box>

            <Box sx={{ minWidth: 200 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Publishing Status</Typography>
              <FormControl fullWidth size="small">
                <Select
                  id="post-status-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ScheduledPost['status'] })}
                  sx={{ borderRadius: 1.5 }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>Current state of this post</FormHelperText>
              </FormControl>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        justifyContent: 'space-between', 
        px: 6, 
        py: 4,
        bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'background.default'
      }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {post && (
            <>
              <Button 
                variant="tonal" 
                color="error" 
                startIcon={<Icon icon="tabler-trash" fontSize={18} />}
                onClick={handleDelete} 
                disabled={loading}
                sx={{ borderRadius: 1.5 }}
              >
                Delete
              </Button>
              <Button 
                variant="tonal" 
                color="primary" 
                startIcon={<Icon icon="tabler-copy" fontSize={18} />}
                onClick={handleDuplicate} 
                disabled={loading}
                sx={{ borderRadius: 1.5 }}
              >
                Duplicate
              </Button>
            </>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={onClose} 
            disabled={loading}
            sx={{ borderRadius: 1.5, px: 4 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            disabled={loading || !formData.text || formData.platforms.length === 0}
            sx={{ 
              borderRadius: 1.5, 
              px: 6,
              bgcolor: '#7367F0',
              '&:hover': { bgcolor: '#665BE0' },
              boxShadow: '0 4px 14px 0 rgba(115, 103, 240, 0.39)'
            }}
          >
            {loading ? 'Saving...' : post ? 'Update Post' : 'Schedule Post'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PostEditorDialog;
