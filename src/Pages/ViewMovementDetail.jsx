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
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* First small full-width grid */}
          <div className="bg-white  flex justify-between">
            <p className="text-xl font-bold">Stock Movement</p>
            <div className="flex items-center bg-blue-500 text-white rounded-lg w-48  mr-2">
              <img
                src={icon}
                className="w-8 h-8 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs">{role}</p>
              </div>
            </div>
          </div>

          {/* full-width grid */}
          <div className="bg-white p-6 rounded-lg shadow-md ml-40 max-w-2xl">
            <div className="ml-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Stock Movement | {movement.Type}{" "}</h3>
              <hr className="mb-4" />

                <div className="flex items-center">
                  <strong className="w-40">Author:</strong>
                  <span className="text-[#8f8d8d]">{movement.User}</span>
                </div>
                <div className="flex items-center">
                  <strong className="w-40">Name:</strong>
                  <span className="text-[#8f8d8d]">{movement.Name}</span>
                </div>
                <div className="flex items-center">
                  <strong className="w-40">Adjustment:</strong>
                  <span className="text-[#8f8d8d]">{movement.Adjustment}</span>
                </div>
                <div className="flex items-center">
                  <strong className="w-40">Change Mode:</strong>
                  <span className="text-[#8f8d8d]">{movement.Type}</span>
                </div>
                <div className="flex items-center">
                  <strong className="w-40">Date:</strong>
                  <span className="text-[#8f8d8d]">{movement.Date}</span>
                </div>
                {/* <div className="flex items-center">
                  <strong className="w-40">Reason:</strong>
                  <span className="text-[#8f8d8d]">{movement.Reason}</span>
                </div> */}
              </div>
              <br />
              <br />
              <hr />
              <br />
              <button
                onClick={handleReturn}
                className="bg-blue-600 ml-40  text-white px-16 py-2 rounded-lg"
              >
                Done
              </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ViewMovementDetail };
export default withAuth(ViewMovementDetail);
