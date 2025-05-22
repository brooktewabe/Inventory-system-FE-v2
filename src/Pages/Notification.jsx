import { useState, useEffect } from "react"
import axios from "../axiosInterceptor"
import withAuth from "../withAuth"
import { FaSearch } from "react-icons/fa"

const Notification = () => {
  const [notifications, setNotifications] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterKeyword, setFilterKeyword] = useState("")
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(15)
  const [isLoading, setIsLoading] = useState(false)
  const role = localStorage.getItem("role")
  const name = localStorage.getItem("name")

  const fetchNotifications = async (page = 1) => {
    setIsLoading(true)
    try {
      let url = `http://localhost:5000/notification/all?page=${page}&limit=${itemsPerPage}`

      if (searchTerm) {
        url += `&search=${searchTerm}`
      }

      if (filterKeyword) {
        url += `&filter=${filterKeyword}`
      }

      const response = await axios.get(url)

      setNotifications(response.data.data)

      const totalCount = response.data.totalCount || response.data.total || 0
      const calculatedTotalPages = Math.ceil(totalCount / itemsPerPage)
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications(currentPage)
  }, [currentPage])

  // When search or filter changes, reset to page 1 and fetch
  useEffect(() => {
    setCurrentPage(1)
    fetchNotifications(1)
  }, [searchTerm, filterKeyword])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const generatePageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages]
    }

    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
  }

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white flex justify-between">
            <p className="text-xl font-bold">Notification</p>
            <div className="flex items-center bg-blue-500 text-white rounded-lg w-48 mr-2">
              <img src="src\assets\user.png" className="w-8 h-8 rounded-full object-cover mr-4" />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs">{role}</p>
              </div>
            </div>
          </div>
            {/* <p className="text-lg sm:text-xl font-bold whitespace-nowrap">
              <span className="sm:hidden">Notification</span>
              <span className="hidden sm:inline">Notification Management System</span>
            </p> */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mx-2 sm:ml-6 w-full sm:min-w-fit">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full mr-2">
              {/* Search Input */}
              <div className="relative w-full sm:w-2/3">
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <div className="bg-blue-600 rounded-l-md p-3.5 text-white">
                    <FaSearch size={16} />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Filter Dropdown */}
              <select
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="low">Low stock</option>
                <option value="deleted">Deleted Stock</option>
                <option value="moved">Moved Stock</option>
              </select>
            </div>

            {/* Table Content */}
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <tbody>
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <tr key={notification.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 border-b whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="py-3 px-4 border-b">{notification.message}</td>
                          <td className="py-3 px-4 border-b whitespace-nowrap">
                            {new Date(notification.createdAt).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-6 px-4 text-center text-gray-500">
                          No notifications found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-4 px-2 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {generatePageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-3 py-1.5 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={isLoading}
                        className={`px-3 py-1.5 border text-sm font-medium ${
                          currentPage === page
                            ? "bg-blue-50 border-blue-500 text-blue-600"
                            : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
              <div className="text-sm text-gray-700 whitespace-nowrap">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Notification }
export default withAuth(Notification)
