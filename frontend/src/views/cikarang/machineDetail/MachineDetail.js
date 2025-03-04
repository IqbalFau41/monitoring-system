import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
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
} from '@coreui/react'
import './machinedetail.css'
import {
  cards,
  shifts,
  getProductionData,
  gridContainerStyle,
  gridLineStyle,
  timeTextStyle,
  progressContainerStyle,
} from './dataMachine.js'

const MachineDetail = () => {
  const { name } = useParams()
  const chartRef = useRef(null)
  const [viewMode, setViewMode] = useState('week') // 'week' or 'month'

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

  return (
    <div>
      <h2>Detail Mesin: {decodeURIComponent(name)}</h2>

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
                        <span style={{ ...timeTextStyle, top: '0', left: position }}>{hour}</span>
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
                data={getProductionData(viewMode)}
                options={chartOptions}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default MachineDetail
