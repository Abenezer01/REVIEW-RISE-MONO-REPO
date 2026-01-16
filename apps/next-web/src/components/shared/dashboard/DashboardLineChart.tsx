'use client'

import dynamic from 'next/dynamic'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import type { ApexOptions } from 'apexcharts'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

interface DashboardLineChartProps {
  title: string
  subtitle?: string
  series: { name: string; data: number[] }[]
  categories?: string[]
  yAxisFormatter?: (val: number) => string
  xAxisType?: 'category' | 'datetime'
}

const DashboardLineChart = ({ title, subtitle, series, categories, yAxisFormatter, xAxisType = 'category' }: DashboardLineChartProps) => {
  const theme = useTheme()
  const textSecondary = 'var(--mui-palette-text-secondary)'
  const divider = 'var(--mui-palette-divider)'

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.secondary.main
    ],
    stroke: {
      width: 3,
      curve: 'smooth',
      lineCap: 'round'
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: divider,
      strokeDashArray: 6,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, bottom: 0, right: 10, left: 10 }
    },
    xaxis: {
      type: xAxisType,
      categories: categories || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: xAxisType === 'datetime' ? 6 : 10,
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        style: { colors: textSecondary, fontSize: '12px' },
        datetimeFormatter: {
           year: 'yyyy',
           month: 'MMM \'yy',
           day: 'dd MMM',
           hour: 'HH:mm'
        }
      }
    },
    yaxis: {
      labels: {
        style: { colors: textSecondary, fontSize: '12px' },
        formatter: yAxisFormatter
      }
    },
    tooltip: {
       theme: theme.palette.mode
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subtitle} />
      <CardContent>
        <AppReactApexCharts type='line' height={300} width='100%' series={series} options={options} />
      </CardContent>
    </Card>
  )
}

export default DashboardLineChart
