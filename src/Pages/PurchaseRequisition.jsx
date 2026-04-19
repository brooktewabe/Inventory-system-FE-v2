import { useState, useEffect } from "react";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import Spinner from "../Components/Spinner";

const PurchaseRequisitionList = () => {
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchHistory(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchHistory = async (page, query) => {
    setLoading(true);
    try {
      const endpoint = query 
        ? `http://apiv2.cnhtc4.com/purchase-requisition/all?page=${page}&limit=${itemsPerPage}&search=${query}`
        : `http://apiv2.cnhtc4.com/purchase-requisition/all?page=${page}&limit=${itemsPerPage}`;
        
      const response = await axios.get(endpoint);
      setHistory(response.data.data || []);
      setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching history:", error);
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container mx-auto">
          <div className="bg-white flex justify-between items-center mr-2 p-1">
            <p className="text-lg sm:text-xl font-bold whitespace-nowrap flex items-center ml-3 mt-[1px]">
              <span className="sm:hidden">History</span>
              <span className="hidden sm:inline">
                Purchase Requisition History
              </span>
            </p>
            {/* Header */}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

        <div className="mb-4"></div>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-xl ml-4 font-semibold">Purchase History</h3>
          </div>

          {/* Search Input */}
          <div className="ml-4 mr-4 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by supplier name, TIN, or stock name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full  md:w-3/5 pl-10 pr-10 py-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm overflow-hidden ml-4 mr-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Total Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Receipt No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Receipt</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Location</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                        <Spinner />
                      </td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-gray-400 font-medium italic text-center">
                        No requisition records found.
                      </td>
                    </tr>
                  ) : (
                    history.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.purchaseDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.stock?.Product_id || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {item.stock?.Name || "Unknown Product"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-semibold">{item.supplierName}</div>
                          <div className="text-xs text-gray-400">TIN: {item.supplierTinNumber}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold text-blue-600">
                          {parseInt(item.stockQuantity)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {Number(item.purchaseCost).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-mono mb-1">{item.receiptNumber}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.receiptImage && (
                            <div className="flex items-center gap-2">
                              <img 
                                src={`http://apiv2.cnhtc4.com/uploads/${item.receiptImage}`} 
                                alt="Receipt" 
                                className="w-12 h-12 object-cover rounded border"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.location === 'Store' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.location}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination */}
              {totalPages > 0 && (
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
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
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
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === i + 1
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white text-gray-500 hover:bg-gray-50 border-gray-300"
                            }`}
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
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === totalPages
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white text-gray-500 hover:bg-gray-50 border-gray-300"
                              }`}
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
                      <span className="font-medium">{totalPages > 0 ? totalPages : 1}</span>
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

export default withAuth(PurchaseRequisitionList);
