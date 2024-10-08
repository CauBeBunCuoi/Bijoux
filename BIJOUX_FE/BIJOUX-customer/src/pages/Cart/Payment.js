import React, { useEffect, useState, useMemo } from "react";
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import numeral from "numeral";
import { get_payment_history } from "../../api/main/accounts/Account_api";
import { Box, CircularProgress } from "@mui/material";

const CurrencyFormatter = ({ value }) => {
    const formattedValue = numeral(value).format('0,0') + ' VND';
    return <span>{formattedValue}</span>;
};

export default function PaymentHistory() {

    const state_creator = (table) => {
        const state = {
            columnDefs: [
                { headerName: "ID", field: "id", flex: 0.4 },
                { headerName: "Order ID", field: "order_id" },
                { headerName: "Payment Type", field: "payment_type.name" },
                {
                    headerName: "Price", flex: 0.5,
                    cellRenderer: (params) => {
                        return (
                            <CurrencyFormatter value={params.data.money} />)
                    },
                },
                { headerName: "Created", field: "created" },
            ],
            rowData: table
        }
        return state
    }
    const [state, setState] = useState(null);
    const [loading, setLoading] = useState(true);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            filter: true,
            autoHeight: true,
            wrapText: true,
            cellClass: 'd-flex align-items-center',
        };
    }, [])

    useEffect(() => {
        const setAttribute = async () => {
            const payment_history_data = await get_payment_history(null, 'get payment history', true);
            setState(state_creator(payment_history_data.data));
            setLoading(false);
        }

        setAttribute();
    }, []);

    return (
        <div className="flex flex-col w-full items-center mt-5">
            <p className="font-loraFont text-4xl font-semibold">Your Payment History</p>
            <div className="my-5 w-3/4 h-0.5 bg-[#151542]"></div>
            {loading ?
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', padding: '100px' }}>
                    <CircularProgress color="inherit" />
                </Box>
                :
                <div id="customize"
                    style={{
                        boxSizing: "border-box",
                        height: "75%",
                        width: "75%"
                    }}
                    className="ag-theme-quartz mb-5">


                    <AgGridReact
                        enableColResize={true}
                        columnDefs={state.columnDefs}
                        rowData={state.rowData}
                        defaultColDef={defaultColDef}
                        rowHeight={35}
                        headerHeight={30}
                        pagination={true}
                        paginationPageSize={10}
                        domLayout='autoHeight'
                    // onGridReady={onGridReady('customize')}
                    />

                </div>
            }
        </div>
    );
}