import { useState, useEffect } from "react";
import axios from "../axiosInterceptor";

const IncomeSection = () => {
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [activePeriod, setActivePeriod] = useState("monthly");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleToggle = (period) => {
    setActivePeriod(period);
    setCurrentPage(1); // reset to first page on period change
  };

  const fetchIncome = async (period, page, limit) => {
    try {
      let endpoint;
      switch (period) {
        case "daily":
          endpoint = "http://localhost:5000/sales/all/day";
          break;
        case "monthly":
          endpoint = "http://localhost:5000/sales/all/month";
          break;
        case "yearly":
          endpoint = "http://localhost:5000/sales/all/year";
          break;
        default:
          endpoint = "http://localhost:5000/sales/all/month";
      }

      const response = await axios.get(`${endpoint}?page=${page}&limit=${limit}`);
      const { data, total } = response.data;

      setTopSellingProducts(data || []);
      setTotalPages(Math.ceil((total || 0) / limit));
    } catch (error) {
      console.error("Error fetching top-selling products:", error);
    }
  };

  useEffect(() => {
    fetchIncome(activePeriod, currentPage, itemsPerPage);
  }, [activePeriod, currentPage]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <h5 className="font-semibold text-lg mb-2 sm:mb-0">
            Product Sales
          </h5>
          <div className="flex flex-wrap gap-2 sm:gap-1 bg-gray-100 p-1 rounded-full">
            {["yearly", "monthly", "daily"].map((period) => (
              <button
                key={period}
                onClick={() => handleToggle(period)}
                className={`py-1.5 px-3 rounded-full text-sm transition-colors whitespace-nowrap ${
                  activePeriod === period
                    ? "bg-blue-500 text-white"
                    : "text-gray-700"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {topSellingProducts.length > 0 ? (
          <div className="space-y-2">
            {topSellingProducts.map((product, index) => (
              <div
                key={product.productId}
                className="flex justify-between text-sm border-b pb-1"
              >
                <span className="text-gray-700 font-medium">
                  {(currentPage - 1) * itemsPerPage + index + 1}. {product.name}
                </span>
                <span className="text-gray-600 font-bold">
                  {product.totalSold.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No data available.</p>
        )}

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
    </>
  );
};

export default IncomeSection;
