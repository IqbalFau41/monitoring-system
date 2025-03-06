import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardText,
  CRow,
  CCol,
  CProgress,
  CProgressStacked,
  CButton,
  CButtonGroup,
  CSpinner,
  CBadge,
} from '@coreui/react'
import './machinedetail.css'
import {
  gridContainerStyle,
  gridLineStyle,
  timeTextStyle,
  progressContainerStyle,
} from './dataMachine.js'

const MachineDetail = () => {
  const { name } = useParams()
  const chartRef = useRef(null)
  const [viewMode, setViewMode] = useState('week') // 'week' or 'month'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [machineData, setMachineData] = useState({
    machineInfo: {},
    latestRecord: {},
    shifts: [],
    chartData: { weekly: { labels: [], datasets: [] }, monthly: { labels: [], datasets: [] } },
  })
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Fetch machine data on component mount and when machine name changes
  useEffect(() => {
    const fetchMachineData = async () => {
      try {
        setLoading(true)
        // Make API call to get machine details
        const response = await axios.get(`/api/machine-detail/${name}`)

        // Process the data to create cumulative charts
        const processedData = {
          ...response.data,
          chartData: processChartData(response.data.records || []),
        }

        setMachineData(processedData)
        setLastUpdate(new Date())
        setLoading(false)
      } catch (err) {
        console.error('Error fetching machine details:', err)
        setError(err.response?.data?.message || 'Failed to fetch machine data')
        setLoading(false)
      }
    }

    if (name) {
      fetchMachineData()
    }
  }, [name])

  // Process chart data to show cumulative values
  const processChartData = (records) => {
    if (!records || records.length === 0) {
      return { weekly: { labels: [], datasets: [] }, monthly: { labels: [], datasets: [] } }
    }

    // Sort records by CreatedAt ascending
    const sortedRecords = [...records].sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt))

    // Get date ranges
    const now = new Date()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(now.getDate() - 7)

    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(now.getMonth() - 1)

    // Initialize weekly data arrays
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weeklyLabels = []
    const weeklyProduction = []
    const weeklyTarget = []

    // Initialize monthly data arrays
    const monthlyLabels = []
    const monthlyProduction = []
    const monthlyTarget = []

    // Create date labels for past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayOfWeek = weekDays[date.getDay()]
      const dateString = `${dayOfWeek} ${date.getMonth() + 1}/${date.getDate()}`
      weeklyLabels.push(dateString)
      weeklyProduction.push(0)
      weeklyTarget.push(2000) // Example target
    }

    // Create date labels for past 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = `${date.getMonth() + 1}/${date.getDate()}`
      monthlyLabels.push(dateString)
      monthlyProduction.push(0)
      monthlyTarget.push(2000) // Example target
    }

    // Process weekly data (cumulative within each day)
    let weeklyData = {}
    weeklyLabels.forEach((label) => {
      weeklyData[label] = { counter: 0 }
    })

    // Process monthly data (cumulative within each day)
    let monthlyData = {}
    monthlyLabels.forEach((label) => {
      monthlyData[label] = { counter: 0 }
    })

    // Calculate cumulative values
    let cumulativeCounter = 0

    sortedRecords.forEach((record) => {
      if (!record.MACHINE_COUNTER) return

      const recordDate = new Date(record.CreatedAt)
      const dayOfWeek = weekDays[recordDate.getDay()]
      const dateLabelWeekly = `${dayOfWeek} ${recordDate.getMonth() + 1}/${recordDate.getDate()}`
      const dateLabelMonthly = `${recordDate.getMonth() + 1}/${recordDate.getDate()}`

      // Update cumulative counter
      cumulativeCounter += record.MACHINE_COUNTER

      // Update weekly data if the date is within our weekly labels
      if (weeklyLabels.includes(dateLabelWeekly)) {
        weeklyData[dateLabelWeekly].counter = cumulativeCounter
      }

      // Update monthly data if the date is within our monthly labels
      if (monthlyLabels.includes(dateLabelMonthly)) {
        monthlyData[dateLabelMonthly].counter = cumulativeCounter
      }
    })

    // Convert the data objects to arrays for Chart.js
    weeklyLabels.forEach((label, index) => {
      weeklyProduction[index] = weeklyData[label].counter
    })

    monthlyLabels.forEach((label, index) => {
      monthlyProduction[index] = monthlyData[label].counter
    })

    return {
      weekly: {
        labels: weeklyLabels,
        datasets: [
          {
            label: 'Cumulative Production',
            data: weeklyProduction,
            borderColor: 'rgba(32, 168, 216, 0.8)',
            backgroundColor: 'rgba(32, 168, 216, 0.2)',
          },
          {
            label: 'Target',
            data: weeklyTarget,
            borderColor: 'rgba(77, 189, 116, 0.8)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
          },
        ],
      },
      monthly: {
        labels: monthlyLabels,
        datasets: [
          {
            label: 'Cumulative Production',
            data: monthlyProduction,
            borderColor: 'rgba(32, 168, 216, 0.8)',
            backgroundColor: 'rgba(32, 168, 216, 0.2)',
          },
          {
            label: 'Target',
            data: monthlyTarget,
            borderColor: 'rgba(77, 189, 116, 0.8)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
          },
        ],
      },
    }
  }

  // Handle chart color scheme updates
  useEffect(() => {
    const handleColorSchemeChange = () => {
      if (chartRef.current) {
        setTimeout(() => {
          const current = chartRef.current
          current.options.scales.x.grid.borderColor = getStyle('--cui-border-color-translucent')
          current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          current.options.scales.y.grid.borderColor = getStyle('--cui-border-color-translucent')
          current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          current.update()
        })
      }
    }

    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)

    return () => {
      document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
    }
  }, [chartRef])

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/machine-detail/${name}`)

      // Process the data to create cumulative charts
      const processedData = {
        ...response.data,
        chartData: processChartData(response.data.records || []),
      }

      setMachineData(processedData)
      setLastUpdate(new Date())
      setLoading(false)
    } catch (err) {
      console.error('Error refreshing machine details:', err)
      setError(err.response?.data?.message || 'Failed to refresh machine data')
      setLoading(false)
    }
  }

  // Chart configuration
  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString()
            }
            return label
          },
        },
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
        ticks: {
          color: getStyle('--cui-body-color'),
          maxTicksLimit: 5,
          callback: function (value) {
            return value.toLocaleString()
          },
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

  // Generate status cards from machine data
  const generateStatusCards = () => {
    if (!machineData.latestRecord) return []

    const { OPERATION_NAME, MACHINE_COUNTER } = machineData.latestRecord
    const machineName = machineData.machineInfo?.MACHINE_NAME || 'Unknown'
    const lineGroup = machineData.machineInfo?.LINE_GROUP || 'Unknown'

    return [
      {
        header: 'Machine Information',
        content: [
          `Machine Name: ${machineName}`,
          `Line Group: ${lineGroup}`,
          `Location: ${machineData.machineInfo?.MACHINE_LOCATION || 'Unknown'}`,
        ],
        color: 'primary',
      },
      {
        header: 'Current Status',
        content: [
          `Status: ${OPERATION_NAME || 'Unknown'}`,
          `Counter: ${MACHINE_COUNTER || 0}`,
          `Last Updated: ${new Date(machineData.latestRecord?.CreatedAt || Date.now()).toLocaleString()}`,
        ],
        color:
          OPERATION_NAME === 'Normal Operation'
            ? 'success'
            : OPERATION_NAME === 'Warning'
              ? 'warning'
              : 'danger',
      },
      {
        header: 'Production Summary',
        content: [
          `Today's Production: ${MACHINE_COUNTER || 0}`,
          `Target: 2,000 pcs`, // Example static target
          `Efficiency: ${Math.round((MACHINE_COUNTER || 0) / 20)}%`, // Example calculation
        ],
        color: 'info',
      },
    ]
  }

  // Generate shift data for display with proper time-based formatting
  const generateShiftData = () => {
    if (!machineData.shifts || machineData.shifts.length === 0) return []

    // Define shift times
    const shiftTimes = {
      'Shift 1': { start: '06:00', end: '14:00' },
      'Shift 2': { start: '14:00', end: '22:00' },
      'Shift 3': { start: '22:00', end: '06:00' },
    }

    return machineData.shifts.map((shift) => {
      const shiftInfo = shiftTimes[shift.name.split(' ')[0] + ' ' + shift.name.split(' ')[1]] || {
        start: '00:00',
        end: '08:00',
      }

      // Generate hours for the shift based on actual times
      const hours = []
      const progressValues = shift.progressValues || []
      const progressValues2 = shift.progressValues2 || []
      const progressValues3 = shift.progressValues3 || []

      // Parse start time
      const [startHour, startMinute] = shiftInfo.start.split(':').map(Number)
      const [endHour, endMinute] = shiftInfo.end.split(':').map(Number)

      // Calculate total hours in shift (handling overnight shifts)
      let totalHours = endHour - startHour
      if (totalHours <= 0) totalHours += 24

      // Create hour markers for the shift
      for (let i = 0; i <= totalHours; i++) {
        let hourMarker = (startHour + i) % 24
        hours.push(`${hourMarker.toString().padStart(2, '0')}:00`)
      }

      return {
        name: shift.name,
        hours,
        progressValues,
        progressValues2,
        progressValues3,
      }
    })
  }

  // If error occurred
  if (error) {
    return (
      <div>
        <h2>Error Loading Machine: {decodeURIComponent(name)}</h2>
        <CCard className="mb-4 border-top-danger border-top-3">
          <CCardBody>
            <p>{error}</p>
            <CButton color="primary" onClick={handleManualRefresh}>
              Retry
            </CButton>
          </CCardBody>
        </CCard>
      </div>
    )
  }

  const cards = generateStatusCards()
  const shifts = generateShiftData()

  return (
    <div>
      <CRow className="mb-3">
        <CCol md={6}>
          <h2>Detail Mesin: {decodeURIComponent(name)}</h2>
        </CCol>
        <CCol md={6} className="text-end">
          <div className="d-flex justify-content-end align-items-center">
            <span className="me-3">Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <button
              className="btn btn-outline-primary"
              onClick={handleManualRefresh}
              disabled={loading}
            >
              {loading ? <CSpinner size="sm" /> : <span>↻ Refresh</span>}
            </button>
          </div>
        </CCol>
      </CRow>

      {loading ? (
        <CRow className="text-center py-5">
          <CCol>
            <CSpinner color="primary" />
            <p className="mt-3">Loading machine data...</p>
          </CCol>
        </CRow>
      ) : (
        <>
          {/* Status cards section */}
          <CRow>
            {cards.map((card, index) => (
              <CCol sm={4} key={index}>
                <CCard className={`mb-3 border-top-${card.color} border-top-3`}>
                  <CCardHeader className="text-body">{card.header}</CCardHeader>
                  <CCardBody className="p-4">
                    {card.content.map((text, textIndex) => (
                      <CCardText key={textIndex}>{text}</CCardText>
                    ))}
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>

          {/* Production details section */}
          <h2>Detail Production</h2>
          <CRow>
            {shifts.map((shift, index) => (
              <CCol md={12} key={index}>
                <CCard className="mb-3">
                  <CCardHeader className="text-body">
                    <strong>{shift.name}</strong>
                  </CCardHeader>
                  <CCardBody className="p-4">
                    <div style={gridContainerStyle}>
                      {shift.hours.map((hour, hourIndex) => {
                        const position = `${(100 * hourIndex) / (shift.hours.length - 1)}%`
                        return (
                          <React.Fragment key={hourIndex}>
                            <span style={{ ...timeTextStyle, top: '0', left: position }}>
                              {hour}
                            </span>
                            <div style={{ ...gridLineStyle, left: position }} />
                            <span style={{ ...timeTextStyle, bottom: '0', left: position }}>
                              {hourIndex * 10}
                            </span>
                          </React.Fragment>
                        )
                      })}

                      <div style={progressContainerStyle}>
                        <CProgressStacked className="progress-stacked">
                          {shift.progressValues.map((value, valueIndex) => (
                            <CProgress key={valueIndex} color="success" value={value} />
                          ))}
                          {shift.progressValues2.map((value, valueIndex) => (
                            <CProgress key={`2-${valueIndex}`} color="danger" value={value} />
                          ))}
                          {shift.progressValues3.map((value, valueIndex) => (
                            <CProgress key={`3-${valueIndex}`} color="warning" value={value} />
                          ))}
                        </CProgressStacked>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>

          {/* Monthly Production Performance Section */}
          <CRow className="mb-3 align-items-center">
            <CCol md={6}>
              <h2 className="m-0">Performa Produksi Bulanan</h2>
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <CCard className="mb-3">
                <CCardHeader className="d-flex justify-content-between align-items-center text-body">
                  <strong>
                    {viewMode === 'week' ? 'Grafik Produksi Mingguan' : 'Grafik Produksi Bulanan'}
                  </strong>
                  <CButtonGroup size="sm">
                    <CButton
                      color={viewMode === 'week' ? 'primary' : 'outline-primary'}
                      onClick={() => setViewMode('week')}
                    >
                      Week
                    </CButton>
                    <CButton
                      color={viewMode === 'month' ? 'primary' : 'outline-primary'}
                      onClick={() => setViewMode('month')}
                    >
                      Month
                    </CButton>
                  </CButtonGroup>
                </CCardHeader>
                <CCardBody className="p-4">
                  <CChartLine
                    ref={chartRef}
                    style={{ height: '300px', marginTop: '40px' }}
                    data={
                      viewMode === 'week'
                        ? machineData.chartData.weekly
                        : machineData.chartData.monthly
                    }
                    options={chartOptions}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default MachineDetail
