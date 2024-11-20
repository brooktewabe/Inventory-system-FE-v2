import { useState, useEffect } from "react";
import axios from "../axiosInterceptor";

const IncomeSection = () => {
  const [stockVal, setStockVal] = useState(0);
  const [normalSum, setNormalSum] = useState(0);
  const [faultySum, setFaultySum] = useState(0);
  
  const currentDate = new Date(); // Get current date
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // State for active toggle button
  const [activePeriod, setActivePeriod] = useState("monthly");

  const handleToggle = (period) => {
    setActivePeriod(period);
    // Fetch income based on the selected period if needed
    fetchIncome(period);
  };

  // Function to fetch normal return income data
  const fetchNormalIncome = async () => {
    try {
      const response = await axios.get("https://api.akbsproduction.com/sales/total-sum/normal");
      const data = response.data.totalSum;
      setNormalSum(data);
    } catch (error) {
      console.error("Error fetching normal income data:", error);
    }
  };

  // Function to fetch faulty return income data
  const fetchFaultyIncome = async () => {
    try {
      const response = await axios.get("https://api.akbsproduction.com/sales/total-sum/faulty");
      const data = response.data.totalSum;
      setFaultySum(data);
    } catch (error) {
      console.error("Error fetching faulty income data:", error);
    }
  };

  // Function to fetch stock value
  const fetchIncome = async (period) => {
    try {
      const response = await axios.get(`https://api.akbsproduction.com/stock/total/total-stock`);
      const data = response.data.totalSum;
      setStockVal(data);
    } catch (error) {
      console.error("Error fetching income data:", error);
    }
  };
  // Function to format numbers with commas and two decimal places
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };
  // Fetch initial income and return values on mount
  useEffect(() => {
    fetchNormalIncome();
    fetchFaultyIncome();
    fetchIncome(activePeriod); // Call this only if needed for specific periods.
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold">Total Inventory Value</h3>
      <div className="flex">
          {((period) => (
            <button
              key={period}
              onClick={() => handleToggle(period)}
              className={`py-1 px-4 rounded-lg ${
                activePeriod === period ? "bg-black text-white" : "bg-[#e0e9ec] text-black"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
      </div>
    </div>
    
    <div className="flex justify-between items-start mt-4">
      <p className="text-2xl font-extrabold">{formatNumber(stockVal)}</p>
      <div className="text-right">
        <p className="text-lg font-bold">Returns: {formatNumber(-1 * normalSum)}</p>
        <p className="text-lg font-bold">Faulty Returns: {formatNumber(-1 * faultySum)}</p>
      </div>
    </div>

    <p className="mb-6 text-sm font-bold">Total Value</p>
    <p className="mb-6 text-sm">{formattedDate}</p>
  </div>
  );
};

export default IncomeSection;