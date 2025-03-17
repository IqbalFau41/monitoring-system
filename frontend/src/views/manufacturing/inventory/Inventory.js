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
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CAlert,
} from '@coreui/react'
import axios from 'axios'
import { cilPen, cilTrash, cilPlus, cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import '../../../scss/inventoryConfig.scss'

const Inventory = () => {
  // State declarations
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
  const [deletingInventory, setDeletingInventory] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newInventory, setNewInventory] = useState({
    no_part: '',
    name_part: '',
    type_part: '',
    maker_part: '',
    qty_part: '',
    information_part: '',
  })
  const [addingInventory, setAddingInventory] = useState(false)

  // Data fetching function
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

  // Handle Add Inventory
  const handleAddInventory = async () => {
    setAddingInventory(true)
    try {
      await axios.post('http://localhost:3001/api/inventory', newInventory)
      setSuccessMessage(`Inventaris ${newInventory.name_part} telah berhasil ditambahkan`)
      setShowAddModal(false)
      setNewInventory({
        no_part: '',
        name_part: '',
        type_part: '',
        maker_part: '',
        qty_part: '',
        information_part: '',
      })
      fetchInventories()
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error adding inventory:', error.response?.data || error.message)
      setError(
        `Gagal menambahkan inventaris: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`,
      )
    } finally {
      setAddingInventory(false)
    }
  }

  // Action handlers
  const handleUpdate = (inventory) => {
    setUpdateItem({ ...inventory })
  }

  const handleSort = (column) => {
    const direction = sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc'
    setSortOrder({ column, direction })
  }

  const handleUpdateInventory = async () => {
    if (!updateItem) return

    setUpdatingInventory(true)
    try {
      const response = await axios.put(
        `http://localhost:3001/api/inventory/${updateItem.no_part}`,
        updateItem,
      )
      setSuccessMessage(`Inventaris ${updateItem.name_part} telah berhasil diperbarui`)
      fetchInventories()
      setUpdateItem(null)
      console.log('Inventory updated successfully:', response.data)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error updating inventory:', error.response?.data || error.message)
      setError(
        `Gagal memperbarui inventaris: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`,
      )
    } finally {
      setUpdatingInventory(false)
    }
  }

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteItem) return

    setDeletingInventory(true)
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
      setError(
        `Gagal menghapus inventaris: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`,
      )
    } finally {
      setDeletingInventory(false)
    }
  }

  // Data processing logic
  const sortedAndFilteredInventories = React.useMemo(() => {
    const filtered = inventories.filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
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

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedAndFilteredInventories.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedAndFilteredInventories.length / itemsPerPage)

  // Pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Loading spinner display
  if (loading) {
    return (
      <div className="spinner-container">
        <CSpinner color="primary" />
      </div>
    )
  }

  // Table header component for better organization
  const TableHeader = ({ column, children }) => (
    <div className="fixed-header-cell" onClick={() => handleSort(column)}>
      {children}
      {sortOrder.column === column && (
        <span className="ms-1">{sortOrder.direction === 'asc' ? '↑' : '↓'}</span>
      )}
    </div>
  )

  // Main component render
  return (
    <CRow className="inventory-page">
      <CCol xs={12}>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError(null)}>
            {error}
          </CAlert>
        )}
        {successMessage && (
          <CAlert color="success" dismissible onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </CAlert>
        )}

        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-items-center">
              <strong>Daftar Inventaris</strong>
              <CButton
                color="primary"
                onClick={() => setShowAddModal(true)}
                className="ms-3"
                style={{ width: 'auto' }}
              >
                <CIcon icon={cilPlus} className="me-1" /> Tambah Inventaris
              </CButton>
            </div>
            <div className="search-container">
              <CFormInput
                type="text"
                placeholder="Cari berdasarkan nama atau nomor part..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
                startContent={<CIcon icon={cilSearch} />}
              />
            </div>
          </CCardHeader>

          <CCardBody>
            <div className="fixed-header">
              <TableHeader column="no_part">ID</TableHeader>
              <TableHeader column="name_part">Nama Part</TableHeader>
              <TableHeader column="type_part">Tipe Part</TableHeader>
              <TableHeader column="maker_part">Maker</TableHeader>
              <TableHeader column="qty_part">Kuantitas</TableHeader>
              <TableHeader column="information_part">Informasi</TableHeader>
              <div className="fixed-header-cell">Aksi</div>
            </div>

            <div className="table-container">
              <CTable striped hover responsive className="responsive-table">
                <CTableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((inventory) => (
                      <CTableRow key={inventory.no_part}>
                        <CTableDataCell>{inventory.no_part}</CTableDataCell>
                        <CTableDataCell>{inventory.name_part}</CTableDataCell>
                        <CTableDataCell>{inventory.type_part || '-'}</CTableDataCell>
                        <CTableDataCell>{inventory.maker_part || '-'}</CTableDataCell>
                        <CTableDataCell>{inventory.qty_part}</CTableDataCell>
                        <CTableDataCell>{inventory.information_part || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1">
                            <CButton
                              color="warning"
                              size="sm"
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
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="text-center">
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

        {/* Modal for adding new inventory */}
        <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
          <CModalHeader>
            <CModalTitle>Tambah Inventaris Baru</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CFormInput
              label="ID"
              value={newInventory.no_part}
              onChange={(e) => setNewInventory({ ...newInventory, no_part: e.target.value })}
              className="mb-3"
              required
            />
            <CFormInput
              label="Nama Part"
              value={newInventory.name_part}
              onChange={(e) => setNewInventory({ ...newInventory, name_part: e.target.value })}
              className="mb-3"
              required
            />
            <CFormInput
              label="Tipe Part"
              value={newInventory.type_part}
              onChange={(e) => setNewInventory({ ...newInventory, type_part: e.target.value })}
              className="mb-3"
            />
            <CFormInput
              label="Maker"
              value={newInventory.maker_part}
              onChange={(e) => setNewInventory({ ...newInventory, maker_part: e.target.value })}
              className="mb-3"
            />
            <CFormInput
              label="Kuantitas"
              type="number"
              value={newInventory.qty_part}
              onChange={(e) => setNewInventory({ ...newInventory, qty_part: e.target.value })}
              className="mb-3"
              required
            />
            <CFormInput
              label="Informasi"
              value={newInventory.information_part}
              onChange={(e) =>
                setNewInventory({ ...newInventory, information_part: e.target.value })
              }
              className="mb-3"
            />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowAddModal(false)}>
              Batal
            </CButton>
            <CButton color="primary" onClick={handleAddInventory} disabled={addingInventory}>
              {addingInventory ? (
                <>
                  <CSpinner size="sm" color="light" className="me-1" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
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
            <strong>ID: {deleteItem?.no_part}</strong>
            <br />
            <strong>Nama Part: {deleteItem?.name_part}</strong>
            <br />
            <strong>Tipe: {deleteItem?.type_part || '-'}</strong>
            <br />
            <strong>Kuantitas: {deleteItem?.qty_part}</strong>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setDeleteItem(null)}>
              Batal
            </CButton>
            <CButton color="danger" onClick={handleDelete} disabled={deletingInventory}>
              {deletingInventory ? (
                <>
                  <CSpinner size="sm" color="light" className="me-1" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Modal for updating inventory */}
        <CModal visible={!!updateItem} onClose={() => setUpdateItem(null)}>
          <CModalHeader>
            <CModalTitle>Perbarui Inventaris</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CFormInput label="ID" value={updateItem?.no_part || ''} disabled className="mb-3" />
            <CFormInput
              label="Nama Part"
              value={updateItem?.name_part || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, name_part: e.target.value })}
              className="mb-3"
              required
            />
            <CFormInput
              label="Tipe Part"
              value={updateItem?.type_part || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, type_part: e.target.value })}
              className="mb-3"
            />
            <CFormInput
              label="Maker"
              value={updateItem?.maker_part || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, maker_part: e.target.value })}
              className="mb-3"
            />
            <CFormInput
              label="Kuantitas"
              type="number"
              value={updateItem?.qty_part || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, qty_part: e.target.value })}
              className="mb-3"
              required
            />
            <CFormInput
              label="Informasi"
              value={updateItem?.information_part || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, information_part: e.target.value })}
              className="mb-3"
            />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setUpdateItem(null)}>
              Batal
            </CButton>
            <CButton color="primary" onClick={handleUpdateInventory} disabled={updatingInventory}>
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
      </CCol>
    </CRow>
  )
}

export default Inventory
