import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaSearch, FaCalendar } from "react-icons/fa";

const SalesHistory = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setfilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;

  const fetchSalesByPage = async (page) => {
    try {
      const response = await axios.get(`https://api.akbsproduction.com/sales/all-sales?page=${page}&limit=${itemsPerPage}`);
      setSales(response.data.data);
      // Ensure the API returns totalCount for calculating total pages
      const totalCount = response.data.total;
      setTotalPages(Math.ceil(totalCount / itemsPerPage));
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  // Search by name
  const fetchSalesByName = async (name) => {
    try {
      const response = await axios.get(
        `https://api.akbsproduction.com/sales/name/${name}`
      );
      setSales(response.data);
      setTotalPages(1); // Assuming no pagination for filtered data
    } catch (error) {
      console.error("Error searching sales by name:", error);
    }
  };

  // Filter by date
  const fetchSalesByDate = async (date) => {
    try {
      const response = await axios.get(
        `https://api.akbsproduction.com/sales/date/${date}`
      );
      setSales(response.data);
      setTotalPages(1); // Assuming no pagination for filtered data
    } catch (error) {
      console.error("Error filtering sales by date:", error);
    }
  };

  // Fetch sales on initial load or when page changes
  useEffect(() => {
    if (!searchTerm && !filterDate) {
      fetchSalesByPage(currentPage);
    }
  }, [currentPage]);

  // Trigger search or filter when searchTerm or filterDate changes
  useEffect(() => {
    if (searchTerm) {
      fetchSalesByName(searchTerm);
    } else if (filterDate) {
      fetchSalesByDate(filterDate);
    } else {
      fetchSalesByPage(currentPage);
    }
  }, [searchTerm, filterDate]);

  const formatProduct = (id) => {
    if (!id) return ''; // Handle null or undefined values
    if (id.length <= 10) return id;
    return `${id.slice(0, 5)}...${id.slice(-5)}`;
  };

  const onEdit = (id) => {
    navigate(`/sales-detail/${id}`);
  };

  // Pagination handler
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* <div className="bg-white p-4">
            <h3 className="text-xl font-bold">Sales History</h3>
          </div> */}

          <div className="bg-white p-6 rounded-lg shadow-md ml-6 mr-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Sales Report</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSearchVisible(!searchVisible)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaSearch size={20} />
                </button>
                <button
                  onClick={() => setFilterVisible(!filterVisible)}
                  className="text-gray-600 hover:text-gray-900 "
                >
                  <FaCalendar size={20} />
                </button>
              </div>
            </div>

            {searchVisible && (
              <input
                type="text"
                placeholder="Search by Client Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mb-4 p-2 border border-gray-300 rounded"
              />
            )}

            {filterVisible && (
              <div className="mb-4">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setfilterDate(e.target.value)}
                  className="w-1/3 p-2 border border-gray-300 rounded"
                />
              </div>
            )}

            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  {[
                    "No.",
                    "Product",
                    "Client",
                    "Quantity",
                    "Total amount",
                    "Payment",
                    "Type",
                    "Credit",
                    "Contact",
                    "Action",
                  ]?.map((header) => (
                    <td
                      key={header}
                      className="py-2 text-[#9aa3a7] text-sm px-4 border-b"
                    >
                      {header}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales
                .map((sale, index) => (
                  <tr key={sale.id}>
                    <td className="py-2 px-4 border-b">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-2 px-4 border-b relative group">
                      {formatProduct(sale.Item_name)}
                      <span className="absolute hidden group-hover:flex bg-gray-700 text-white text-sm rounded  z-10 left-1/2 transform -translate-x-1/2 mt-1">
                        {sale.Item_name}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{sale.Full_name}</td>
                    <td className="py-2 px-4 border-b">{sale.Quantity}</td>
                    <td className="py-2 px-4 border-b">{sale.Total_amount}</td>
                    <td className="py-2 px-4 border-b">
                      {sale.Payment_method}
                    </td>
                    <td className="py-2 px-4 border-b">{sale.Sale_type}</td>
                    <td className="py-2 px-4 border-b">{sale.Credit}</td>
                    <td className="py-2 px-4 border-b">{sale.Contact}</td>
                    <td className="py-3 px-4 border-b space-x-2">
                      <button
                        onClick={() => onEdit(sale.id)}
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination controls */}
            {!searchTerm && !filterDate && (
              <div className="mt-4 flex justify-center items-center space-x-2">
                <button
                  className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                </span>
                <button
                  className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { SalesHistory };
export default withAuth(SalesHistory);
