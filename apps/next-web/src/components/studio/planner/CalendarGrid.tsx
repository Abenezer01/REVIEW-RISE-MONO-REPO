'use client'

import React, { useMemo } from 'react'

import { Card } from '@mui/material'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

import AppFullCalendar from '@/libs/styles/AppFullCalendar'

interface PlanDay {
    day: number
    topic: string
    platform: string
}

interface CalendarGridProps {
    days: PlanDay[]
    selectedDay: number
    onSelectDay: (day: number) => void
    monthLabel: string
}

export default function CalendarGrid({ days, onSelectDay, monthLabel }: CalendarGridProps) {
    
    const events = useMemo(() => {
        // Parse monthLabel which is likely "January 2025" or similar
        // Fallback to current date if parsing fails
        const now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth(); // 0-indexed

        if (monthLabel) {
            const parts = monthLabel.split(' ');

            if (parts.length === 2) {
                const parsedDate = new Date(`${parts[0]} 1, ${parts[1]}`);

                if (!isNaN(parsedDate.getTime())) {
                    year = parsedDate.getFullYear();
                    month = parsedDate.getMonth();
                }
            }
        }

        return days.map(d => {
            // Create date object for the day
            const date = new Date(year, month, d.day);

            // Format to YYYY-MM-DD
            const dateStr = date.toISOString().split('T')[0];
            
            // Map platform to color class
            let className = 'event-bg-primary';
            const p = d.platform.toLowerCase();

            if (p.includes('instagram')) className = 'event-bg-warning'; // Instagram gradient-ish (orange/pink map to warning often)
            else if (p.includes('facebook')) className = 'event-bg-info'; // Blue
            else if (p.includes('linkedin')) className = 'event-bg-primary'; // Blue
            else if (p.includes('twitter')) className = 'event-bg-info'; // Light Blue

            return {
                title: d.topic,
                start: dateStr,
                allDay: true,
                extendedProps: { dayNum: d.day },
                classNames: [className]
            }
        });
    }, [days, monthLabel]);

    // Calculate initial date based on monthLabel or events
    const initialDate = useMemo(() => {
        if (events.length > 0) return events[0].start;
        
return new Date().toISOString().split('T')[0];
    }, [events]);

    return (
        <Card>
            <AppFullCalendar className='app-calendar'>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
                    initialView="dayGridMonth"
                    initialDate={initialDate}
                    headerToolbar={{
                        start: 'title',
                        end: 'prev,next'
                    }}
                    events={events}
                    validRange={{
                        start: events.length > 0 ? events[0].start : undefined
                    }}
                    height={800} // Ensuring enough height for standard view
                    dateClick={(info) => {
                         const clickedDate = new Date(info.date);

                         // This assumes the month matches. Ideally we check if it's the correct month.
                         const day = clickedDate.getDate();

                         onSelectDay(day);
                    }}
                    eventClick={(info) => {
                        const day = info.event.extendedProps.dayNum;

                        if (day) onSelectDay(day);
                    }}
                    eventContent={(eventInfo) => {
                         // Custom render if needed, or rely on FullCalendar default which is styled by AppFullCalendar
                         return (
                            <div className={`fc-event-main-frame ${eventInfo.event.classNames.join(' ')}`}>
                                <div className="fc-event-title-container">
                                    <div className="fc-event-title fc-sticky">
                                        {eventInfo.event.title}
                                    </div>
                                </div>
                            </div>
                         )
                    }}
                />
            </AppFullCalendar>
        </Card>
    )
}
