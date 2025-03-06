import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CButton,
  CFormInput,
  CAlert,
} from '@coreui/react'
import axios from 'axios'
import { cilPen, cilTrash, cilPlus, cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import '../../../scss/inventoryConfig.scss'

const Inventory = () => {
  const [inventories, setInventories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState({ column: 'name_part', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [deleteItem, setDeleteItem] = useState(null)
  const [updateItem, setUpdateItem] = useState(null)
  const [updatingInventory, setUpdatingInventory] = useState(false)
  const [formData, setFormData] = useState({
    no_part: '',
    name_part: '',
    qty_part: '',
    date_part: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  const fetchInventories = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:3001/api/inventory')
      setInventories(response.data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching inventories:', error)
      setError('Gagal memuat daftar inventaris. Silakan coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventories()
  }, [])

  const handleUpdate = (inventory) => {
    setUpdateItem(inventory)
  }

  const handleSort = (column) => {
    const direction = sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc'
    setSortOrder({ column, direction })
  }

  // Handle input change
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle opening Create modal
  const openModal = (inventory = null) => {
    if (inventory) {
      setFormData({ ...inventory })
      setIsEditing(true)
    } else {
      setFormData({ no_part: '', name_part: '', qty_part: '', date_part: '' })
      setIsEditing(false)
    }
    setModalVisible(true)
  }

  // Handle Create & Update from modal
  const handleSave = async () => {
    try {
      if (isEditing) {
        await axios.put(`http://localhost:3001/api/inventory/${formData.no_part}`, formData)
        setSuccessMessage(`Inventaris ${formData.name_part} telah berhasil diperbarui`)
      } else {
        await axios.post('http://localhost:3001/api/inventory', formData)
        setSuccessMessage(`Inventaris ${formData.name_part} telah berhasil ditambahkan`)
      }
      fetchInventories()
      setModalVisible(false)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error saving inventory:', error)
      setError(`Gagal menyimpan inventaris: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`)
    }
  }

  // Handle Update from update modal
  const handleUpdateInventory = async () => {
    if (!updateItem) return

    setUpdatingInventory(true)
    try {
      const response = await axios.put(`http://localhost:3001/api/inventory/${updateItem.no_part}`, updateItem)
      setSuccessMessage(`Inventaris ${updateItem.name_part} telah berhasil diperbarui`)
      fetchInventories()
      setUpdateItem(null)
      console.log('Inventory updated successfully:', response.data)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error updating inventory:', error.response?.data || error.message)
      setError(`Gagal memperbarui inventaris: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`)
    } finally {
      setUpdatingInventory(false)
    }
  }

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      await axios.delete(`http://localhost:3001/api/inventory/${deleteItem.no_part}`)
      setSuccessMessage(`Inventaris ${deleteItem.name_part} telah berhasil dihapus`)
      fetchInventories()
      setDeleteItem(null)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error deleting inventory:', error.response?.data || error.message)
      setError(`Gagal menghapus inventaris: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`)
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const sortedAndFilteredInventories = React.useMemo(() => {
    const filtered = inventories.filter((item) =>
      Object.values(item).some(
        value =>
          value &&
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

    return [...filtered].sort((a, b) => {
      const aValue = a[sortOrder.column] || ''
      const bValue = b[sortOrder.column] || ''

      if (sortOrder.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [inventories, searchTerm, sortOrder])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedAndFilteredInventories.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedAndFilteredInventories.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <CSpinner color="primary" />
      </div>
    )
  }

  const TableHeader = ({ column, children }) => (
    <div className="fixed-header-cell" onClick={() => handleSort(column)}>
      {children}
      {sortOrder.column === column && (
        <span className="ms-1">{sortOrder.direction === 'asc' ? '↑' : '↓'}</span>
      )}
    </div>
  )

  return (
    <CRow className="inventory-page">
      <CCol xs={12}>
        {error && <CAlert color="danger" dismissible onClose={() => setError(null)}>{error}</CAlert>}
        {successMessage && (
          <CAlert color="success" dismissible onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </CAlert>
        )}

        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Daftar Inventaris</strong>

            <div className="d-flex">
              <div className="search-container me-3">
                <CFormInput
                  type="text"
                  placeholder="Cari berdasarkan nama atau nomor part..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                  startContent={<CIcon icon={cilSearch} />}
                />
              </div>

            </div>
          </CCardHeader>

          <CCardBody>
          <CButton color="primary" onClick={() => openModal()}>
                <CIcon icon={cilPlus} className="me-2" />
                Tambah Inventaris
              </CButton>
            <div className="fixed-header">
              <TableHeader column="no_part">No Part</TableHeader>
              <TableHeader column="name_part">Nama Part</TableHeader>
              <TableHeader column="qty_part">Kuantitas</TableHeader>
              <TableHeader column="date_part">Tanggal</TableHeader>
              <div className="fixed-header-cell">Aksi</div>
            </div>

            <div style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
  <CTable striped hover responsive className="responsive-table">
    <CTableBody>
      {currentItems.length > 0 ? (
        currentItems.map((inventory) => (
          <CTableRow key={inventory.no_part}>
            <CTableDataCell>{inventory.no_part}</CTableDataCell>
            <CTableDataCell>{inventory.name_part}</CTableDataCell>
            <CTableDataCell>{inventory.qty_part}</CTableDataCell>
            <CTableDataCell>{formatDate(inventory.date_part)}</CTableDataCell>
            <CTableDataCell>
              <CButton
                color="warning"
                size="sm"
                className="me-2"
                onClick={() => handleUpdate(inventory)}
                title="Edit"
              >
                <CIcon icon={cilPen} />
              </CButton>
              <CButton
                color="danger"
                size="sm"
                onClick={() => setDeleteItem(inventory)}
                title="Hapus"
              >
                <CIcon icon={cilTrash} />
              </CButton>
            </CTableDataCell>
          </CTableRow>
        ))
      ) : (
        <CTableRow>
          <CTableDataCell colSpan="5" className="text-center">
            Tidak ada data inventaris yang tersedia
          </CTableDataCell>
        </CTableRow>
      )}
    </CTableBody>
  </CTable>
</div>

            {totalPages > 1 && (
              <CPagination className="mt-3 justify-content-center">
                <CPaginationItem
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </CPaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <CPaginationItem
                    key={index + 1}
                    active={currentPage === index + 1}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </CPaginationItem>
                ))}
                <CPaginationItem
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            )}
          </CCardBody>
        </CCard>

        {/* Modal for creating new inventory */}
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>{isEditing ? 'Edit Inventaris' : 'Tambah Inventaris'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CFormInput
              label="No Part"
              name="no_part"
              value={formData.no_part}
              onChange={handleInputChange}
              disabled={isEditing}
              className="mb-3"
            />
            <CFormInput
              label="Nama Part"
              name="name_part"
              value={formData.name_part}
              onChange={handleInputChange}
              required
              className="mb-3"
            />
            <CFormInput
              label="Kuantitas"
              type="number"
              name="qty_part"
              value={formData.qty_part}
              onChange={handleInputChange}
              required
              className="mb-3"
            />
            <CFormInput
              label="Tanggal"
              type="date"
              name="date_part"
              value={formData.date_part?.split('T')[0] || ''}
              onChange={handleInputChange}
              required
              className="mb-3"
            />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Batal
            </CButton>
            <CButton
              color="primary"
              onClick={handleSave}
            >
              Simpan
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Modal for updating inventory */}
        <CModal visible={!!updateItem} onClose={() => setUpdateItem(null)}>
          <CModalHeader>
            <CModalTitle>Perbarui Inventaris</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CFormInput
              label="No Part"
              value={updateItem?.no_part || ''}
              disabled
              className="mb-3"
            />
            <CFormInput
              label="Nama Part"
              value={updateItem?.name_part || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, name_part: e.target.value })}
              className="mb-3"
            />
            <CFormInput
              label="Kuantitas"
              type="number"
              value={updateItem?.qty_part || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, qty_part: e.target.value })}
              className="mb-3"
            />
            <CFormInput
              label="Tanggal"
              type="date"
              value={updateItem?.date_part?.split('T')[0] || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, date_part: e.target.value })}
              className="mb-3"
            />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setUpdateItem(null)}>
              Batal
            </CButton>
            <CButton
              color="primary"
              onClick={handleUpdateInventory}
              disabled={updatingInventory}
            >
              {updatingInventory ? (
                <>
                  <CSpinner size="sm" color="light" className="me-1" />
                  Memperbarui...
                </>
              ) : (
                'Perbarui'
              )}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Modal for deleting inventory */}
        <CModal visible={!!deleteItem} onClose={() => setDeleteItem(null)}>
          <CModalHeader>
            <CModalTitle>Konfirmasi Hapus</CModalTitle>
          </CModalHeader>
          <CModalBody>
            Apakah Anda yakin ingin menghapus inventaris:
            <br />
            <strong>No Part: {deleteItem?.no_part}</strong>
            <br />
            <strong>Nama Part: {deleteItem?.name_part}</strong>
            <br />
            <strong>Kuantitas: {deleteItem?.qty_part}</strong>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setDeleteItem(null)}>
              Batal
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Hapus
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default Inventory
