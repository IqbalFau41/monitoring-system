import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import MainChart from './MainChart'

const Dashboard = () => {
  const production = [
    {
      title: 'Cam Shaft',
      planning: Math.floor(Math.random() * 100),
      actual: Math.floor(Math.random() * 100),
      good: Math.floor(Math.random() * 100),
      ng: Math.floor(Math.random() * 100),
    },
    {
      title: 'Connecting Rod',
      planning: Math.floor(Math.random() * 100),
      actual: Math.floor(Math.random() * 100),
      good: Math.floor(Math.random() * 100),
      ng: Math.floor(Math.random() * 100),
    },
    {
      title: 'Clutch System',
      planning: Math.floor(Math.random() * 100),
      actual: Math.floor(Math.random() * 100),
      good: Math.floor(Math.random() * 100),
      ng: Math.floor(Math.random() * 100),
    },
    {
      title: 'Gear Transmission',
      planning: Math.floor(Math.random() * 100),
      actual: Math.floor(Math.random() * 100),
      good: Math.floor(Math.random() * 100),
      ng: Math.floor(Math.random() * 100),
    },
    {
      title: 'Primary Gear',
      planning: Math.floor(Math.random() * 100),
      actual: Math.floor(Math.random() * 100),
      good: Math.floor(Math.random() * 100),
      ng: Math.floor(Math.random() * 100),
    },
    {
      title: 'Secondary Gear',
      planning: Math.floor(Math.random() * 100),
      actual: Math.floor(Math.random() * 100),
      good: Math.floor(Math.random() * 100),
      ng: Math.floor(Math.random() * 100),
    },
    {
      title: 'Lifter Valve',
      planning: Math.floor(Math.random() * 100),
      actual: Math.floor(Math.random() * 100),
      good: Math.floor(Math.random() * 100),
      ng: Math.floor(Math.random() * 100),
    },
    {
      title: 'Rocker Arm',
      planning: Math.floor(Math.random() * 100),
      actual: Math.floor(Math.random() * 100),
      good: Math.floor(Math.random() * 100),
      ng: Math.floor(Math.random() * 100),
    },
  ]

  return (
    <>
      <CRow>
        <CCol xs={12} className="mb-4">
          <CRow>
            <CCol md={6}>
              <CCard>
                <CCardHeader>Production 1 Cikarang</CCardHeader>
                <CCardBody>
                  <MainChart />
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard>
                <CCardHeader>Production 2 Karawang</CCardHeader>
                <CCardBody>
                  <MainChart />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCol>
      </CRow>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Daily Production Cikarang</CCardHeader>
            <CCardBody>
              <CTable>
                <thead>
                  <CTableRow>
                    <CTableHeaderCell style={{ width: '15%' }}>Part</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '5%' }}>Planning</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '5%' }}>Actual</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                  </CTableRow>
                </thead>
                <CTableBody>
                  {production.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell style={{ width: '15%' }}>{item.title}</CTableDataCell>
                      <CTableDataCell style={{ width: '5%' }}>{item.planning}</CTableDataCell>
                      <CTableDataCell style={{ width: '5%' }}>{item.actual}</CTableDataCell>
                      <CTableDataCell>
                        <div className="progress-thin">
                          <CProgress
                            className="progress-thin-proses"
                            thin
                            color="info"
                            value={item.good}
                          />
                          <CProgress
                            className="progress-thin-proses"
                            thin
                            color="danger"
                            value={item.ng}
                          />
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
          <CCard className="mb-4">
            <CCardHeader>Daily Production Cikarang</CCardHeader>
            <CCardBody>
              <CTable>
                <thead>
                  <CTableRow>
                    <CTableHeaderCell style={{ width: '15%' }}>Part</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '5%' }}>Planning</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '5%' }}>Actual</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                  </CTableRow>
                </thead>
                <CTableBody>
                  {production.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell style={{ width: '15%' }}>{item.title}</CTableDataCell>
                      <CTableDataCell style={{ width: '5%' }}>{item.planning}</CTableDataCell>
                      <CTableDataCell style={{ width: '5%' }}>{item.actual}</CTableDataCell>
                      <CTableDataCell>
                        <div className="progress-thin">
                          <CProgress
                            className="progress-thin-proses"
                            thin
                            color="info"
                            value={item.good}
                          />
                          <CProgress
                            className="progress-thin-proses"
                            thin
                            color="danger"
                            value={item.ng}
                          />
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
