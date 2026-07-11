import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'

const RED = '#dc2626'
const BLUE = '#3b82f6'

export function AreaChart({
  categories,
  series,
  height = 300,
  colors = [RED, BLUE],
}: {
  categories: string[]
  series: { name: string; data: number[] }[]
  height?: number
  colors?: string[]
}) {
  const options: ApexOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
    colors,
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02, stops: [0, 90, 100] },
    },
    grid: { borderColor: '#eef2f7', strokeDashArray: 4 },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8' } },
    },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#64748b' } },
    tooltip: { theme: 'light' },
  }

  return <ReactApexChart type="area" options={options} series={series} height={height} />
}

export function DonutChart({
  labels,
  series,
  colors = [RED, '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'],
  height = 280,
}: {
  labels: string[]
  series: number[]
  colors?: string[]
  height?: number
}) {
  const options: ApexOptions = {
    chart: { fontFamily: 'inherit' },
    labels,
    colors,
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    legend: { position: 'bottom', labels: { colors: '#64748b' } },
    plotOptions: {
      pie: { donut: { size: '70%', labels: { show: true, total: { show: true, color: '#64748b' } } } },
    },
    tooltip: { theme: 'light' },
  }

  return <ReactApexChart type="donut" options={options} series={series} height={height} />
}

export function BarChart({
  categories,
  series,
  height = 300,
  colors = [RED],
}: {
  categories: string[]
  series: { name: string; data: number[] }[]
  height?: number
  colors?: string[]
}) {
  const options: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    colors,
    plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
    dataLabels: { enabled: false },
    grid: { borderColor: '#eef2f7', strokeDashArray: 4 },
    xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#94a3b8' } } },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    legend: { show: false },
    tooltip: { theme: 'light' },
  }

  return <ReactApexChart type="bar" options={options} series={series} height={height} />
}
