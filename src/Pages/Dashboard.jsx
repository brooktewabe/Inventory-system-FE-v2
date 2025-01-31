import { useState, useEffect } from "react";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import Revenue from "../Components/Revenue";
import Total from "../Components/Total"
import Chart from "../Components/Chart"
import History from "../Components/History"
const Dashboard = () => {

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold">Dashboard</h3>
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-6">
            <div className="px-6">
              <Revenue />
            </div>
            <div className="px-1">
              <Total />
            </div>
            <div className="px-1">
              <Chart />
            </div>
          </div>
          <History />
        </div>
      </div>
    </section>
  );
};

export { Dashboard };
export default withAuth(Dashboard);