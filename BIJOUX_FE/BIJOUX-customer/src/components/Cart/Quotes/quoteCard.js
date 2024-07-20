import React, { useEffect, useState } from "react";
import numeral from 'numeral';
import { Collapse } from '@mui/material';
import { Envelope, Phone } from 'phosphor-react';
import Button from '@mui/material/Button';
const CurrencyFormatter = ({ value }) => {
    const formattedValue = numeral(value).format('0,0') + ' VND';
    return <span>{formattedValue}</span>;
};

export default function QuoteCard({ quote, onCancel }) {
    const newProductionPrice = (quote.profit_rate / 100) * quote.product_price + quote.production_price;
    const [checkOpen, setCheckOpen] = useState(false);
    const [saleStaff, setSaleStaff] = useState(quote.sale_staff);
    const [designStaff, setDesignStaff] = useState(quote.design_staff);
    const [productionStaff, setProductionStaff] = useState(quote.production_staff);


    const handleOpenClose = () => {
        setCheckOpen(!checkOpen);
    }
    const templateImage = "https://i.pinimg.com/564x/d0/65/b0/d065b0f511204401fe8af162372091a6.jpg";



    return (
        <div className="w-full flex flex-col items-center">
            <div className="flex w-10/12 h-[200px] items-center bg-white  p-4 border-b border-black">
                <div className="md:border-2 md:w-[150px] md:h-[150px] my-5 sm:w-0 flex items-center justify-center overflow-hidden">
                    {quote.product.imageUrl ? (
                        <img src={quote.product.imageUrl} alt="product" className="h-[150px] w-[150px] object-cover object-center" />
                    ) : (
                        <img src={templateImage} alt="product" className="h-[150px] w-[150px] object-cover object-center" />
                    )}
                </div>

                <div className="flex flex-col h-full ml-5 w-1/3">
                    <div className="flex">
                        <p className="font-semibold font-cartFont md:text-2xl sm:text-lg">Quote ID: </p>
                        <p className="ml-1 font-semibold font-cartFont md:text-2xl sm:text-lg">#{quote.id}</p>
                    </div>
                    <div className="flex mt-1">
                        <p className="font-cartFont">Created Date: {quote.created}</p>
                    </div>
                    <div className="flex flex-col mt-1">
                        {/* Sử dụng lớp `hidden` để ẩn và `md:block` để hiển thị khi màn hình từ md trở lên */}
                        <p className="font-cartFont hidden md:block">Note:</p>
                        {/* <div className="w-10/12 h-[75px] bg-slate-200 overflow-y-auto hidden md:block">
                            <p className="font-gantariFont ml-2 mt-2 mr-2 mb-1">{quote.note}</p>
                        </div> */}
                        <textarea readOnly className="w-10/12 h-[75px] resize-none bg-slate-200 overflow-y-auto font-gantariFont p-2 border-2 border-gray-200 rounded-md">
                            {quote.note}
                        </textarea>
                    </div>
                </div>

                <div className="mx-1 h-full w-0.5 bg-black"> </div>

                <div className="flex-1 flex flex-col h-full ml-5">
                    {quote.total_price && quote.quote_status.id == 4 ? (
                        <p className="font-cartFont text-xl font-semibold"><CurrencyFormatter value={quote.total_price} /></p>
                    ) : (
                        <p className="font-cartFont text-xl font-semibold">Unpriced yet</p>
                    )}

                    <div className="flex">
                        <p className="font-cartFont text-md mr-2">Quote Status: </p>
                        <p className={
                            quote.quote_status.id === 1 ? "text-sky-700 font-cartFont font-semibold" :
                                quote.quote_status.id === 2 ? "text-sky-700 font-cartFont font-semibold" :
                                    quote.quote_status.id === 3 ? "text-sky-700 font-cartFont font-semibold" :
                                        quote.quote_status.id === 4 ? "text-green-700 font-cartFont font-semibold" :
                                            quote.quote_status.id === 5 ? "text-red-700 font-cartFont font-semibold" :
                                                ""
                        }>{quote.quote_status.id === 1 || quote.quote_status.id === 2 || quote.quote_status.id === 3 ? "Pending" : quote.quote_status.id === 4 ? "Accepted" : "Declined"}
                        </p>
                    </div>

                    <div className="flex">
                        <p className="font-cartFont text-md mr-2">Materials Price: </p>
                        {quote.product_price && quote.quote_status.id == 4 ? (
                            <p className="font-cartFont"><CurrencyFormatter value={quote.product_price} /></p>
                        ) : (
                            <p>Not yet</p>
                        )}
                    </div>

                    <div className="flex">
                        <p className="font-cartFont text-md mr-2">Production Price: </p>
                        {quote.production_price && quote.quote_status.id == 4 ? (
                            <p className="font-cartFont"><CurrencyFormatter value={newProductionPrice} /></p>
                        ) : (
                            <p>Not yet</p>
                        )}
                    </div>


                    <div className="w-full h-[65px] flex items-center justify-around">
                        <Button onClick={handleOpenClose} variant="contained">
                            SEE SUPPORTERS
                        </Button>
                        {quote.quote_status.id === 4 || quote.quote_status.id === 5 ? (
                            <Button disabled variant="contained" color="error">
                                CANCEL
                            </Button>
                        ) : (
                            <Button onClick={onCancel} variant="contained" color="error">
                                CANCEL
                            </Button>
                        )}

                    </div>
                    {quote.quote_status.id === 4 ? (
                        <div>
                            <p className="italic text-green-600">(Your quote has been complete, please move to Order List to see more informations)</p>
                        </div>
                    ) : (
                        ""
                    )}
                </div>

            </div>

            <Collapse className="w-full flex flex-col justify-center items-center" in={checkOpen} timeout="auto" unmountOnExit>

                <div className="w-full flex flex-col items-center">
                    <div className="w-10/12 grid bg-gray-200 grid-cols-3 mt-2">

                        <div className="w-full flex flex-col items-center">
                            <div className="w-full flex justify-center">
                                <p className="font-cartFont text-xl font-semibold ">Sale Staff</p>
                            </div>
                            {saleStaff ? (
                                <div className="w-3/4 flex flex-col">
                                    <div className="flex justify-center mb-2">
                                        <img src={saleStaff.imageUrl} alt="saleStaff" className="w-[25px] h-[25px] rounded-full mr-2" />
                                        <p className="font-cartFont font-semibold">{saleStaff.fullname}</p>
                                    </div>
                                    <div className="flex mb-2">
                                        <Phone size={20} className="mr-2" />
                                        <p className="font-cartFont">{saleStaff.phone}</p>
                                    </div>
                                    <div className="flex mb-2">
                                        <Envelope size={20} className="mr-2" />
                                        <p className="font-cartFont">{saleStaff.email}</p>
                                    </div>
                                </div>
                            )
                                : (
                                    <div className="w-full flex justify-center">
                                        <p className="font-bold text-sky-800">NOT YET...</p>
                                    </div>
                                )}
                        </div>


                        <div className="w-full flex flex-col items-center">
                            <div className="w-full flex justify-center">
                                <p className="font-cartFont text-xl font-semibold ">Design Staff</p>
                            </div>
                            {designStaff ? (
                                <div className="w-3/4 flex flex-col">
                                    <div className="flex justify-center mb-2">
                                        <img src={designStaff.imageUrl} alt="saleStaff" className="w-[25px] h-[25px] rounded-full mr-2" />
                                        <p className="font-cartFont font-semibold">{designStaff.fullname}</p>
                                    </div>
                                    <div className="flex mb-2">
                                        <Phone size={20} className="mr-2" />
                                        <p className="font-cartFont">{designStaff.phone}</p>
                                    </div>
                                    <div className="flex mb-2">
                                        <Envelope size={20} className="mr-2" />
                                        <p className="font-cartFont">{designStaff.email}</p>
                                    </div>
                                </div>
                            )
                                : (
                                    <div className="w-full flex justify-center">
                                        <p className="font-bold text-sky-800">NOT YET...</p>
                                    </div>
                                )}
                        </div>

                        <div className="w-full flex flex-col items-center">
                            <div className="w-full flex justify-center">
                                <p className="font-cartFont text-xl font-semibold ">Production Staff</p>
                            </div>
                            {productionStaff ? (
                                <div className="w-3/4 flex flex-col">
                                    <div className="flex justify-center mb-2">
                                        <img src={productionStaff.imageUrl} alt="saleStaff" className="w-[25px] h-[25px] rounded-full mr-2" />
                                        <p className="font-cartFont font-semibold">{productionStaff.fullname}</p>
                                    </div>
                                    <div className="flex mb-2">
                                        <Phone size={20} className="mr-2" />
                                        <p className="font-cartFont">{productionStaff.phone}</p>
                                    </div>
                                    <div className="flex mb-2">
                                        <Envelope size={20} className="mr-2" />
                                        <p className="font-cartFont">{productionStaff.email}</p>
                                    </div>
                                </div>
                            )
                                : (
                                    <div className="w-full flex justify-center">
                                        <p className="font-bold text-sky-800">NOT YET...</p>
                                    </div>
                                )}
                        </div>
                    </div>

                </div>


            </Collapse >

        </div>

    );
}