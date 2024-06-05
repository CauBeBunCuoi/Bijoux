import React, { createContext, useEffect, useState, useRef, useContext, useMemo } from "react";
import { AgGridReact } from 'ag-grid-react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import {
    CButton,
    CButtonGroup,
    CCard,
    CCardBody,
    CCardImage,
    CCardTitle,
    CCardText,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
    CRow,
    CCol,
    CCardHeader,
    CSpinner,
} from '@coreui/react'
import AppBar from '@mui/material/AppBar';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import Box from '@mui/material/Box';
import { get_product_list, update_product_list } from "../../api/ProductApi";
import Modal_Button from "../component_items/Modal/ModalButton"
import { UsersThree, Eye, UserCirclePlus } from "phosphor-react";
import onGridReady, { resetHeaderProperties } from "../component_items/Ag-grid/useStickyHeader";
import './style/style.css'
import StaffUpdate from "./Modal_body/StaffUpdate";
import { quote_status_creator } from "../component_items/Ag-grid/status_badge";
import AssignForm from "./Modal_body/QuoteAssign";
import { BsFillClipboardCheckFill } from "react-icons/bs";
import QuoteApprove from "./Modal_body/QuoteApprove";
import { get_account_list } from "../../api/accounts/Account_Api";





const state_creator = (table) => {
    const state = {
        columnDefs: [
            { headerName: "id", field: "id", flex: 0.4 },
            { headerName: "Product id", field: "product.id", flex: 0.6 },
            {
                headerName: "Image", flex: 0.5,
                cellRenderer: (params) => {
                    return (
                        <img className="rounded-3" width={'100%'} src={params.data.product.imageUrl} />)

                },
            },
            { headerName: "Customer", field: "account.fullname" },
            { headerName: "Phone", field: "account.phone" },
            { headerName: "Created", field: "created" },
            {
                headerName: "Status",
                valueGetter: 'data.quote_status.id',
                cellClass: 'd-flex align-items-center py-1',
                cellRenderer: (params) => {
                    const quote_status = params.data.quote_status;
                    return quote_status_creator(quote_status);
                },
            },
            {
                headerName: "Option",
                cellClass: 'd-flex justify-content-center py-0',
                cellRenderer: (params) => {
                    const Modal_props = {
                        assignForm: <QuoteApprove quote={params.data}  />,
                        title: 'Approve Quote [ID: #' + params.data.id+']',
                        button: <BsFillClipboardCheckFill size={25} color={params.data.quote_status.id != 3 ? "gray" :"green" } weight="duotone" />,
                        update_button_color: 'white'
                    }
                    return (

                        <CButtonGroup style={{ width: '100%', height: "100%" }} role="group" aria-label="Basic mixed styles example">
                            <Modal_Button
                                disabled={params.data.quote_status.id != 3}
                                title={Modal_props.title}
                                content={Modal_props.button}
                                color={Modal_props.color} >
                                {Modal_props.assignForm}
                            </Modal_Button>
                        </CButtonGroup>
                    )

                },
                flex: 0.8,
            }

        ],
        rowData: table

    }
    return state
}

const data =  [
        {
            id: 1,
            "product": {
                "id": 2,
                "imageUrl": "http://localhost:8000/image/Diamond/D_IF.jpg",
                "mounting_type": null,
                "model_id": 501,
                "mounting_size": null,
                "product_diamond": [

                ],
                "product_metal": [

                ]
            },
            "account": {
                id: 1,
                username: 'john_doe',
                password: 'hashed_password',
                imageUrl: "http://localhost:8000/image/Diamond/D_IF.jpg",
                dob: '1990-01-01',
                email: 'john.doe@example.com',
                fullname: 'John Doe',
                role_id: 2,
                phone: '123-456-7890',
                address: '123 Main St, Anytown, USA'
            },
            quote_status: {
                id: 1,
                name: 'received'
            },
            product_price: 100.0,
            production_price: 0,
            profit_rate: 0,
            saleStaff_id: null,
            designStaff_id: null,
            productionStaff_id: null,
            note: 'qfqfqfqfwefwfwfwfwfwffqfqfqf q qf qf qưe fwewref ưefwefwef   ư q qè ưef ',
            created: '2023-05-24'
        },
        {
            id: 1,
            "product": {
                "id": 2,
                "imageUrl": "http://localhost:8000/image/Diamond/D_IF.jpg",
                "mounting_type": null,
                "model_id": 501,
                "mounting_size": null,
                "product_diamond": [

                ],
                "product_metal": [

                ]
            },
            account: {
                id: 1,
                username: 'john_doe',
                password: 'hashed_password',
                imageUrl: "http://localhost:8000/image/Diamond/D_IF.jpg",
                dob: '1990-01-01',
                email: 'john.doe@example.com',
                fullname: 'John Doe',
                role_id: 2,
                phone: '123-456-7890',
                address: '123 Main St, Anytown, USA'
            },
            quote_status: {
                id: 3,
                name: 'priced'
            },
            product_price: 100.0,
            production_price: 0,
            profit_rate: 0,
            saleStaff_id: null,
            designStaff_id: null,
            productionStaff_id: null,
            note: 'qfqfqfqfwefwfwfwfwfwffqfqfqf q qf qf qưe fwewref ưefwefwef   ư q qè ưef ',
            created: '2023-05-24'
        },
        {
            id: 1,
            "product": {
                "id": 2,
                "imageUrl": "http://localhost:8000/image/Diamond/D_IF.jpg",
                "mounting_type": null,
                "model_id": 501,
                "mounting_size": null,
                "product_diamond": [

                ],
                "product_metal": [

                ]
            },
            account: {
                id: 1,
                username: 'john_doe',
                password: 'hashed_password',
                imageUrl: "http://localhost:8000/image/Diamond/D_IF.jpg",
                dob: '1990-01-01',
                email: 'john.doe@example.com',
                fullname: 'John Doe',
                role_id: 2,
                phone: '123-456-7890',
                address: '123 Main St, Anytown, USA'
            },
            quote_status: {
                id: 2,
                name: 'assigned'
            },
            product_price: 100.0,
            production_price: 0,
            profit_rate: 0,
            saleStaff_id: null,
            designStaff_id: null,
            productionStaff_id: null,
            note: '',
            created: '2023-05-24'
        },
        {
            id: 1,
            "product": {
                "id": 2,
                "imageUrl": "http://localhost:8000/image/Diamond/D_IF.jpg",
                "mounting_type": null,
                "model_id": 501,
                "mounting_size": null,
                "product_diamond": [

                ],
                "product_metal": [

                ]
            },
            account: {
                id: 1,
                username: 'john_doe',
                password: 'hashed_password',
                imageUrl: "http://localhost:8000/image/Diamond/D_IF.jpg",
                dob: '1990-01-01',
                email: 'john.doe@example.com',
                fullname: 'John Doe',
                role_id: 2,
                phone: '123-456-7890',
                address: '123 Main St, Anytown, USA'
            },
            quote_status: {
                id: 2,
                name: 'assigned'
            },
            product_price: 100.0,
            production_price: 0,
            profit_rate: 0,
            saleStaff_id: null,
            designStaff_id: null,
            productionStaff_id: null,
            note: '',
            created: '2023-05-24'
        }, {
            id: 1,
            "product": {
                "id": 2,
                "imageUrl": "http://localhost:8000/image/Diamond/D_IF.jpg",
                "mounting_type": null,
                "model_id": 501,
                "mounting_size": null,
                "product_diamond": [

                ],
                "product_metal": [

                ]
            },
            account: {
                id: 1,
                username: 'john_doe',
                password: 'hashed_password',
                imageUrl: "http://localhost:8000/image/Diamond/D_IF.jpg",
                dob: '1990-01-01',
                email: 'john.doe@example.com',
                fullname: 'John Doe',
                role_id: 2,
                phone: '123-456-7890',
                address: '123 Main St, Anytown, USA'
            },
            quote_status: {
                id: 2,
                name: 'assigned'
            },
            product_price: 100.0,
            production_price: 0,
            profit_rate: 0,
            saleStaff_id: null,
            designStaff_id: null,
            productionStaff_id: null,
            note: '',
            created: '2023-05-24'
        },
        {
            id: 1,
            "product": {
                "id": 2,
                "imageUrl": "http://localhost:8000/image/Diamond/D_IF.jpg",
                "mounting_type": null,
                "model_id": 501,
                "mounting_size": null,
                "product_diamond": [

                ],
                "product_metal": [

                ]
            },
            account: {
                id: 1,
                username: 'john_doe',
                password: 'hashed_password',
                imageUrl: "http://localhost:8000/image/Diamond/D_IF.jpg",
                dob: '1990-01-01',
                email: 'john.doe@example.com',
                fullname: 'John Doe',
                role_id: 2,
                phone: '123-456-7890',
                address: '123 Main St, Anytown, USA'
            },
            quote_status: {
                id: 2,
                name: 'assigned'
            },
            product_price: 100.0,
            production_price: 0,
            profit_rate: 0,
            saleStaff_id: null,
            designStaff_id: null,
            productionStaff_id: null,
            note: '',
            created: '2023-05-24'
        },
        {
            id: 1,
            "product": {
                "id": 2,
                "imageUrl": "http://localhost:8000/image/Diamond/D_IF.jpg",
                "mounting_type": null,
                "model_id": 501,
                "mounting_size": null,
                "product_diamond": [

                ],
                "product_metal": [

                ]
            },
            account: {
                id: 1,
                username: 'john_doe',
                password: 'hashed_password',
                imageUrl: "http://localhost:8000/image/Diamond/D_IF.jpg",
                dob: '1990-01-01',
                email: 'john.doe@example.com',
                fullname: 'John Doe',
                role_id: 2,
                phone: '123-456-7890',
                address: '123 Main St, Anytown, USA'
            },
            quote_status: {
                id: 2,
                name: 'assigned'
            },
            product_price: 100.0,
            production_price: 0,
            profit_rate: 0,
            saleStaff_id: null,
            designStaff_id: null,
            productionStaff_id: null,
            note: '',
            created: '2023-05-24'
        },
        {
            id: 1,
            "product": {
                "id": 2,
                "imageUrl": "http://localhost:8000/image/Diamond/D_IF.jpg",
                "mounting_type": null,
                "model_id": 501,
                "mounting_size": null,
                "product_diamond": [

                ],
                "product_metal": [

                ]
            },
            account: {
                id: 1,
                username: 'john_doe',
                password: 'hashed_password',
                imageUrl: "http://localhost:8000/image/Diamond/D_IF.jpg",
                dob: '1990-01-01',
                email: 'john.doe@example.com',
                fullname: 'John Doe',
                role_id: 2,
                phone: '123-456-7890',
                address: '123 Main St, Anytown, USA'
            },
            quote_status: {
                id: 2,
                name: 'assigned'
            },
            product_price: 100.0,
            production_price: 0,
            profit_rate: 0,
            saleStaff_id: null,
            designStaff_id: null,
            productionStaff_id: null,
            note: '',
            created: '2023-05-24'
        },
        {
            id: 1,
            "product": {
                "id": 2,
                "imageUrl": "http://localhost:8000/image/Diamond/D_IF.jpg",
                "mounting_type": null,
                "model_id": 501,
                "mounting_size": null,
                "product_diamond": [

                ],
                "product_metal": [

                ]
            },
            account: {
                id: 1,
                username: 'john_doe',
                password: 'hashed_password',
                imageUrl: "http://localhost:8000/image/Diamond/D_IF.jpg",
                dob: '1990-01-01',
                email: 'john.doe@example.com',
                fullname: 'John Doe',
                role_id: 2,
                phone: '123-456-7890',
                address: '123 Main St, Anytown, USA'
            },
            quote_status: {
                id: 2,
                name: 'assigned'
            },
            product_price: 100.0,
            production_price: 0,
            profit_rate: 0,
            saleStaff_id: null,
            designStaff_id: null,
            productionStaff_id: null,
            note: '',
            created: '2023-05-24'
        }
    ]


const Quote_Price = () => {
    const [key, setKey] = useState('customize');
    const [quoteList, setQuoteList] = useState(null);
    let [state, setState] = useState(null);

    const handleTableChange = async () => {
        await get_account_list();
        const quoteList = data;
        setQuoteList(quoteList);

        setState({
            //template: state_creator(quoteList.template_quote_list),
            customize: state_creator(quoteList)
        })
    }

    useEffect(() => {

        handleTableChange()
    }, [])




    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            filter: true,
            autoHeight: true,
            wrapText: true,
            cellClass: 'd-flex align-items-center',
        };
    }, [])
    return (

        <CRow>
            <CCol xs={12}>
                {state === null ? <CButton className="w-100" color="secondary" disabled>
                    <CSpinner as="span" size="sm" aria-hidden="true" />
                    Loading...
                </CButton> :

                    <Tabs
                        defaultActiveKey="template"
                        id="fill-tab-example"
                        className="mb-3"
                        activeKey={key}
                        fill
                        onSelect={(key) => {
                            setKey(key)
                            resetHeaderProperties();
                        }}

                    >
                        {key === 'customize' &&
                            <Tab eventKey="customize" title="Quote Approvement">
                                <div
                                    id="customize"
                                    style={{
                                        boxSizing: "border-box",
                                        height: "100%",
                                        width: "100%"
                                    }}
                                    className="ag-theme-quartz"
                                >
                                    <AgGridReact
                                        enableColResize={true}
                                        columnDefs={state.customize.columnDefs}
                                        rowData={state.customize.rowData}
                                        defaultColDef={defaultColDef}
                                        rowHeight={35}
                                        headerHeight={30}
                                        pagination={true}
                                        paginationPageSize={10}
                                        domLayout='autoHeight'
                                        onGridReady={onGridReady('customize')}
                                    />
                                </div>

                            </Tab>}


                    </Tabs>
                }

            </CCol>
        </CRow>
    );

}
export default Quote_Price;
