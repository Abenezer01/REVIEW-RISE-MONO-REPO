'use client'

import dynamic from 'next/dynamic'
// We import type only so it doesn't break SSR
import type { Props } from 'react-apexcharts'

const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

const AppReactApexCharts = (props: Props) => {
  return <ReactApexcharts {...props} />
}

export default AppReactApexCharts
