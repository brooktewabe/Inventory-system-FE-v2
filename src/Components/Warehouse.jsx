import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import axios from "../axiosInterceptor"
import withAuth from "../withAuth"
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa"
import { PiKeyReturnBold, PiKeyReturnLight } from "react-icons/pi"

const Inventory = () => {
  const navigate = useNavigate()

  const role = localStorage.getItem("role");
  const [stocks, setStocks] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filteredStocks, setFilteredStocks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedStockId, setSelectedStockId] = useState(null)
  const [selectedStockName, setSelectedStockName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [moveQuantity, setMoveQuantity] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 15

  const fetchStocks = async (page) => {
    try {
      const response = await axios.get(`http://apiv2.cnhtc4.com/stock/all/warehouse?page=${page}&limit=${itemsPerPage}`)
      setStocks(response.data.data)
      setFilteredStocks(response.data.data)
      const totalCount = response.data.total
      setTotalPages(Math.ceil(totalCount / itemsPerPage))
    } catch (error) {
      console.error("Error fetching :", error)
    }
  }

  useEffect(() => {
    if (!searchTerm) {
      fetchStocks(currentPage)
    }
  }, [currentPage])

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 400) // 400ms debounce time

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const fetchFilteredStocks = async () => {
      try {
        const response = await axios.get(`http://apiv2.cnhtc4.com/stock/search?query=${debouncedSearchTerm}&location=warehouse`)
        setFilteredStocks(response.data)
      } catch (error) {
        console.error("Error fetching filtered stocks:", error)
      }
    }

    if (debouncedSearchTerm || filterStatus) {
      fetchFilteredStocks()
    } else {
      fetchStocks(currentPage) // fallback
    }
  }, [debouncedSearchTerm, filterStatus, currentPage])

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
          const response = await axios.get(`http://apiv2.cnhtc4.com/stock/all/${id}`)
          const stockToDelete = response.data
          await axios.delete(`http://apiv2.cnhtc4.com/stock/all/${id}`)
          setStocks(stocks.filter((stock) => stock.id !== id))
          const notifData = new FormData()
          notifData.append("message", `${stockToDelete.Name} is deleted.`)
          notifData.append("priority", "High")

          // Post notification data
          await axios.post("http://apiv2.cnhtc4.com/notification/create", notifData, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          toast.success("Deleted Successfully")
          // Refresh the stock list after deletion
          fetchStocks(currentPage)
        } catch (error) {
          toast.error("Error deleting stock. Try again later.")
        }
      }
    })
  }
  const handleOpenDialog = (stockId, stockName) => {
    setSelectedStockId(stockId)
    setSelectedStockName(stockName)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedStockId(null)
    setSelectedStockName("")
    setMoveQuantity("")
  }

  const handleConfirmMove = async () => {
    if (!moveQuantity || isNaN(Number(moveQuantity)) || Number(moveQuantity) < 1) {
      Swal.fire({
        title: "Error!",
        text: "Quantity is required and must be at least 1.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.patch(
        `http://apiv2.cnhtc4.com/stock/move-stock?name=${selectedStockName}&quantity=${moveQuantity}`,
      )

      setIsDialogOpen(false)
      setIsLoading(false)

      // Create notification for the stock movement
      const notifData = new FormData()
      notifData.append("message", `${moveQuantity} units of ${selectedStockName} moved to store.`)
      notifData.append("priority", "Medium")

      await axios.post("http://apiv2.cnhtc4.com/notification/create", notifData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Refresh the stock list
      fetchStocks(currentPage)

      Swal.fire({
        title: "Success!",
        text: "Stock has been moved successfully.",
        icon: "success",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "OK",
      })
    } catch (error) {
      setIsLoading(false)
      console.error("Error moving stock:", error)

      let errorMessage = "Failed to move stock. Please try again."
      if (error.response) {
        // If the error has a response from the server
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.status === 404) {
          errorMessage = `Store item with similar name to '${selectedStockName}' not found.`
        }
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      })
    }

    setMoveQuantity("")
  }
  const onEditStock = (id) => {
    navigate(`/edit-product/${id}`)
  }
  const handleViewNavigation = (id) => {
    navigate(`/stock-details/${id}`)
  }
  const handleReturnNavigation = (id) => {
    navigate(`/return-product/${id}`)
  }
  // Pagination handler
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

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
          {isDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Move Stock to Store</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Moving stock: <span className="font-medium">{selectedStockName}</span>
                </p>
                <label className="block text-sm text-gray-700 mb-2">Quantity to move:</label>
                <input
                  type="number"
                  value={moveQuantity}
                  onChange={(e) => setMoveQuantity(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 mb-4"
                  min={1}
                />
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleCloseDialog}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmMove}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/*full-width grid */}
          <div className="bg-white rounded-md shadow-sm overflow-hidden ml-4 mr-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">No.</td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product Image</td>

                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">ID</td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product Name</td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">Price</td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">Cost</td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">Stock</td>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">Restock Level</td>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Move</th>
                    <td className="px-4 py-3 text-left text-xs font-medium text-gray-500">Action</td>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks
                    ?.map((stock, index) => (
                      <tr key={stock.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <img
                            className="size-10"
                            src={
                              stock.Product_image
                                ? `http://apiv2.cnhtc4.com/uploads/${stock.Product_image}`
                                : "/src/assets/Placeholder.png"
                            }
                            alt="Stock Image"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {stock.Product_id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{stock.Category}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{stock.Name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{stock.Price}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{stock.Cost}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{stock.Curent_stock}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{stock.Restock_level}</td>

                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                          <button
                            onClick={() => handleOpenDialog(stock.id, stock.Name)}
                            className="text-blue-500 hover:text-blue-700 mr-2"
                            title="Move to Store"
                          >
                            <PiKeyReturnLight size={18} />
                          </button>
                        </td>
                        <td className="border-b space-x-2">
                          <button
                            onClick={() => handleReturnNavigation(stock.id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Return Product"
                          >
                            <PiKeyReturnBold />
                          </button>
                          <button
                            onClick={() => onEditStock(stock.id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit"
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
  )
}

export { Inventory }
export default withAuth(Inventory)
