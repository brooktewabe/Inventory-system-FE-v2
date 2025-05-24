import withAuth from "../withAuth";
import Revenue from "../Components/Revenue";
import Total from "../Components/Total";
import Store from "../Components/Store";
const Dashboard = () => {
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white  flex justify-between">
            <p className="text-xl font-bold">Dashboard</p>
            <div className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-lg w-32 mr-2">
              <p className="font-semibold">{name}</p>
              <p className="text-xs">{role}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            <div className="px-4 sm:px-6">
              <Revenue />
            </div>
            <div className="px-4 sm:px-6">
              <Total />
            </div>
          </div>
          <Store />
        </div>
      </div>
    </section>
  );
};

export { Dashboard };
export default withAuth(Dashboard);
