'use client'

import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import axios from 'axios'
import KeywordCloud from '../dashboard/KeywordCloud' // Reusing existing component

interface ReviewKeywordCloudProps {
  locationId: string
}

const ReviewKeywordCloud = ({ locationId }: ReviewKeywordCloudProps) => {
  const [keywords, setKeywords] = useState<{ keyword: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    const fetchKeywords = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`/api/v1/reviews/locations/${locationId}/keywords`, {
            params: { timeRange }
        })
        
        if (res.data.success) {
            setKeywords(res.data.data.keywords)
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
        title="Review Themes & Keywords" 
        subheader="Recurring topics in customer feedback"
        action={
            <FormControl size="small" sx={{ minWidth: 120 }}>
                {/* <InputLabel>Time Range</InputLabel> */}
                <Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Time Range' }}
                >
                    <MenuItem value="7d">Last 7 Days</MenuItem>
                    <MenuItem value="30d">Last 30 Days</MenuItem>
                    <MenuItem value="90d">Last 90 Days</MenuItem>
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
