'use client'

import React, { useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
)

interface BrandInputSectionProps {
  onAnalyze: (url: string) => void
  loading: boolean
}

const BrandInputSection: React.FC<BrandInputSectionProps> = ({ onAnalyze, loading }) => {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (url) {
      onAnalyze(url)
    }
  }

  return (
    <Card>
      <CardHeader
        title="AI Brand Visibility Analysis"
        subheader="Enter your brand's website URL to analyze its presence across major AI platforms like ChatGPT, Gemini, and Claude."
      />
      <Divider />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 9 }}>
              <TextField
                fullWidth
                label="Brand Website URL"
                placeholder="e.g., https://yourbrand.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                helperText="Enter the full URL including https://"
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                            <GlobeIcon />
                            </InputAdornment>
                        )
                    }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={!url || loading}
                startIcon={!loading && <SearchIcon />}
                sx={{ height: '56px' }} // Match TextField height
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default BrandInputSection
