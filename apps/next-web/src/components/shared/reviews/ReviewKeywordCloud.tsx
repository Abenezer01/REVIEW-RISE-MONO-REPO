'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useTranslations } from 'next-intl'

import apiClient from '@/lib/apiClient'
import KeywordCloud from '../dashboard/KeywordCloud'; // Reusing existing component

interface ReviewKeywordCloudProps {
  locationId: string
}

const ReviewKeywordCloud = ({ locationId }: ReviewKeywordCloudProps) => {
  const t = useTranslations('dashboard')
  const [keywords, setKeywords] = useState<{ keyword: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    const fetchKeywords = async () => {
      setLoading(true)

      try {
        // Use apiClient (auto-unwraps data field)
        const res = await apiClient.get<any>(`/reviews/api/v1/locations/${locationId}/keywords`, {
            params: { timeRange }
        })
        
        if (res.data?.keywords) {
            setKeywords(res.data.keywords)
        }
      } catch (error) {
        console.error('Failed to fetch review keywords:', error)
      } finally {
        setLoading(false)
      }
    }

    if (locationId) {
      fetchKeywords()
    }
  }, [locationId, timeRange])

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title={t('reviews.themesTitle')}
        subheader={t('reviews.themesSubtitle')}
        action={
            <FormControl size="small" sx={{ minWidth: 120 }}>
                {/* <InputLabel>Time Range</InputLabel> */}
                <Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Time Range' }}
                >
                    <MenuItem value="7d">{t('stats.last7Days')}</MenuItem>
                    <MenuItem value="30d">{t('stats.last30Days')}</MenuItem>
                    <MenuItem value="90d">{t('stats.last90Days')}</MenuItem>
                </Select>
            </FormControl>
        }
      />
      <CardContent>
        {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        ) : (
            <KeywordCloud 
                title="" 
                subtitle="" 
                keywords={keywords} 
            />
        )}
      </CardContent>
    </Card>
  )
}

export default ReviewKeywordCloud
