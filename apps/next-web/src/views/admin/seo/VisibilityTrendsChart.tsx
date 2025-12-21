'use client'

import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import dynamic from 'next/dynamic'

// Types
import type { ApexOptions } from 'apexcharts'
import type { VisibilityMetricDTO } from '@platform/contracts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), { ssr: false })

interface VisibilityTrendsChartProps {
  data: VisibilityMetricDTO[];
  loading?: boolean;
}

const VisibilityTrendsChart = ({ data, loading }: VisibilityTrendsChartProps) => {
  const theme = useTheme()

  const series = [
    {
      name: 'Map Pack Visibility',
      data: data.map(d => Number(d.mapPackVisibility.toFixed(1)))
    },
    {
      name: 'Share of Voice',
      data: data.map(d => Number(d.shareOfVoice.toFixed(1)))
    }
  ]

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      zoom: { enabled: false },
      toolbar: { show: false },
      fontFamily: theme.typography.fontFamily
    },
    colors: [theme.palette.primary.main, theme.palette.warning.main],
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: theme.palette.divider,
      xaxis: {
        lines: { show: true } 
      },
      padding: {
        top: -10,
        bottom: -5
      }
    },
    xaxis: {
      categories: data.map(d => new Date(d.periodStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: theme.palette.text.disabled,
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.disabled,
          fontSize: '12px'
        }
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      labels: {
          colors: theme.palette.text.secondary
      }
    },
    tooltip: {
        theme: theme.palette.mode
    }
  }

  if (loading) {
      return (
          <Card sx={{ height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Loading Chart...
          </Card>
      )
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Visibility Trends (30 Days)" />
      <CardContent>
        <AppReactApexCharts type='line' height={400} width='100%' series={series} options={options} />
      </CardContent>
    </Card>
  )
}

export default VisibilityTrendsChart
