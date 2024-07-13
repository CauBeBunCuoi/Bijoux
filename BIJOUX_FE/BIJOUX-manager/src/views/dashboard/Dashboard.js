import React, { useEffect, useState } from 'react'
import classNames from 'classnames'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import { get_dashboard } from '../../api/main/orders/Order_api'

const Dashboard = () => {

  const progressExample = [
    { title: 'Visits', value: '29.703 Users', percent: 40, color: 'success' },
    { title: 'Unique', value: '24.093 Users', percent: 20, color: 'info' },
    { title: 'Pageviews', value: '78.706 Views', percent: 60, color: 'warning' },
    { title: 'New Users', value: '22.123 Users', percent: 80, color: 'danger' },
    { title: 'Bounce Rate', value: 'Average Rate', percent: 40.15, color: 'primary' },
  ]

  const progressGroupExample1 = [
    { title: 'Monday', value1: 34, value2: 78 },
    { title: 'Tuesday', value1: 56, value2: 94 },
    { title: 'Wednesday', value1: 12, value2: 67 },
    { title: 'Thursday', value1: 43, value2: 91 },
    { title: 'Friday', value1: 22, value2: 73 },
    { title: 'Saturday', value1: 53, value2: 82 },
    { title: 'Sunday', value1: 9, value2: 69 },
  ]

  const progressGroupExample2 = [
    { title: 'Male', icon: cilUser, value: 53 },
    { title: 'Female', icon: cilUserFemale, value: 43 },
  ]

  const progressGroupExample3 = [
    { title: 'Organic Search', icon: cibGoogle, percent: 56, value: '191,235' },
    { title: 'Facebook', icon: cibFacebook, percent: 15, value: '51,223' },
    { title: 'Twitter', icon: cibTwitter, percent: 11, value: '37,564' },
    { title: 'LinkedIn', icon: cibLinkedin, percent: 8, value: '27,319' },
  ]

  const tableExample = [
    {
      avatar: { src: avatar1, status: 'success' },
      user: {
        name: 'Yiorgos Avraamu',
        new: true,
        registered: 'Jan 1, 2023',
      },
      country: { name: 'USA', flag: cifUs },
      usage: {
        value: 50,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'success',
      },
      payment: { name: 'Mastercard', icon: cibCcMastercard },
      activity: '10 sec ago',
    },
    {
      avatar: { src: avatar2, status: 'danger' },
      user: {
        name: 'Avram Tarasios',
        new: false,
        registered: 'Jan 1, 2023',
      },
      country: { name: 'Brazil', flag: cifBr },
      usage: {
        value: 22,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'info',
      },
      payment: { name: 'Visa', icon: cibCcVisa },
      activity: '5 minutes ago',
    },
    {
      avatar: { src: avatar3, status: 'warning' },
      user: { name: 'Quintin Ed', new: true, registered: 'Jan 1, 2023' },
      country: { name: 'India', flag: cifIn },
      usage: {
        value: 74,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'warning',
      },
      payment: { name: 'Stripe', icon: cibCcStripe },
      activity: '1 hour ago',
    },
    {
      avatar: { src: avatar4, status: 'secondary' },
      user: { name: 'Enéas Kwadwo', new: true, registered: 'Jan 1, 2023' },
      country: { name: 'France', flag: cifFr },
      usage: {
        value: 98,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'danger',
      },
      payment: { name: 'PayPal', icon: cibCcPaypal },
      activity: 'Last month',
    },
    {
      avatar: { src: avatar5, status: 'success' },
      user: {
        name: 'Agapetus Tadeáš',
        new: true,
        registered: 'Jan 1, 2023',
      },
      country: { name: 'Spain', flag: cifEs },
      usage: {
        value: 22,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'primary',
      },
      payment: { name: 'Google Wallet', icon: cibCcApplePay },
      activity: 'Last week',
    },
    {
      avatar: { src: avatar6, status: 'danger' },
      user: {
        name: 'Friderik Dávid',
        new: true,
        registered: 'Jan 1, 2023',
      },
      country: { name: 'Poland', flag: cifPl },
      usage: {
        value: 43,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'success',
      },
      payment: { name: 'Amex', icon: cibCcAmex },
      activity: 'Last week',
    },
  ]
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState([]);

  const [months, setMonths] = useState([]);

  const [order_deposit, setOrderDeposit] = useState(null);
  const [order_design, setOrderDesign] = useState(null);
  const [order_production, setOrderProduction] = useState(null);
  const [order_payment, setOrderPayment] = useState(null);
  const [order_delivery, setOrderDelivery] = useState(null);

  const [order_template, setOrderTemplate] = useState(null);
  const [order_customize, setOrderCustomize] = useState(null);

  useEffect(() => {

    const setAttribute = async () => {
      const dashboard = await get_dashboard();
      const data = dashboard.data;
      setData(data);
      setMonths(data.months);
      // setUser(data.user);
      // setProfit(data.profit);
      // setOrder(data.order);
      setOrderDeposit(data.order_deposit);
      setOrderDesign(data.order_design);
      setOrderProduction(data.order_production);
      setOrderPayment(data.order_payment);
      setOrderDelivery(data.order_delivery);
      setOrderTemplate(data.order_template);
      setOrderCustomize(data.order_customize);
      setLoading(false);
    }
    setAttribute()
  }, [])
  return (
    <>
      {loading ?
        <CButton className="w-100" color="secondary" disabled>
          <CSpinner as="span" size="sm" aria-hidden="true" />
          Loading...
        </CButton>

        :

        <>
          <WidgetsDropdown data={data} className="mb-4" />
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
            className="mb-2 text-center"
          >

            <CCol
              className={'d-none d-xl-block'}
              
            >
              <div className="text-body-secondary">Pending Deposit</div>
              <div className="fw-semibold text-truncate">
                {order_deposit.deposit_count} ({order_deposit.deposit_percentage}%)
              </div>
              <CProgress thin className="mt-2" color="secondary" value={order_deposit.deposit_percentage} />
            </CCol>
            <CCol
              className={'d-none d-xl-block'}
              
            >
              <div className="text-body-secondary">Designing</div>
              <div className="fw-semibold text-truncate">
                {order_design.design_count} ({order_design.design_percentage}%)
              </div>
              <CProgress thin className="mt-2" color="info" value={order_design.design_percentage} />
            </CCol>
            <CCol
              className={'d-none d-xl-block'}
              
            >
              <div className="text-body-secondary">Manufacturing</div>
              <div className="fw-semibold text-truncate">
                {order_production.production_count} ({order_production.production_percentage}%)
              </div>
              <CProgress thin className="mt-2" color="warning" value={order_production.production_percentage} />
            </CCol>
            <CCol
              className={'d-none d-xl-block'}
              
            >
              <div className="text-body-secondary">Pending Payment</div>
              <div className="fw-semibold text-truncate">
                {order_payment.payment_count} ({order_payment.payment_percentage}%)
              </div>
              <CProgress thin className="mt-2" color="success" value={order_payment.payment_percentage} />
            </CCol>
            <CCol
              className={'d-none d-xl-block'}
              
            >
              <div className="text-body-secondary">Delivering</div>
              <div className="fw-semibold text-truncate">
                {order_delivery.delivery_count} ({order_delivery.delivery_percentage}%)
              </div>
              <CProgress thin className="mt-2" color="primary" value={order_delivery.delivery_percentage} />
            </CCol>
            

          </CRow>
          <CCard className="mb-4">
            <CCardBody>
              <CRow>
                <CCol sm={5}>
                  <h4 id="traffic" className="card-title mb-0">
                    Services
                  </h4>
                  <div className="small text-body-secondary">{months[0]} - {months[months.length-1]} {new Date().getFullYear()}</div>
                </CCol>
                <CCol sm={7} className="d-none d-md-block">
                  {/* <CButton color="primary" className="float-end">
                    <CIcon icon={cilCloudDownload} />
                  </CButton> */}
                  <CButtonGroup className="float-end me-3">
                    {['Year'].map((value) => (
                      <CButton
                        color="outline-secondary"
                        key={value}
                        className="mx-0"
                        active={value === 'Year'}
                      >
                        {value}
                      </CButton>
                    ))}
                  </CButtonGroup>
                </CCol>
              </CRow>
              <MainChart templateOrders={order_template} customizeOrders={order_customize} />
            </CCardBody>
            
          </CCard>
         
        </>
      }

    </>
  )
}

export default Dashboard
