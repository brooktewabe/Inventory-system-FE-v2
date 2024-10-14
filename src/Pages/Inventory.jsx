import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaEdit, FaTrash, FaSearch, FaFilter, FaPlus } from "react-icons/fa";
import { AiOutlineHourglass } from "react-icons/ai";

const Inventory = () => {
  const navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(
          "https://api.akbsproduction.com/stock/all"
        );
        setStocks(response.data.data);
        setFilteredStocks(response.data.data);
      } catch (error) {
        console.error("Error fetching :", error);
      }
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    let updatedStocks = stocks;

    if (searchTerm) {
      updatedStocks = updatedStocks.filter((stock) =>
        stock.Name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      updatedStocks = updatedStocks.filter(
        (stock) => stock.Category === filterStatus
      );
    }

    setFilteredStocks(updatedStocks);
  }, [searchTerm, filterStatus, stocks]);
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
            `https://api.akbsproduction.com/stock/${id}`
          );
          const stockToDelete = response.data;
          await axios.delete(`https://api.akbsproduction.com/stock/all/${id}`);
          setStocks(stocks.filter((stock) => stock.id !== id));
          const notifData = new FormData();
          notifData.append("message", `${stockToDelete.Name} is deleted.`);
          notifData.append("priority", "High");

          // Post notification data
          await axios.post(
            "https://api.akbsproduction.com/notification/create",
            notifData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          toast.success("Deleted Successfully");
        } catch (error) {
          toast.error("Error deleting stock. Try again later.");
        }
      }
    });
  };

  const onEditStock = (id) => {
    navigate(`/edit-product/${id}`);
  };
  const handleAddNavigation = () => {
    navigate("/add-product");
  };
  const handleMovementNavigation = () => {
    navigate("/stock-movement");
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* First small full-width grid */}
          <div className="bg-white p-4  ">
            <h3 className="text-xl font-bold">Stock System</h3>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <div>
              <div
                className="bg-[#eceaeaec] p-6 max-w-sm rounded-lg ml-20 shadow-md cursor-pointer"
                onClick={handleAddNavigation}
              >
                <div className="items-center mb-4 flex flex-col">
                  <FaPlus size={40} />
                  <p>Create Product</p>
                </div>
              </div>
            </div>
            <div>
              <div
                className="bg-[#eceaeaec] p-6 max-w-sm rounded-lg ml-20 shadow-md cursor-pointer"
                onClick={handleMovementNavigation}
              >
                <div className="items-center mb-4 flex flex-col">
                  <AiOutlineHourglass size={40} />
                  <p>Stock Movement</p>
                </div>
              </div>
            </div>
          </div>

          {/*full-width grid */}
          <div className="bg-white p-6 rounded-lg shadow-md ml-6 ">
            <div className="flex justify-between items-center mb-6">
              <h3 className=" text-lg font-bold">Stock List</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSearchVisible(!searchVisible)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaSearch size={20} />
                </button>
                {/* <button
                  onClick={() => setFilterVisible(!filterVisible)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaFilter size={20} />
                </button> */}
              </div>
            </div>
            {searchVisible && (
              <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mb-4 p-2 border border-gray-300 rounded"
              />
            )}
            {/* {filterVisible && (
              <div className="mb-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select status</option>
                  <option value="Active">Free</option>
                  <option value="unavailable">Rented</option>
                </select>
              </div>
            )} */}
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    No.
                  </td>

                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Product ID
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Category
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Name
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Price
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Current Stock Level
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Reorder Level
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Location
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Action
                  </td>
                </tr>
              </thead>
              <tbody>
                {filteredStocks?.map((stock, index) => (
                  <tr key={stock.id}>
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b">
                      {formatProductId(stock.id)}
                    </td>
                    <td className="py-2 px-4 border-b">{stock.Category}</td>
                    <td className="py-2 px-4 border-b">{stock.Name}</td>
                    <td className="py-2 px-4 border-b">{stock.Price}</td>
                    <td className="py-2 px-4 border-b">{stock.Curent_stock}</td>
                    <td className="py-2 px-4 border-b">
                      {stock.Reorder_level}
                    </td>

                    <td className="py-2 px-4 border-b">{stock.Location}</td>

                    <td className="py-3 px-4 border-b space-x-2">
                      <button
                        onClick={() => onEditStock(stock.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(stock.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
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

export { Inventory };
export default withAuth(Inventory);
