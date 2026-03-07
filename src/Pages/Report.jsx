import withAuth from "../withAuth";
import Revenue from "../Components/Revenue";
import TopSelling from "../Components/TopSelling";
import WarehouseAssets from "../Components/WarehouseAsset";
import StoreAssets from "../Components/StoreAsset";
import History from "../Components/History";
import TotalProfit from "../Components/TotalProfit";

const Report = () => {
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  return (
    <section className="bg-[#edf0f0b9] h-full">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-2">
          {/* First small full-width grid */}
        <div className="bg-white flex justify-between items-center mr-2">
            <p className="text-xl font-bold">Report</p>

          <div className="flex items-center bg-blue-600 text-white rounded-lg px-3 py-1 space-x-2 cursor-pointer">
            {/* Circle with initial */}
            <div className="bg-white text-blue-600 font-semibold w-6 h-6 flex items-center justify-center rounded-full text-sm">
              {name?.charAt(0)?.toUpperCase() || "?"}
            </div>

            {/* Name and role */}
            <div className="flex flex-col text-left leading-tight">
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-blue-100">{role}</p>
            </div>

            {/* Dropdown arrow */}
            <svg
              className="w-4 h-4 text-blue-100 ml-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
          <div className="flex justify-between items-center p-4 ml-2">
          <h3 className="font-bold text-lg">General Report</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <div className="px-4 sm:px-6">
            <Revenue />
          </div>
          <div className="px-4 sm:px-6">
            <TotalProfit />
          </div>
          <div className="px-4 sm:px-6">
            <WarehouseAssets />
          </div>
          <div className="px-4 sm:px-6">
            <StoreAssets />
          </div>
        </div>
        <div className="ml-6 mr-6">
          <TopSelling/>
        </div>
        </div>
      </div>
    </section>
  );
};

export { Report };
export default withAuth(Report);
