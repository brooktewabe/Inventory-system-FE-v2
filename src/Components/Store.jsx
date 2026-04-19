import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { BiPurchaseTagAlt } from "react-icons/bi";


const Inventory = () => {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
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
  const onDelete = async (id) => {
    Swal.fire({
      text: "Are you sure you want to delete this product?",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      customClass: {
        cancelButton: "border border-gray-700 px-6 py-2 w-32 rounded-3xl ",
        confirmButton: "bg-red-500 text-white px-6 py-2 w-32 rounded-3xl",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.get(
            `http://apiv2.cnhtc4.com/stock/all/${id}`
          );
          const stockToDelete = response.data;
          await axios.delete(`http://apiv2.cnhtc4.com/stock/all/${id}`);
          setStocks(stocks.filter((stock) => stock.id !== id));
          const notifData = new FormData();
          notifData.append("message", `${stockToDelete.Name} is deleted.`);
          notifData.append("priority", "High");

          // Post notification data
          await axios.post(
            "http://apiv2.cnhtc4.com/notification/create",
            notifData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          toast.success("Deleted Successfully");
          fetchStocks(currentPage)
        } catch (error) {
          toast.error("Error deleting stock. Try again later.");
        }
      }
    });
  };

  const onEditStock = (id) => {
    navigate(`/edit-product/${id}`);
  };
  const handleViewNavigation = (id) => {
    navigate(`/stock-details/${id}`);
  };
  const onPurchase = (id) => {
    navigate("/add-purchase-requisition", {
      state: {
        stockId: id,
        type: "store",
      },
    });
  };
  // Pagination handler
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-xl ml-4 font-semibold">Warehouse Inventory</h3>
          </div>
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

          {/*full-width grid */}
          <div className="bg-white rounded-md shadow-sm overflow-hidden ml-4 mr-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      No.
                    </td>
                    {/* <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Product Image
                    </td> */}

                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      ID
                    </td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Category
                    </td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Product Name
                    </td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Price
                    </td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Cost
                    </td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Stock
                    </td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Restock Level
                    </td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Action
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks
                    ?.map((stock, index) => (
                      <tr key={stock.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>

                        {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <img
                            className="size-10"
                            src={
                              stock.Product_image
                                ? `http://apiv2.cnhtc4.com/uploads/${stock.Product_image}`
                                : "/src/assets/Placeholder.png"
                            }
                            alt="Stock Image"
                          />
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
                          {stock.Cost}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {stock.Curent_stock}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {stock.Restock_level}
                        </td>

                        <td className="border-b space-x-2">
                          <button
                            onClick={() => onPurchase(stock.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <BiPurchaseTagAlt />
                          </button>
                          <button
                            onClick={() => onEditStock(stock.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <FaEdit />
                          </button>
                        {role == 'admin' &&  <button
                            onClick={() => onDelete(stock.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                          }
                          <button
                            onClick={() => handleViewNavigation(stock.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
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

export { Inventory };
export default withAuth(Inventory);
