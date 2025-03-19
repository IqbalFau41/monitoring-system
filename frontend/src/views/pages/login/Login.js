// src/views/pages/login/Login.js
import React, { useState, useEffect } from 'react'
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
  const [apiUrl, setApiUrl] = useState('')
  const navigate = useNavigate()

  // Dynamically determine the API URL based on the current environment
  useEffect(() => {
    // Get the hostname and port from the current URL
    const hostname = window.location.hostname
    const port = import.meta.env.VITE_BACKEND_PORT || '3001'

    // Determine protocol (use HTTPS in production)
    const protocol = window.location.protocol

    // For development local environment
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      setApiUrl(`http://localhost:${port}/api/auth/login`)
    }
    // For production or other environments
    else {
      setApiUrl(`${protocol}//${hostname}:${port}/api/auth/login`)
    }
  }, [])

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(apiUrl, data)

      // Store the token in local storage
      const { token } = response.data
      localStorage.setItem('token', token)

      // Save the API base URL for other components to use
      localStorage.setItem('apiBaseUrl', apiUrl.replace('/api/auth/login', ''))

      // Redirect to dashboard
      navigate('/cikarang')
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status <= 500) {
        setError(error.response.data.message)
      } else {
        setError('An unexpected error occurred. Please check your network connection.')
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
                        type="password"
                        placeholder="Password"
                        name="nrp"
                        onChange={handleChange}
                        value={data.nrp}
                        required
                      />
                    </CInputGroup>
                    {error && <div className="text-danger mb-3">{error}</div>}
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
