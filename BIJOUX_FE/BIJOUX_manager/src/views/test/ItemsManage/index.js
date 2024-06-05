import React, { createContext, useEffect, useState, useRef, useContext, useMemo } from "react";
import { faker } from "@faker-js/faker";
import { Link } from "react-router-dom";
import { AgGridReact } from 'ag-grid-react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
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

  CToaster
} from '@coreui/react'
import { AdapterDateFnsBase } from "@mui/x-date-pickers/AdapterDateFnsBase";
import { get_product_list, update_product_list } from "../../../api/ProductApi";
import axios from 'axios';
import StoneShapeTable from "./StoneShape/table";
//import 'bootstrap/dist/css/bootstrap.css';



export const ItemsManageContext = createContext();

const ItemsManage = () => {

  const [toast, setToast] = useState(0)




  return (
    <ItemsManageContext.Provider value={{setToast: setToast}}>
      <CToaster push={toast} placement="top-end" />

      <StoneShapeTable />
    </ItemsManageContext.Provider>
  );

}
export default ItemsManage;
