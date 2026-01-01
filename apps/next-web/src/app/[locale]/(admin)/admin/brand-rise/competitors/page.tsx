'use client';

import { useCallback, useEffect, useState } from 'react';

import Avatar from '@mui/material/Avatar';
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
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useAuth } from '@/contexts/AuthContext';
import { useBusinessId } from '@/hooks/useBusinessId';
import { BrandService, type Competitor } from '@/services/brand.service';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

// Helper to generate consistent colors
const stringToColor = (string: string) => {
  if (!string) return '#7367F0';
  let hash = 0;

  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;

    color += ('00' + value.toString(16)).substr(-2);
  }

  
return color;
}

const CompetitorsPage = () => {
  const theme = useTheme();
  const t = useTranslations('dashboard');
  const { businessId } = useBusinessId();
  const { user } = useAuth();
  
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({ name: '', website: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // RBAC: Manager or Admin can edit
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const fetchCompetitors = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);

    try {
      const data = await BrandService.listCompetitors(businessId);

      setCompetitors(data);
    } catch (error) {
      console.error('Failed to fetch competitors', error);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchCompetitors();
    }
  }, [businessId, fetchCompetitors]);

  const handleAddCompetitor = async () => {
    if (!businessId) return;
    setActionLoading(true);

    try {
      await BrandService.addCompetitor(businessId, newCompetitor);
      setOpenAddDialog(false);
      setNewCompetitor({ name: '', website: '' });
      fetchCompetitors();
    } catch (error) {
      console.error('Failed to add competitor', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCompetitor = async (id: string) => {
    if (!businessId || !confirm('Are you sure you want to remove this competitor?')) return;

    try {
      await BrandService.removeCompetitor(businessId, id);
      fetchCompetitors();
    } catch (error) {
      console.error('Failed to delete competitor', error);
    }
  };

  return (
    <Grid container spacing={6}>
      {/* Competitor Tracking Section */}
      <Grid size={{ xs: 12 }}>
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
                <Typography variant="h5" fontWeight="bold">{t('brandRise.competitors.tracking')}</Typography>
                <Typography variant="body1" color="text.secondary">Monitor and compare your brand against competitors</Typography>
            </Box>
            {canEdit && (
              <Button 
                  variant="contained" 
                  startIcon={<Icon icon="tabler-plus" />}
                  sx={{ bgcolor: '#7367F0', '&:hover': { bgcolor: '#665BE0' } }}
                  onClick={() => setOpenAddDialog(true)}
              >
                  Add Competitor
              </Button>
            )}
         </Box>

         <Card>
            <TableContainer>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Competitor</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Website</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Visibility Score</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <CircularProgress />
                            </TableCell>
                          </TableRow>
                        ) : competitors.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography color="text.secondary">No competitors added yet.</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          competitors.map((competitor) => (
                            <TableRow key={competitor.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar 
                                            variant="rounded" 
                                            sx={{ bgcolor: stringToColor(competitor.name), width: 38, height: 38 }}
                                        >
                                            <Typography variant="body2" sx={{ color: '#fff' }}>
                                              {competitor.name.charAt(0)}
                                            </Typography>
                                        </Avatar>
                                        <Typography variant="body1" fontWeight={500}>{competitor.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">{competitor.website || '-'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={
                                            <Box component="span" sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1, fontSize: '0.7rem', py: 0.5 }}>
                                                <span>Com</span>
                                                <span>ing</span>
                                            </Box>
                                        }
                                        sx={{ 
                                            height: 'auto', 
                                            borderRadius: 1, 
                                            bgcolor: 'action.hover', 
                                            color: 'text.disabled',
                                            '& .MuiChip-label': { px: 1 }
                                        }} 
                                    />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                                            <Icon icon="tabler-eye" fontSize={18} />
                                        </IconButton>
                                        {canEdit && (
                                          <IconButton 
                                            size="small" 
                                            color="error" 
                                            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, color: '#FF9F43' }}
                                            onClick={() => handleDeleteCompetitor(competitor.id)}
                                          >
                                              <Icon icon="tabler-trash" fontSize={18} style={{ color: '#EA5455' }} />
                                          </IconButton>
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                          ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
         </Card>
      </Grid>

      {/* Add Competitor Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Competitor</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
            <TextField 
              label="Competitor Name" 
              fullWidth 
              value={newCompetitor.name}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
            />
            <TextField 
              label="Website URL" 
              fullWidth 
              value={newCompetitor.website}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddCompetitor} 
            variant="contained" 
            disabled={!newCompetitor.name || actionLoading}
          >
            {actionLoading ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>


      {/* Competitive Analysis Section */}
      <Grid size={{ xs: 12 }}>
         <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">Competitive Analysis</Typography>
            <Typography variant="body1" color="text.secondary">Side-by-side performance comparison</Typography>
         </Box>

         <Grid container spacing={4}>
            {/* Visibility Comparison Card */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">Visibility Comparison</Typography>
                            <Icon icon="tabler-chart-bar" fontSize={22} style={{ color: '#7367F0' }} />
                        </Box>
                        <Box sx={{ 
                            height: 200, 
                            bgcolor: 'action.hover', 
                            borderRadius: 1, 
                            width: '100%',
                            opacity: 0.5 
                        }} />
                    </CardContent>
                </Card>
            </Grid>

            {/* Content Activity Card */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">Content Activity</Typography>
                            <Icon icon="tabler-notes" fontSize={22} style={{ color: '#28C76F' }} />
                        </Box>
                         <Box sx={{ 
                            height: 200, 
                            bgcolor: 'action.hover', 
                            borderRadius: 1, 
                            width: '100%',
                            opacity: 0.5 
                        }} />
                    </CardContent>
                </Card>
            </Grid>

            {/* Review Sentiment Card */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">Review Sentiment</Typography>
                            <Icon icon="tabler-star" fontSize={22} style={{ color: '#FF9F43' }} />
                        </Box>
                         <Box sx={{ 
                            height: 200, 
                            bgcolor: 'action.hover', 
                            borderRadius: 1, 
                            width: '100%',
                            opacity: 0.5 
                        }} />
                    </CardContent>
                </Card>
            </Grid>
         </Grid>
      </Grid>
    </Grid>
  );
};

export default CompetitorsPage;
