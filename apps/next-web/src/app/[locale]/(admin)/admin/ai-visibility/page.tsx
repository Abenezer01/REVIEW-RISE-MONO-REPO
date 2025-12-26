/* eslint-disable import/no-unresolved */
'use client'

import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import { useTranslations } from 'next-intl'
import { PageHeader } from '@platform/shared-ui/client'

import AIVisibilityDashboard from '@/views/admin/ai-visibility/AIVisibilityDashboard'

const AdminAIVisibilityPage = () => {
  const tDashboard = useTranslations('dashboard')

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <PageHeader
          title={tDashboard('navigation.ai-visibility')}
          subtitle={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              Analyze how your brand appears in AI-generated answers (GEO/AIO).
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'inherit' }}>GEO: Generative Engine Optimization</Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: 'inherit' }}>Optimizing content to rank better in AI search engines.</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'inherit' }}>AIO: AI Overview</Typography>
                    <Typography variant="body2" sx={{ color: 'inherit' }}>The AI-generated summary at the top of search results.</Typography>
                  </Box>
                }
                arrow
              >
                <InfoOutlined fontSize="small" sx={{ ml: 0.5, cursor: 'help', verticalAlign: 'middle', color: 'text.secondary' }} />
              </Tooltip>
            </Box>
          }
        />
        <Box sx={{ mt: 2 }}>
          <AIVisibilityDashboard />
        </Box>
      </Grid>
    </Grid>
  )
}

export default AdminAIVisibilityPage
