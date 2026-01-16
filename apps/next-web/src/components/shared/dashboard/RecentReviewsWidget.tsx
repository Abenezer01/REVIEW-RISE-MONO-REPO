'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Rating from '@mui/material/Rating'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt'
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral'
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'
import { useTheme } from '@mui/material/styles'

interface Review {
  id: string
  author: string
  rating: number
  content?: string | null
  sentiment?: string | null
  publishedAt: Date
  response?: string | null
}

interface RecentReviewsWidgetProps {
  reviews: Review[]
  unrepliedCount: number
  recentRepliesCount: number
}

const RecentReviewsWidget = ({ reviews, unrepliedCount, recentRepliesCount }: RecentReviewsWidgetProps) => {
  const theme = useTheme()

  const getSentimentIcon = (sentiment?: string | null) => {
    const sent = sentiment?.toLowerCase()
    
    if (sent === 'positive') {
      return <SentimentSatisfiedAltIcon sx={{ color: theme.palette.success.main }} />
    } else if (sent === 'negative') {
      return <SentimentDissatisfiedIcon sx={{ color: theme.palette.error.main }} />
    }
    return <SentimentNeutralIcon sx={{ color: theme.palette.warning.main }} />
  }

  const getSentimentColor = (sentiment?: string | null) => {
    const sent = sentiment?.toLowerCase()
    
    if (sent === 'positive') return theme.palette.success.main
    if (sent === 'negative') return theme.palette.error.main
    return theme.palette.warning.main
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Recent Reviews"
        action={
          <Box display="flex" gap={1}>
            <Chip
              label={`${unrepliedCount} Unreplied`}
              color="error"
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${recentRepliesCount} Recent Replies`}
              color="success"
              size="small"
              variant="outlined"
            />
          </Box>
        }
      />
      <CardContent sx={{ pt: 0, maxHeight: 500, overflow: 'auto' }}>
        {reviews.length === 0 ? (
          <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
            <Typography color="text.secondary">No recent reviews</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {reviews.map((review, index) => (
              <ListItem
                key={review.id}
                alignItems="flex-start"
                divider={index < reviews.length - 1}
                sx={{ px: 0 }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getSentimentColor(review.sentiment) }}>
                    {getSentimentIcon(review.sentiment)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {review.author}
                      </Typography>
                      <Rating value={review.rating} size="small" readOnly />
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <>
                      {review.content && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {truncateText(review.content)}
                        </Typography>
                      )}
                      <Typography variant="caption" component="div" color="text.disabled" sx={{ display: 'flex', alignItems: 'center' }}>
                        {new Date(review.publishedAt).toLocaleDateString()}
                        {review.response && (
                          <Chip
                            label="Replied"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentReviewsWidget
