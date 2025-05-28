import { useState, useEffect } from "react";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { useParams } from "react-router-dom";
import { useNavigate} from "react-router-dom";
import icon from '../assets/user.png'
import Spinner from "../Components/Spinner";


const ViewMovementDetail = () => {
  const { id } = useParams();
  const [movement, setMovement] = useState(null);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const handleReturn = async () => {
    try {
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  useEffect(() => {
    const fetchMovement= async () => {
      try {
        const response = await axios.get(`http://localhost:5000/movement/${id}`);
        setMovement(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchMovement();
  }, [id]);

  if (!movement) return <p><Spinner/>...</p>;

  return (
<section className="bg-[#edf0f0b9] min-h-screen overflow-x-hidden">
  <div className="container m-auto px-4">
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white flex justify-between">
        <p className="text-xl font-bold">Stock Movement</p>
        <div className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-lg w-32 mr-2">
          <p className="font-semibold">{name}</p>
          <p className="text-xs">{role}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mx-0 sm:mx-6 max-w-2xl w-full">
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4">
            Stock Movement | {movement.Type}
          </h3>
          <hr className="mb-4" />

          <div className="space-y-3">
            {[
              ["Author", movement.User],
              ["Name", movement.Name],
              ["Adjustment", movement.Adjustment],
              ["Change Mode", movement.Type],
              ["Date", movement.Date],
            ].map(([label, value], idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center"
              >
                <strong className="sm:w-40 text-gray-700 mb-1 sm:mb-0">
                  {label}:
                </strong>
                <span className="text-[#8f8d8d]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex justify-center">
          <button
            onClick={handleReturn}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

  );
};

export { ViewMovementDetail };
export default withAuth(ViewMovementDetail);
