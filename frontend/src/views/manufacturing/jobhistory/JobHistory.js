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
  CAlert,
} from '@coreui/react'
import axios from 'axios'
import { cilTrash, cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import '../../../scss/inventoryConfig.scss'

const JobHistory = () => {
  // State declarations
  const [jobHistory, setJobHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState({ column: 'COMPLETION_DATE', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Data fetching function
  const fetchJobHistory = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:3001/api/job-history')
      setJobHistory(response.data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching job history:', error)
      setError('Gagal memuat riwayat pekerjaan. Silakan coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobHistory()
  }, [])

  // Sort handling
  const handleSort = (column) => {
    const direction = sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc'
    setSortOrder({ column, direction })
  }

  // Delete handling
  const handleDelete = async () => {
    if (!deleteItem) return

    setDeleting(true)
    try {
      console.log('Deleting item:', deleteItem)
      const response = await axios.delete(`http://localhost:3001/api/job-history/${deleteItem.NRP}`)

      console.log('Delete response:', response)
      setSuccessMessage(`Riwayat pekerjaan ${deleteItem.NAME} berhasil dihapus`)
      fetchJobHistory()
      setDeleteItem(null)

      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Full error:', error)
      console.error('Error details:', error.response?.data)

      setError(
        `Gagal menghapus riwayat pekerjaan: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`,
      )
    } finally {
      setDeleting(false)
    }
  }

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Data processing logic
  const sortedAndFilteredHistory = React.useMemo(() => {
    // First, filter the jobs based on search term
    const filtered = jobHistory.filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )

    // Then sort the filtered results
    return [...filtered].sort((a, b) => {
      const aValue = a[sortOrder.column] || ''
      const bValue = b[sortOrder.column] || ''

      if (sortOrder.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [jobHistory, searchTerm, sortOrder])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedAndFilteredHistory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedAndFilteredHistory.length / itemsPerPage)

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
    <CRow className="job-list-page">
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
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Riwayat Pekerjaan</strong>
            <div className="search-container">
              <CFormInput
                type="text"
                placeholder="Cari berdasarkan nama atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                startContent={<CIcon icon={cilSearch} />}
              />
            </div>
          </CCardHeader>
          <CCardBody>
            <div className="fixed-header">
              <TableHeader column="NRP">NRP</TableHeader>
              <TableHeader column="NAME">Nama</TableHeader>
              <TableHeader column="JOB_CLASS">Job Class</TableHeader>
              <TableHeader column="JOB_DESC">Deskripsi Pekerjaan</TableHeader>
              <TableHeader column="FACTORY">Pabrik</TableHeader>
              <TableHeader column="DUE_DATE">Tanggal Jatuh Tempo</TableHeader>
              <TableHeader column="STATUS">Status</TableHeader>
              <TableHeader column="COMPLETION_DATE">Tanggal Selesai</TableHeader>
              <TableHeader column="ORIGINAL_CREATED_AT">Tanggal Dibuat</TableHeader>
              <div className="fixed-header-cell">Aksi</div>
            </div>

            <div className="table-container">
              <CTable striped hover responsive className="responsive-table">
                <CTableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((job) => (
                      <CTableRow key={job.NRP}>
                        <CTableDataCell>{job.NRP}</CTableDataCell>
                        <CTableDataCell>{job.NAME}</CTableDataCell>
                        <CTableDataCell>{job.JOB_CLASS}</CTableDataCell>
                        <CTableDataCell>{job.JOB_DESC}</CTableDataCell>
                        <CTableDataCell>{job.FACTORY}</CTableDataCell>
                        <CTableDataCell>{formatDate(job.DUE_DATE)}</CTableDataCell>
                        <CTableDataCell>
                          <span className={`status-badge status-${job.STATUS?.toLowerCase()}`}>
                            {job.STATUS || 'N/A'}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>{formatDate(job.COMPLETION_DATE)}</CTableDataCell>
                        <CTableDataCell>{formatDate(job.ORIGINAL_CREATED_AT)}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => setDeleteItem(job)}
                            title="Hapus"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="10" className="text-center">
                        Tidak ada data riwayat pekerjaan yang tersedia
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

        {/* Delete confirmation modal */}
        <CModal visible={!!deleteItem} onClose={() => setDeleteItem(null)}>
          <CModalHeader>
            <CModalTitle>Konfirmasi Hapus</CModalTitle>
          </CModalHeader>
          <CModalBody>
            Apakah Anda yakin ingin menghapus riwayat pekerjaan:
            <br />
            <strong>NRP: {deleteItem?.NRP}</strong>
            <br />
            <strong>Nama: {deleteItem?.NAME}</strong>
            <br />
            <strong>Deskripsi Pekerjaan: {deleteItem?.JOB_DESC}</strong>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setDeleteItem(null)}>
              Batal
            </CButton>
            <CButton color="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <CSpinner size="sm" color="light" className="me-1" />
                  Memproses...
                </>
              ) : (
                'Hapus'
              )}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default JobHistory
