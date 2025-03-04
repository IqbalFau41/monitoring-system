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
import { useNavigate } from 'react-router-dom'
import { cilPen, cilCheck, cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import '../../../scss/inventoryConfig.scss'

const JobList = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState({ column: 'NAME', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [completeItem, setCompleteItem] = useState(null)
  const [completingJob, setCompletingJob] = useState(false)
  const [updateItem, setUpdateItem] = useState(null) // State for update modal
  const [updatingJob, setUpdatingJob] = useState(false) // State for updating job
  const navigate = useNavigate()

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:3001/api/job-list')
      setJobs(response.data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching job list:', error)
      setError('Gagal memuat daftar pekerjaan. Silakan coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleUpdate = (job) => {
    setUpdateItem(job) // Set the job to be updated
  }

  const handleSort = (column) => {
    const direction = sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc'
    setSortOrder({ column, direction })
  }

  const handleComplete = async () => {
    if (!completeItem) return

    setCompletingJob(true)
    try {
      const response = await axios.post(`http://localhost:3001/api/job-history/move-to-history/${completeItem.NRP}`)
      setSuccessMessage(`Pekerjaan ${completeItem.NAME} telah berhasil diselesaikan`)
      fetchJobs()
      setCompleteItem(null)
      console.log('Job completed successfully:', response.data)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error completing job:', error.response?.data || error.message)
      setError(`Gagal menyelesaikan pekerjaan: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`)
    } finally {
      setCompletingJob(false)
    }
  }

  const handleUpdateJob = async () => {
    if (!updateItem) return

    setUpdatingJob(true)
    try {
      const response = await axios.put(`http://localhost:3001/api/job-list/${updateItem.NRP}`, updateItem)
      setSuccessMessage(`Pekerjaan ${updateItem.NAME} telah berhasil diperbarui`)
      fetchJobs()
      setUpdateItem(null)
      console.log('Job updated successfully:', response.data)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error updating job:', error.response?.data || error.message)
      setError(`Gagal memperbarui pekerjaan: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`)
    } finally {
      setUpdatingJob(false)
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

  const sortedAndFilteredJobs = React.useMemo(() => {
    const filtered = jobs.filter((item) =>
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
  }, [jobs, searchTerm, sortOrder])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedAndFilteredJobs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedAndFilteredJobs.length / itemsPerPage)

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
    <CRow className="job-list-page">
      <CCol xs={12}>
        {error && <CAlert color="danger" dismissible onClose={() => setError(null)}>{error}</CAlert>}
        {successMessage && (
          <CAlert color="success" dismissible onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </CAlert>
        )}

        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Daftar Pekerjaan Karyawan</strong>
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
              <TableHeader column="created_at">Dibuat Pada</TableHeader>
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
                        <CTableDataCell>{formatDate(job.created_at)}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleUpdate(job)}
                            title="Edit"
                          >
                            <CIcon icon={cilPen} />
                          </CButton>
                          <CButton
                            color="success"
                            size="sm"
                            onClick={() => setCompleteItem(job)}
                            title="Selesai"
                          >
                            <CIcon icon={cilCheck} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="9" className="text-center">
                        Tidak ada data pekerjaan yang tersedia
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

        {/* Modal for completing job */}
        <CModal visible={!!completeItem} onClose={() => setCompleteItem(null)}>
          <CModalHeader>
            <CModalTitle>Konfirmasi Penyelesaian Pekerjaan</CModalTitle>
          </CModalHeader>
          <CModalBody>
            Apakah Anda yakin pekerjaan ini telah selesai:
            <br />
            <strong>NRP: {completeItem?.NRP}</strong>
            <br />
            <strong>Nama: {completeItem?.NAME}</strong>
            <br />
            <strong>Deskripsi Pekerjaan: {completeItem?.JOB_DESC}</strong>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setCompleteItem(null)}>
              Batal
            </CButton>
            <CButton
              color="success"
              onClick={handleComplete}
              disabled={completingJob}
            >
              {completingJob ? (
                <>
                  <CSpinner size="sm" color="light" className="me-1" />
                  Memproses...
                </>
              ) : (
                'Selesai'
              )}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Modal for updating job */}
        <CModal visible={!!updateItem} onClose={() => setUpdateItem(null)}>
          <CModalHeader>
            <CModalTitle>Perbarui Pekerjaan</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CFormInput
              label="Nama"
              value={updateItem?.NAME || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, NAME: e.target.value })}
            />
            <CFormInput
              label="Deskripsi Pekerjaan"
              value={updateItem?.JOB_DESC || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, JOB_DESC: e.target.value })}
            />
            <CFormInput
              label="Job Class"
              value={updateItem?.JOB_CLASS || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, JOB_CLASS: e.target.value })}
            />
            <CFormInput
              label="Pabrik"
              value={updateItem?.FACTORY || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, FACTORY: e.target.value })}
            />
            <CFormInput
              label="Tanggal Jatuh Tempo"
              type="date"
              value={updateItem?.DUE_DATE?.split('T')[0] || ''}
              onChange={(e) => setUpdateItem({ ...updateItem, DUE_DATE: e.target.value })}
            />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setUpdateItem(null)}>
              Batal
            </CButton>
            <CButton
              color="primary"
              onClick={handleUpdateJob}
              disabled={updatingJob}
            >
              {updatingJob ? (
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

export default JobList
