'use client'

import dynamic from 'next/dynamic'

import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import type { ApexOptions } from 'apexcharts'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

interface DashboardDonutChartProps {
  title: string
  subtitle?: string
  series: number[]
  labels: string[]
  colors?: string[] // Optional custom colors
}

const DashboardDonutChart = ({ title, subtitle, series, labels, colors }: DashboardDonutChartProps) => {
  const theme = useTheme()

  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main
  ]

  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true }
    },
    colors: colors || defaultColors,
    stroke: { width: 0 },
    legend: { show: false },
    dataLabels: { enabled: false },
    labels: labels,
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        customScale: 0.9,
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              offsetY: 25,
              fontSize: '0.875rem',
              color: 'var(--mui-palette-text-secondary)'
            },
            value: {
              offsetY: -15,
              fontWeight: 500,
              fontSize: '1.5rem',
              color: 'var(--mui-palette-text-primary)',
              formatter: val => `${val}`
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '0.875rem',
              color: 'var(--mui-palette-text-secondary)',
              formatter: w => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)

                
return `${total}`
              }
            }
          }
        }
      }
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subtitle} />
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <AppReactApexCharts type='donut' height={250} width='100%' series={series} options={options} />
      </CardContent>
    </Card>
  )
}

export default DashboardDonutChart
