'use client';

import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';

import { useAuth } from '@/contexts/AuthContext';
import { useBusinessId } from '@/hooks/useBusinessId';
import type { ContentIdea } from '@/services/brand.service';
import { BrandService } from '@/services/brand.service';
import ContentCalendar from './ContentCalendar';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

const ContentPage = () => {
  const theme = useTheme();
  const t = useTranslations('dashboard');
  const { businessId } = useBusinessId();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '', platform: 'BLOG POST' });

  const canAdd = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const fetchIdeas = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);

    try {
        const data = await BrandService.listContent(businessId);

        setIdeas(data);
    } catch (error) {
        console.error('Failed to fetch content ideas', error);
    } finally {
        setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
        fetchIdeas();
    }
  }, [businessId, fetchIdeas]);

  const handleAddIdea = async () => {
      if (!businessId) return;

      try {
          await BrandService.createContent(businessId, newIdea);
          setOpenAddDialog(false);
          setNewIdea({ title: '', description: '', platform: 'BLOG POST' });
          fetchIdeas();
      } catch (error) {
          console.error('Failed to add idea', error);
      }
  };

  const handleDeleteIdea = async (id: string) => {
      if (!businessId) return;
      if (!confirm('Are you sure you want to delete this idea?')) return;

      try {
          await BrandService.deleteContent(businessId, id);
          fetchIdeas();
      } catch (error) {
          console.error('Failed to delete idea', error);
      }
  };

  const getTypeColor = (type: string) => {
      switch(type) {
          case 'BLOG POST': return { color: '#7367F0', bg: '#E8EAF6' };
          case 'SOCIAL POST': return { color: '#28C76F', bg: '#E8F8F0' };
          case 'VIDEO': return { color: '#FF9F43', bg: '#FFF5EB' };
          case 'EMAIL': return { color: '#7367F0', bg: '#E8EAF6' };
          default: return { color: '#7367F0', bg: '#E8EAF6' };
      }
  };

  return (
    <Grid container spacing={4}>
      {/* Content Calendar Section */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
           <Typography variant="h6">{t('brandRise.content.calendar')}</Typography>
           {canAdd && (
             <Button 
               variant="contained" 
               startIcon={<Icon icon="tabler-plus" />}
               sx={{ bgcolor: '#7367F0', '&:hover': { bgcolor: '#665BE0' } }}
               onClick={() => setOpenAddDialog(true)}
             >
               {t('brandRise.content.add')}
             </Button>
           )}
        </Box>

        <Card sx={{ display: 'flex', flexDirection: 'column', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
           <CardContent>
              <ContentCalendar ideas={ideas} />
           </CardContent>
        </Card>
      </Grid>

      {/* Content Ideas Section */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Box sx={{ mb: 3 }}>
           <Typography variant="h6">{t('brandRise.content.ideas')}</Typography>
        </Box>

        {loading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                 <CircularProgress />
             </Box>
        ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {(ideas || []).map((idea, index) => {
                const colors = getTypeColor(idea.platform);

                
return (
                    <Card key={index} sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                        <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Chip 
                                    label={idea.platform} 
                                    size="small"
                                    sx={{ 
                                    bgcolor: colors.bg, 
                                    color: colors.color,
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem',
                                    height: 24
                                    }} 
                                />
                            </Box>
                            {canAdd && (
                                <IconButton size="small" onClick={() => handleDeleteIdea(idea.id)}>
                                    <Icon icon="tabler-trash" fontSize={16} />
                                </IconButton>
                            )}
                        </Box>
                        
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, textAlign: 'left' }}>
                            {idea.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ textAlign: 'left', mb: 3 }}>
                            {idea.description}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                    <Icon icon='tabler-clock' fontSize={16} />
                                    <Typography variant="caption">{new Date(idea.createdAt).toLocaleDateString()}</Typography>
                                </Box>
                            </Box>
                            <IconButton size="small">
                                <Icon icon="tabler-bookmark" fontSize={20} />
                            </IconButton>
                        </Box>
                        </CardContent>
                    </Card>
                );
            })}
            </Box>
        )}
      </Grid>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add Content Idea</DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                label="Title"
                fullWidth
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
            />
            <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
            />
            <TextField
                select
                margin="dense"
                label="Platform"
                fullWidth
                value={newIdea.platform}
                onChange={(e) => setNewIdea({ ...newIdea, platform: e.target.value })}
            >
                <MenuItem value="BLOG POST">Blog Post</MenuItem>
                <MenuItem value="SOCIAL POST">Social Post</MenuItem>
                <MenuItem value="VIDEO">Video</MenuItem>
                <MenuItem value="EMAIL">Email</MenuItem>
            </TextField>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddIdea} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ContentPage;
