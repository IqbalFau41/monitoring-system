import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CProgress, CRow } from '@coreui/react'

const Dashboard = () => {
  const production = [
    { title: 'Monday', good: 64, ng: 8 },
    { title: 'Tuesday', good: 56, ng: 4 },
    { title: 'Wednesday', good: 12, ng: 15 },
    { title: 'Thursday', good: 43, ng: 9 },
    { title: 'Friday', good: 22, ng: 7 },
    { title: 'Saturday', good: 53, ng: 8 },
    { title: 'Sunday', good: 90, ng: 52 },
  ]

  return (
    <CRow>
      <CCol xs>
        <CCard className="mb-4">
          <CCardHeader>Daily Production</CCardHeader>
          <CCardBody>
            <CRow>
              <CCol>
                {production.map((item, index) => (
                  <div className="progress-group mb-4" key={index}>
                    <div className="progress-group-prepend">
                      <span className="text-body-secondary small">{item.title}</span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress thin color="info" value={item.good} />
                      <CProgress thin color="danger" value={item.ng} />
                    </div>
                  </div>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Dashboard
