'use client';

import { useEffect, useState } from 'react';

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

import { useAuth } from '@/contexts/AuthContext';
import { useBusinessId } from '@/hooks/useBusinessId';
import { BrandService, type Report } from '@/services/brand.service';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

const ReportsPage = () => {
  const t = useTranslations('dashboard');
  const { businessId } = useBusinessId();
  const { user } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // RBAC: Manager or Admin can generate
  const canGenerate = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    const fetchReports = async () => {
      if (!businessId) return;
      setLoading(true);
  
      try {
        const data = await BrandService.listReports(businessId);
  
        setReports(data);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchReports();
    }
  }, [businessId]);

  const handleViewReport = async (reportId: string) => {
    if (!businessId) return;

    try {
        const report = await BrandService.getReport(businessId, reportId);

        // Open report content in new window for now
        const win = window.open('', '_blank');

        if (win) {
            win.document.write(report.htmlContent);
            win.document.close();
        }
    } catch (error) {
        console.error('Failed to load report content', error);
        alert('Failed to load report content');
    }
  };

  const handleGenerateReport = () => {
      // Future implementation: Open generation dialog
      alert('Report generation feature coming soon!');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
            <Typography variant="h6" fontWeight="bold">{t('brandRise.reports.title')}</Typography>
            <Typography variant="body1" color="text.secondary">Access and view comprehensive brand performance reports</Typography>
        </Box>
        {canGenerate && (
          <Button 
              variant="contained" 
              startIcon={<Icon icon="tabler-file-plus" />}
              sx={{ bgcolor: '#7367F0', '&:hover': { bgcolor: '#665BE0' }, textTransform: 'none' }}
              onClick={handleGenerateReport}
          >
              {t('brandRise.reports.generate')}
          </Button>
        )}
      </Box>

      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Report Title</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Version</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Created Date</TableCell>
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
              ) : reports.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={4} align="center">
                     <Typography color="text.secondary">No reports generated yet.</Typography>
                   </TableCell>
                 </TableRow>
              ) : (
                (reports || []).map((row) => (
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
                             <Icon icon="tabler-file-text" fontSize={20} />
                         </Box>
                         <Typography variant="body1" fontWeight={500}>{row.title}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                          label={`v${row.version}`} 
                          size="small" 
                          sx={{ 
                              bgcolor: '#E8F8F0', 
                              color: '#28C76F',
                              fontWeight: 600,
                              borderRadius: 1,
                              height: 24
                          }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                          {new Date(row.generatedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Button 
                              variant="contained" 
                              size="small" 
                              startIcon={<Icon icon="tabler-eye" fontSize={16} />}
                              sx={{ 
                                  bgcolor: '#7367F0', 
                                  '&:hover': { bgcolor: '#665BE0' },
                                  textTransform: 'none',
                                  borderRadius: 1,
                                  px: 2
                              }}
                              onClick={() => handleViewReport(row.id)}
                          >
                              View
                          </Button>
                          <IconButton size="small" sx={{ color: 'text.secondary' }}>
                              <Icon icon="tabler-download" fontSize={20} />
                          </IconButton>
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

