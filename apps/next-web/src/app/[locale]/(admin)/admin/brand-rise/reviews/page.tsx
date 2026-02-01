/* eslint-disable import/no-unresolved */
'use client';

import { useEffect, useState } from 'react';

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
import Rating from '@mui/material/Rating';
import { useTheme, alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';

import { useSystemMessages } from '@platform/shared-ui';
import { SystemMessageCode } from '@platform/contracts';

import { useAuth } from '@/contexts/AuthContext';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import type { Review } from '@/services/brand.service';
import { BrandService } from '@/services/brand.service';

// Shared Components
import DashboardDonutChart from '@/components/shared/dashboard/DashboardDonutChart';
import DashboardLineChart from '@/components/shared/dashboard/DashboardLineChart';
import MetricCard from '@/components/shared/dashboard/MetricCard';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

const ReviewsPage = () => {
  const { notify } = useSystemMessages();
  const theme = useTheme();
  const t = useTranslations('dashboard');
  const { businessId } = useBusinessId();
  const { locationId } = useLocationFilter();
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Pending Approval
  
  // Reply State
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const canReply = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    const fetchData = async () => {
        if (!businessId) return;
        setLoading(true);
  
        try {
            const replyStatus = activeTab === 1 ? 'pending_approval' : undefined;

            const [reviewsData, statsData] = await Promise.all([
                BrandService.listReviews(businessId, 1, 50, undefined, locationId, replyStatus),
                BrandService.getReviewStats(businessId, locationId)
            ]);
  
            setReviews(reviewsData.reviews);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch reviews data', error);
        } finally {
            setLoading(false);
        }
    };

    if (businessId) {
        fetchData();
    }
  }, [businessId, locationId, activeTab]);

  const refreshData = async () => {
    if (!businessId) return;

    try {
        const replyStatus = activeTab === 1 ? 'pending_approval' : undefined;

        const [reviewsData, statsData] = await Promise.all([
            BrandService.listReviews(businessId, 1, 50, undefined, locationId, replyStatus),
            BrandService.getReviewStats(businessId, locationId)
        ]);

        setReviews(reviewsData.reviews);
        setStats(statsData);
    } catch (error) {
        console.error('Failed to refresh reviews', error);
    }
  };

  const handleOpenReply = (review: Review) => {
      setSelectedReview(review);

      // If there's an AI suggestion, use it as default
      const suggestion = (review as any).aiSuggestions?.suggestedReply;

      setReplyText(review.response || suggestion || '');
      setReplyDialogOpen(true);
  };

  const handleSendReply = async () => {
      if (!businessId || !selectedReview || !replyText) return;
      setReplying(true);

      try {
          await BrandService.postReviewReply(businessId, selectedReview.id, replyText);
          notify(SystemMessageCode.REVIEWS_REPLY_POSTED);
          setReplyDialogOpen(false);
          refreshData(); // Refresh list
      } catch (error) {
          console.error('Failed to send reply', error);
          notify(SystemMessageCode.GENERIC_ERROR);
      } finally {
          setReplying(false);
      }
  };

  const handleRejectReply = async (reviewId: string) => {
      if (!businessId) return;
      
      try {
          await BrandService.rejectReviewReply(businessId, reviewId);
          notify(SystemMessageCode.REVIEWS_REPLY_REJECTED);
          refreshData();
      } catch (error) {
          console.error('Failed to reject reply', error);
          notify(SystemMessageCode.GENERIC_ERROR);
      }
  };

  // Mock Data for Charts (placeholder for now)
  const velocitySeries = [{ name: 'Reviews', data: [12, 19, 15, 25, 22, 30, 35, 28, 42, 45, 50, 55] }];
  const velocityCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Derive sentiment from reviews (simple heuristic)
  const positive = (reviews || []).filter(r => r.rating >= 4).length;
  const neutral = (reviews || []).filter(r => r.rating === 3).length;
  const negative = (reviews || []).filter(r => r.rating <= 2).length;
  const total = (reviews || []).length || 1; // avoid div by zero
  
  const sentimentSeries = [
      Math.round((positive / total) * 100), 
      Math.round((neutral / total) * 100), 
      Math.round((negative / total) * 100)
  ];
  
  const sentimentLabels = ['Positive', 'Neutral', 'Negative'];

  // Helper for sentiment color/label
  const getSentimentInfo = (rating: number) => {
      if (rating >= 4) return { label: 'Positive', color: 'success' };
      if (rating === 3) return { label: 'Neutral', color: 'warning' };
      
      return { label: 'Negative', color: 'error' };
  };

  const responseRate = (reviews || []).length > 0 
      ? Math.round(((reviews || []).filter(r => r.response).length / (reviews || []).length) * 100) 
      : 0;

  return (
    <Grid container spacing={4}>
      {/* Metrics Row */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard 
            title="Total Reviews" 
            value={stats.totalReviews.toString()} 
            trend={{ value: 0, label: 'this month', direction: 'up', suffix: '+' }}
            icon={<Icon icon="tabler-message-circle" fontSize={24} />}
            iconColor="#7367F0"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard 
            title="Average Rating" 
            value={stats.averageRating.toString()} 
            trend={{ value: 0, label: 'vs last period', direction: 'up', suffix: '+' }}
            icon={<Icon icon="tabler-star" fontSize={24} />}
            iconColor="#FF9F43"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
         <MetricCard 
            title="Sentiment Score" 
            value={`${sentimentSeries[0]}%`} 
            trend={{ value: 'Positive sentiment', label: '', direction: 'up', suffix: '' }}
            icon={<Icon icon="tabler-mood-smile" fontSize={24} />}
            iconColor="#28C76F"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
         <MetricCard 
            title="Response Rate" 
            value={`${responseRate}%`} 
            trend={{ value: 0, label: 'vs last period', direction: 'up', suffix: '% +' }}
            icon={<Icon icon="tabler-arrow-back-up" fontSize={24} />}
            iconColor="#7367F0"
        />
      </Grid>

      {/* Charts Row */}
      <Grid size={{ xs: 12, md: 8 }}>
        <DashboardLineChart 
            title={t('brandRise.reviews.velocity')} 
            subtitle="Review volume over time"
            series={velocitySeries}
            categories={velocityCategories}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <DashboardDonutChart 
            title={t('brandRise.reviews.sentiment')} 
            subtitle="Sentiment model"
            series={sentimentSeries}
            labels={sentimentLabels}
        />
      </Grid>

      {/* Recent Reviews List */}
      <Grid size={{ xs: 12 }}>
         <Card sx={{ height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={(_, v) => setActiveTab(v)} 
                sx={{ px: 2 }}
                id="reviews-tabs"
              >
                <Tab 
                  label="All Reviews" 
                  id="reviews-tab-all"
                  aria-controls="reviews-tabpanel-all"
                />
                <Tab 
                  label="Pending Approval" 
                  id="reviews-tab-pending"
                  aria-controls="reviews-tabpanel-pending"
                />
              </Tabs>
            </Box>
            <CardContent>
               <Box sx={{ mb: 4 }}>
                  <Typography variant="h6">
                    {activeTab === 0 ? t('brandRise.reviews.recent') : 'Pending AI Replies'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeTab === 0 
                      ? 'Latest customer feedback across all platforms' 
                      : 'Reviews waiting for AI reply approval before posting'}
                  </Typography>
               </Box>

               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                          <CircularProgress />
                      </Box>
                  ) : reviews.length === 0 ? (
                      <Typography color="text.secondary" align="center">No reviews found.</Typography>
                  ) : (
                      reviews.map((review) => {
                         const sentiment = getSentimentInfo(review.rating);
                         const isPending = (review as any).replyStatus === 'pending_approval';

                         return (
                             <Box key={review.id} sx={{ p: 2, borderRadius: 1, bgcolor: 'background.default' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                   <Box sx={{ display: 'flex', gap: 2 }}>
                                      <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>
                                        {review.author.charAt(0)}
                                      </Avatar>
                                      <Box>
                                         <Typography variant="subtitle2" fontWeight="bold">{review.author}</Typography>
                                         <Typography variant="caption" color="text.secondary">
                                             {new Date(review.publishedAt).toLocaleDateString()}
                                         </Typography>
                                      </Box>
                                   </Box>
                                   <Rating value={review.rating} readOnly size="small" />
                                </Box>
                                
                                <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>{review.content || 'No content'}</Typography>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                   <Box sx={{ display: 'flex', gap: 1 }}>
                                       <Chip 
                                          label={review.platform} 
                                          size="small" 
                                          sx={{ 
                                            bgcolor: 'primary.lighter', 
                                            color: 'primary.main', 
                                            fontWeight: 'bold',
                                            borderRadius: 1
                                          }} 
                                       />
                                       <Chip 
                                          label={sentiment.label} 
                                          size="small" 
                                          color={sentiment.color as any}
                                          sx={{ 
                                            borderRadius: 1,
                                            height: 24,
                                            '& .MuiChip-label': { px: 1.5, fontSize: '0.75rem', fontWeight: 600 }
                                          }} 
                                       />
                                       {isPending && (
                                         <Chip 
                                            label="Pending AI Approval" 
                                            size="small" 
                                            color="info"
                                            variant="outlined"
                                            sx={{ borderRadius: 1, height: 24 }}
                                         />
                                       )}
                                   </Box>
                                   {canReply && (
                                       <Stack direction="row" spacing={1}>
                                          {isPending && (
                                            <Button 
                                              size="small" 
                                              variant="outlined" 
                                              color="error"
                                              onClick={() => handleRejectReply(review.id)}
                                            >
                                              Reject
                                            </Button>
                                          )}
                                          <Button 
                                              size="small" 
                                              variant={review.response ? "outlined" : "contained"} 
                                              onClick={() => handleOpenReply(review)}
                                          >
                                              {review.response ? 'Edit Reply' : isPending ? 'Review & Post' : 'Reply'}
                                          </Button>
                                       </Stack>
                                   )}
                                </Box>

                                {isPending && (review as any).aiSuggestions?.suggestedReply && (
                                    <Box sx={{ mt: 2, pl: 2, borderLeft: `2px solid ${theme.palette.info.main}`, bgcolor: (theme) => alpha(theme.palette.info.main, 0.05), p: 2, borderRadius: 1 }}>
                                        <Typography variant="caption" fontWeight="bold" color="info.main">AI Suggested Reply:</Typography>
                                        <Typography variant="body2">{(review as any).aiSuggestions.suggestedReply}</Typography>
                                    </Box>
                                )}

                                {review.response && (
                                    <Box sx={{ mt: 2, pl: 2, borderLeft: `2px solid ${theme.palette.primary.main}`, bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
                                        <Typography variant="caption" fontWeight="bold" color="primary">Your Response:</Typography>
                                        <Typography variant="body2">{review.response}</Typography>
                                    </Box>
                                )}
                             </Box>
                         );
                      })
                  )}
               </Box>
            </CardContent>
         </Card>
      </Grid>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            {selectedReview?.response ? 'Edit Reply' : 'Reply to Review'}
          </DialogTitle>
          <DialogContent>
              <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Review content:</Typography>
                  <Typography variant="body2" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 3 }}>
                    {selectedReview?.content}
                  </Typography>
                  <TextField
                      id="review-reply-dialog-input"
                      fullWidth
                      multiline
                      rows={6}
                      variant="outlined"
                      placeholder="Type your response here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={replying}
                  />
                  {(selectedReview as any)?.aiSuggestions?.analysis && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      AI Analysis: {(selectedReview as any).aiSuggestions.analysis}
                    </Typography>
                  )}
              </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setReplyDialogOpen(false)} disabled={replying}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleSendReply} 
                disabled={!replyText || replying}
                startIcon={replying && <CircularProgress size={20} color="inherit" />}
              >
                {replying ? 'Posting...' : 'Post Reply'}
              </Button>
          </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ReviewsPage;
