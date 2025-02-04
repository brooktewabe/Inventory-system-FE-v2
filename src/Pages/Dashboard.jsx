import withAuth from "../withAuth";
import Revenue from "../Components/Revenue";
import Total from "../Components/Total"
import Chart from "../Components/Chart"
import History from "../Components/History"
const Dashboard = () => {
    const role = localStorage.getItem("role");

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold">Dashboard</h3>
          </div>
          {role== 'admin' &&   <>
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
        </>
        }
        {role!== 'admin' && 
        <div className="bg-white p-6 text-center rounded-lg shadow-md ml-6 mr-6">
          <p> You don&apos;t have the necessary permission to view this page</p>
        </div>
        }
        </div>
      </div>
    </section>
  );
};

export { Dashboard };
export default withAuth(Dashboard);