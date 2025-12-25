'use client'

import dynamic from 'next/dynamic'

import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// Types
import type { ApexOptions } from 'apexcharts'
import type { VisibilityMetricDTO } from '@platform/contracts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

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

  const divider = 'var(--mui-palette-divider)'
  const textDisabled = 'var(--mui-palette-text-disabled)'

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: { shared: false },
    dataLabels: { enabled: false },

    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: { colors: 'var(--mui-palette-text-secondary)' },
      fontSize: '13px',
      markers: {
        offsetY: 2,
        offsetX: theme.direction === 'rtl' ? 7 : -4
      },
      itemMargin: { horizontal: 9 }
    },
    fill: {
      opacity: 1,
      type: 'solid'
    },
    grid: {
      show: true,
      borderColor: divider,
      xaxis: {
        lines: { show: true }
      }
    },
    yaxis: {
      labels: {
        style: { colors: textDisabled, fontSize: '13px' }
      }
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { color: divider },
      crosshairs: {
        stroke: { color: divider }
      },
      labels: {
        style: { colors: textDisabled, fontSize: '13px' }
      },

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
