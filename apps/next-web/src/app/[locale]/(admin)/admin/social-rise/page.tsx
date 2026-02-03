/* eslint-disable import/no-unresolved */
'use client';

import { useCallback, useEffect, useState } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useTranslations } from 'next-intl';

import { useAuth } from '@/contexts/AuthContext';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import type { ScheduledPost } from '@/services/brand.service';
import { BrandService } from '@/services/brand.service';
import ContentCalendar from './ContentCalendar';
import PostEditorDialog from './PostEditorDialog';
import PublishingLogsTable from './PublishingLogsTable';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
    return <i className={icon} style={{ fontSize }} {...rest} />
}

const ContentPage = () => {
    const theme = useTheme();
    const t = useTranslations('dashboard');
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { businessId } = useBusinessId();
    const { locationId } = useLocationFilter();
    const { user } = useAuth();

    const tabFromUrl = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabFromUrl || 'calendar');

    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<ScheduledPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
    const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);

    const [platformFilter, setPlatformFilter] = useState<string>('ALL');
    const [openAddDialog, setOpenAddDialog] = useState(false);

    useEffect(() => {
        if (tabFromUrl && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl, activeTab]);

    const handleTabChange = (_: any, newValue: string) => {
        setActiveTab(newValue);

        const params = new URLSearchParams(searchParams.toString());

        params.set('tab', newValue);

        router.push(`${pathname}?${params.toString()}`);
    };

    const canAdd = user?.role === 'ADMIN' || user?.role === 'MANAGER';
    const isDark = theme.palette.mode === 'dark';

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
      setFilteredPosts(scheduledPosts.filter(post => {
        const ALL_SUPPORTED_PLATFORMS = ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'GOOGLE_BUSINESS'];

        const normalizedPlatforms = (post.platforms || []).reduce((acc: string[], curr: string) => {
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

        const uniquePlatforms = Array.from(new Set(normalizedPlatforms));

        return uniquePlatforms.includes(platformFilter);
      }));
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
        <Box sx={{ 
            width: '100%', 
            p: { xs: 4, sm: 6, md: 8 },
            minHeight: '100vh',
            bgcolor: isDark ? 'background.default' : '#F8F9FA'
        }}>
            {/* Header Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', lg: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', lg: 'flex-end' }, 
                mb: 8,
                gap: 4
            }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <Box sx={{ 
                            p: 1.5, 
                            borderRadius: '12px', 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            display: 'flex'
                        }}>
                            <Icon icon="tabler-calendar-stats" fontSize={24} />
                        </Box>
                        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '1px' }}>
                            SOCIAL MEDIA STUDIO
                        </Typography>
                    </Box>
                    <Typography variant="h2" fontWeight="800" sx={{ mb: 1.5, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                        {t('navigation.social-content', { defaultValue: 'Calendar & Logs' })}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, opacity: 0.7, maxWidth: 600, lineHeight: 1.5 }}>
                        Schedule, manage, and monitor your brand&apos;s digital presence across all social channels from one unified calendar.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                    {canAdd && activeTab === 'calendar' && (
                        <Button
                            variant="contained"
                            startIcon={<Icon icon="tabler-plus" />}
                            sx={{ 
                                bgcolor: theme.palette.primary.main,
                                '&:hover': { 
                                    bgcolor: theme.palette.primary.dark,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`
                                }, 
                                px: 6, 
                                py: 2.5,
                                borderRadius: '14px',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                textTransform: 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                            }}
                            onClick={() => {
                                setInitialDate(new Date());
                                setSelectedPost(null);
                                setOpenAddDialog(true);
                            }}
                        >
                            {t('brandRise.content.add', { defaultValue: 'Create New Post' })}
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Content Container */}
            <Card sx={{ 
                boxShadow: isDark ? 'none' : '0 20px 60px 0 rgba(0, 0, 0, 0.03)',
                border: `1px solid ${isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.6)}`,
                borderRadius: '24px',
                overflow: 'hidden',
                bgcolor: 'background.paper',
                position: 'relative'
            }}>
                <Box sx={{ 
                    px: { xs: 4, md: 8 }, 
                    pt: 4,
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 4,
                }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        aria-label="content management tabs"
                        sx={{
                            minHeight: 'auto',
                            '& .MuiTabs-indicator': {
                                height: 0
                            },
                            '& .MuiTabs-flexContainer': {
                                gap: 1,
                                bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.03),
                                p: 1,
                                borderRadius: '14px',
                            },
                            '& .MuiTab-root': {
                                py: 2,
                                px: 6,
                                minHeight: 'auto',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                color: 'text.secondary',
                                textTransform: 'none',
                                borderRadius: '10px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&.Mui-selected': {
                                    color: isDark ? 'common.white' : 'primary.main',
                                    bgcolor: 'background.paper',
                                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.06)'
                                },
                                '&:hover:not(.Mui-selected)': {
                                    color: 'primary.main',
                                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                                }
                            }
                        }}
                    >
                        <Tab 
                            label={t('brandRise.content.calendar', { defaultValue: 'Calendar View' })} 
                            value="calendar" 
                        />
                        <Tab 
                            label={t('brandRise.content.logs', { defaultValue: 'Publishing Logs' })} 
                            value="logs" 
                        />
                    </Tabs>

                    {activeTab === 'calendar' && (
                        <Box sx={{ minWidth: 260 }}>
                            <TextField
                                id="platform-filter-select"
                                select
                                fullWidth
                                size="small"
                                value={platformFilter}
                                onChange={(e) => setPlatformFilter(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <Box sx={{ mr: 2, color: 'text.secondary', display: 'flex' }}>
                                            <Icon icon="tabler-filter" fontSize={18} />
                                        </Box>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02),
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover': {
                                            bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.04),
                                        },
                                        '&.Mui-focused': {
                                            bgcolor: 'background.paper',
                                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="ALL">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Icon icon="tabler-world" fontSize={18} />
                                        <Typography variant="body2" fontWeight="600">All Channels</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="INSTAGRAM">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Icon icon="tabler-brand-instagram" fontSize={18} style={{ color: '#E4405F' }} />
                                        <Typography variant="body2" fontWeight="600">Instagram</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="FACEBOOK">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Icon icon="tabler-brand-facebook" fontSize={18} style={{ color: '#1877F2' }} />
                                        <Typography variant="body2" fontWeight="600">Facebook</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="LINKEDIN">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Icon icon="tabler-brand-linkedin" fontSize={18} style={{ color: '#0A66C2' }} />
                                        <Typography variant="body2" fontWeight="600">LinkedIn</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="TWITTER">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Icon icon="tabler-brand-x" fontSize={18} />
                                        <Typography variant="body2" fontWeight="600">Twitter (X)</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="GOOGLE_BUSINESS">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Icon icon="tabler-brand-google" fontSize={18} style={{ color: '#4285F4' }} />
                                        <Typography variant="body2" fontWeight="600">Google Business</Typography>
                                    </Box>
                                </MenuItem>
                            </TextField>
                        </Box>
                    )}
                </Box>

                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    {activeTab === 'calendar' ? (
                        <Box sx={{ p: { xs: 2, sm: 6, md: 8 } }}>
                            <ContentCalendar
                                scheduledPosts={filteredPosts}
                                onEventDrop={handleEventDrop}
                                onDateClick={handleDateClick}
                                onEventClick={handleEventClick}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ p: { xs: 4, sm: 8 } }}>
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
