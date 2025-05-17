import { useState, useEffect } from "react";
import axios from "../axiosInterceptor";

const IncomeSection = () => {
  const [stockVal, setStockVal] = useState(0);
  
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

  // Function to fetch stock value
  const fetchIncome = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/stock/total/warehouse-stock`);
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
    fetchIncome(); // Call this only if needed for specific periods.
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold">Inventory Asset</h3>
    </div>
    <div className="flex justify-between items-start mt-4">
      <p className="text-2xl mb-10 font-extrabold">{formatNumber(stockVal)}</p>
    </div>
    <p className="text-sm font-bold ">Total Value</p>
  <p className="text-sm text-gray-600">{formattedDate} - {formattedDatePlusOne}</p>

  </div>
  );
};

export default IncomeSection;