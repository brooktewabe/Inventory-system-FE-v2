import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect, useRef } from "react";

const Layout = () => {
  const [role, setRole] = useState(() => {
    const role = localStorage.getItem("role");
    return role;
  });

  return (
    <>
      <Navbar />
      <div className={` ${role ? "ml-32 md:ml-56" : ""}`}>
        <Outlet />
      </div>
      <ToastContainer />
    </>
  );
};

export default Layout;
