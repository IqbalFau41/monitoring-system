import React, { useEffect, useState } from 'react';
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
  CFormInput,
  CFormLabel,
  CForm,
} from '@coreui/react';
import axios from 'axios';
import { cilPen, cilTrash, cilPlus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import '../../../scss/inventoryConfig.scss';

const Inventory = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [formData, setFormData] = useState({
    no_part: '',
    name_part: '',
    qty_part: '',
    date_part: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch inventory data
  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/inventory');
      setInventories(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching inventories:', error);
      setError('Failed to load inventories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle opening Create/Update modal
  const openModal = (inventory = null) => {
    if (inventory) {
      setFormData({ ...inventory });
      setIsEditing(true);
    } else {
      setFormData({ no_part: '', name_part: '', qty_part: '', date_part: '' });
      setIsEditing(false);
    }
    setModalVisible(true);
  };

  // Handle input change
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Create & Update
  const handleSave = async () => {
    try {
      if (isEditing) {
        await axios.put(`http://localhost:3001/api/inventory/${formData.no_part}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/inventory', formData);
      }
      fetchInventories();
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving inventory:', error);
      setError('Failed to save inventory. Please try again.');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await axios.delete(`http://localhost:3001/api/inventory/${deleteItem.no_part}`);
      fetchInventories();
      setDeleteItem(null);
    } catch (error) {
      console.error('Error deleting inventory:', error);
      setError('Failed to delete inventory.');
    }
  };

  return (
    <CRow className="inventory-page">
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Inventory Management</strong>
            <CButton color="primary" onClick={() => openModal()}>
              <CIcon icon={cilPlus} className="me-2" />
              Tambah Inventory
            </CButton>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="d-flex justify-content-center">
                <CSpinner color="primary" />
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>No</CTableHeaderCell>
                    <CTableHeaderCell>Nama Part</CTableHeaderCell>
                    <CTableHeaderCell>Quantity</CTableHeaderCell>
                    <CTableHeaderCell>Tanggal</CTableHeaderCell>
                    <CTableHeaderCell>Aksi</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {inventories.map((inventory) => (
                    <CTableRow key={inventory.no_part}>
                      <CTableDataCell>{inventory.no_part}</CTableDataCell>
                      <CTableDataCell>{inventory.name_part}</CTableDataCell>
                      <CTableDataCell>{inventory.qty_part}</CTableDataCell>
                      <CTableDataCell>{inventory.date_part}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => openModal(inventory)}
                        >
                          <CIcon icon={cilPen} />
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => setDeleteItem(inventory)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>

        {/* Modal Create & Update */}
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>{isEditing ? 'Edit Inventory' : 'Tambah Inventory'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormLabel>No Part</CFormLabel>
              <CFormInput
                type="text"
                name="no_part"
                value={formData.no_part}
                onChange={handleInputChange}
                disabled={isEditing}
              />
              <CFormLabel>Nama Part</CFormLabel>
              <CFormInput
                type="text"
                name="name_part"
                value={formData.name_part}
                onChange={handleInputChange}
                required
              />
              <CFormLabel>Quantity</CFormLabel>
              <CFormInput
                type="number"
                name="qty_part"
                value={formData.qty_part}
                onChange={handleInputChange}
                required
              />
              <CFormLabel>Tanggal</CFormLabel>
              <CFormInput
                type="date"
                name="date_part"
                value={formData.date_part}
                onChange={handleInputChange}
                required
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Batal
            </CButton>
            <CButton color="primary" onClick={handleSave}>
              Simpan
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Modal Delete */}
        <CModal visible={!!deleteItem} onClose={() => setDeleteItem(null)}>
          <CModalHeader>
            <CModalTitle>Konfirmasi Hapus</CModalTitle>
          </CModalHeader>
          <CModalBody>
            Apakah Anda yakin ingin menghapus <strong>{deleteItem?.name_part}</strong>?
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
  );
};

export default Inventory;
