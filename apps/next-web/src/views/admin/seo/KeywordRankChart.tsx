'use client'

import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import axios from 'axios'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Card from '@mui/material/Card'
import type { ApexOptions } from 'apexcharts'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

interface Props {
  keywordId: string | null
  keywordText: string | null
  open: boolean
  onClose: () => void
}

const API_URL = 'http://localhost:3012/api/v1'

export default function KeywordRankChart({ keywordId, keywordText, open, onClose }: Props) {
  const [series, setSeries] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    if (!open || !keywordId) return
    const today = new Date()
    const start = new Date()

    start.setDate(today.getDate() - 30)
    axios.get(`${API_URL}/keywords/${keywordId}/ranks`, {
      params: {
        startDate: start.toISOString(),
        endDate: today.toISOString(),
        limit: 100
      }
    }).then(res => {
      const data = res.data?.data || []

      const sorted = [...data].sort((a: any, b: any) =>
        new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
      )

      setCategories(sorted.map((r: any) => r.capturedAt.split('T')[0]))
      setSeries([
        {
          name: 'Organic Rank',
          data: sorted.map((r: any) => r.rankPosition ?? null)
        },
        {
          name: 'Map Pack',
          data: sorted.map((r: any) => r.mapPackPosition ?? null)
        }
      ])
    })
  }, [open, keywordId])

  const options: ApexOptions = {
    chart: { parentHeightOffset: 0, toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'straight' },
    xaxis: { categories },
    yaxis: { reversed: true, min: 1, max: 100, labels: { formatter: (v) => String(v) } },
    tooltip: { shared: true }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Ranking History — {keywordText}</DialogTitle>
      <DialogContent>
        <Card sx={{ p: 2 }}>
          <AppReactApexCharts type='line' height={360} width='100%' series={series} options={options} />
        </Card>
      </DialogContent>
    </Dialog>
  )
}

