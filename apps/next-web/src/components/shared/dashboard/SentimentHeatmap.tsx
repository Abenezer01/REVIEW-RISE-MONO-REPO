'use client'

import dynamic from 'next/dynamic'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme, alpha } from '@mui/material/styles'
import type { ApexOptions } from 'apexcharts'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

interface SentimentHeatmapProps {
  title: string
  subtitle?: string
  data: Array<{
    date: string
    positive: number
    neutral: number
    negative: number
  }>
}

const SentimentHeatmap = ({ title, subtitle, data }: SentimentHeatmapProps) => {
  const theme = useTheme()

  // Transform data for heatmap
  const dates = data.map(d => d.date)

  const series = [
    {
      name: 'Positive',
      data: data.map(d => d.positive)
    },
    {
      name: 'Neutral',
      data: data.map(d => d.neutral)
    },
    {
      name: 'Negative',
      data: data.map(d => d.negative)
    }
  ]

  const options: ApexOptions = {
    chart: {
      type: 'heatmap',
      toolbar: { show: false }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 5,
              name: 'Low',
              color: theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.3) : theme.palette.success.light
            },
            {
              from: 6,
              to: 15,
              name: 'Medium',
              color: theme.palette.success.main
            },
            {
              from: 16,
              to: 1000,
              name: 'High',
              color: theme.palette.success.dark
            }
          ]
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: [theme.palette.mode === 'dark' ? '#fff' : '#000']
      }
    },
    xaxis: {
      categories: dates,
      labels: {
        rotate: -45,
        style: {
          colors: 'var(--mui-palette-text-secondary)',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: 'var(--mui-palette-text-secondary)',
          fontSize: '13px'
        }
      }
    },
    colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val: number) => `${val} reviews`
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      labels: {
        colors: 'var(--mui-palette-text-primary)'
      }
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subtitle} />
      <CardContent>
        <AppReactApexCharts type='heatmap' height={300} width='100%' series={series} options={options} />
      </CardContent>
    </Card>
  )
}

export default SentimentHeatmap
