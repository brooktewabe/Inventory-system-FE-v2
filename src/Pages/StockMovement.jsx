import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaEye, FaPlus, FaMinus, FaEdit} from "react-icons/fa";

const StockMovement = () => {
  const navigate = useNavigate();

  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await axios.get("https://api.akbsproduction.com/movement/all?page=1&limit=100");
        setMovements(response.data.data);
        setFilteredMovements(response.data.data);
      } catch (error) {
        console.error("Error fetching Movements:", error);
      }
    };

    fetchMovements();
  }, []);


  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          {/* First small full-width grid */}
          <div className="bg-white p-4  ">
            <h3 className="text-xl font-bold">Stock Movement</h3>
          </div>

          {/* full-width grid */}
          <div className="bg-white p-6 rounded-lg shadow-md ml-6 ">

          <div className="items-center mb-6">
          <h3 className=" text-lg font-bold">Stock Movement</h3>
          <p className=" text-sm">Showing recent 100 data</p>
          </div>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                    <td></td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    ID
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Type
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Name
                  </td>

                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                  Stock Adjustment
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Date
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    User
                  </td>
                  <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                    Action
                  </td>
                </tr>
              </thead>
              <tbody>
                {filteredMovements?.map((movement,index) => (
                  <tr key={movement.id}>
                   <td className="py-2 px-4 border-b">
                    {movement.Type === "Addition" && <FaPlus className="text-green-500" />}
                    {movement.Type === "Reduction" && <FaMinus className="text-red-500" />}
                    {movement.Type === "Modification" && <FaEdit className="text-blue-500" />}
                    {movement.Type === "Return" && <FaEdit className="text-blue-500" />}
                  </td>
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b">
                      {movement.Type}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {movement.Name}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {movement.Adjustment}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {movement.Date}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex items-center">
                        {movement.User}
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex items-center">
                      <button
                            onClick={() => navigate(`/movement-detail/${movement.id}`)}
                        >
                          <FaEye />
                        </button>
                      </div>
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

export { StockMovement };
export default withAuth(StockMovement);
