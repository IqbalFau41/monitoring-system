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
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
} from '@coreui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { cilPen, cilTrash, cilArrowTop, cilArrowBottom } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import '../../../scss/inventoryConfig.scss'

const Inventory = () => {
  // State management for inventory data and UI controls
  const [inventories, setInventories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState({ column: 'name_part', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [deleteItem, setDeleteItem] = useState(null)
  const navigate = useNavigate()

  // Function to fetch inventory data from the API
  const fetchInventories = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:3001/api/inventory')
      setInventories(response.data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching inventories:', error)
      setError('Failed to load inventories. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts
  useEffect(() => {
    fetchInventories()
  }, [])

  // Navigation handler for updating inventory items
  const handleUpdate = (id) => {
    navigate(`/manufacturing/inventory/update/${id}`)
  }

  // Sorting handler that toggles sort direction when clicking the same column
  const handleSort = (column) => {
    const direction = sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc'
    setSortOrder({ column, direction })
  }

  // Delete confirmation handler
  const confirmDelete = (inventory) => {
    setDeleteItem(inventory)
  }

  // Delete execution handler
  const handleDelete = async () => {
    if (!deleteItem) return

    try {
      await axios.delete(`http://localhost:3001/api/inventory/${deleteItem.no_part}`)
      fetchInventories()
      setDeleteItem(null)
    } catch (error) {
      console.error('Error deleting inventory:', error)
      setError('Failed to delete inventory. Please try again later.')
    }
  }

  // Sort and filter data processing
  const sortedInventories = [...inventories].sort((a, b) => {
    if (sortOrder.direction === 'asc') {
      return a[sortOrder.column] > b[sortOrder.column] ? 1 : -1
    } else {
      return a[sortOrder.column] < b[sortOrder.column] ? 1 : -1
    }
  })

  const filteredInventories = sortedInventories.filter((item) =>
    item.name_part.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInventories.slice(indexOfFirstItem, indexOfLastItem)
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Loading spinner display
  if (loading) {
    return (
      <div className="spinner-container">
        <CSpinner color="primary" />
      </div>
    )
  }

  // Main component render
  return (
    <CRow className="job-list-page">
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Inventory Management</strong>
            <div className="search-input">
              <input
                type="text"
                className="form-control"
                placeholder="Cari berdasarkan nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CCardHeader>
          <CCardBody>
            <div className="table-wrapper">
              {/* Fixed header section with sort indicators */}
              <div className="fixed-header">
                <div className="fixed-header-cell" onClick={() => handleSort('no_part')}>
                  No{' '}
                  {sortOrder.column === 'no_part' && (
                    <CIcon icon={sortOrder.direction === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </div>
                <div className="fixed-header-cell" onClick={() => handleSort('date_part')}>
                  Tanggal{' '}
                  {sortOrder.column === 'date_part' && (
                    <CIcon icon={sortOrder.direction === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </div>
                <div className="fixed-header-cell" onClick={() => handleSort('name_part')}>
                  Nama Part{' '}
                  {sortOrder.column === 'name_part' && (
                    <CIcon icon={sortOrder.direction === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </div>
                <div className="fixed-header-cell" onClick={() => handleSort('type_part')}>
                  Tipe Part{' '}
                  {sortOrder.column === 'type_part' && (
                    <CIcon icon={sortOrder.direction === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </div>
                <div className="fixed-header-cell" onClick={() => handleSort('maker_part')}>
                  Maker{' '}
                  {sortOrder.column === 'maker_part' && (
                    <CIcon icon={sortOrder.direction === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </div>
                <div className="fixed-header-cell" onClick={() => handleSort('qty_part')}>
                  Qty{' '}
                  {sortOrder.column === 'qty_part' && (
                    <CIcon icon={sortOrder.direction === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </div>
                <div className="fixed-header-cell" onClick={() => handleSort('unit_part')}>
                  Unit{' '}
                  {sortOrder.column === 'unit_part' && (
                    <CIcon icon={sortOrder.direction === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </div>
                <div className="fixed-header-cell" onClick={() => handleSort('recipient_part')}>
                  Penerima{' '}
                  {sortOrder.column === 'recipient_part' && (
                    <CIcon icon={sortOrder.direction === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </div>
                <div className="fixed-header-cell" onClick={() => handleSort('information_part')}>
                  Informasi{' '}
                  {sortOrder.column === 'information_part' && (
                    <CIcon icon={sortOrder.direction === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </div>
                <div className="fixed-header-cell" onClick={() => handleSort('pic_part')}>
                  PIC{' '}
                  {sortOrder.column === 'pic_part' && (
                    <CIcon icon={sortOrder.direction === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </div>
                <div className="fixed-header-cell">Action</div>
              </div>

              {/* Scrollable table content */}
              <div className="table-container">
                <CTable striped hover responsive className="responsive-table">
                  <CTableHead className="d-none">
                    <CTableRow>
                      <CTableHeaderCell>No</CTableHeaderCell>
                      <CTableHeaderCell>Tanggal</CTableHeaderCell>
                      <CTableHeaderCell>Nama Part</CTableHeaderCell>
                      <CTableHeaderCell>Tipe Part</CTableHeaderCell>
                      <CTableHeaderCell>Maker</CTableHeaderCell>
                      <CTableHeaderCell>Qty</CTableHeaderCell>
                      <CTableHeaderCell>Unit</CTableHeaderCell>
                      <CTableHeaderCell>Penerima</CTableHeaderCell>
                      <CTableHeaderCell>Informasi</CTableHeaderCell>
                      <CTableHeaderCell>PIC</CTableHeaderCell>
                      <CTableHeaderCell>Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentItems.map((inventory) => (
                      <CTableRow key={inventory.no_part}>
                        <CTableDataCell>{inventory.no_part}</CTableDataCell>
                        <CTableDataCell>
                          {new Date(inventory.date_part).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell>{inventory.name_part}</CTableDataCell>
                        <CTableDataCell>{inventory.type_part}</CTableDataCell>
                        <CTableDataCell>{inventory.maker_part}</CTableDataCell>
                        <CTableDataCell>{inventory.qty_part}</CTableDataCell>
                        <CTableDataCell>{inventory.unit_part}</CTableDataCell>
                        <CTableDataCell>{inventory.recipient_part}</CTableDataCell>
                        <CTableDataCell>{inventory.information_part}</CTableDataCell>
                        <CTableDataCell>{inventory.pic_part}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleUpdate(inventory.no_part)}
                          >
                            <CIcon icon={cilPen} />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => confirmDelete(inventory)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            </div>

            {/* Pagination controls */}
            <CPagination aria-label="Page navigation example" className="mt-3">
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
              >
                Previous
              </CPaginationItem>
              {[...Array(Math.ceil(filteredInventories.length / itemsPerPage))].map((_, index) => (
                <CPaginationItem
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </CPaginationItem>
              ))}
              <CPaginationItem
                disabled={currentPage === Math.ceil(filteredInventories.length / itemsPerPage)}
                onClick={() => paginate(currentPage + 1)}
              >
                Next
              </CPaginationItem>
            </CPagination>
          </CCardBody>
        </CCard>

        {/* Error display */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Delete confirmation modal */}
        <CModal visible={!!deleteItem} onClose={() => setDeleteItem(null)}>
          <CModalHeader>
            <CModalTitle>Konfirmasi Hapus</CModalTitle>
          </CModalHeader>
          <CModalBody>
            Apakah Anda yakin ingin menghapus part:
            <br />
            <strong>No Part: {deleteItem?.no_part}</strong>
            <br />
            <strong>Nama Part: {deleteItem?.name_part}</strong>
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
