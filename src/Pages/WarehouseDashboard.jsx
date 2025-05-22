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
          <div className="bg-white  flex justify-between">
            <p className="text-lg sm:text-xl font-bold whitespace-nowrap">
              <span className="sm:hidden">Inventory</span>
              <span className="hidden sm:inline">Inventory Management System</span>
            </p>
            <div className="flex items-center bg-blue-500 text-white rounded-lg w-48 mr-2">
              <img
                src="src\assets\user.png"
                className="w-8 h-8 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs">{role}</p>
              </div>
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
