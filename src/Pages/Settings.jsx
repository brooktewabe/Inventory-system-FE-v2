import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { BiUser, BiListCheck } from "react-icons/bi";
import { BsThreeDots } from "react-icons/bs";
import withAuth from "../withAuth";

const Layout = () => {
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  
  // Define menu items with corresponding icons
  const menuItems = [
    { label: "Add User", path: "/user-admin", icon: <BiUser size={18} /> },
    { label: "Manage Fields", path: "/add-fields", icon: <BiListCheck size={18} /> },
    { label: "Manage Options", path: "/manage-options", icon: <BsThreeDots size={18} /> },
  ];

  return (
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-2">
          {/* Header section */}
          <div className="bg-white flex justify-between">
            <p className="text-xl font-bold">Settings</p>
            <div className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-lg w-32 mr-2">
              <p className="font-semibold">{name}</p>
              <p className="text-xs">{role}</p>
            </div>
          </div>
          
          <div className="py-1"></div>
          <h3 className="text-lg font-semibold ml-4">Settings</h3>
          
          <div className="p-6">
            <div className="bg-white rounded-md border border-blue-300 overflow-hidden">
              {menuItems.map((item) => (
                <Link
                  to={item.path}
                  key={item.label}
                  className={`flex items-center justify-between px-4 py-4 border-b border-blue-300 last:border-b-0 hover:bg-blue-50`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white rounded-full p-1">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {item.label}
                    </span>
                  </div>
                  <div className="bg-blue-600 text-white rounded-full p-1">
                    <FiChevronRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Layout };
export default withAuth(Layout);