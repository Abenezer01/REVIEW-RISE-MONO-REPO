/* eslint-disable import/no-unresolved */
'use client';

import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useTranslations } from 'next-intl';

import { useAuth } from '@/contexts/AuthContext';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import type { ScheduledPost } from '@/services/brand.service';
import { BrandService } from '@/services/brand.service';
import ContentCalendar from './ContentCalendar';
import PostEditorDialog from './PostEditorDialog';
import PublishingLogsTable from '@/app/[locale]/(admin)/admin/brand-rise/content/PublishingLogsTable';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
    return <i className={icon} style={{ fontSize }} {...rest} />
}

const ContentPage = () => {
    const t = useTranslations('dashboard');
    const { businessId } = useBusinessId();
    const { locationId } = useLocationFilter();
    const { user } = useAuth();
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<ScheduledPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
    const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);

    const [platformFilter, setPlatformFilter] = useState<string>('ALL');
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('calendar');

    const canAdd = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const fetchData = useCallback(async () => {
        if (!businessId) return;

        try {
            const postsData = await BrandService.listScheduledPosts(businessId);

            // If locationId is present, filter posts by locationId
            const filteredByLocation = locationId 
                ? postsData.filter(p => p.locationId === locationId)
                : postsData;

            setScheduledPosts(filteredByLocation);
        } catch (error) {
            console.error('Failed to fetch scheduled posts', error);
        }
    }, [businessId, locationId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (platformFilter === 'ALL') {
            setFilteredPosts(scheduledPosts);
        } else {
            setFilteredPosts(scheduledPosts.filter(post => post.platforms.includes(platformFilter)));
        }
    }, [platformFilter, scheduledPosts]);

    const handleSavePost = async (data: Partial<ScheduledPost>) => {
        if (!businessId) return;

        try {
            if (selectedPost) {
                await BrandService.updateScheduledPost(businessId, selectedPost.id, data);
            } else {
                // Include locationId if present when creating new post
                const postData = {
                    ...data,
                    locationId: locationId || undefined
                };

                await BrandService.createScheduledPost(businessId, postData);
            }

            fetchData();
        } catch (error) {
            console.error('Failed to save post', error);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!businessId) return;

        try {
            await BrandService.deleteScheduledPost(businessId, postId);

            fetchData();
        } catch (error) {
            console.error('Failed to delete post', error);
        }
    };

    const handleDuplicatePost = async (postId: string) => {
        if (!businessId) return;

        try {
            await BrandService.duplicateScheduledPost(businessId, postId);
            fetchData();
        } catch (error) {
            console.error('Failed to duplicate post', error);
        }
    };

    const handleEventDrop = async (postId: string, newDate: Date) => {
        if (!businessId) return;

        try {
            await BrandService.updateScheduledPost(businessId, postId, {
                scheduledAt: newDate.toISOString()
            });

            fetchData();
        } catch (error) {
            console.error('Failed to update post date', error);
            fetchData(); // Revert UI
        }
    };

    const handleDateClick = (date: Date) => {
        setInitialDate(date);
        setSelectedPost(null);
        setOpenAddDialog(true);
    };

    const handleEventClick = (postId: string) => {
        const post = scheduledPosts.find(p => p.id === postId);

        if (post) {
            setSelectedPost(post);
            setInitialDate(undefined);
            setOpenAddDialog(true);
        }
    };



    return (
        <Box sx={{ width: '100%', p: { xs: 2, sm: 4, md: 6 } }}>
            {/* Header Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                mb: 6,
                gap: 4
            }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        {t('brandRise.content.title', { defaultValue: 'Content Management' })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Plan, schedule, and monitor your social media content across platforms.
                    </Typography>
                </Box>

                {canAdd && activeTab === 'calendar' && (
                    <Button
                        variant="contained"
                        startIcon={<Icon icon="tabler-plus" />}
                        sx={{ 
                            bgcolor: '#7367F0', 
                            '&:hover': { bgcolor: '#665BE0' }, 
                            px: 6, 
                            py: 2,
                            borderRadius: 1.5,
                            boxShadow: '0 4px 14px 0 rgba(115, 103, 240, 0.39)'
                        }}
                        onClick={() => {
                            setInitialDate(new Date());
                            setSelectedPost(null);
                            setOpenAddDialog(true);
                        }}
                    >
                        {t('brandRise.content.add')}
                    </Button>
                )}
            </Box>

            {/* Tabs & Filters Section */}
            <Card sx={{ 
                mb: 6, 
                boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.05)',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 2
            }}>
                <Box sx={{ 
                    px: 6, 
                    pt: 2, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 4,
                    borderBottom: 1, 
                    borderColor: 'divider' 
                }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(_, newValue) => setActiveTab(newValue)} 
                        aria-label="content management tabs"
                        sx={{
                            '& .MuiTab-root': {
                                py: 4,
                                minHeight: 'auto',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                }
                            }
                        }}
                    >
                        <Tab 
                            icon={<Icon icon="tabler-calendar" fontSize={20} />} 
                            iconPosition="start"
                            label={t('brandRise.content.calendar', { defaultValue: 'Content Calendar' })} 
                            value="calendar" 
                        />
                        <Tab 
                            icon={<Icon icon="tabler-list-details" fontSize={20} />} 
                            iconPosition="start"
                            label={t('brandRise.content.logs', { defaultValue: 'Publishing Logs' })} 
                            value="logs" 
                        />
                    </Tabs>

                    {activeTab === 'calendar' && (
                        <Box sx={{ pb: 2, minWidth: 220 }}>
                            <TextField
                                id="platform-filter-select"
                                select
                                fullWidth
                                size="small"
                                label="Platform Filter"
                                value={platformFilter}
                                onChange={(e) => setPlatformFilter(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'background.default'
                                    }
                                }}
                            >
                                <MenuItem value="ALL">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Icon icon="tabler-world" fontSize={18} />
                                        <span>All Platforms</span>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="INSTAGRAM">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Icon icon="tabler-brand-instagram" fontSize={18} style={{ color: '#E4405F' }} />
                                        <span>Instagram</span>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="FACEBOOK">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Icon icon="tabler-brand-facebook" fontSize={18} style={{ color: '#1877F2' }} />
                                        <span>Facebook</span>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="LINKEDIN">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Icon icon="tabler-brand-linkedin" fontSize={18} style={{ color: '#0A66C2' }} />
                                        <span>LinkedIn</span>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="TWITTER">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Icon icon="tabler-brand-x" fontSize={18} />
                                        <span>Twitter (X)</span>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="GOOGLE_BUSINESS">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Icon icon="tabler-brand-google" fontSize={18} style={{ color: '#4285F4' }} />
                                        <span>Google Business</span>
                                    </Box>
                                </MenuItem>
                            </TextField>
                        </Box>
                    )}
                </Box>

                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    {activeTab === 'calendar' ? (
                        <ContentCalendar
                            scheduledPosts={filteredPosts}
                            onEventDrop={handleEventDrop}
                            onDateClick={handleDateClick}
                            onEventClick={handleEventClick}
                        />
                    ) : (
                        <Box sx={{ p: 6 }}>
                            <PublishingLogsTable 
                                businessId={businessId || ''} 
                                onViewPost={handleEventClick}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            <PostEditorDialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                post={selectedPost}
                initialDate={initialDate}
                onSave={handleSavePost}
                onDelete={handleDeletePost}
                onDuplicate={handleDuplicatePost}
            />
        </Box>
    );
};

export default ContentPage;
