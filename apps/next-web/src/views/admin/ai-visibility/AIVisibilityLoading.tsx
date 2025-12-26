'use client'

import React from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'

const AIVisibilityLoading = () => {
  return (
    <Grid container spacing={6}>
      {/* Overview Metrics Skeletons */}
      {Array.from(new Array(4)).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width={60} height={32} />
                </Box>
                <Skeleton variant="circular" width={40} height={40} />
              </Box>
              <Skeleton variant="text" width="80%" height={20} />
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Platform Breakdown Skeleton */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 4 }}>
                <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={300} height={20} />
            </Box>
            {Array.from(new Array(5)).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                <Box sx={{ width: '100%' }}>
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="60%" height={16} />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Optimization Tips Skeleton */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ mb: 4 }}>
                <Skeleton variant="text" width={150} height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={200} height={20} />
            </Box>
            {Array.from(new Array(3)).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', mb: 3 }}>
                <Skeleton variant="rounded" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ width: '100%' }}>
                  <Skeleton variant="text" width="90%" height={24} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="100%" height={16} />
                  <Skeleton variant="text" width="80%" height={16} />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AIVisibilityLoading
