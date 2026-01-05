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
}

const DashboardLineChart = ({ title, subtitle, series, categories }: DashboardLineChartProps) => {
  const theme = useTheme()
  const textSecondary = 'var(--mui-palette-text-secondary)'
  const divider = 'var(--mui-palette-divider)'

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: [theme.palette.primary.main, theme.palette.info.main],
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
      padding: { top: -10, bottom: -10 }
    },
    xaxis: {
      categories: categories || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: 10, // Limit the number of ticks displayed
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true, // Hide labels that overlap
        style: { colors: textSecondary, fontSize: '13px' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: textSecondary, fontSize: '13px' }
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
