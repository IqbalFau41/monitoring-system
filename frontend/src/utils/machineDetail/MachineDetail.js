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
  CButton,
  CButtonGroup,
  CSpinner,
  CToast,
  CToastBody,
  CToastHeader,
} from '@coreui/react'
import './machinedetail.css'
import { chartOptions } from './dataMachine.js'
import ShiftDetail from './CProgress/ShiftDetail.js'

// Configuration for real-time updates
const REALTIME_UPDATE_INTERVAL = 1000
const ABNORMALITY_STATUSES = ['Warning', 'Error', 'Maintenance Required', 'Breakdown']

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
  const [showAbnormalityAlert, setShowAbnormalityAlert] = useState(false)
  const [abnormalityMessage, setAbnormalityMessage] = useState('')
  const [realtimeEnabled, setRealtimeEnabled] = useState(true)

  // Function to fetch machine data
  const fetchMachineData = async () => {
    try {
      const response = await axios.get(`/api/machine-detail/${name}`)

      // Check for abnormalities in the new data
      const newStatus = response.data.latestRecord?.OPERATION_NAME
      const currentStatus = machineData.latestRecord?.OPERATION_NAME

      // Detect abnormality status change
      if (
        currentStatus &&
        newStatus &&
        currentStatus !== newStatus &&
        ABNORMALITY_STATUSES.includes(newStatus)
      ) {
        setShowAbnormalityAlert(true)
        setAbnormalityMessage(`Machine status changed to ${newStatus}!`)

        // Optionally: Play a sound alert
        const alertSound = new Audio('/assets/alert-sound.mp3')
        alertSound.play().catch((e) => console.log('Error playing alert sound:', e))
      }

      setMachineData(response.data)
      setLastUpdate(new Date())
      setLoading(false)
    } catch (err) {
      console.error('Error fetching machine details:', err)
      setError(err.response?.data?.message || 'Failed to fetch machine data')
      setLoading(false)
      setRealtimeEnabled(false) // Disable realtime updates if there's an error
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (name) {
      setLoading(true)
      fetchMachineData()
    }
  }, [name])

  // Set up real-time updates
  useEffect(() => {
    let intervalId

    if (realtimeEnabled && name) {
      intervalId = setInterval(() => {
        fetchMachineData()
      }, REALTIME_UPDATE_INTERVAL)
    }

    // Clean up the interval on component unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [realtimeEnabled, name, machineData.latestRecord?.OPERATION_NAME])

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
      await fetchMachineData()
      setLoading(false)
    } catch (err) {
      console.error('Error refreshing machine details:', err)
      setError(err.response?.data?.message || 'Failed to refresh machine data')
      setLoading(false)
    }
  }

  // Toggle realtime updates
  const toggleRealtime = () => {
    setRealtimeEnabled((prev) => !prev)
  }

  // Dismiss abnormality alert
  const dismissAlert = () => {
    setShowAbnormalityAlert(false)
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
          `Target: ${machineData.machineInfo?.TARGET_PRODUCTION || 2000} pcs`,
          `Efficiency: ${Math.round(((MACHINE_COUNTER || 0) / (machineData.machineInfo?.TARGET_PRODUCTION || 2000)) * 100)}%`,
        ],
        color: 'info',
      },
    ]
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

  return (
    <div>
      {/* Abnormality Alert */}
      {showAbnormalityAlert && (
        <CToast visible className="mb-3 text-white bg-danger" onClose={dismissAlert}>
          <CToastHeader closeButton>
            <strong className="me-auto">Abnormality Detected</strong>
            <small>{new Date().toLocaleTimeString()}</small>
          </CToastHeader>
          <CToastBody>{abnormalityMessage}</CToastBody>
        </CToast>
      )}

      <CRow className="mb-3">
        <CCol md={6}>
          <h2>Detail Mesin: {decodeURIComponent(name)}</h2>
        </CCol>
        <CCol md={6} className="text-end">
          <div className="d-flex justify-content-end align-items-center">
            <span className="me-3">Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <CButtonGroup className="me-2">
              <CButton
                color={realtimeEnabled ? 'success' : 'secondary'}
                size="sm"
                onClick={toggleRealtime}
              >
                {realtimeEnabled ? 'Realtime: ON' : 'Realtime: OFF'}
              </CButton>
            </CButtonGroup>
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

      {loading && machineData.latestRecord?.OPERATION_NAME === undefined ? (
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
          <CRow>
            <ShiftDetail shifts={machineData.shifts || []} />
          </CRow>
        </>
      )}

      {/* Realtime indicator */}
      {realtimeEnabled && (
        <div className="realtime-indicator">
          <div className={`realtime-dot ${loading ? 'pulse' : ''}`}></div>
          <span>Realtime</span>
        </div>
      )}
    </div>
  )
}

export default MachineDetail
