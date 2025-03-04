import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CSpinner } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import '../../../scss/inventoryConfig.scss'

const NewProject = () => {
  const navigate = useNavigate()

  return (
    <CRow className="inventory-page">
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>NewProject Management</strong>
          </CCardHeader>
          <CCardBody>
            <CButton
              color="primary"
              onClick={() => navigate('/manufacturing/inventory/add')}
              className="mb-3"
            >
              Tambah NewProject
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default NewProject
