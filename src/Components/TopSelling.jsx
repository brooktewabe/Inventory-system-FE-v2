import { useState, useEffect } from "react";
import axios from "../axiosInterceptor";

const IncomeSection = () => {
  const [currentDateIncome, setCurrentDateIncome] = useState(0);
  const [currentMonthIncome, setCurrentMonthIncome] = useState(0);
  const [currentYearIncome, setCurrentYearIncome] = useState(0);
  const [name, setName] = useState("");
  const currentDate = new Date(); // Get current date

  // Format the current date for display
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedDatePlusOne = new Date(
    currentDate.getFullYear() + 1,
    currentDate.getMonth(),
    currentDate.getDate()
  ).toLocaleDateString("en-US", {
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
          endpoint = "http://localhost:5000/sales/top-sold-product/day";
          break;
        case "monthly":
          endpoint = "http://localhost:5000/sales/top-sold-product/month";
          break;
        case "yearly":
          endpoint = "http://localhost:5000/sales/top-sold-product/year";
          break;
        default:
          endpoint = "http://localhost:5000/sales/top-sold-product/month"; // Default to monthly
      }

      const response = await axios.get(endpoint);
      const data = response.data.totalSold;
      setName(response.data.stock.Name)
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
<div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
    <h5 className="font-semibold text-lg mb-2 sm:mb-0">Top Selling Product <br /> <span className="font-light text-sm">{name}</span></h5>
    <div className="flex flex-wrap flex-col sm:flex-row md:flex-row gap-2 sm:gap-1 bg-gray-100 p-1 rounded-full">
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

  <div className="mt-4">
    <p className="text-2xl sm:text-3xl font-extrabold">
      {activePeriod === "daily"
        ? currentDateIncome.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : activePeriod === "monthly"
        ? currentMonthIncome.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : currentYearIncome.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
    </p>
  </div>

  <p className="text-sm font-bold mt-3 sm:mt-4">Total Sales</p>
  <p className="text-sm text-gray-600">{formattedDate} - {formattedDatePlusOne}</p>
</div>

  );
};

export default IncomeSection;
