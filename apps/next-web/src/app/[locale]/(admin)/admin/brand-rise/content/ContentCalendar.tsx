
'use client';

import AppFullCalendar from '@/libs/styles/AppFullCalendar';
import { ContentIdea } from '@/services/brand.service';
import { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useTheme } from '@mui/material';

interface ContentCalendarProps {
  ideas: ContentIdea[];
}

const ContentCalendar = ({ ideas }: ContentCalendarProps) => {
  const theme = useTheme();

  // Transform ideas into FullCalendar events
  const events = ideas.map(idea => {
    let color = '';
    let className = '';
    
    switch(idea.platform) {
        case 'BLOG POST': 
            color = '#7367F0'; 
            className = 'event-bg-primary';
            break;
        case 'SOCIAL POST': 
            color = '#28C76F'; 
            className = 'event-bg-success';
            break;
        case 'VIDEO': 
            color = '#FF9F43'; 
            className = 'event-bg-warning';
            break;
        case 'EMAIL': 
            color = '#00CFE8'; 
            className = 'event-bg-info';
            break;
        default: 
            color = '#7367F0';
            className = 'event-bg-primary';
    }

    // If scheduledAt exists use it, otherwise use createdAt for demo or random date
    const date = idea.createdAt; 

    return {
      id: idea.id,
      title: `${idea.platform}: ${idea.title}`,
      start: date,
      allDay: true,
      backgroundColor: color,
      borderColor: color,
      classNames: [className],
      extendedProps: {
        description: idea.description,
        platform: idea.platform
      }
    };
  });

  return (
    <AppFullCalendar className='app-calendar'>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        headerToolbar={{
          start: 'sidebarToggle, prev,next, title',
          end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        }}
        events={events}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={2}
        height={650}
        eventClick={(info: EventClickArg) => {
            alert(`Event: ${info.event.title}\nDescription: ${info.event.extendedProps.description}`);
        }}
      />
    </AppFullCalendar>
  );
};

export default ContentCalendar;
