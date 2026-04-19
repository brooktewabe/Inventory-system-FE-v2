import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaSearch, FaPlus, FaExchangeAlt, FaLayerGroup } from "react-icons/fa";

const Sales = () => {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const itemsPerPage = 15;

  const fetchStocks = async (page) => {
    try {
      const response = await axios.get(
        `http://apiv2.cnhtc4.com/stock/all/store?page=${page}&limit=${itemsPerPage}`
      );
      setStocks(response.data.data);
      setFilteredStocks(response.data.data);
      const totalCount = response.data.total;
      setTotalPages(Math.ceil(totalCount / itemsPerPage));
    } catch (error) {
      console.error("Error fetching :", error);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      fetchStocks(currentPage);
    }
  }, [currentPage]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400); // 400ms debounce time

    return () => clearTimeout(timer); 
  }, [searchTerm]);
  
  useEffect(() => {
    const fetchFilteredStocks = async () => {
      try {
        const response = await axios.get(
          `http://apiv2.cnhtc4.com/stock/search?query=${debouncedSearchTerm}&location=store`
        );
        setFilteredStocks(response.data);
      } catch (error) {
        console.error("Error fetching filtered stocks:", error);
      }
    };

    if (debouncedSearchTerm ) {
      fetchFilteredStocks();
    } else {
      fetchStocks(currentPage); // fallback
    }
  }, [debouncedSearchTerm, currentPage]);


  const formatProductId = (id) => {
    if (id.length <= 10) return id; // Return the id if it's less than or equal to 10 characters
    return `${id.slice(0, 3)}...${id.slice(-5)}`; // Format as 'xxxxx...xxxxx'
  };

  const onEditStock = (id) => {
    navigate(`/record-sale`, { state: { id }});
  };

  const handleMultiSales = () => {
    navigate("/batch-sale");
  };

  const handleAddProduct = () => {
    navigate("/choose-method");
  };

  const handleViewStockMovement = () => {
    navigate("/stock-movement");
  };
  // Pagination handler
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          {/* First small full-width grid */}
        <div className="bg-white flex justify-between items-center mr-2 p-1">
          <p className="text-lg sm:text-xl font-bold whitespace-nowrap flex items-center ml-3 mt-[1px]">
              <span className="sm:hidden">Store</span>
              <span className="hidden sm:inline">Store Management System</span>
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
              onClick={handleMultiSales}
              className="flex items-center justify-start gap-3 p-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <div className="bg-blue-600 text-white p-2 rounded-full">
                <FaLayerGroup />
              </div>
              <span>Multi-Sales</span>
            </button>
            
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
        
        {/* Inventory Management Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 ml-4">Inventory Managment</h2>
          
          {/* Search Bar */}
          <div className="mb-4 relative w-5/7 sm:w-3/5 md:w-3/5 mx-4">
            <div className="absolute inset-y-0 left-0 flex items-center">
              <div className="bg-blue-600 rounded-l-md px-3 py-3 text-white flex items-center justify-center">
                <FaSearch size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <input
              type="text"
              placeholder="Search by Name, Product ID, Category, Model"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
          
          {/* Table */}
          <div className="bg-white rounded-md shadow-sm overflow-hidden ml-4  mr-2">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-500">
                      No
                    </th>
                    {/* <th className="px-4 py-3 text-xs text-left font-medium text-gray-500">
                      Product Image
                    </th> */}
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-500 ">
                      ID
                    </th>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-500">
                      Category
                    </th>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-500">
                      Product Name
                    </th>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-500">
                      Price
                    </th>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-500">
                      Cost
                    </th>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-500">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      Restock Level
                    </th>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStocks.map((stock, index) => (
                    <tr key={stock.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                    {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <img className="size-10" src={stock.Product_image ? `http://apiv2.cnhtc4.com/uploads/${stock.Product_image}` : '/src/assets/Placeholder.png'} alt="Stock Image" />
                    </td> */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {stock.Product_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {stock.Category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {stock.Name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {stock.Price}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {stock.Cost }
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {stock.Curent_stock}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {stock.Restock_level}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                        <button
                          onClick={() => onEditStock(stock.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Record Sale
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
              {!searchTerm && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          Previous
                        </button>

                        {[...Array(Math.min(5, totalPages))].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              currentPage === i + 1
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                            } text-sm font-medium`}
                          >
                            {i + 1}
                          </button>
                        ))}

                        {totalPages > 5 && (
                          <>
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                            <button
                              onClick={() => handlePageChange(totalPages)}
                              className={`relative inline-flex items-center px-4 py-2 border ${
                                currentPage === totalPages
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                              } text-sm font-medium`}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                    <div className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{" "}
                      <span className="font-medium">
                        {totalPages > 0 ? totalPages : 1}
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export { Sales };
export default withAuth(Sales);
