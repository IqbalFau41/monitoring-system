import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CModalFooter,
  CSpinner,
  CRow,
  CCol,
} from '@coreui/react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

const UpdateInventory = () => {
  const { id } = useParams()
  const navigate = useNavigate()
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const fetchInventory = async () => {
      if (!id) {
        setError('No inventory ID provided')
        return
      }

      setLoading(true)
      try {
        const response = await axios.get(`http://localhost:3001/api/inventory/${id}`)
        if (response.data) {
          setFormData({
            date_part: response.data.date_part
              ? new Date(response.data.date_part).toISOString().split('T')[0]
              : '',
            delivery_note: response.data.delivery_note || '',
            purchase_order: response.data.purchase_order || '',
            name_part: response.data.name_part || '',
            type_part: response.data.type_part || '',
            maker_part: response.data.maker_part || '',
            qty_part: response.data.qty_part || '',
            unit_part: response.data.unit_part || '',
            recipient_part: response.data.recipient_part || '',
            information_part: response.data.information_part || '',
            pic_part: response.data.pic_part || '',
          })
          setError(null)
        } else {
          setError('No data found for this inventory item.')
        }
      } catch (error) {
        console.error('Error fetching inventory:', error)
        setError(error.response?.data?.error || 'Failed to fetch inventory data.')
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.name_part || !formData.qty_part || !formData.date_part) {
      setError('Nama Part, Jumlah, dan Tanggal harus diisi.')
      return
    }

    try {
      await axios.put(`http://localhost:3001/api/inventory/${id}`, {
        ...formData,
        qty_part: parseInt(formData.qty_part, 10),
      })

      setSuccess('Inventory berhasil diperbarui.')
      setTimeout(() => {
        navigate('/manufacturing/inventory')
      }, 1500)
    } catch (error) {
      console.error('Error updating inventory:', error)
      setError(error.response?.data?.error || 'Gagal memperbarui inventory.')
    }
  }

  if (!id) {
    return <div className="alert alert-danger">ID inventaris tidak valid</div>
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <CSpinner />
      </div>
    )
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>Perbarui Inventory - ID: {id}</strong>
      </CCardHeader>
      <CCardBody>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

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

          <div className="mb-3">
            <CFormLabel>Informasi Part</CFormLabel>
            <CFormInput
              type="text"
              name="information_part"
              value={formData.information_part}
              onChange={handleInputChange}
            />
          </div>

          <CModalFooter>
            <CButton color="secondary" onClick={() => navigate('/manufacturing/inventory')}>
              Batal
            </CButton>
            <CButton color="primary" type="submit">
              Perbarui
            </CButton>
          </CModalFooter>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default UpdateInventory
