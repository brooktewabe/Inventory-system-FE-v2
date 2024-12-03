import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaSearch } from "react-icons/fa";
import { AiOutlineHourglass } from "react-icons/ai";
import { GrMultiple } from "react-icons/gr";
const Sales = () => {
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
        const response = await axios.get(`https://api.akbsproduction.com/stock/all`);
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
  const onEditStock = (id) => {
    navigate(`/record-sale/${id}`);
  };
  // const onEditStock = (id) => {
  //   navigate('/record-sale', { state: { id } }); // Pass the product id via state/props
  // };
  const handleAddNavigation = () => {
    navigate("/sales-history");
  };
  const handleBatchNavigation = () => {
    navigate("/batch-sale");
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          {/* First small full-width grid */}
          <div className="bg-white p-4  ">
            <h3 className="text-xl font-bold">Sales System</h3>
          </div>

          {/* Two equally sized grids */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6">
            <div>
              <div
                className="bg-[#eceaeaec] p-6 w-52 rounded-lg ml-32 shadow-md cursor-pointer"
                onClick={handleBatchNavigation}
              >
                <div className="items-center mb-4 flex flex-col">
                  <GrMultiple size={40} />
                  <p>Multiple Item sale</p>
                </div>
              </div>
            </div>
            <div>
              <div
                className="bg-[#eceaeaec] p-6 w-52 rounded-lg ml-20 shadow-md cursor-pointer"
                onClick={handleAddNavigation}
              >
                <div className="items-center mb-4 flex flex-col">
                  <AiOutlineHourglass size={40} />
                  <p>View History</p>
                </div>
              </div>
            </div>
          </div>

          {/* full-width grid */}
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
              </div>
            </div>
            {searchVisible && (
              <input
                type="text"
                placeholder="Search Product"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mb-4 p-2 border border-gray-300 rounded"
              />
            )}

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
                    Type
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
                {filteredStocks
                ?.filter((stock) => stock.Type === "Finished Products"||stock.Type === "Finished Product")
                .map((stock, index) => (
                  <tr key={stock.id}>
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b">
                      {formatProductId(stock.id)}
                    </td>
                    <td className="py-2 px-4 border-b">{stock.Category}</td>
                    <td className="py-2 px-4 border-b"> {stock.Type}</td>

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
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                          Record Sale
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

export { Sales };
export default withAuth(Sales);
