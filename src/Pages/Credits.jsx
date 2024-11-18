import { useState, useEffect } from "react";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";

const Credits = () => {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setfilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 500;

  const fetchSalesByPage = async (page) => {
    try {
      const response = await axios.get(`https://api.akbsproduction.com/sales/all-credit`);
      setSales(response.data.data);
      // const totalCount = response.data.total;
      // setTotalPages(Math.ceil(totalCount / itemsPerPage));
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  useEffect(() => {
    if (!searchTerm && !filterDate) {
      fetchSalesByPage(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchSalesByPage(currentPage);
  }, [searchTerm, filterDate]);

  const onEdit = async (id) => {
    try {
      await axios.patch(`https://api.akbsproduction.com/sales/${id}`, { Credit_due: null });
      // Update local state to reflect the change
      setSales((prevSales) =>
        prevSales.map((sale) =>
          sale.id === id ? { ...sale, Credit_due: null } : sale
        )
      );
    } catch (error) {
      console.error("Error updating sale:", error);
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold">Credits</h3>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md ml-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Credits</h3>
            </div>

            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  {["No.", "Client", "Credit", "Credit Due", "Actions"].map((header) => (
                    <td key={header} className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                      {header}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales
                  ?.filter(sale => sale.Credit_due !== null && sale.Credit_due !== "")
                  .map((sale, index) => (
                    <tr key={sale.id}>
                      <td className="py-2 px-4 border-b">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="py-2 px-4 border-b">{sale.Full_name}</td>
                      <td className="py-2 px-4 border-b">{sale.Credit}</td>
                      <td className="py-2 px-4 border-b">{sale.Credit_due}</td>
                      <td className="py-3 px-4 border-b space-x-2">
                        <button
                          onClick={() => onEdit(sale.id)}
                          className="text-blue-500 underline hover:text-blue-700"
                        >
                          Paid
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </section>
  );
};

export { Credits };
export default withAuth(Credits);