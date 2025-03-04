import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CProgress } from '@coreui/react'
import cardData from './dataBalancer'

const Balancer = () => {
  const getColors = (status) => {
    switch (status) {
      case 'Running':
        return {
          borderColor: 'var(--cui-success)',
          headerColor: 'var(--cui-success)',
          signal: [
            'signal-dark-red',
            'signal-dark-yellow',
            'signal-green',
            'signal-dark-blue',
            'signal-dark-white',
          ],
        }
      case 'Warning':
        return {
          borderColor: 'var(--cui-warning)',
          headerColor: 'var(--cui-warning)',
          signal: [
            'signal-dark-red',
            'signal-yellow',
            'signal-dark-green',
            'signal-dark-blue',
            'signal-dark-white',
          ],
        }
      case 'Stop':
        return {
          borderColor: 'var(--cui-danger)',
          headerColor: 'var(--cui-danger)',
          signal: [
            'signal-red',
            'signal-dark-yellow',
            'signal-dark-green',
            'signal-dark-blue',
            'signal-dark-white',
          ],
        }
      case 'Little Stop':
        return {
          borderColor: '#fc38da',
          headerColor: '#fc38da',
          signal: [
            'signal-dark-red',
            'signal-dark-yellow',
            'signal-dark-green',
            'signal-blue',
            'signal-dark-white',
          ],
        }
      case 'Line Stop':
        return {
          borderColor: '#c03fab',
          headerColor: '#c03fab',
          signal: [
            'signal-dark-green',
            'signal-dark-yellow',
            'signal-dark-red',
            'signal-blue',
            'signal-dark-white',
          ],
        }
      case 'Power Off':
        return {
          borderColor: 'var(--cui-secondary)',
          headerColor: 'var(--cui-secondary)',
          signal: [
            'signal-dark-green',
            'signal-dark-yellow',
            'signal-dark-red',
            'signal-dark-blue',
            'signal-white',
          ],
        }
      default:
        return {
          borderColor: '#000',
          headerColor: '#000',
          signal: [
            'signal-dark-green',
            'signal-dark-yellow',
            'signal-dark-red',
            'signal-dark-blue',
            'signal-dark-white',
          ],
        }
    }
  }

  return (
    <CRow>
      {cardData.map((data, index) => {
        const { borderColor, headerColor, signal } = getColors(data.message)
        const progress = data.Plan > 0 ? (data.actual / data.Plan) * 100 : 0
        return (
          <CCol className="col-3" xs={3} key={index}>
            <CCard
              className="mb-4"
              style={{
                borderColor: borderColor,
                borderWidth: '1px',
                borderStyle: 'solid',
                height: '100%',
              }}
            >
              <CCardHeader
                style={{
                  backgroundColor: headerColor,
                  color: 'white',
                  height: '60px', // Fixed height for all headers
                  display: 'flex',
                  alignItems: 'center', // Center text vertically
                  padding: '10px 15px',
                }}
              >
                <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {data.mesin}
                </div>
              </CCardHeader>
              <CCardBody>
                {/* Message Display */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <strong>{data.message}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0' }}>
                  <div
                    className="signal-tower"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minWidth: '30px',
                      height: '115px', // Adjusted to match content height
                    }}
                  >
                    {signal.map((signalClass, i) => (
                      <div
                        key={i}
                        className={`signal ${signalClass}`}
                        style={{
                          height: '20px',
                          width: '30px',
                          borderRadius: '2px',
                        }}
                      />
                    ))}
                  </div>
                  {/* Information */}
                  <div style={{ flex: 1 }}>
                    <p>
                      <strong>Plan:</strong> {data.Plan}
                    </p>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Actual:</strong> {data.actual}
                      <CProgress height={10} value={progress} />
                    </div>
                    <div>
                      <strong>Performa:</strong> {data.performance}
                      <CProgress height={10} value={data.performance.replace('%', '')} />
                    </div>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        )
      })}
    </CRow>
  )
}

export default Balancer
