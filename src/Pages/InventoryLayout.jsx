import { Link } from "react-router-dom";
import withAuth from "../withAuth";

const Layout = () => {
  return (
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-2">
          {/* First small full-width grid */}
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold">Inventory Management</h3>
          </div>
          <div className="py-4 px-8">
            
          </div>
          <div className="gap-2">
            <div className="py-10 px-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="">
                  <h3 className="text-lg text-center font-bold flex-shrink-0">
                    Inventory Management
                  </h3>
                  <h5 className="text-lg font-bold flex-shrink-0">
                    Choose Option
                  </h5>
                </div>
                <div className="mt-4 flex flex-col">
                  <Link
                    to="/inventory"
                    className="mb-6 ml pl-6 text-sm bg-zinc-200 py-3 hover:bg-[#a7a7ac] hover:rounded-sm"
                  >
                    All Inventory
                  </Link>
                  <Link
                    to="/inventory-raw"
                    className="mb-6 ml pl-6 text-sm bg-zinc-200 py-3  hover:bg-[#a7a7ac] hover:rounded-sm"
                  >
                    Raw Material Inventory
                  </Link>
                  <Link
                    to="/finished-inventory"
                    className="mb-6 ml pl-6 text-sm bg-zinc-200 py-3  hover:bg-[#a7a7ac] hover:rounded-sm"
                  >
                    Production Inventory
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Layout };
export default withAuth(Layout);
