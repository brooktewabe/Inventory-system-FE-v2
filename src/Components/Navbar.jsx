import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import {
  AiOutlineMenu,
  AiOutlineUser,
  AiOutlineBars,
  AiOutlineSwap,
  AiTwotonePlusCircle,
  AiFillPlusSquare,
  AiTwotoneReconciliation,
  AiFillSetting
} from "react-icons/ai";
import { CiLogout, CiViewList } from "react-icons/ci";
import { useNavigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { MdOutlineDocumentScanner } from "react-icons/md";
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

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [user, setUser] = useState("");
  const sidebarRef = useRef(null);
  const linkClass = ({ isActive }) => (isActive ? "text-[#3b82f6]" : "");
  const role = localStorage.getItem("role");
  const uid = localStorage.getItem("uid");
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get(
          `https://api.akbsproduction.com/user/${uid}`
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchInfo();
  }, [id]);

  const userMenu = [
    {
      icon: <BiSolidDashboard size={25} className="mr-4" />,
      text: "Dashboard",
      link: "/",
      className: { linkClass },
    },
    {
      icon: <AiTwotonePlusCircle size={25} className="mr-4" />,
      text: "Inventory",
      link: "/inventory",
      className: { linkClass },
    },
    {
      icon: <AiFillPlusSquare size={25} className="mr-4" />,
      text: " Raw Material Inventory",
      link: "/inventory-raw",
      className: { linkClass },
    },
    {
      icon: <AiTwotoneReconciliation size={25} className="mr-4" />,
      text: "Record Sales",
      link: "/sales",
      className: { linkClass },
    },
    {
      icon: <MdOutlineDocumentScanner  size={25} className="mr-4" />,
      text: "Record Usage",
      link: "/sales-raw",
      className: { linkClass },
    },
    {
      icon: <AiOutlineBars size={25} className="mr-4" />,
      text: "Report",
      link: "/report",
      className: { linkClass },
    },
  ];

  const adminMenu = [
    {
      icon: <BiSolidDashboard size={25} className="mr-4" />,
      text: "Dashboard",
      link: "/",
      className: { linkClass },
    },
    {
      icon: <AiTwotonePlusCircle size={25} className="mr-4" />,
      text: "Inventory",
      link: "/inventory",
      className: { linkClass },
    },
    {
      icon: <AiFillPlusSquare size={25} className="mr-4" />,
      text: " Raw Material Inventory",
      link: "/inventory-raw",
      className: { linkClass },
    },
    {
      icon: <AiTwotoneReconciliation size={25} className="mr-4" />,
      text: "Record Sales",
      link: "/sales",
      className: { linkClass },
    },
    {
      icon: <MdOutlineDocumentScanner  size={25} className="mr-4" />,
      text: "Record Usage",
      link: "/sales-raw",
      className: { linkClass },
    },
    {
      icon: <AiOutlineBars size={25} className="mr-4" />,
      text: "Report",
      link: "/report",
      className: { linkClass },
    },
    {
      icon: <AiOutlineUser size={25} className="mr-4" />,
      text: "User Admin",
      link: "/user-admin",
      className: { linkClass },
    },
    {
      icon: <  AiFillSetting  size={25} className="mr-4" />,
      text: "Categories",
      link: "/settings",
      className: { linkClass },
    },
    {
      icon: <AiOutlineSwap size={25} className="mr-4" />,
      text: "Notifications",
      link: "/notification",
      className: { linkClass },
    },
  ];

  const handleLogout = async () => {
    try {
      await axios.post(`https://api.akbsproduction.com/logout`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      // Cookies.remove("userId");
      Cookies.remove("jwt");
      localStorage.removeItem("role");
      localStorage.removeItem("uid");
      navigate("/userlogin", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleNav = () => {
    setNav((prevNav) => {
      const newNavState = !prevNav;
      localStorage.setItem("navCollapsed", JSON.stringify(newNavState));
      return newNavState;
    });
  };

  useEffect(() => {
    setNav(JSON.parse(localStorage.getItem("navCollapsed") || "false"));
  }, [location]);

  if (role !== "admin" && role !== "user") {
    return null;
  }

  return (
    <div className="flex">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-[#06030b] min-h-full z-50 duration-300 
          ${nav ? "w-[90px]" : "w-[13%]"} flex flex-col justify-between`}
      >
        <div className="bg-[#06030b] rounded-t-xl p-4 flex flex-col">
          {!nav && (
            <>
              <div className="flex">
                <p className="text-xl  hidden md:block text-white ml-2">Control Panel</p>
                <AiOutlineMenu
                  size={30}
                  className="cursor-pointer text-white ml-auto"
                  onClick={toggleNav}
                />
              </div>
              <div className="text-white bg-black rounded-3xl flex items-center p-2 mt-8">
                <AiOutlineUser size={25} className="mr-4 hidden md:block " />
                <div>
                  <h3 className="text-white hidden md:block ">
                    {user.fname + " " + user.lname}
                  </h3>
                  <h3 className="text-neutral-800 hidden md:block ">{role}</h3>
                </div>
              </div>
            </>
          )}
          {nav && (
            <AiOutlineMenu
              size={30}
              className="cursor-pointer text-white ml-auto"
              onClick={toggleNav}
            />
          )}
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide">
          <ul className="flex flex-col p-4 text-white">
            {role === "user" &&
              userMenu?.map(({ icon, text, link }, index) => (
                <li key={index} className="my-2">
                  <NavLink
                    to={link}
                    className="flex items-center text-xl hover:bg-[#424243] rounded-lg p-2"
                    onClick={() => setNav(false)}
                  >
                    {icon}
                    {!nav && <span className="ml-1">{text}</span>}
                  </NavLink>
                </li>
              ))}
            {role === "admin" &&
              adminMenu?.map(({ icon, text, link }, index) => (
                <li key={index} className="my-4">
                  <NavLink
                    to={link}
                    className="flex items-center text-lg  hover:bg-[#424243] rounded-lg p-2"
                    onClick={() => setNav(false)}
                  >
                    {icon}
                    {!nav && <span className="ml-1 hidden md:block ">{text}</span>}
                  </NavLink>
                </li>
              ))}
          </ul>
        </nav>

        <div className="p-4">
          <button
            className="flex items-center text-white p-2 rounded-lg"
            onClick={() => setModalIsOpen(true)}
          >
            <CiLogout size={30} />
            {!nav && <span className="ml-4 hidden md:block ">Logout</span>}
          </button>
        </div>
      </div>

      {/* Page content */}
      {/* <div
        className={`ml-auto p-4 duration-300 ${nav ? "w-[calc(100%-90px)]" : "w-[calc(100%-13%)]"}`}
      >
        <Outlet />
      </div> */}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Confirm Logout"
        className="bg-white p-6 rounded-lg shadow-md w-1/3 mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center"
      >
        <div className="text-center mb-4">
          <CiLogout size={50} className="mx-auto mb-4" />
          <p className="mb-4 text-center">Are you sure you want to logout?</p>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setModalIsOpen(false)}
            className="border border-gray-700 px-6 py-2 w-32 rounded-3xl text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 w-32 rounded-3xl"
          >
            Yes
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Navbar;
