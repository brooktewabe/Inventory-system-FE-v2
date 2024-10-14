import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";

const Report = () => {
  const navigate = useNavigate();
  const [activePeriod, setActivePeriod] = useState("monthly");
  const [currentDateIncome, setCurrentDateIncome] = useState(0);
  const [currentMonthIncome, setCurrentMonthIncome] = useState(0);
  const [currentYearIncome, setCurrentYearIncome] = useState(0);
  const currentDate = new Date(); // Get current date
  const [stock, setStock] = useState([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const stockResponse = await axios.get(
          "https://api.akbsproduction.com/stock/total/total-stock"
        );
        setStock(stockResponse.data.totalSum);
      } catch (error) {
        console.error("Error fetching stock:", error);
      }
    };

    fetchStocks();
  }, []);

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleToggle = (period) => {
    setActivePeriod(period);
    fetchIncome(period); // Fetch income based on the selected period
  };

  // Function to fetch income data based on the selected period
  const fetchIncome = async (period) => {
    try {
      let endpoint;
      switch (period) {
        case "daily":
          endpoint = "https://api.akbsproduction.com/sales/total-amount/day";
          break;
        case "monthly":
          endpoint = "https://api.akbsproduction.com/sales/total-amount/month";
          break;
        case "yearly":
          endpoint = "https://api.akbsproduction.com/sales/total-amount/year";
          break;
        default:
          endpoint = "https://api.akbsproduction.com/sales/total-amount/month"; // Default to monthly
      }

      const response = await axios.get(endpoint);

      // Accessing total directly from the response
      const data = response.data.total; // This is now a string

      // Convert the string to a float for calculations
      const totalAmount = parseFloat(data) || 0;

      if (period === "daily") {
        setCurrentDateIncome(totalAmount);
      } else if (period === "monthly") {
        setCurrentMonthIncome(totalAmount);
      } else if (period === "yearly") {
        setCurrentYearIncome(totalAmount);
      }
    } catch (error) {
      console.error("Error fetching income data:", error);
    }
  };

  // Fetch initial income data
  useEffect(() => {
    fetchIncome(activePeriod);
  }, [activePeriod]);

  return (
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          {/* First small full-width grid */}
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold">Analytics</h3>
          </div>

          {/* Two equally sized grids */}
          <div className="gap-6">
            <div className="px-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Total Assets</h3>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-extrabold">{stock}</p>
                </div>
                <p className="mb-6 text-sm font-bold">Total value</p>
                <p className="mb-6 text-sm">{formattedDate}</p>
              </div>
            </div>
            <div className="py-10 px-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 flex-wrap">
                  <h3 className="text-lg font-bold flex-shrink-0">
                    Total Sales
                  </h3>
                  <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center">
                    {["yearly", "monthly", "daily"]?.map((period) => (
                      <button
                        key={period}
                        onClick={() => handleToggle(period)}
                        className={`py-1 px-4 rounded-lg mb-2 sm:mb-0 sm:mr-2 ${
                          activePeriod === period
                            ? "bg-black text-white"
                            : "bg-[#e0e9ec] text-black"
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-extrabold">
                    {activePeriod === "daily"
                      ? currentDateIncome.toFixed(2)
                      : activePeriod === "monthly"
                      ? currentMonthIncome.toFixed(2)
                      : currentYearIncome.toFixed(2)}
                  </p>
                </div>
                <p className="mb-6 text-sm font-bold">Total Sales</p>
                <p className="mb-6 text-sm">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Report };
export default withAuth(Report);
