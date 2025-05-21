import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaEdit, FaTrash, FaArrowUp, FaCalendar, FaArrowLeft } from 'react-icons/fa';
import { BsCashStack } from "react-icons/bs";

const StockMovement = () => {
  const navigate = useNavigate();
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false)
  const [filterStartDate, setfilterStartDate] = useState("")
  const [filterEndDate, setfilterEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
 
    const fetchMovements = async (startDate,endDate,page) => {
      try {
        const response = await axios.get(`http://localhost:5000/movement/all?startDate=${startDate || ""}&endDate=${endDate || ""}&page=${page}&limit=${itemsPerPage}`);
        setMovements(response.data.data);
        setFilteredMovements(response.data.data);
        const totalCount = response.data.total;
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
      } catch (error) {
        console.error("Error fetching Movements:", error);
      }
    };

  useEffect(() => {
      fetchMovements(filterStartDate,filterEndDate,currentPage);  
  }, [filterStartDate,filterEndDate, currentPage ]);

  // Pagination handler
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get icon based on movement type
  const getIcon = (type) => {
    switch (type) {
      case "Addition":
        return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><FaArrowUp className="text-green-500" /></div>;
      case "Reduction":
      case "Sale":
        return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><BsCashStack className="text-green-500" /></div>;
      case "Transfer":
        return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><FaArrowLeft className="text-blue-500" /></div>;
      case "Deleted":
        return <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><FaTrash className="text-red-500" /></div>;
      case "Modification":
        return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><FaEdit className="text-blue-500" /></div>;
      case "Return":
        return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><FaArrowLeft className="text-red-500" /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><FaEdit className="text-gray-500" /></div>;
    }
  }

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

          {/* full-width grid */}
      <div className="bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Stock Movement</h2>
        <button
          onClick={() => setFilterVisible(!filterVisible)}
          className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
        >
          <FaCalendar size={18} />
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b gap-4">
        <div className="flex justify-between items-center w-full md:w-auto">
          <h3 className="font-medium">Stock Movement</h3>
        </div>

        {filterVisible && (
          <div className="w-full md:w-1/2 lg:w-1/3">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaCalendar className="text-gray-400" size={16} />
                </div>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setfilterStartDate(e.target.value)}
                  className="w-full pl-10 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Start date"
                />
              </div>
              
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaCalendar className="text-gray-400" size={16} />
                </div>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setfilterEndDate(e.target.value)}
                  className="w-full pl-10 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
        )}
        
      </div>     
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Adjustment</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.map((movement, index) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    {getIcon(movement.Type)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">{movement.Type}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{movement.Name}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{movement.Adjustment}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{movement.Date}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{movement.User}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/movement-detail/${movement.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
            {/* Pagination */}
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
      </div>
    </div>
        </div>
      </div>
    </section>
  );
};

export { StockMovement };
export default withAuth(StockMovement);
