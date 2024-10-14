import { useState, useEffect } from "react";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import Revenue from "../Components/Revenue";
import Total from "../Components/Total"
const Dashboard = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`https://api.akbsproduction.com/stock/all`);
        setStocks(response.data.data); 
        console.log(stocks)
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchStocks();
  }, []);
  const formatProductId = (id) => {
    if (id.length <= 10) return id; // Return the id if it's less than or equal to 10 characters
    return `${id.slice(0, 3)}...${id.slice(-5)}`; // Format as 'xxxxx...xxxxx'
  };
  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold">Dashboard</h3>
          </div>

          {/* Two equally sized grids */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6">

            <div className="px-6">
              <Revenue />
            </div>
            <div className="px-1">
              <Total />
            </div>
          </div>

          {/*  full-width grid */}
          <div className="bg-white p-6 rounded-lg shadow-md ml-6 ">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Stock List</h3>
            </div>

            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">No.</td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">Product ID</td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">Category</td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">Name</td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">Price</td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">Current Stock Level</td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">Reorder Level</td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">Location</td>
                </tr>
              </thead>
              <tbody>
                {stocks?.map((stock, index) => (
                  <tr key={stock.id}>
                    {/* Use index + 1 for numbering */}
                    
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b"> {formatProductId(stock.id)}</td>
                    <td className="py-2 px-4 border-b"> {stock.Category}</td>
                    <td className="py-2 px-4 border-b"> {stock.Name}</td>
                    <td className="py-2 px-4 border-b"> {stock.Price}</td>
                    <td className="py-2 px-4 border-b"> {stock.Curent_stock}</td>
                    <td className="py-2 px-4 border-b">{stock.Reorder_level}</td>
                    <td className="py-2 px-4 border-b">{stock.Location}</td>
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

export { Dashboard };
export default withAuth(Dashboard);