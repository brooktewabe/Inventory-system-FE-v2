import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import {
  AiOutlineMenu,
  AiOutlineBars,
  AiTwotonePlusCircle,
  AiFillSetting,
  AiOutlineShop,
  AiOutlineBell,
  AiOutlineContacts
} from "react-icons/ai";
import { BiHorizontalCenter } from "react-icons/bi";
import { CiLogout } from "react-icons/ci";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { BiSolidDashboard } from "react-icons/bi";
import Cookies from "js-cookie";
import axios from "../axiosInterceptor";
import { useParams } from "react-router-dom";

Modal.setAppElement("#root"); // Set the app element for accessibility

const Navbar = () => {
  const [nav, setNav] = useState(() => {
    const storedNavState = localStorage.getItem("navCollapsed");
    return storedNavState !== null ? JSON.parse(storedNavState) : false;
  });
  
  // Add state to track if we're on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [user, setUser] = useState("");
  const sidebarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const role = localStorage.getItem("role");
  const uid = localStorage.getItem("uid");

  // Add resize listener to detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse on mobile
      if (window.innerWidth < 768 && !nav) {
        setNav(true);
        localStorage.setItem("navCollapsed", "true");
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial load
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [nav]);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user/${uid}`
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchInfo();
  }, [id, uid]);

  // Menu sections based on the image
  const menuSection = [
    {
      icon: <BiSolidDashboard size={20} className={isMobile ? "" : "mr-4"} />,
      text: "Inventory Dashboard",
      link: "/dashboard",
    },
    {
      icon: <AiOutlineShop size={20} className={isMobile ? "" : "mr-4"} />,
      text: "Store Management",
      link: "/sales",
    },
  ];

  const functionSection = [
    {
      icon: <AiTwotonePlusCircle size={20} className={isMobile ? "" : "mr-4"} />,
      text: "Inventory Management",
      link: "/warehouse",
    },
    {
      icon: <AiOutlineBars size={20} className={isMobile ? "" : "mr-4"} />,
      text: "Inventory Report",
      link: "/sales-history",
    },
    {
      icon: <BiHorizontalCenter size={25} className={isMobile ? "" : "mr-4"} />,
      text: "Stock Movement",
      link: "/stock-movement",
    },
    {
      icon: <AiOutlineContacts size={20} className={isMobile ? "" : "mr-4"} />,
      text: "CMS",
      link: "/customers-list",
    },
  ];

  const bottomSection = [
    {
      icon: <AiOutlineBell size={20} className={isMobile ? "" : "mr-3"} />,
      text: "Notifications",
      link: "/notification",
    },
    {
      icon: <AiFillSetting size={20} className={isMobile ? "" : "mr-3"} />,
      text: "Settings",
      link: "/settings",
    },
  ];

  const handleLogout = async () => {
    try {
      await axios.post(`http://localhost:5000/logout`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      Cookies.remove("jwt");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("uid");
      localStorage.removeItem("permissions");
      navigate("/login", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleNav = () => {
    // On mobile, don't allow expanding the sidebar
    if (isMobile) return;
    
    setNav((prevNav) => {
      const newNavState = !prevNav;
      localStorage.setItem("navCollapsed", JSON.stringify(newNavState));
      return newNavState;
    });
  };

  useEffect(() => {
    if (!isMobile) {
      setNav(JSON.parse(localStorage.getItem("navCollapsed") || "false"));
    }
  }, [location, isMobile]);

  if (!role) {
    return null;
  }

  const renderMenuItems = (items, sectionTitle) => (
    <div className="mb-6">
      {(!isMobile || !nav) && sectionTitle && (
        <h3 className="text-xs font-semibold text-gray-500 mb-2 px-4">{sectionTitle}</h3>
      )}
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.link}
              className={({ isActive }) => 
                `flex items-center ${isMobile ? "justify-center px-2" : "px-4"} py-2 text-sm rounded-md transition-colors ${
                  isActive ? "bg-blue-100 text-black-700" : "text-gray-700 hover:bg-gray-100"
                } ${nav && "justify-center"}`
              }
              title={isMobile ? item.text : ""}
            >
              <span className="flex items-center">{item.icon}</span>
              {(!isMobile && !nav) && <span>{item.text}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300 flex flex-col
          ${isMobile ? "w-[60px]" : nav ? "w-[100px]" : "w-[200px]"}`}
      >
        {/* Header */}
        <div className="bg-blue-600 py-4 px-4 flex items-center justify-between">
          {!isMobile && !nav && <h1 className="text-white font-medium text-sm">Inventory Management</h1>}
          {!isMobile && (
            <AiOutlineMenu
              size={20}
              className={`text-white cursor-pointer p-1 rounded hover:bg-blue-700 ${nav && "mx-auto"}`}
              onClick={toggleNav}
            />
          )}
          {isMobile && (
            <AiOutlineMenu
              size={20}
              className="text-white cursor-pointer p-1 rounded hover:bg-blue-700 mx-auto"
              onClick={() => {}} // Disabled on mobile
            />
          )}
        </div>

        {/* Navigation sections */}
        <div className="flex-1 py-4">
          {renderMenuItems(menuSection, "MENU")}
          {renderMenuItems(functionSection, "FUNCTION")}
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 pt-4 pb-6">
          {renderMenuItems(bottomSection)}

          <div className="px-4 mt-4">
            <button
              onClick={() => setModalIsOpen(true)}
              className={`flex items-center ${isMobile ? "justify-center" : ""} w-full px-2 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 transition-colors
                ${nav && "justify-center"}`}
              title={isMobile ? "Logout" : ""}
            >
              <CiLogout size={20} className={isMobile || nav ? "mx-auto" : "mr-3"} />
              {!isMobile && !nav && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div
        className={`ml-auto p-4 transition-all duration-300 ${
          isMobile ? "w-[calc(100%-60px)]" : nav ? "w-[calc(100%-70px)]" : "w-[calc(100%-200px)]"
        }`}
      >
        {/* Your page content will go here */}
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Confirm Logout"
        className="bg-white p-6 rounded-lg shadow-md w-4/5 md:w-1/3 mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center"
      >
        <div className="text-center mb-4">
          <CiLogout size={50} className="mx-auto mb-4" />
          <p className="mb-4 text-center">Are you sure you want to logout?</p>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setModalIsOpen(false)}
            className="border border-gray-700 px-6 py-2 w-32 rounded-full text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 w-32 rounded-full"
          >
            Yes
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Navbar;