import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { GoImage } from "react-icons/go";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AddProduct = () => {
  const [Product_image, setProduct_image] = useState(null);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid");

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

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
  // Validation schema
  const validationSchema = Yup.object({
    Name: Yup.string().required("Required"),
    Location: Yup.string().required("Required"),
    Category: Yup.string().required("Required"),
    // Type: Yup.string().required("Required"),
    Price: Yup.number()
      .required("Required")
      .positive("Must be greater than zero"),
    Curent_stock: Yup.number()
      .required("Required")
      .positive("Must be greater than zero"),
    Reorder_level: Yup.number()
      .required("Required")
      .positive("Must be greater than zero")
      .lessThan(
        Yup.ref("Curent_stock"),
        "Stock must be greater than reorder level"
      ),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);

    // Create formData for product creation
    const formData = new FormData();
    formData.append("Name", values.Name);
    formData.append("Location", values.Location);
    formData.append("Category", values.Category);
    formData.append("Price", values.Price);
    formData.append("Curent_stock", values.Curent_stock);
    formData.append("Reorder_level", values.Reorder_level);
    formData.append("Type", "Finished Product");
    formData.append("files", Product_image);

    try {
      // Create the product
      const productResponse = await axios.post(
        "https://api.akbsproduction.com/stock/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Create movement data
      const mvtData = {
        User: `${user.fname} ${user.lname}`,
        Name: values.Name,
        Adjustment: values.Curent_stock,
        Type: "Addition",
      };

      // Post movement data
      const movementResponse = await axios.post(
        "https://api.akbsproduction.com/movement/create",
        mvtData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        title: "Success!",
        text: "Product added successfully.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/");
        toast.success("Created Successfully");
      });
    } catch (error) {
      console.error("Error creating stock or movement:", error);
      toast.error(
        "Error creating stock. Make sure all fields are filled appropriately."
      );
    }

    setSubmitting(false);
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          {/* First small full-width grid */}
          <div className="bg-white p-4  ">
            <h3 className="text-xl font-bold">Create Product</h3>
          </div>

          {/* Create Product Section */}
          <div className="bg-white p-6 rounded-lg shadow-md max-w-[70%] ml-20">
            <h3 className="text-xl font-bold mb-4">Add New Product</h3>

            <Formik
              initialValues={{
                Name: "",
                Location: "",
                Category: "",
                Price: "",
                Curent_stock: "",
                Reorder_level: "",
                Type:""
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Right Side */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Product Title
                        </label>
                        <Field
                          name="Name"
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                        />
                        <ErrorMessage
                          name="Name"
                          component="div"
                          className="text-red-600 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Location
                        </label>
                        <Field
                          name="Location"
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                        />
                        <ErrorMessage
                          name="Location"
                          component="div"
                          className="text-red-600 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Reorder Level
                        </label>
                        <Field
                          name="Reorder_level"
                          type="number"
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                        />
                        <ErrorMessage
                          name="Reorder_level"
                          component="div"
                          className="text-red-600 text-sm"
                        />
                      </div>
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <Field
                          as="select"
                          name="Type"
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                        >
                          <option value="">Select type</option>
                          <option value="Finished Product">Finished Product</option>
                          <option value="Raw Material">Raw Material</option>
                        </Field>
                        <ErrorMessage
                          name="Type"
                          component="div"
                          className="text-red-600 text-sm"
                        />
                      </div> */}
                    </div>

                    {/* Left Side */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <Field
                          as="select"
                          name="Category"
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.category}>
                              {category.category}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="Category"
                          component="div"
                          className="text-red-600 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Stock Amount
                        </label>
                        <Field
                          name="Curent_stock"
                          type="number"
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                        />
                        <ErrorMessage
                          name="Curent_stock"
                          component="div"
                          className="text-red-600 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <Field
                          name="Price"
                          type="number"
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                        />
                        <ErrorMessage
                          name="Price"
                          component="div"
                          className="text-red-600 text-sm"
                        />
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
                      disabled={isSubmitting}
                      className="bg-[#16033a] text-white px-16 py-2 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </section>
  );
};

export { AddProduct };
export default withAuth(AddProduct);
