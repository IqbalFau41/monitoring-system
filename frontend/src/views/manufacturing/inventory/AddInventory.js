import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CCol,
} from '@coreui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const AddInventory = () => {
  const [formData, setFormData] = useState({
    date_part: '',
    delivery_note: '',
    purchase_order: '',
    name_part: '',
    type_part: '',
    maker_part: '',
    qty_part: '',
    unit_part: '',
    recipient_part: '',
    information_part: '',
    pic_part: '',
  })
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name_part || !formData.qty_part || !formData.date_part) {
      alert('Nama Part, Jumlah, dan Tanggal harus diisi!')
      return
    }

    try {
      const dataToSend = {
        ...formData,
        qty_part: parseInt(formData.qty_part, 10),
      }

      await axios.post('http://localhost:3001/api/inventory', dataToSend)
      navigate('/manufacturing/inventory')
    } catch (error) {
      console.error('Error adding inventory:', error)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Tambah Inventory Part</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Tanggal</CFormLabel>
                  <CFormInput
                    type="date"
                    name="date_part"
                    value={formData.date_part}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol>
                  <CFormLabel>Nama Part</CFormLabel>
                  <CFormInput
                    type="text"
                    name="name_part"
                    value={formData.name_part}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Delivery Note</CFormLabel>
                  <CFormInput
                    type="text"
                    name="delivery_note"
                    value={formData.delivery_note}
                    onChange={handleInputChange}
                  />
                </CCol>
                <CCol>
                  <CFormLabel>Purchase Order</CFormLabel>
                  <CFormInput
                    type="text"
                    name="purchase_order"
                    value={formData.purchase_order}
                    onChange={handleInputChange}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Tipe Part</CFormLabel>
                  <CFormInput
                    type="text"
                    name="type_part"
                    value={formData.type_part}
                    onChange={handleInputChange}
                  />
                </CCol>
                <CCol>
                  <CFormLabel>Maker Part</CFormLabel>
                  <CFormInput
                    type="text"
                    name="maker_part"
                    value={formData.maker_part}
                    onChange={handleInputChange}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Jumlah Part</CFormLabel>
                  <CFormInput
                    type="number"
                    name="qty_part"
                    value={formData.qty_part}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol>
                  <CFormLabel>Unit Part</CFormLabel>
                  <CFormInput
                    type="text"
                    name="unit_part"
                    value={formData.unit_part}
                    onChange={handleInputChange}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Penerima Part</CFormLabel>
                  <CFormInput
                    type="text"
                    name="recipient_part"
                    value={formData.recipient_part}
                    onChange={handleInputChange}
                  />
                </CCol>
                <CCol>
                  <CFormLabel>PIC Part</CFormLabel>
                  <CFormInput
                    type="text"
                    name="pic_part"
                    value={formData.pic_part}
                    onChange={handleInputChange}
                  />
                </CCol>
              </CRow>

              <CFormLabel>Informasi Part</CFormLabel>
              <CFormInput
                type="text"
                name="information_part"
                value={formData.information_part}
                onChange={handleInputChange}
                className="mb-3"
              />

              <CModalFooter>
                <CButton color="secondary" onClick={() => navigate('/manufacturing/inventory')}>
                  Batal
                </CButton>
                <CButton color="primary" type="submit">
                  Simpan
                </CButton>
              </CModalFooter>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddInventory
