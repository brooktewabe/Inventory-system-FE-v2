import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaPlus, FaExchangeAlt } from "react-icons/fa";
import Warehouse from "../Components/Warehouse";

const Sales = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);


  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/stock/all/warehouse`
        );
        setStocks(response.data.data);
        setFilteredStocks(response.data.data);
      } catch (error) {
        console.error("Error fetching :", error);
      }
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    let updatedStocks = stocks;

    if (searchTerm) {
      updatedStocks = updatedStocks.filter(
        (stock) =>
          stock.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.id.toString().includes(searchTerm) ||
          (stock.Category &&
            stock.Category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus) {
      updatedStocks = updatedStocks.filter(
        (stock) => stock.Category === filterStatus
      );
    }

    setFilteredStocks(updatedStocks);
  }, [searchTerm, filterStatus, stocks]);


  const handleAddProduct = () => {
    navigate("/select-method");
  };

  const handleViewStockMovement = () => {
    navigate("/sales-history");
  };
  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          {/* First small full-width grid */}
        <div className="bg-white flex justify-between items-center mr-2">
            <p className="text-lg sm:text-xl font-bold whitespace-nowrap">
              <span className="sm:hidden">Inventory</span>
              <span className="hidden sm:inline">Inventory Management System</span>
            </p>

          <div className="flex items-center bg-blue-600 text-white rounded-lg px-3 py-1 space-x-2 cursor-pointer">
            {/* Circle with initial */}
            <div className="bg-white text-blue-600 font-semibold w-6 h-6 flex items-center justify-center rounded-full text-sm">
              {name?.charAt(0)?.toUpperCase() || "?"}
            </div>

            {/* Name and role */}
            <div className="flex flex-col text-left leading-tight">
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-blue-100">{role}</p>
            </div>

            {/* Dropdown arrow */}
            <svg
              className="w-4 h-4 text-blue-100 ml-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold mb-4">Action</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mr-2">
              <button
                onClick={handleAddProduct}
                className="flex items-center justify-start gap-3 p-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="bg-blue-600 text-white p-2 rounded-full">
                  <FaPlus />
                </div>
                <span>Add Product</span>
              </button>

              <button
                onClick={handleViewStockMovement}
                className="flex items-center justify-start gap-3 p-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="bg-blue-600 text-white p-2 rounded-full">
                  <FaExchangeAlt />
                </div>
                <span>View Stock Movement</span>
              </button>
            </div>
          </div>
          <Warehouse/>
        </div>
      </div>
    </section>
  );
};

export { Sales };
export default withAuth(Sales);
