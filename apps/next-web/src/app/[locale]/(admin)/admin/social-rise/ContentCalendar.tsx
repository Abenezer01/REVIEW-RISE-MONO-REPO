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

import { alpha, useTheme } from '@mui/material/styles';

import type { ScheduledPost } from '@/services/brand.service';
import AppFullCalendar from '@/libs/styles/AppFullCalendar';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />;
};

const PLATFORM_ICONS: Record<string, { icon: string; color: string }> = {
  INSTAGRAM: { icon: 'tabler-brand-instagram', color: '#E4405F' },
  FACEBOOK: { icon: 'tabler-brand-facebook', color: '#1877F2' },
  LINKEDIN: { icon: 'tabler-brand-linkedin', color: '#0A66C2' },
  TWITTER: { icon: 'tabler-brand-x', color: '#000000' },
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
  const isDark = theme.palette.mode === 'dark';

  // Transform scheduled posts into FullCalendar events
  const postEvents = scheduledPosts.map(post => {
    let color = '';
    let className = '';

    // Color based on status - using softer background colors with high contrast text/border
    switch(post.status) {
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
            color = '#A8AAAD';
            className = 'event-bg-secondary';
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
        type: 'post',
        statusColor: color
      }
    };
  });

  const allEvents = [...postEvents];

  return (
      <Box sx={{ 
        width: '100%', 
        height: '100%',
        '& .fc-theme-standard td, & .fc-theme-standard th': {
          borderColor: isDark ? alpha(theme.palette.divider, 0.5) : alpha(theme.palette.divider, 0.5)
        },
        '& .fc-day-today': {
          backgroundColor: isDark ? `${alpha(theme.palette.primary.main, 0.08)} !important` : `${alpha(theme.palette.primary.main, 0.04)} !important`,
          '& .fc-daygrid-day-number': {
            color: 'primary.main !important',
            fontWeight: 800,
            fontSize: '1rem',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            m: 1
          }
        },
        '& .fc-event': {
          background: 'none !important',
          border: 'none !important',
          padding: '0 !important',
          boxShadow: 'none !important'
        },
        '& .fc-daygrid-event-harness': {
          margin: '4px 6px !important'
        },
        '& .fc-col-header-cell': {
          py: 4,
          bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.common.black, 0.01),
          '& .fc-col-header-cell-cushion': {
            color: theme.palette.text.secondary,
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '1.5px'
          }
        },
        '& .fc-toolbar-title': {
          fontWeight: 800,
          letterSpacing: '-1px',
          fontSize: '1.5rem !important'
        },
        '& .fc-button': {
          borderRadius: '12px !important',
          fontWeight: 700,
          textTransform: 'capitalize',
          fontSize: '0.85rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)'
          }
        },
        '& .fc-daygrid-day-number': {
          p: 2,
          fontWeight: 600,
          color: alpha(theme.palette.text.primary, 0.7),
          fontSize: '0.9rem'
        }
      }}>
        <AppFullCalendar className='app-calendar'>
          <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView='dayGridMonth'
          headerToolbar={{
            start: 'prev,next, title',
            end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
          }}
          events={allEvents}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          height={800}
          eventContent={(eventInfo) => {
            const platforms = eventInfo.event.extendedProps.platforms || [];
            const statusColor = eventInfo.event.extendedProps.statusColor || theme.palette.primary.main;
            const isDark = theme.palette.mode === 'dark';
            const status = eventInfo.event.extendedProps.status || 'scheduled';

            return (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 1.5,
                p: 2.5,
                width: '100%',
                height: '100%',
                borderRadius: '16px',
                backgroundColor: isDark ? alpha(statusColor, 0.12) : alpha(statusColor, 0.06),
                border: `1px solid ${isDark ? alpha(statusColor, 0.25) : alpha(statusColor, 0.15)}`,
                borderLeft: `5px solid ${statusColor}`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  backgroundColor: isDark ? alpha(statusColor, 0.2) : alpha(statusColor, 0.12),
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: `0 12px 24px -8px ${alpha(statusColor, 0.5)}`,
                  zIndex: 50,
                  borderColor: alpha(statusColor, 0.5)
                },
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                    {platforms.map((p: string) => {
                      const platformKey = PLATFORM_ICONS[p] ? p : p.toUpperCase().replace(/\s+/g, '_');
                      const platform = PLATFORM_ICONS[platformKey] || { icon: 'tabler-world', color: theme.palette.text.secondary };

                      return (
                        <Box
                          key={p}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            borderRadius: '8px',
                            backgroundColor: isDark ? alpha(theme.palette.common.white, 0.1) : 'background.paper',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.06)',
                            color: platform.color,
                            border: `1px solid ${alpha(platform.color, 0.15)}`,
                            transition: 'all 0.2s',
                            '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: `0 4px 12px ${alpha(platform.color, 0.2)}`
                            }
                          }}
                        >
                          <Icon
                            icon={platform.icon}
                            fontSize={14}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                  
                  <Box sx={{ 
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '8px',
                    bgcolor: alpha(statusColor, 0.15),
                    border: `1px solid ${alpha(statusColor, 0.3)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                     <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor }} />
                     <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 900, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {status}
                     </Typography>
                  </Box>
                </Box>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700,
                    color: isDark ? 'text.primary' : 'text.primary',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '0.85rem',
                    letterSpacing: '-0.3px'
                  }}
                >
                  {eventInfo.event.title}
                </Typography>

                {eventInfo.event.start && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mt: 'auto', 
                    pt: 1,
                    borderTop: `1px solid ${isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.05)}`
                  }}>
                    <Icon icon="tabler-clock" fontSize={14} style={{ opacity: 0.6 }} />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        opacity: 0.8,
                        color: 'text.secondary'
                      }}
                    >
                      {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(eventInfo.event.start)}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }}
        eventClick={(info: EventClickArg) => {
            if (onEventClick) {
                onEventClick(info.event.id);
            } else {
                alert(`Event: ${info.event.title}\nDescription: ${info.event.extendedProps.description || 'No description'}`);
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
