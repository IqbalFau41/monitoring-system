import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilIndustry,
  cilNotes,
  cilChartPie,
  cilStar,
  cilExternalLink,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Cikarang Plant',
    to: '/cikarang',
    icon: <CIcon icon={cilIndustry} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Karawang Plant',
    to: '/karawang',
    icon: <CIcon icon={cilIndustry} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'maintenance',
  },
  {
    component: CNavGroup,
    name: 'Cikarang Old',
    icon: <CIcon icon={cilIndustry} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Machine Cikarang',
        to: '/cikarang/allcikarang',
      },
      {
        component: CNavItem,
        name: 'ALGT',
        to: '/cikarang/algt',
      },
      {
        component: CNavItem,
        name: 'Balancer',
        to: '/cikarang/balancer',
      },
      {
        component: CNavItem,
        name: 'Cashting',
        to: '/cikarang/cashting',
      },
      {
        component: CNavItem,
        name: 'Finishing',
        to: '/cikarang/finishing',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Karawang Old',
    icon: <CIcon icon={cilIndustry} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Machine Karawang',
        to: '/karawang/allkarawang',
      },
      {
        component: CNavItem,
        name: 'SC Camshaft',
        to: '/karawang/sc_camshaft',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Tool Control',
    to: '/tool_control',
    icon: <CIcon icon={cilIndustry} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Kanagata',
    to: '/kanagata',
    icon: <CIcon icon={cilIndustry} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Departemen',
  },
  {
    component: CNavGroup,
    name: 'Manufacturing Eng',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Job List',
        to: '/manufacturing/joblist',
      },
      {
        component: CNavItem,
        name: 'Inventory',
        to: '/manufacturing/inventory',
      },
      {
        component: CNavItem,
        name: 'History Job',
        to: '/manufacturing/jobhistory',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Timeline Project',
    to: '/charts',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Extras',
  },
  {
    component: CNavGroup,
    name: 'Pages',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Login',
        to: '/login',
      },
      {
        component: CNavItem,
        name: 'Error 404',
        to: '/404',
      },
      {
        component: CNavItem,
        name: 'Error 500',
        to: '/500',
      },
    ],
  },
  {
    component: CNavItem,
    name: (
      <React.Fragment>
        {'Flex Signal'}
        <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
      </React.Fragment>
    ),
    href: 'http://06cs016/FS/DataDisplay/SignalMonitor.aspx',
  },
]

export default _nav
