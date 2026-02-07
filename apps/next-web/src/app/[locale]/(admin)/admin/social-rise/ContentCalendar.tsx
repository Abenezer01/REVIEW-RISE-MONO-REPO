/* eslint-disable import/no-unresolved */

'use client';

import type { EventClickArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack';

import { useTranslations } from 'next-intl';
import { alpha, useTheme } from '@mui/material/styles';
import { useState, useRef } from 'react';

import type { ScheduledPost } from '@/services/brand.service';
import AppFullCalendar from '@/libs/styles/AppFullCalendar';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number;[key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />;
};

const PLATFORM_ICONS: Record<string, { icon: string; color: string }> = {
  INSTAGRAM: { icon: 'tabler-brand-instagram', color: '#E4405F' },
  FACEBOOK: { icon: 'tabler-brand-facebook', color: '#1877F2' },
  LINKEDIN: { icon: 'tabler-brand-linkedin', color: '#0A66C2' },
  TWITTER: { icon: 'tabler-brand-x', color: '#000000' },
  X: { icon: 'tabler-brand-x', color: '#000000' },
  GOOGLE_BUSINESS: { icon: 'tabler-brand-google', color: '#4285F4' },

  // Map mixed case names from planner/other services
  'Instagram': { icon: 'tabler-brand-instagram', color: '#E4405F' },
  'Facebook': { icon: 'tabler-brand-facebook', color: '#1877F2' },
  'LinkedIn': { icon: 'tabler-brand-linkedin', color: '#0A66C2' },
  'Twitter': { icon: 'tabler-brand-x', color: '#000000' },
  'Google Business': { icon: 'tabler-brand-google', color: '#4285F4' }
};

interface ContentCalendarProps {
  scheduledPosts: ScheduledPost[];
  onEventDrop?: (postId: string, newDate: Date) => void;
  onDateClick?: (date: Date) => void;
  onEventClick?: (postId: string) => void;
}

const ContentCalendar = ({ scheduledPosts, onEventDrop, onDateClick, onEventClick }: ContentCalendarProps) => {
  const theme = useTheme();
  const t = useTranslations('social.calendar');
  const isDark = theme.palette.mode === 'dark';

  // Transform scheduled posts into FullCalendar events
  const postEvents = scheduledPosts.map(post => {
    let color = '';
    let className = '';

    const ALL_SUPPORTED_PLATFORMS = ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'GOOGLE_BUSINESS'];

    // Normalize platforms array to handle comma-separated strings if they exist
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

          return [...pAcc, p];
        }, [])];
      }

      return [...acc, curr];
    }, []);

    const uniquePlatforms = Array.from(new Set(normalizedPlatforms)) as string[];

    // Color based on status - using softer background colors with high contrast text/border
    switch (post.status) {
      case 'published':
        color = '#28C76F';
        className = 'event-bg-success';
        break;
      case 'failed':
        color = '#EA5455';
        className = 'event-bg-error';
        break;
      case 'scheduled':
        color = '#7367F0';
        className = 'event-bg-primary';
        break;
      case 'draft':
        color = '#82868B'; // Professional secondary grey
        className = 'event-bg-secondary';
        break;
      case 'publishing':
        color = '#00CFE8'; // Info blue for active processing
        className = 'event-bg-info';
        break;
      case 'canceled':
        color = '#FF9F43'; // Warning orange
        className = 'event-bg-warning';
        break;
      default:
        color = '#7367F0';
        className = 'event-bg-primary';
    }

    return {
      id: post.id,
      title: post.content.title || post.content.text?.substring(0, 30) || 'Untitled Post',
      start: post.scheduledAt,
      allDay: false,
      backgroundColor: 'transparent', // We'll handle background in eventContent
      borderColor: 'transparent',
      classNames: [className, 'modern-event'],
      extendedProps: {
        ...post,
        platforms: uniquePlatforms,
        type: 'post',
        statusColor: color
      }
    };
  });

  const allEvents = [...postEvents];

  const [view, setView] = useState('dayGridMonth');
  const [searchTerm, setSearchTerm] = useState('');
  const calendarRef = useRef<FullCalendar>(null);

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
    if (newView !== null) {
      setView(newView);
      const api = calendarRef.current?.getApi();

      if (api) {
        api.changeView(newView);
      }
    }
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
  };

  const legendItems = [
    { label: t('statuses.scheduled'), color: '#7367F0' },
    { label: t('statuses.published'), color: '#28C76F' },
    { label: t('statuses.draft'), color: '#82868B' },
    { label: t('statuses.publishing'), color: '#00CFE8' },
    { label: t('statuses.failed'), color: '#EA5455' },
    { label: t('statuses.canceled'), color: '#FF9F43' }
  ];

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      bgcolor: 'background.paper',
      borderRadius: '24px',
      overflow: 'hidden',
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.05)',

      // FullCalendar Overrides
      '& .fc': {
        '--fc-border-color': theme.palette.divider,
        '--fc-today-bg-color': isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02),
        fontFamily: theme.typography.fontFamily
      },
      '& .fc-theme-standard td, & .fc-theme-standard th': {
        borderColor: alpha(theme.palette.divider, 0.6)
      },
      '& .fc-scrollgrid': {
        border: 'none !important'
      },
      '& .fc-col-header-cell': {
        borderBottom: `1px solid ${theme.palette.divider} !important`,
        borderLeft: 'none !important',
        borderRight: 'none !important',
        py: 2
      },
      '& .fc-timegrid-slot': {
        height: '4rem !important',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)} !important`
      },
      '& .fc-timegrid-axis-cushion': {
        color: theme.palette.text.secondary,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        fontWeight: 600
      },
      '& .fc-event': {
        background: 'none !important',
        border: 'none !important',
        padding: '0 !important',
        boxShadow: 'none !important'
      }
    }}>
      {/* Custom Toolbar */}
      <Box sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : '#fff'
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handlePrev} size="small" sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <Icon icon="tabler-chevron-left" fontSize={18} />
          </IconButton>
          <Button
            onClick={handleToday}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: '8px',
              px: 3,
              color: 'text.primary',
              borderColor: theme.palette.divider,
              fontWeight: 600,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
            }}
          >
            {t('today')}
          </Button>
          <IconButton onClick={handleNext} size="small" sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <Icon icon="tabler-chevron-right" fontSize={18} />
          </IconButton>
        </Stack>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{
            bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.03),
            p: 0.5,
            borderRadius: '12px',
            border: 'none',
            '& .MuiToggleButton-root': {
              px: 3,
              py: 0.8,
              border: 'none',
              borderRadius: '8px !important',
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'none',
              mx: 0.2,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': { bgcolor: 'primary.dark' }
              }
            }
          }}
        >
          <ToggleButton value="timeGridDay">{t('views.day')}</ToggleButton>
          <ToggleButton value="timeGridWeek">{t('views.week')}</ToggleButton>
          <ToggleButton value="dayGridMonth">{t('views.month')}</ToggleButton>
          <ToggleButton value="listMonth">{t('views.year')}</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          size="small"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon="tabler-search" fontSize={18} />
              </InputAdornment>
            ),
            sx: { borderRadius: '10px', width: 220, bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02) }
          }}
        />
      </Box>

      {/* Legend */}
      <Box sx={{
        px: 4,
        py: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        bgcolor: isDark ? alpha(theme.palette.background.paper, 0.2) : alpha(theme.palette.background.default, 0.4),
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '10px',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main'
          }}>
            <Icon icon="tabler-info-circle" fontSize={18} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.2px' }}>
            {t('statusLegend')}
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexGrow: 1,
          justifyContent: 'flex-end'
        }}>
          {legendItems.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: '12px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : '#fff',
                '&:hover': {
                  bgcolor: alpha(item.color, 0.08),
                  borderColor: alpha(item.color, 0.3),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(item.color, 0.1)}`
                }
              }}
            >
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: item.color,
                boxShadow: `0 0 10px ${alpha(item.color, 0.5)}`,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -3,
                  left: -3,
                  right: -3,
                  bottom: -3,
                  borderRadius: '50%',
                  border: `1px solid ${alpha(item.color, 0.2)}`
                }
              }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s',
                  '.MuiBox-root:hover &': {
                    color: 'text.primary'
                  }
                }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <AppFullCalendar className='app-calendar' sx={{ p: '0 !important', flexGrow: 1 }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView='dayGridMonth'
          headerToolbar={false}
          events={allEvents}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          height="auto"
          dayHeaderContent={(arg) => {
            const date = arg.date;
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date).toUpperCase();
            const dayNum = date.getDate();

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
                  {dayName}
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: 'text.primary' }}>
                  {dayNum}
                </Typography>
              </Box>
            );
          }}
          eventContent={(eventInfo) => {
            const platforms = eventInfo.event.extendedProps.platforms || [];
            const statusColor = eventInfo.event.extendedProps.statusColor || theme.palette.primary.main;
            const viewType = eventInfo.view.type;
            const isMonth = viewType === 'dayGridMonth';

            return (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                borderRadius: '8px',
                bgcolor: alpha(statusColor, 0.08),
                borderTop: `3px solid ${statusColor}`,
                p: isMonth ? 1 : 1.5,
                gap: 0.5,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(statusColor, 0.12),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(statusColor, 0.1)}`
                },
                cursor: 'pointer',
                overflow: 'hidden'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: statusColor,
                    whiteSpace: 'nowrap'
                  }}>
                    {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(eventInfo.event.start!).toUpperCase()}
                  </Typography>
                  {platforms.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {platforms.slice(0, 1).map((p: string) => {
                        const platform = PLATFORM_ICONS[(p || '').toUpperCase().replace(/\s+/g, '_')] || { icon: 'tabler-world', color: statusColor };

                        return <Icon key={p} icon={platform.icon} fontSize={12} style={{ color: platform.color }} />;
                      })}
                    </Box>
                  )}
                </Box>
                <Typography sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: isMonth ? 1 : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {eventInfo.event.title}
                </Typography>
              </Box>
            );
          }}
          eventClick={(info: EventClickArg) => {
            if (onEventClick) {
              onEventClick(info.event.id);
            }
          }}
          dateClick={(info) => {
            if (onDateClick) onDateClick(info.date);
          }}
          eventDrop={(info: EventDropArg) => {
            if (info.event.extendedProps.type === 'post' && onEventDrop) {
              onEventDrop(info.event.id, info.event.start!);
            } else {
              info.revert();
            }
          }}
        />
      </AppFullCalendar>
    </Box>
  );
};

export default ContentCalendar;
