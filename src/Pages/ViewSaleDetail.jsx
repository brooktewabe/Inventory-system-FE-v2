import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaClock, FaPrint } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import icon from '../assets/user.png'

const ViewSaleDetail = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [stocks, setStocks] = useState([]); // Store multiple stock items
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
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
        const response = await axios.get(`http://localhost:5000/sales/${id}`);
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
            axios.get(`http://localhost:5000/stock/all/${productId}`)
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
    <section className="bg-[#edf0f0b9] h-full">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white  flex justify-between">
            <p className="text-xl font-bold">Sales History - Details</p>
            <div className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-lg w-32 mr-2">
              <p className="font-semibold">{name}</p>
              <p className="text-xs">{role}</p>
            </div>
          </div>
          <div className="flex justify-center px-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
            <div className="relative mb-6" id="sale-detail-section">
              <div className="flex flex-col items-center">
                <FaClock size={25} />
                <h3 className="text-2xl font-bold mb-4">Sales History Record</h3>
                <button
                  onClick={handleDownloadPDF}
                  className="absolute top-0 right-0"
                  title="Download PDF"
                >
                  <FaPrint size={25} />
                </button>
              </div>

              <hr className="mb-4" />

              {/* Buyer Info */}
              <h3 className="font-bold mb-4">Buyer Information</h3>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <strong className="sm:w-60 text-[#8f8d8d]">Full Name:</strong>
                  <span>{sale.Full_name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <strong className="sm:w-60 text-[#8f8d8d]">Phone Number:</strong>
                  <span>{sale.Contact}</span>
                </div>
              </div>

              <hr className="my-6" />

              {/* Order Info */}
              <h3 className="font-bold mb-4">Order Information</h3>
              {stocks.length > 0 ? (
                stocks.map((stock, index) => (
                  <div key={index} className="mb-4 bg-gray-50 p-3 rounded-md">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <strong className="sm:w-60 text-[#8f8d8d]">Product Name:</strong>
                      <span>{stock.Name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <strong className="sm:w-60 text-[#8f8d8d]">Price:</strong>
                      <span>{stock.Price}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <strong className="sm:w-60 text-[#8f8d8d]">Quantity:</strong>
                      <span>{sale.EachQuantity.split(",")[index]}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <strong className="sm:w-60 text-[#8f8d8d]">Total:</strong>
                      <span>
                        {Number(sale.EachQuantity.split(",")[index]) * stock.Price}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p>Loading product details...</p>
              )}

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <strong className="sm:w-60 text-[#8f8d8d]">Total Paid:</strong>
                  <span>{sale.Amount}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <strong className="sm:w-60 text-[#8f8d8d]">Date:</strong>
                  <span>
                    {new Date(sale.Date).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <strong className="sm:w-60 text-[#8f8d8d]">Quantity:</strong>
                  <span>{sale.Quantity}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <strong className="sm:w-60 text-[#8f8d8d]">Payment Method:</strong>
                  <span>{sale.Payment_method}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <strong className="sm:w-60 text-[#8f8d8d]">Total:</strong>
                  <span>{sale.Total_amount}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <strong className="sm:w-60 text-[#8f8d8d]">Receipt:</strong>
                  {sale.Receipt && (
                    <a
                      href={`http://localhost:5000/uploads/${sale.Receipt}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Click to open in new tab"
                    >
                      <img
                        src={`http://localhost:5000/uploads/${sale.Receipt}`}
                        alt="Receipt"
                        className="w-36 h-40 cursor-pointer hover:opacity-90 border border-gray-300 rounded"
                      />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Done Button */}
            <div className="flex justify-center sm:justify-center mt-6">
              <button
                onClick={handleReturn}
                className="bg-blue-600 text-white px-10 py-2 rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export { ViewSaleDetail };
export default withAuth(ViewSaleDetail);
