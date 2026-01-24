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
  GOOGLE_BUSINESS: { icon: 'tabler-brand-google', color: '#4285F4' }
};

interface ContentCalendarProps {
  scheduledPosts: ScheduledPost[];
  onEventDrop?: (postId: string, newDate: Date) => void;
  onDateClick?: (date: Date) => void;
  onEventClick?: (postId: string) => void;
}

const ContentCalendar = ({ scheduledPosts, onEventDrop, onDateClick, onEventClick }: ContentCalendarProps) => {
  // Transform scheduled posts into FullCalendar events
  const postEvents = scheduledPosts.map(post => {
    let color = '';
    let className = '';

    // Color based on status
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
      backgroundColor: color,
      borderColor: color,
      classNames: [className],
      extendedProps: {
        ...post,
        type: 'post'
      }
    };
  });

  const allEvents = [...postEvents];

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <AppFullCalendar className='app-calendar'>
        <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        headerToolbar={{
          start: 'sidebarToggle, prev,next, title',
          end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        }}
        events={allEvents}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={3}
        height={700}
        eventContent={(eventInfo) => {
          const platforms = eventInfo.event.extendedProps.platforms || [];

          return (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              overflow: 'hidden',
              px: 1,
              py: 0.5,
              width: '100%'
            }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                {platforms.map((p: string) => (
                  <Icon 
                    key={p} 
                    icon={PLATFORM_ICONS[p]?.icon || 'tabler-world'} 
                    fontSize={12} 
                    style={{ color: PLATFORM_ICONS[p]?.color }} 
                  />
                ))}
              </Box>
              <Typography 
                variant="caption" 
                noWrap 
                sx={{ 
                  fontWeight: 500,
                  color: 'inherit',
                  lineHeight: 1.2
                }}
              >
                {eventInfo.event.title}
              </Typography>
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
