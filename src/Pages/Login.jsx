import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiShow, BiHide } from "react-icons/bi";
import { toast } from "react-toastify";
import * as Yup from "yup";
import axios from "axios";
import Cookies from "js-cookie";
import { AiOutlineUser, AiFillSecurityScan } from "react-icons/ai";

const ValidatedLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // // Integrate Eruda
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "https://cdn.jsdelivr.net/npm/eruda";
  //   script.onload = () => {
  //     if (window.eruda) {
  //       window.eruda.init();
  //     }
  //   };
  //   document.body.appendChild(script);
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post("https://api.akbsproduction.com/login", {
        email,
        password,
      });

      Cookies.set("jwt", response.data.jwt, { expires: 1 });
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("uid", response.data.id);

      setEmail("");
      setPassword("");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Login error:", error.response ? error.response.data : error);
      toast.error("Invalid email or password");
    }
  };

  const validateForm = () => {
    const schema = Yup.object().shape({
      email: Yup.string().required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
    });

    try {
      schema.validateSync({ email, password }, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.inner.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  return (
    <div className="flex items-center h-screen bg-black p-4 md:p-0">
      <div className="w-full max-w-md p-8 rounded-lg text-white md:w-1/2 md:px-8 md:mb-4 md:ml-6">
        <div className="mb-6">
          <p className="font-bold text-2xl">Login</p>
          <p className="text-stone-500">Hello - Login to your panel</p>
        </div>
        {errors.login && (
          <div className="text-red-500 text-sm text-center">{errors.login}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm mb-2">
              Username
            </label>
            <div className="flex items-center bg-[#a19f9f] rounded">
              <AiOutlineUser size={25} className="mr-4 ml-2" />
              <input
                id="email"
                name="email"
                type="text"
                placeholder="Enter username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full py-2 px-3 bg-[#494747] text-white outline-none ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.email && (
              <div className="text-red-500 text-sm">{errors.email}</div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm mb-2">
              Password
            </label>
            <div className="relative">
              <div className="flex items-center bg-[#a19f9f] rounded">
                <AiFillSecurityScan size={25} className="mr-4 ml-2" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full py-2 px-3 bg-[#494747] text-white outline-none ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <BiHide /> : <BiShow />}
                </button>
              </div>
              {errors.password && (
                <div className="text-red-500 text-sm mt-2">{errors.password}</div>
              )}
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-[#131756] hover:bg-blue-700 w-full py-2 px-4 rounded font-bold"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidatedLoginForm;