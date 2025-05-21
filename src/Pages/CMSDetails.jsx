/* eslint-disable no-unused-vars */
import { useParams } from "react-router-dom";
import axios from "../axiosInterceptor";
import { useEffect, useState } from "react";
import withAuth from "../withAuth";
import { FaInfoCircle } from "react-icons/fa";
import icon from "../assets/user.png";

const CmsDetails = () => {
  const { id } = useParams(); // phone number
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const [purchaseHistoryData, setPurchaseHistoryData] = useState({ data: [], total: 0 });
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/sales/search/find?nameOrPhone=${id}&page=${currentPage}&limit=${entriesPerPage}`);
        setPurchaseHistoryData(res.data);
        setTotal(res.data.total);
      } catch (err) {
        console.error("Error fetching customer:", err);
      }
    };

  useEffect(() => {
    fetchCustomer();
  }, [currentPage, entriesPerPage]);
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

  const totalPages = Math.ceil(total / entriesPerPage);

  const customerName = purchaseHistoryData.data[0]?.Full_name || "N/A";
  const customerPhone = purchaseHistoryData.data[0]?.Contact || "N/A";

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white flex justify-between">
            <p className="text-lg sm:text-xl font-bold whitespace-nowrap">
              <span className="sm:hidden">Customer</span>
              <span className="hidden sm:inline">Customer Management System</span>
            </p>
            <div className="flex items-center bg-blue-500 text-white rounded-lg w-48 mr-2">
              <img src={icon} className="w-8 h-8 rounded-full object-cover mr-4" />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs">{role}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-md w-[95%] mx-auto">
            {/* Header */}
            <div className="flex items-center p-4 border-b">
              <div className="text-blue-600 mr-2">
                <FaInfoCircle />
              </div>
              <h2 className="text-lg font-medium">{customerName}</h2>
            </div>

            {/* User Info */}
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="text-md font-medium">{customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="text-md font-medium">{customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Purchase History */}
            <div className="p-6 border-t">
              <h3 className="text-lg font-bold mb-4">Purchase History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Quantity</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Transaction ID</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistoryData.data.map((item, index) => (
                      <tr key={item.id} className="border-b">
                         <td className="py-4 px-4 whitespace-nowrap">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                        <td className="py-2 px-3 text-center">{item.Sale_type}</td>
                        <td className="py-2 px-3 text-center">{item.Quantity}</td>
                        <td className="py-2 px-3 text-center">{item.Total_amount}</td>
                        <td className="py-2 px-3 text-center">{item.Transaction_id}</td>
                        <td className="py-2 px-3 text-center">{new Date(item.Date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {purchaseHistoryData.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-gray-500">
                          No purchase history found.
                        </td>
                      </tr>
                    )}
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
        </div>
      </div>
    </section>
  );
};

export { CmsDetails };
export default withAuth(CmsDetails);
