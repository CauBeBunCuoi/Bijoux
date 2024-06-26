import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { IoMdArrowDropleft } from "react-icons/io";
import OrderStepper from "../../components/Cart/Orders/orderStepper";
import { gold, silver } from "../../assets/images";
import OrderInformations from "../../components/Cart/Orders/orderInformations";
import ManufactureProgress from "../../components/Cart/Orders/manufactureProgress";
import DesignProcess from "../../components/Cart/Orders/designProcess";
import { get_order_detail, get_order_detail_customer } from "../../api/main/orders/Order_api";
import { instantAlertMaker } from "../../api/instance/axiosInstance";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}


export default function OrderDetails() {
    const navigate = useNavigate();
    const query = useQuery();

    const { id } = useParams();
    const [orderDetail, setOrderDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkContent, setCheckContent] = useState("order-informations");
    const [checkPayment, setCheckPayment] = useState(false);
    //call api để lấy order_detail từ id
    useEffect(() => {
        if (query.get("payment_status") == "success") {
            instantAlertMaker('success', 'Payment success', 'Your payment has been successfully processed. Thank you for your purchase!')
        } else if (query.get("payment_status") == "cancel") {
            instantAlertMaker('error', 'Payment failed', 'Your payment has failed. Please try again!')
        }
    }, [query])
    useEffect(() => {
        const setAttribute = async () => {
            const formData = new FormData();
            formData.append("order_id", id);
            const order_detail_data = await get_order_detail_customer(formData, 'Get order detail', true);
            const order_detail = order_detail_data.data.order_detail;
            setOrderDetail(order_detail);
            console.log('DETAIL', order_detail);
            if (order_detail.order_status.id == 4 || order_detail.order_status.id == 1) {
                setCheckPayment(true);
            }
            setLoading(false);

        }

        setAttribute()
    }, []);



    const handleBack = () => {
        navigate(-1); // Navigate back to the previous page
    };

    const handleChangeContent = (content) => {
        setCheckContent(content);
    }


    return (
        <div className="flex flex-col items-center">
            <div className="flex w-full">
                <div className="md:w-1/5 flex items-center underline">
                    <IoMdArrowDropleft size={20} />
                    <button onClick={handleBack}>Back to Order list</button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <h1 className="font-loraFont text-4xl font-light">Order Details</h1>
                </div>
                <div className="w-1/5">

                </div>
            </div>
            <div className="w-10/12 my-7">
                {!loading && <OrderStepper order={orderDetail} />}
            </div>
            {!loading &&
                <div className="w-10/12 grid grid-cols-3">
                    <div className="w-full flex items-center justify-center">
                        <button onClick={() => handleChangeContent("order-informations")} className="md:w-[190px] md:h-[40px] sm:w-[165px] sm:h-[40px] sm:text-sm md:text-base bg-[#151542] text-white font-semibold hover:bg-[#2323D5] hover:text-yellow-400">Order Informations</button>
                    </div>
                    {orderDetail.order_type.id == 2 &&
                        <div className="w-full flex items-center justify-center">
                            <button onClick={() => handleChangeContent("design-process")} className="md:w-[190px] md:h-[40px] sm:w-[165px] sm:h-[40px] sm:text-sm md:text-base bg-[#151542] text-white font-semibold hover:bg-[#2323D5] hover:text-yellow-400">Design Process</button>
                        </div>
                    }
                    <div className="w-full flex items-center justify-center">
                        <button onClick={() => handleChangeContent("manufacture-progress")} className="md:w-[190px] md:h-[40px] sm:w-[165px] sm:h-[40px] sm:text-sm md:text-base bg-[#151542] text-white font-semibold hover:bg-[#2323D5] hover:text-yellow-400">Manufacture Progress</button>
                    </div>
                </div>
            }
            <div className="w-10/12 h-0.5 my-5 bg-gray-500"></div>

            <div className="w-10/12">
                {!loading && checkContent === "order-informations" && (
                    <OrderInformations order={orderDetail} />
                )}
                {!loading && checkContent === "design-process" && (
                    orderDetail.order_status.id !== 1 && orderDetail.design_process !== null && orderDetail.design_process.design_process_status.id == 3 ? (
                        <DesignProcess order={orderDetail} />
                    ) : (
                        <div className="flex justify-center">
                            <p className="font-loraFont font-light text-xl text-[#151542]">Đơn hàng của bạn chưa tới bước Design, vui lòng đợi trong tương lai.</p>
                        </div>
                    )
                )}
                {!loading && checkContent === "manufacture-progress" && (
                    orderDetail.order_status.id !== 1 && orderDetail.order_status.id !== 2 ? (
                        <ManufactureProgress order={orderDetail} />
                    ) : (
                        <div className="flex justify-center">
                            <p className="font-loraFont font-light text-xl text-[#151542]">Đơn hàng của bạn chưa tới bước Manufacture, vui lòng đợi trong tương lai.</p>
                        </div>
                    )
                )}
            </div>

        </div>
    );
}