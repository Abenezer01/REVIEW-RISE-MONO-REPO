'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

interface Activity {
  id: string
  title: string
  timeAgo: string
  type: 'review' | 'content' | 'competitor' | 'system'
  tag?: string
  tagColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default'
}

interface ActivityFeedProps {
  activities: Activity[]
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Recent Activity" subheader="Latest updates" />
      <CardContent>
        <Timeline position="right">
          {activities.map((activity, index) => (
            <TimelineItem key={activity.id}>
              <TimelineOppositeContent sx={{ display: 'none' }} />
              <TimelineSeparator>
                <TimelineDot 
                    color={
                        activity.type === 'review' ? 'primary' : 
                        activity.type === 'content' ? 'info' : 
                        activity.type === 'competitor' ? 'warning' : 'grey'
                    } 
                    variant="outlined"
                />
                {index !== activities.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="subtitle2" component="span">
                            {activity.title}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                            {activity.timeAgo}
                        </Typography>
                    </Box>
                    {activity.tag && (
                        <Chip label={activity.tag} size="small" color={activity.tagColor || 'default'} variant="tonal" />
                    )}
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}

export default ActivityFeed
