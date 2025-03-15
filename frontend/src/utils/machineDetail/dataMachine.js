import { getStyle } from '@coreui/utils'

// Chart configuration options for production data
export const chartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
    },
  },
  scales: {
    x: {
      grid: {
        color: getStyle('--cui-border-color-translucent'),
        drawOnChartArea: false,
      },
      ticks: {
        color: getStyle('--cui-body-color'),
      },
    },
    y: {
      beginAtZero: true,
      border: {
        color: getStyle('--cui-border-color-translucent'),
      },
      grid: {
        color: getStyle('--cui-border-color-translucent'),
      },
      max: 2500,
      ticks: {
        color: getStyle('--cui-body-color'),
        maxTicksLimit: 5,
        stepSize: Math.ceil(2500 / 5),
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    },
  },
}
