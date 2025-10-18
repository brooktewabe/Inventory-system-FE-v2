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
        <div className="bg-white flex justify-between items-center mr-2 p-1">
            <p className="text-xl font-bold ml-3">Settings</p>
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