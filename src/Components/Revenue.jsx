import { useState, useEffect } from "react";
import axios from "../axiosInterceptor";

const IncomeSection = () => {
  const [currentDateIncome, setCurrentDateIncome] = useState(0);
  const [currentMonthIncome, setCurrentMonthIncome] = useState(0);
  const [currentYearIncome, setCurrentYearIncome] = useState(0);
  const currentDate = new Date(); // Get current date

  // Format the current date for display
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // State for active toggle button
  const [activePeriod, setActivePeriod] = useState("monthly");

  const handleToggle = (period) => {
    setActivePeriod(period);
    fetchIncome(period);
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
      const data = response.data.total; 
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

  useEffect(() => {
    fetchIncome(activePeriod); 
  }, [activePeriod]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4 flex-wrap">
        <h3 className="text-lg font-bold flex-1">Revenue</h3>
        <div className="flex flex-col md:flex-row md:flex-1 justify-end">
          {["yearly", "monthly", "daily"]?.map((period) => (
            <button
              key={period}
              onClick={() => handleToggle(period)}
              className={`py-1 px-4 rounded-lg mb-2 md:mb-0 md:mr-2 ${
                activePeriod === period ? "bg-black text-white" : "bg-[#e0e9ec] text-black"
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
  );
};

export default IncomeSection;
