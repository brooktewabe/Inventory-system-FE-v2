/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import axios from "../axiosInterceptor"
import withAuth from "../withAuth"
import * as Yup from "yup"
import { toast } from "react-toastify"
import Swal from "sweetalert2"

const UserAdmin = () => {
  const [users, setUsers] = useState([])
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const name = localStorage.getItem("name")
  const [errors, setErrors] = useState({})
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)

  // Permission mapping - display text to enum value
  const permissionMap = {
    "Store Management": "store",
    "Inventory Management": "inventory",
    "Reporting": "report",
    "Add Products": "add",
    "Customer Management System": "cms",
    "Settings": "settings",
    "Dashboard": "dashboard",
    "Notification":"notification"
  }

  const handlePermissionChange = (displayText, enumValue) => {
    setPermissions((prev) => (prev.includes(enumValue) ? prev.filter((p) => p !== enumValue) : [...prev, enumValue]))
  }

  const validateForm = () => {
    const schema = Yup.object().shape({
      userName: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      role: Yup.string().required("Role is required"),
      password: Yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
      permissions: Yup.array()
        .min(1, "At least one permission is required")
        .required("At least one permission is required"),
    })

    try {
      schema.validateSync({ userName, email, password, role, permissions }, { abortEarly: false })
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await axios.post("http://localhost:5000/signup", {
        name:userName,
        email,
        password,
        role,
        permissions,
      })
      toast.success("Registration successful")

      // Reset fields
      setUserName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setRole("")
      setPermissions([])

      // Refresh user list
      fetchUsers()
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error("Email already in use")
      } else {
        toast.error("Failed to add. Please try again later.")
      }
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get("http://localhost:5000/users")
      if (Array.isArray(response.data)) {
        setUsers(response.data)
      } else {
        console.error("Response data is not an array:", response.data)
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Error fetching users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const onDeleteUser = async (id) => {
    Swal.fire({
      text: "Are you sure you want to delete this user?",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      customClass: {
        cancelButton: "border border-gray-700 px-6 py-2 w-32 rounded-3xl",
        confirmButton: "bg-red-500 text-white px-6 py-2 w-32 rounded-3xl",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/user/${id}`)
          setUsers(users.filter((user) => user.id !== id))
          toast.success("Deleted Successfully")
        } catch (error) {
          toast.error("Error deleting. Try again later.")
        }
      }
    })
  }

  // Map permission enum back to display text
  const getPermissionDisplayText = (enumValue) => {
    for (const [displayText, value] of Object.entries(permissionMap)) {
      if (value === enumValue) return displayText
    }
    return enumValue // Fallback to the enum value if no match
  }

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white flex justify-between">
            <p className="text-xl font-bold">Settings</p>
            <div className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-lg w-32 mr-2">
              <p className="font-semibold">{name}</p>
              <p className="text-xs">{role}</p>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-4 ml-4">Add User</h3>
          <div className="bg-white rounded-lg shadow-md p-6 mx-auto w-full max-w-4xl">
            <h2 className="text-lg mb-6">Add User</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" autoComplete="off">
              {/* Name */}
              <div>
                <label className="text-gray-600 text-sm mb-1 block">Name</label>
                <input
                  type="text"
                  placeholder="Enter Full Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full border rounded-md p-2 bg-gray-50"
                  autoComplete="off"
                />
                {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-gray-600 text-sm mb-1 block">Email</label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-md p-2 bg-gray-50"
                  autoComplete="off"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="text-gray-600 text-sm mb-1 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-md p-2 bg-gray-50"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="text-gray-600 text-sm mb-1 block">Choose Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded-md p-2 bg-gray-50"
                >
                  <option value="">Choose Role</option>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="user">Data Clerk</option>
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              {/* Permissions */}
              <div className="col-span-1 md:col-span-2 mt-6">
                <h3 className="text-md font-semibold mb-4">Permissions</h3>
                <div className="grid grid-cols-1 gap-y-4 w-full md:w-4/5">
                  {Object.entries(permissionMap).map(([displayText, enumValue], idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-700">{displayText}</span>
                      <input
                        type="checkbox"
                        checked={permissions.includes(enumValue)}
                        onChange={() => handlePermissionChange(displayText, enumValue)}
                        className="h-4 w-4 accent-blue-600"
                      />
                    </div>
                  ))}
                </div>
                {errors.permissions && <p className="text-red-500 text-xs mt-1">{errors.permissions}</p>}
              </div>

              {/* Submit Button */}
              <div className="col-span-1 md:col-span-2 flex justify-center mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>

          {/* User List */}
          <div className="bg-white rounded-lg shadow-md p-6 mx-auto w-full max-w-4xl mt-6">
            <h2 className="text-lg mb-6">User List</h2>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Email</th>
                      <th className="py-2 px-4 text-left">Role</th>
                      <th className="py-2 px-4 text-left">Permissions</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-2 px-4">{user.name}</td>
                        <td className="py-2 px-4">{user.email}</td>
                        <td className="py-2 px-4 capitalize">{user.role}</td>
                        <td className="py-2 px-4">
                          {user.permissions && Array.isArray(user.permissions) ? (
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.map((perm, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {getPermissionDisplayText(perm)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "No permissions"
                          )}
                        </td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Delete ${user.userName}`}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No users found</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export { UserAdmin }
export default withAuth(UserAdmin)
