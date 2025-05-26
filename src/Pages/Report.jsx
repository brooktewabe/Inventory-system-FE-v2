import withAuth from "../withAuth";
import Revenue from "../Components/Revenue";
import TopSelling from "../Components/TopSelling";
import WarehouseAssets from "../Components/WarehouseAsset";
import StoreAssets from "../Components/StoreAsset";
import History from "../Components/History";

const Report = () => {
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  return (
    <section className="bg-[#edf0f0b9] h-full">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-2">
          {/* First small full-width grid */}
          <div className="bg-white  flex justify-between">
            <p className="text-xl font-bold">Report</p>
            <div className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-lg w-32 mr-2">
              <p className="font-semibold">{name}</p>
              <p className="text-xs">{role}</p>
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
            <WarehouseAssets />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
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
