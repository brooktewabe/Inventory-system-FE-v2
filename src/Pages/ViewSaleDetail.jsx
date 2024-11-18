import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaClock, FaPrint } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";

const ViewSaleDetail = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [stocks, setStocks] = useState([]); // Store multiple stock items
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate("/");
  };
  const handleDownloadPDF = () => {
    const element = document.getElementById("sale-detail-section");
    html2pdf()
      .from(element)
      .save("Sale_Detail.pdf");
  };

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await axios.get(`https://api.akbsproduction.com/sales/${id}`);
        setSale(response.data);
      } catch (error) {
        console.error("Error fetching sale details:", error);
      }
    };
    fetchSale();
  }, [id]);

  useEffect(() => {
    const fetchStocks = async () => {
      if (sale && sale.Product_id) {
        try {
          const productIds = sale.Product_id.split(",").map((id) => id.trim());
          const stockPromises = productIds.map((productId) =>
            axios.get(`https://api.akbsproduction.com/stock/all/${productId}`)
          );
          const stockResponses = await Promise.all(stockPromises);
          const stockData = stockResponses.map((res) => res.data);
          setStocks(stockData);
        } catch (error) {
          console.error("Error fetching stock details:", error);
        }
      }
    };
    fetchStocks();
  }, [sale]);

  if (!sale) return <p>Loading sale details...</p>;

  return (
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold">Sales History - Details</h3>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md ml-40 max-w-2xl">
            <div className="ml-16 mb-6 relative"  id="sale-detail-section">
              <div className="flex flex-col items-center">
                <FaClock size={25} />
                <h3 className="text-2xl font-bold mb-4">
                  Sales History Record
                </h3>
                <button
                  onClick={handleDownloadPDF}
                  className="absolute top-0 right-0"
                >
                  <FaPrint size={25} />
                </button>
              </div>

              <hr className="mb-4" />
              <br />
              <h3 className="font-bold mb-4">Buyer Information</h3>
              <div className="flex items-center">
                <strong className="w-60 text-[#8f8d8d]">Full Name:</strong>
                <span>{sale.Full_name}</span>
              </div>
              <div className="flex items-center">
                <strong className="w-60 text-[#8f8d8d]">Phone Number:</strong>
                <span>{sale.Contact}</span>
              </div>
              <br />
              <hr className="mb-4" />
              <h3 className="font-bold mb-4">Order Information</h3>

              {stocks.length > 0 ? (
                stocks.map((stock, index) => (
                  <div key={index} className="mb-4  bg-gray-50 ">
                    <div className="flex items-center">
                      <strong className="w-60 text-[#8f8d8d]">
                        Product Name
                      </strong>
                      <span>{stock.Name}</span>
                    </div>
                    <div className="flex items-center">
                      <strong className="w-60 text-[#8f8d8d]">
                        Price
                      </strong>
                      <span>{stock.Price}</span>
                    </div>
                    <div className="flex items-center">
                      <strong className="w-60 text-[#8f8d8d]">
                        Quantity:
                      </strong>
                      <span>{sale.EachQuantity.split(",")[index]}</span>
                    </div>
                    <div className="flex items-center">
                      <strong className="w-60 text-[#8f8d8d]">
                        Total:
                      </strong>
                      <span>{Number(sale.EachQuantity.split(",")[index]) * stock.Price}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>Loading product details...</p>
              )}

              <div className="flex items-center">
                <strong className="w-60 text-[#8f8d8d]">Total Paid</strong>
                <span>{sale.Amount}</span>
              </div>
              <div className="flex items-center">
              <strong className="w-60 text-[#8f8d8d]">Date</strong>
              <span>
                {new Date(sale.Date).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true, // for AM/PM format
                })}
              </span>
            </div>
              <div className="flex items-center">
                <strong className="w-60 text-[#8f8d8d]">Quantity</strong>
                <span>{sale.Quantity}</span>
              </div>
              <div className="flex items-center">
                <strong className="w-60 text-[#8f8d8d]">Payment Method</strong>
                <span>{sale.Payment_method}</span>
              </div>
              <div className="flex items-center">
                <strong className="w-60 text-[#8f8d8d]">Total Credit</strong>
                <span>{sale.Credit}</span>
              </div>
              <div className="flex items-center">
                <strong className="w-60 text-[#8f8d8d]">Credit Due</strong>
                <span>{sale.Credit_due}</span>
              </div>
              <div className="flex items-center">
                <strong className="w-60 text-[#8f8d8d]">Total</strong>
                <span>{sale.Total_amount}</span>
              </div>
              <div className="flex items-center">
                <strong className="w-60 text-[#8f8d8d]">Receipt</strong>
                {sale.Receipt && (
                  <img
                    src={`https://api.akbsproduction.com/uploads/${sale.Receipt}`}
                    alt="Receipt"
                    className="w-36 h-40"
                  />
                )}
              </div>
            </div>
            <button
              onClick={handleReturn}
              className="bg-[#16033a] ml-40 text-white px-16 py-2 rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ViewSaleDetail };
export default withAuth(ViewSaleDetail);
