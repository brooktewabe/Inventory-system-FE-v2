/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import withAuth from "../withAuth";
import axios from "../axiosInterceptor";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const ManageOptions = () => {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/category/all");
        setCategories(res.data);
        setLoading(false);
      } catch (err) {
        toast.error("Failed to load categories.");
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  // Add category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!category.trim()) return toast.error("Category name is required.");

    try {
      const res = await axios.post("http://localhost:5000/category/create", {
        category: category.trim(),
      });
      setCategories([...categories, res.data]);
      setCategory("");
      toast.success("Category added successfully.");
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("Category already exists.");
      } else {
        toast.error("Failed to add category.");
      }
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    Swal.fire({
      text: "Are you sure you want to delete this category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/category/all/${id}`);
          setCategories(categories.filter((cat) => cat.id !== id));
          toast.success("Deleted successfully.");
        } catch (err) {
          toast.error("Failed to delete category.");
        }
      }
    });
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Header */}
          <div className="bg-white flex justify-between">
            <p className="text-xl font-bold">Settings</p>
            <div className="flex items-center bg-blue-500 text-white rounded-lg w-48 mr-2">
              <img
                src="src/assets/user.png"
                className="w-8 h-8 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs">{role}</p>
              </div>
            </div>
          </div>

          {/* Manage Categories */}
          <h3 className="text-xl font-semibold mb-4 ml-4">Manage Categories</h3>
          <div className="bg-white p-6 rounded-lg shadow-md w-[90%] mx-auto">
            <h2 className="text-md font-semibold mb-4">Add New Category</h2>

            {/* Form */}
            <form onSubmit={handleAddCategory} className="flex gap-4 mb-6">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter category"
                className="w-full md:w-1/2 p-2 border rounded-md bg-gray-100"
              />
              <button
                type="submit"
                className="bg-blue-700 text-white py-2 px-6 rounded-md hover:bg-blue-800"
              >
                Add
              </button>
            </form>

            {/* Category List */}
            <h3 className="text-md font-semibold mb-2">Category List</h3>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : categories.length === 0 ? (
              <p className="text-gray-500">No categories found.</p>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex justify-between items-center border-b pb-1"
                  >
                    <span className="text-gray-800">{cat.category}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-black hover:text-red-600"
                      aria-label={`Delete ${cat.category}`}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { ManageOptions };
export default withAuth(ManageOptions);