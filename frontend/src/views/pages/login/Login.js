// src/views/pages/login/Login.js
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

const Login = () => {
  const [data, setData] = useState({ nrp: '', email: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate() // Hook to programmatically navigate

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = 'http://localhost:3001/api/auth/login' // Ganti dengan IP backend Anda
      const response = await axios.post(url, data)

      // Pastikan backend mengembalikan token
      const { token } = response.data // Sesuaikan dengan struktur respons backend
      localStorage.setItem('token', token) // Simpan token di local storage

      // Redirect ke cikarang
      navigate('/cikarang') // Ganti dengan route cikarang Anda
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status <= 500) {
        setError(error.response.data.message) // Set pesan kesalahan dari respons
      } else {
        setError('An unexpected error occurred.') // Pesan kesalahan umum
      }
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-medium-emphasis">Sign In to your account</p>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        name="email"
                        onChange={handleChange}
                        value={data.email}
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="Password"
                        placeholder="Password"
                        name="nrp"
                        onChange={handleChange}
                        value={data.nrp}
                        required
                      />
                    </CInputGroup>
                    {error && <div className="text-danger">{error}</div>}{' '}
                    {/* Display error message */}
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5">
                <CCardBody className="text-center">
                  <div>
                    <h2>Monitoring System IOT</h2>
                    <p>by: Manufakturing Engineering</p>
                    <h2></h2>
                    <p>Kepuasan Pelanggan Adalah Hal Yang Utama</p>
                    <p>PT. Musashi Auto Part Indonesia</p>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
