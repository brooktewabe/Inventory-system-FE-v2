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
          <h3 className="text-lg font-semibold ml-4">Notification Management System</h3>
          <div className="bg-white p-6 rounded-lg shadow-md ml-6 min-w-fit">
            <div className="flex justify-between items-center mb-6">
              <div className="flex justify-between items-center space-x-4 w-full">
                <div className="mb-4 relative w-2/5 ml-6">
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <div className="bg-blue-600 rounded-l-md p-3 text-white">
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
              </div>
              <select
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-1/4 mb-4 p-2 border border-gray-300 rounded"
              >
                <option value="">All</option>
                <option value="low">Low stock</option>
                <option value="deleted">Deleted Stock</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <table className="min-w-full bg-white">
                <tbody>
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <tr key={notification.id}>
                        <td className="py-2 px-4 border-b">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="py-2 px-4 border-b">{notification.message}</td>
                        <td className="py-2 px-4 border-b">
                          {new Date(notification.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-4 px-4 text-center text-gray-500">
                        No notifications found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
                          onClick={() => handlePageChange(page)}
                          disabled={isLoading}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === page
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                          } text-sm font-medium`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>

                <div className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>
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
