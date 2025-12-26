'use client'

import React from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'

export interface PlatformData {
  platform: 'ChatGPT' | 'Gemini' | 'Claude' | 'Perplexity' | 'Bing Copilot'
  rank: number | 'Not Found' // Rank in list or "Not Found"
  sentiment: 'Positive' | 'Neutral' | 'Negative'
  mentioned: boolean
  sourcesCount: number
}

interface AIPlatformBreakdownProps {
  data: PlatformData[]
}

const AIPlatformBreakdown: React.FC<AIPlatformBreakdownProps> = ({ data }) => {
  const getSentimentColor = (sentiment: string): 'success' | 'default' | 'error' | 'warning' => {
    switch (sentiment) {
      case 'Positive': return 'success'
      case 'Negative': return 'error'
      default: return 'default'
    }
  }

  const getPlatformIcon = (platform: string) => {
    // Simple colored avatars as placeholders for platform logos
    let color = '#757575'
    
    if (platform === 'ChatGPT') color = '#10a37f'
    if (platform === 'Gemini') color = '#4285F4'
    if (platform === 'Claude') color = '#D97757'
    if (platform === 'Perplexity') color = '#28B7BA'
    if (platform === 'Bing Copilot') color = '#008AD8'

    return (
        <Avatar sx={{ width: 24, height: 24, bgcolor: color, fontSize: '0.75rem', mr: 1.5 }}>
            {platform[0]}
        </Avatar>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Performance by AI Platform"
        subheader="How different Large Language Models (LLMs) perceive your brand"
      />
      <CardContent>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="ai platform table">
            <TableHead>
              <TableRow>
                <TableCell>Platform</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Sentiment</TableCell>
                <TableCell align="right">Sources Cited</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow
                  key={row.platform}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getPlatformIcon(row.platform)}
                        <Typography variant="body2" fontWeight={500}>
                            {row.platform}
                        </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {row.mentioned ? (
                         <Chip label="Mentioned" color="success" size="small" variant="tonal" />
                    ) : (
                         <Chip label="Not Found" color="error" size="small" variant="tonal" />
                    )}
                  </TableCell>
                  <TableCell>
                    {row.mentioned && (
                         <Chip
                            label={row.sentiment}
                            color={getSentimentColor(row.sentiment)}
                            size="small"
                            variant="outlined"
                         />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {row.sourcesCount > 0 ? row.sourcesCount : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default AIPlatformBreakdown
