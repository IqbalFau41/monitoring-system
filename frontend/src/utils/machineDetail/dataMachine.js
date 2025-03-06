import { getStyle } from '@coreui/utils'

export const cards = [
  {
    header: 'Status mesin',
    color: 'success',
    content: ['Running', 'Finish: 14%'],
  },
  {
    header: 'Cycle Time',
    color: 'danger',
    content: ['40/1 detik', 'Downtime: 25 menit'],
  },
  {
    header: 'Output Produksi',
    color: 'info',
    content: ['Good: 3541 Pcs', 'NG: 203 Pcs'],
  },
  {
    header: 'Nama Produk',
    color: 'secondary',
    content: ['Assembly', 'Cams Shaft Transmisi Honda'],
  },
  {
    header: 'Produksi Order',
    color: 'secondary',
    content: ['Tanggal: 01-01-2025', 'Order: 15000 Part'],
  },
  {
    header: 'Estimasi Produk',
    color: 'secondary',
    content: ['Estimasi Selesai: 10-01-2025', 'Actual: 3001 Part'],
  },
]

export const shifts = [
  {
    name: 'Shift 1',
    hours: [
      '07:00',
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
    ],
    progressValues: [60],
    progressValues2: [30],
    progressValues3: [10],
  },
  {
    name: 'Shift 2',
    hours: [
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
      '23:00',
      '00:00',
      '01:00',
    ],
    progressValues: [50],
    progressValues2: [5],
    progressValues3: [20],
  },
  {
    name: 'Shift 3',
    hours: ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00'],
    progressValues: [10],
    progressValues2: [15],
    progressValues3: [10],
  },
]

export const monthlyProductionData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
  datasets: [
    {
      label: 'Good Products',
      backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
      borderColor: getStyle('--cui-info'),
      pointHoverBackgroundColor: getStyle('--cui-info'),
      borderWidth: 2,
      data: [1200, 1350, 1500, 1650, 1800, 1950, 2100],
      fill: true,
    },
    {
      label: 'NG Products',
      backgroundColor: 'transparent',
      borderColor: getStyle('--cui-danger'),
      pointHoverBackgroundColor: getStyle('--cui-danger'),
      borderWidth: 2,
      data: [50, 75, 100, 125, 150, 175, 200],
    },
    {
      label: 'Target Production',
      backgroundColor: 'transparent',
      borderColor: getStyle('--cui-success'),
      pointHoverBackgroundColor: getStyle('--cui-success'),
      borderWidth: 1,
      borderDash: [8, 5],
      data: [1500, 1500, 1500, 1500, 1500, 1500, 1500],
    },
  ],
}

export const gridContainerStyle = {
  position: 'relative',
  width: '100%',
  marginBottom: '5px',
  padding: '0',
  height: '120px',
}

export const gridLineStyle = {
  position: 'absolute',
  top: 25,
  bottom: 25,
  width: '2px',
  backgroundColor: 'rgba(200, 200, 200, 0.5)',
  zIndex: 1,
}

export const timeTextStyle = {
  position: 'absolute',
  transform: 'translateX(-50%)',
  width: 'auto',
  fontSize: '0.9rem',
  padding: '0 5px',
}

export const progressContainerStyle = {
  position: 'absolute',
  left: '0',
  right: '0',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  padding: '0',
  height: '32px',
}

export const dailyProductionData = {
  labels: Array.from({ length: 31 }, (_, i) => `${i + 1}`),
  datasets: [
    {
      label: 'Good Products',
      backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
      borderColor: getStyle('--cui-info'),
      pointHoverBackgroundColor: getStyle('--cui-info'),
      borderWidth: 2,
      data: Array.from({ length: 31 }, (_, i) => 1200 + i * 30),
      fill: true,
    },
    {
      label: 'NG Products',
      backgroundColor: 'transparent',
      borderColor: getStyle('--cui-danger'),
      pointHoverBackgroundColor: getStyle('--cui-danger'),
      borderWidth: 2,
      data: Array.from({ length: 31 }, (_, i) => 50 + i * 2),
    },
    {
      label: 'Target Production',
      backgroundColor: 'transparent',
      borderColor: getStyle('--cui-success'),
      pointHoverBackgroundColor: getStyle('--cui-success'),
      borderWidth: 1,
      borderDash: [8, 5],
      data: Array(31).fill(1500),
    },
  ],
}

export const getProductionData = (view) => {
  const baseData = {
    labels:
      view === 'month'
        ? Array.from({ length: 30 }, (_, i) => `${i + 1}`)
        : Array.from({ length: 7 }, (_, i) => `${i + 1}`),
    datasets: [
      {
        label: 'Good Products',
        backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
        borderColor: getStyle('--cui-info'),
        pointHoverBackgroundColor: getStyle('--cui-info'),
        borderWidth: 2,
        data:
          view === 'month'
            ? Array.from({ length: 30 }, (_, i) => 1200 + i * 30)
            : Array.from({ length: 7 }, (_, i) => 1200 + i * 50),
        fill: true,
      },
      {
        label: 'NG Products',
        backgroundColor: 'transparent',
        borderColor: getStyle('--cui-danger'),
        pointHoverBackgroundColor: getStyle('--cui-danger'),
        borderWidth: 2,
        data:
          view === 'month'
            ? Array.from({ length: 30 }, (_, i) => 50 + i * 2)
            : Array.from({ length: 7 }, (_, i) => 50 + i * 5),
      },
      {
        label: 'Target Production',
        backgroundColor: 'transparent',
        borderColor: getStyle('--cui-success'),
        pointHoverBackgroundColor: getStyle('--cui-success'),
        borderWidth: 1,
        borderDash: [8, 5],
        data: view === 'month' ? Array(30).fill(1500) : Array(7).fill(1500),
      },
    ],
  }
  return baseData
}
