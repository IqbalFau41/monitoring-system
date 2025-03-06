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
        setMachineData(response.data)
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
      setMachineData(response.data)
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
      'Shift 1': { start: '07:00', end: '15:00' },
      'Shift 2': { start: '15:00', end: '23:00' },
      'Shift 3': { start: '23:00', end: '07:00' },
    }

    return machineData.shifts.map((shift) => {
      const shiftInfo = shiftTimes[shift.name] || { start: '00:00', end: '08:00' }

      // Generate hours for the shift based on actual times
      const hours = []
      const progressValues = []
      const progressValues2 = []
      const progressValues3 = []

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

        // Example calculation for progress values
        // In a real implementation, you would calculate these from your data
        progressValues.push(Math.floor(Math.random() * 20) + 10)
        progressValues2.push(Math.floor(Math.random() * 10))
        progressValues3.push(Math.floor(Math.random() * 5))
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
