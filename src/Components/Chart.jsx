import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "axios";

const Donut = () => {
  const [options, setOptions] = useState({
    labels: [
      "Total Sales This Year",
      "Sales with Credit This Year",
    ],
  });
  const [series, setSeries] = useState([0, 0]);
  const [futureCreditDueCount, setFutureCreditDueCount] = useState(0); // State for future credit due count

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total count of sales and count of sales with credit
        const salesResponse = await axios.get("http://localhost:5000/sales/count-with-credit");
        const { totalCount, creditCount } = salesResponse.data;

        // Set series data for the chart
        setSeries([totalCount, creditCount]);

        const creditDueResponse = await axios.get("http://localhost:5000/sales/clients-with-future-credit-due");
        const creditDueCount = creditDueResponse.data.count;

        // Set future credit due count
        setFutureCreditDueCount(creditDueCount);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="donut bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between">
        <p>Sales Overview</p>
      </div>
      <Chart options={options} series={series} type="donut" width="400" />
      
      <div className="mt-4">
        <h4 className="text-lg font-bold">Customers with Future Credit Due: <span className="p-3 bg-[#e4e3e3]">{futureCreditDueCount}</span> </h4>
      </div>
    </div>
  );
};

export default Donut;