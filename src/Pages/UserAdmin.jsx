/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaSearch, FaTrash } from "react-icons/fa";
import * as Yup from "yup";
import { BiShow, BiHide } from "react-icons/bi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import UnauthorizedAccess from "../Components/UnauthorizedAccess";

const UserAdmin = () => {
  const [users, setUsers] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const currentRole = localStorage.getItem("role");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const schema = Yup.object().shape({
      fname: Yup.string().required("First name is required"),
      lname: Yup.string().required("Last name is required"),
      email: Yup.string().required("Email is required"),
      role: Yup.string().required("Role is required"),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
    });

    try {
      schema.validateSync(
        { email, password, fname, lname, confirmPassword, role },
        { abortEarly: false }
      );
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await axios.post("https://api.akbsproduction.com/signup", {
        fname,
        lname,
        email,
        password,
        role,
      });
      toast.success("Registration successful");
      window.location.reload();
      // Optionally reset fields
      setFname("");
      setLname("");
      setEmail("");
      setPassword("");
      setRole("");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error("Email already in use");
      } else {
        toast.error("Failed to add. Please try again later.");
      }
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://api.akbsproduction.com/users");
        if (Array.isArray(response.data)) {
          setUsers(response.data);
          setFilteredUsers(response.data);
        } else {
          console.error("Response data is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let updatedUsers = users;

    if (searchTerm) {
      updatedUsers = updatedUsers.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredUsers(updatedUsers);
  }, [searchTerm, users]);

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
          await axios.delete(`https://api.akbsproduction.com/user/${id}`);
          setUsers(users.filter((user) => user.id !== id));
          toast.success("Deleted Successfully");
        } catch (error) {
          toast.error("Error deleting. Try again later.");
        }
      }
    });
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      {currentRole === "admin" ? (
        <div className="container m-auto">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-4">
              <h3 className="text-xl font-bold">User Administration</h3>
            </div>
            <div className="gap-6">
              <div>
                <div className="bg-white p-2 w-[60%] rounded-lg ml-20 shadow-md cursor-pointer">
                  <div className="items-center mb-4 flex flex-col">
                    <p className="mt-4 text-2xl">Add User</p>
                    <form
                      onSubmit={handleSubmit}
                      autoComplete="false"
                      className="mx-auto mt-4"
                    >
                      <div className="mb-4">
                        <label
                          htmlFor="fname"
                          className="text-gray-400 block text-sm mb-2"
                        >
                          First name
                        </label>
                        <input
                          id="fname"
                          name="fname"
                          type="text"
                          placeholder="Enter first name"
                          value={fname}
                          onChange={(e) => setFname(e.target.value)}
                          className={`shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                            errors.fname ? "border-red-500" : ""
                          }`}
                        />
                        {errors.fname && (
                          <div className="text-red-500 text-sm">
                            {errors.fname}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="lname"
                          className="text-gray-400 block text-sm mb-2"
                        >
                          Last name
                        </label>
                        <input
                          id="lname"
                          name="lname"
                          type="text"
                          placeholder="Enter last name"
                          value={lname}
                          onChange={(e) => setLname(e.target.value)}
                          className={`shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                            errors.lname ? "border-red-500" : ""
                          }`}
                        />
                        {errors.lname && (
                          <div className="text-red-500 text-sm">
                            {errors.lname}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="email"
                          className="text-gray-400 block text-sm mb-2"
                        >
                          Email/Username
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="text"
                          placeholder="Enter username/email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                            errors.email ? "border-red-500" : ""
                          }`}
                        />
                        {errors.email && (
                          <div className="text-red-500 text-sm">
                            {errors.email}
                          </div>
                        )}
                      </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Role
                    </label>

                  <select
                    name="role"
                    value={role}
                    onChange={(e)=> setRole(e.target.value)}
                    className="mt-1 block w-full border border-gray-400 rounded-lg p-2" 
                    >
                    <option disabled value="">Choose Role</option>
                    <option value="admin">Administrator</option>
                    <option value="manager">Production Manager</option>
                    <option value="user">Data Clerk</option>
                  </select>
                    {errors.role && (
                      <div className="text-red-600 text-sm">{errors.role}</div>
                    )}
                  </div>
                      <div className="mb-4">
                        <label
                          htmlFor="password"
                          className="text-gray-400 block text-sm mb-2"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                              errors.password ? "border-red-500" : ""
                            }`}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <BiHide /> : <BiShow />}
                          </button>
                        </div>
                        {errors.password && (
                          <div className="text-red-500 text-sm">
                            {errors.password}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="mt-4 bg-[#16033a] w-full text-white font-bold py-2 px-4 rounded"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white p-6 rounded-lg min-w-fit shadow-md ml-20 mr-40">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Users List</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSearchVisible(!searchVisible)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <FaSearch size={20} />
                  </button>
                </div>
              </div>
              {searchVisible && (
                <input
                  type="text"
                  placeholder="Search User"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
              )}

              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                      No.
                    </td>
                    <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                      Email
                    </td>
                    <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                      Action
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={user.id}>
                        <td className="py-2 px-4 border-b">{index + 1}</td>
                        <td className="py-2 px-4 border-b">{user.email}</td>
                        <td className="py-3 px-4 border-b space-x-2">
                          {user.role !== "admin" ? (
                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          ) : (
                            <></>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-2 px-4 text-center">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <UnauthorizedAccess />
      )}
    </section>
  );
};

export { UserAdmin };
export default withAuth(UserAdmin);
