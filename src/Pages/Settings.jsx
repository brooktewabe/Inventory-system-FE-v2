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

const Categories = () => {
  const [users, setUsers] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setfilteredCategories] = useState([]);
  const [category, setCategory] = useState("");
  const currentRole = localStorage.getItem("role");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const schema = Yup.object().shape({
      category: Yup.string().required("Name is required"),
    });

    try {
      schema.validateSync(
        { category },
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
      await axios.post("http://localhost:5000/category", {
        category
      });
      toast.success("Registration successful");
      window.location.reload();
      // Optionally reset fields
      setCategory("");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error("Already in use");
      } else {
        toast.error("Failed to add. Please try again later.");
      }
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/category/all");
        if (Array.isArray(response.data)) {
          setUsers(response.data);
          setfilteredCategories(response.data);
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
    setfilteredCategories(updatedUsers);
  }, [searchTerm, users]);

  const onDelete = async (id) => {
    Swal.fire({
      text: "Are you sure you want to delete this category?",
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
          await axios.delete(`http://localhost:5000/category/all/${id}`);
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
              <h3 className="text-xl font-bold">Category controller</h3>
            </div>
            <div className="gap-6">
              <div>
                <div className="bg-white p-2 w-[60%] rounded-lg ml-20 shadow-md cursor-pointer">
                  <div className="items-center mb-4 flex flex-col">
                    <p className="mt-4 text-2xl">Add Category</p>
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
                          Catrgory name
                        </label>
                        <input
                          id="fname"
                          name="fname"
                          type="text"
                          placeholder="Enter category name"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
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
                <h3 className="text-lg font-bold">Category List</h3>
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
                    Category
                    </td>
                    <td className="py-2 text-[#9aa3a7] text-sm px-4 border-b">
                      Action
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories && filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => (
                      <tr key={category.id}>
                        <td className="py-2 px-4 border-b">{index + 1}</td>
                        <td className="py-2 px-4 border-b">{category.category}</td>
                        <td className="py-3 px-4 border-b space-x-2">
                            <button
                              onClick={() => onDelete(category.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                        
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-2 px-4 text-center">
                        No category found
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

export { Categories };
export default withAuth(Categories);
