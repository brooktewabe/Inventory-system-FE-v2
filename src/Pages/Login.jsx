import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BiShow, BiHide } from "react-icons/bi"
import { toast } from "react-toastify"
import * as Yup from "yup"
import axios from "axios"
import Cookies from "js-cookie"
import { AiOutlineUser, AiFillSecurityScan } from "react-icons/ai"

// Add reload script to head before React mounts
if (typeof window !== "undefined") {
  const script = document.createElement("script")
  script.textContent = `
    if (!sessionStorage.getItem('app_loaded')) {
      sessionStorage.setItem('app_loaded', '1');
      window.location.reload();
    }
  `
  document.head.appendChild(script)
}
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
  
const ValidatedLoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      })

      Cookies.set("jwt", response.data.jwt, { expires: 1 })
      localStorage.setItem("role", response.data.role)
      localStorage.setItem("name", response.data.name)
      localStorage.setItem("uid", response.data.id)
      localStorage.setItem("permissions", response.data.permissions)

      setEmail("")
      setPassword("")
      navigate("/")
      window.location.reload()
    } catch (error) {
      console.error("Login error:", error.response ? error.response.data : error)
      toast.error("Invalid email or password")
    }
  }

  const validateForm = () => {
    const schema = Yup.object().shape({
      email: Yup.string().required("Email is required"),
      password: Yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
    })

    try {
      schema.validateSync({ email, password }, { abortEarly: false })
      setErrors({})
      return true
    } catch (error) {
      const newErrors = {}
      error.inner.forEach((err) => {
        newErrors[err.path] = err.message
      })
      setErrors(newErrors)
      return false
    }
  }

  return (
  <div className="flex items-center justify-center h-screen bg-[#edf0f0] p-4">
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
      <div className="mb-6">
        <p className="font-bold text-2xl text-gray-800">Login</p>
        <p className="text-sm text-gray-500">Hello - Login to your panel</p>
      </div>
      {errors.login && <div className="text-red-500 text-sm text-center mb-4">{errors.login}</div>}
      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white">
            <AiOutlineUser size={20} className="text-gray-500 mr-2" />
            <input
              id="email"
              name="email"
              type="text"
              placeholder="Enter username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-transparent text-gray-800 outline-none text-sm ${
                errors.email ? "border-red-500" : ""
              }`}
            />
          </div>
          {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white">
            <AiFillSecurityScan size={20} className="text-gray-500 mr-2" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-transparent text-gray-800 outline-none text-sm ${
                errors.password ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              className="absolute right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <BiHide /> : <BiShow />}
            </button>
          </div>
          {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  </div>

  )
}

export default ValidatedLoginForm

