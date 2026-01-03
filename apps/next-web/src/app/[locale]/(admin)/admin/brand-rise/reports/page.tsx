'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

import { useAuth } from '@/contexts/AuthContext';
import { useBusinessId } from '@/hooks/useBusinessId';
import { BrandService } from '@/services/brand.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

const ReportsPage = () => {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const { businessId } = useBusinessId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const canGenerate = user?.role === 'Admin' || user?.role === 'MANAGER';

  // Fetch Reports
  const { data: reports = [], isLoading } = useQuery({
      queryKey: ['opportunities-reports', businessId],
      queryFn: async () => {
          if (!businessId) return [];
          const res = await BrandService.listOpportunitiesReports(businessId);
          return res; // Assuming service returns array
      },
      enabled: !!businessId
  });

  // Generate Mutation
  const generateMutation = useMutation({
      mutationFn: async () => {
          if (!businessId) throw new Error('No business ID');
          return BrandService.generateOpportunitiesReport(businessId);
      },
      onSuccess: () => {
          toast.success('Report generation started...');
          // In real implementation, this might be async job. 
          // If sync, we invalidate queries.
          setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['opportunities-reports', businessId] });
          }, 2000); 
      },
      onError: (err) => {
          toast.error('Failed to generate report');
          console.error(err);
      }
  });

  const handleViewReport = (reportId: string) => {
      if(!businessId) return;
      router.push(`/en/admin/brand-rise/reports/${reportId}`); // TODO: Handle locale dynamically if needed
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
            <Typography variant="h6" fontWeight="bold">{t('brandRise.reports.title')}</Typography>
            <Typography variant="body1" color="text.secondary">{t('brandRise.reports.subtitle')}</Typography>
        </Box>
        {canGenerate && (
          <Button 
              variant="contained" 
              startIcon={generateMutation.isPending ? <CircularProgress size={20} color="inherit"/> : <Icon icon="tabler-wand" />}
              sx={{ bgcolor: '#7367F0', '&:hover': { bgcolor: '#665BE0' }, textTransform: 'none' }}
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
          >
              {generateMutation.isPending ? t('brandRise.reports.generating') : t('brandRise.reports.generate')}
          </Button>
        )}
      </Box>

      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="reports table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('brandRise.reports.columns.date')}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('brandRise.reports.columns.status')}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('brandRise.reports.columns.id')}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('brandRise.reports.columns.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                   <TableCell colSpan={4} align="center">
                     <CircularProgress />
                   </TableCell>
                 </TableRow>
              ) : reports.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={4} align="center">
                     <Typography color="text.secondary" py={3}>{t('brandRise.reports.noReports')}</Typography>
                   </TableCell>
                 </TableRow>
              ) : (
                reports.map((row: any) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                         <Box sx={{ 
                             width: 38, 
                             height: 38, 
                             display: 'flex', 
                             alignItems: 'center', 
                             justifyContent: 'center', 
                             bgcolor: '#E8EAF6',
                             color: '#7367F0',
                             borderRadius: 1
                         }}>
                             <Icon icon="tabler-file-analytics" fontSize={20} />
                         </Box>
                         <Typography variant="body1" fontWeight={500}>
                            {new Date(row.generatedAt).toLocaleDateString()} {new Date(row.generatedAt).toLocaleTimeString()}
                         </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                          label="Ready" 
                          size="small" 
                          color="success"
                          variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                          {row.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Button 
                              variant="outlined" 
                              size="small" 
                              startIcon={<Icon icon="tabler-eye" fontSize={16} />}
                              onClick={() => handleViewReport(row.id)}
                          >
                              {t('brandRise.reports.viewInsights')}
                          </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default ReportsPage;
