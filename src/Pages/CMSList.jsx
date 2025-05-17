import { useState, useEffect } from "react";
import withAuth from "../withAuth";
import axios from "../axiosInterceptor";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CmsList = () => {

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/sales/customers/list`, {
          params: {
            page: currentPage,
            limit: entriesPerPage,
            search: searchTerm
          }
        }
      );
      setData(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching customer list:", error);
    }
  };

  const handleViewNavigation = (phone) => {
    navigate(`/customer-details/${phone}`);
  };
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, entriesPerPage,searchTerm]);

  const filteredData = data.filter((item) =>
    `${item.sale_Full_name} ${item.sale_Contact}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(total / entriesPerPage);
  const generatePageNumbers = () => {
    const delta = 1;
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === 2 && currentPage - delta > 3) ||
        (i === totalPages - 1 && currentPage + delta < totalPages - 2)
      ) {
        pages.push("...");
      }
    }

    return [...new Set(pages)];
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white flex justify-between">
            <p className="text-xl font-bold">Customer Management System</p>
            <div className="flex items-center bg-blue-500 text-white rounded-lg w-48 mr-2">
              <img
                src="src/assets/user.png"
                className="w-8 h-8 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs">{role}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4 ml-4">
            Customer Management List
          </h3>

          <div className="bg-white rounded-md shadow-md w-[95%] mx-auto">
            <div className="mb-4 relative mt-2 w-full sm:w-3/5 md:w-3/5 mx-4">
              <div className="absolute inset-y-0 left-0 flex items-center">
                <div className="bg-blue-600 rounded-l-md px-3 py-2 text-white flex items-center justify-center">
                  <FaSearch size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <input
                type="text"
                placeholder="Search by Name or Phone Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>

            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">No</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Organization</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Phone Number</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3 text-sm text-gray-900">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.sale_Full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.sale_Contact}</td>
                    <td className="text-blue-700">
                      <button
                        onClick={() => handleViewNavigation(item.sale_Contact)}
                        className="hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    {generatePageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === page
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                          } text-sm font-medium`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
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
          </div>
        </div>
      </div>
    </section>
  );
};

export { CmsList };
export default withAuth(CmsList);
