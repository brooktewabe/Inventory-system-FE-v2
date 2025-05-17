import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Dashboard from "./Dashboard";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const jwtToken = Cookies.get("jwt");
    if (!jwtToken) {
      const timeoutId = setTimeout(() => {
        navigate("/login");
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [navigate]);

  return (
    <>
      <Dashboard/>
    </>
  );
};

export default HomePage;
