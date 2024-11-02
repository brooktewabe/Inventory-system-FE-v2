import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { GoImage } from "react-icons/go";
import { toast, ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const uid = localStorage.getItem("uid");

  const validationSchema = Yup.object({
    Name: Yup.string().required("Required"),
    Location: Yup.string().required("Required"),
    Category: Yup.string().required("Required"),
    Type: Yup.string().required("Required"),
    Price: Yup.number()
      .required("Required")
      .positive("Must be greater than zero"),
    Curent_stock: Yup.number()
      .required("Required")
      .positive("Must be greater than zero"),
    // .moreThan(Yup.ref('Reorder_level'), "Stock must be greater than reorder level"),
  });
  useEffect(() => {
    // Fetch categories from the API endpoint
    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://api.akbsproduction.com/category/all");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);
  const formik = useFormik({
    initialValues: {
      Name: "",
      Location: "",
      Category: "",
      Type: "",
      Price: "",
      Curent_stock: "",
      Reorder_level: "",
      Product_image: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("Name", values.Name);
      formData.append("Location", values.Location);
      formData.append("Category", values.Category);
      formData.append("Type", values.Type);
      formData.append("Price", values.Price);
      formData.append("Curent_stock", values.Curent_stock);
      formData.append("Reorder_level", values.Reorder_level);
      if (values.Product_image) formData.append("files", values.Product_image);

      try {
        const response = await axios.patch(
          `https://api.akbsproduction.com/stock/all/${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Create movement data
        const mvtData = new FormData();
        mvtData.append("User", `${user.fname} ${user.lname}`);
        mvtData.append("Name", values.Name);
        mvtData.append("Adjustment", values.Curent_stock - stock.Curent_stock);
        mvtData.append("Type", "Modification");

        // Post movement data
        await axios.post("https://api.akbsproduction.com/movement/create", mvtData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        // Create notification data
        if (values.Curent_stock < values.Reorder_level) {
          const notifData = new FormData();
          notifData.append("message", `${stock.Name} is running low on stock.`);
          notifData.append("priority", "High");

          // Post notification data
          await axios.post(
            "https://api.akbsproduction.com/notification/create",
            notifData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
        Swal.fire({
          title: "Success!",
          text: "Updated successfully.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/");
          toast.success("Updated Successfully");
        });
      } catch (error) {
        console.error("Error updating stock:", error);
        toast.error("Error updating stock. Try again later." + error);
      }
    },
  });

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get(
          `https://api.akbsproduction.com/stock/all/${id}`
        );
        setStock(response.data);
        formik.setValues({
          Name: response.data.Name,
          Location: response.data.Location,
          Category: response.data.Category,
          Type: response.data.Type,
          Price: response.data.Price,
          Curent_stock: response.data.Curent_stock,
          Reorder_level: response.data.Reorder_level,
          Product_image: response.data.Product_image,
        });
      } catch (error) {
        console.error("Error fetching stock:", error);
      }
    };

    // Fetch stock data only if it hasn't been fetched yet
    if (!stock) {
      fetchStock();
    }
  }, [id, stock]); 

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get(`https://api.akbsproduction.com/user/${uid}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchInfo();
  }, [uid]);

  const handleFileChange = (e) => {
    formik.setFieldValue("Product_image", e.currentTarget.files[0]);
  };

  if (!stock) return <div>Loading...</div>;
  const handleCancel = () => {
    navigate("/");
  };

  return (
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 ">
            <h3 className="text-xl font-bold">Edit Product</h3>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md max-w-[70%] ml-20">
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>
            <form onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Title
                    </label>
                    <input
                      type="text"
                      name="Name"
                      value={formik.values.Name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                    {formik.touched.Name && formik.errors.Name && (
                      <div className="text-red-600 text-sm">
                        {formik.errors.Name}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="Location"
                      value={formik.values.Location}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                    {formik.touched.Location && formik.errors.Location && (
                      <div className="text-red-600 text-sm">
                        {formik.errors.Location}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      type="text"
                      name="Price"
                      value={formik.values.Price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                    {formik.touched.Price && formik.errors.Price && (
                      <div className="text-red-600 text-sm">
                        {formik.errors.Price}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      name="Category"
                      value={formik.values.Category}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.category}>
                          {category.category}
                        </option>
                      ))}
                    </select>
                    {formik.touched.Category && formik.errors.Category && (
                      <div className="text-red-600 text-sm">
                        {formik.errors.Category}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stock Amount
                    </label>
                    <input
                      type="number"
                      name="Curent_stock"
                      value={formik.values.Curent_stock}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                    {formik.touched.Curent_stock &&
                      formik.errors.Curent_stock && (
                        <div className="text-red-600 text-sm">
                          {formik.errors.Curent_stock}
                        </div>
                      )}
                  </div>
                  <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">
                    Type
                  </label>
                  <select
                    name="Type"
                    value={formik.values.Type}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  >
                    <option value="" disabled>Select Type</option>
                    <option value="Finished Product">Finished Product</option>
                    <option value="Raw Material">Raw Material</option>
                  </select>
                </div>
              </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-around space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-gray-400 text-gray-700 px-16 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#16033a] text-white px-16 py-2 rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export { EditProduct };
export default withAuth(EditProduct);
