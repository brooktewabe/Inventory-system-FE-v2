import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaUpload, FaInfoCircle, FaTimes } from "react-icons/fa";
import { AiFillCaretDown } from "react-icons/ai";
import { Formik, Form, Field, ErrorMessage } from "formik";

const AddProduct = () => {
  const [Product_image, setProduct_image] = useState(null);
  const [ProductImagePreview, setProductImagePreview] = useState(null);
  const [user, setUser] = useState(null);
  const [customColumns, setCustomColumns] = useState([]);
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user/${uid}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchInfo();
  }, [uid]);

  useEffect(() => {
    // Fetch categories from the API endpoint
    const fetchColumns = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/custom-product-columns/all"
        );
        setCustomColumns(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchColumns();
  }, []);
  const customInitialValues = customColumns.reduce((acc, col) => {
    acc[col.fieldName] = ""; // or null if you prefer
    return acc;
  }, {});

  const initialValues = {
    Name: "",
    Location: "",
    Price: "",
    Curent_stock: "",
    Restock_level: "",
    ...customInitialValues,
  };
  // Validation schema
  const baseSchema = {
      Name: Yup.string().required("Required"),
      Location: Yup.string().required("Required"),
      // Type: Yup.string().required("Required"),
      Price: Yup.number()
        .required("Required")
        .positive("Must be greater than zero"),
      Curent_stock: Yup.number()
        .required("Required")
        .positive("Must be greater than zero"),
      Restock_level: Yup.number()
        .required("Required")
        .positive("Must be greater than zero")
        .lessThan(
          Yup.ref("Curent_stock"),
          "Stock must be greater than restock level"
        ),
    };

  const customSchema = customColumns.reduce((acc, col) => {
    acc[col.fieldName] = Yup.string().required(`${col.fieldName} is required`);
    return acc;
  }, {});

  const validationSchema = Yup.object().shape({
    ...baseSchema,
    ...customSchema,
  });
  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);

    // Create formData for product creation
    const formData = new FormData();
    formData.append("Name", values.Name);
    formData.append("Location", values.Location);
    formData.append("Price", values.Price);
    formData.append("Curent_stock", values.Curent_stock);
    formData.append("Restock_level", values.Restock_level);
    formData.append("storageLocation", "Warehouse");
    formData.append("file", Product_image);
    customColumns.forEach((col) => {
      const fieldKey = col.fieldName;
      const value = values[fieldKey];
      if (value !== undefined && value !== null) {
        formData.append(fieldKey, value);
      }
    });

    try {
      // Create the product
       await axios.post("http://localhost:5000/stock/create",formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Create movement data
      const mvtData = {
        User: `${name}`,
        Name: values.Name,
        Adjustment: values.Curent_stock,
        Type: "Addition",
      };

      // Post movement data
      const movementResponse = await axios.post(
        "http://localhost:5000/movement/create",
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
        confirmButtonColor: "#2563eb",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/");
        toast.success("Created Successfully");
      });
    } catch (error) {
      console.error("Error creating stock or movement:", error);
      toast.error(
        error
      );
    }

    setSubmitting(false);
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          {/* First small full-width grid */}
          <div className="bg-white  flex justify-between">
            <p className="text-lg sm:text-xl font-bold whitespace-nowrap">
              <span className="sm:hidden">Inventory</span>
              <span className="hidden sm:inline">Inventory Management System</span>
            </p>
            <div className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-lg w-32 mr-2">
              <p className="font-semibold">{name}</p>
              <p className="text-xs">{role}</p>
            </div>
          </div>

          {/* Create Product Section */}
          <div className="bg-white p-6 rounded-lg shadow-md max-w-[85%] ml-4">
            {/* Header with info icon */}
            <div className="flex items-center mb-6 pb-2 border-b">
              <FaInfoCircle className="text-blue-600 mr-2" />
              <h2 className="text-lg font-medium">Add Product </h2>
            </div>
            <h3 className="text-xl font-bold mb-4">Add Product</h3>
            {customColumns.length > 0 && (
              <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-1">Name</label>
                        <Field
                          name="Name"
                          placeholder="Enter Product Name"
                          type="text"
                          className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <ErrorMessage
                          name="Name"
                          component="div"
                          className="text-red-600 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-1">Price</label>
                        <Field
                          name="Price"
                          placeholder="Enter Price"
                          type="number"
                          className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <ErrorMessage
                          name="Price"
                          component="div"
                          className="text-red-600 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Product Image</label>
                        <div className="flex items-center gap-4">
                          {/* Upload Button (fixed size) */}
                          <div className="w-40">
                            <input
                              type="file"
                              id="Product_image"
                              name="Product_image"
                              onChange={(e) => {
                              handleFileChange(e, setProduct_image)
                                const file = e.target.files?.[0];
                                if (file) {
                                  const blobURL = URL.createObjectURL(file);
                                  setProductImagePreview(blobURL);
                                }
                              }}
                              className="hidden"
                              accept=".png, .jpg, .jpeg"
                            />
                            <label
                              htmlFor="Product_image"
                              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-blue-700 transition-colors w-full"
                            >
                              <FaUpload size={16} />
                              <span className="truncate">Upload</span>
                            </label>
                          </div>

                          {/* Image Preview */}
                          {ProductImagePreview && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-20 h-20 border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                                onClick={() => window.open(ProductImagePreview, '_blank')}
                                title="Click to view full size"
                              >
                                <img
                                  src={ProductImagePreview}
                                  alt="Product preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setProductImagePreview(null)
                                }
                                className="text-gray-500 hover:text-red-500"
                                title="Remove image"
                              >
                                <FaTimes size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle Column */}
                    <div className="space-y-4">
                      <div>
                      {customColumns
                        .filter((col) => col.fieldName === "Category" && col.type === "options")
                        .map((col) => (
                          <div key={col.id}>
                            <label className="block text-sm mb-1">{col.fieldName}</label>
                            <div className="relative">
                              <Field
                                as="select"
                                name={col.fieldName}
                                className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option disabled value="">
                                  {col.options?.length ? `Select ${col.fieldName}` : "No options"}
                                </option>
                                {col.options?.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </Field>
                              <AiFillCaretDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                              <ErrorMessage
                                name={col.fieldName}
                                component="div"
                                className="text-red-600 text-sm mt-1"
                              />
                            </div>
                          </div>
                      ))}
                      </div>

                      <div>
                        <label className="block text-sm mb-1">Restock Level</label>
                        <Field
                          name="Restock_level"
                          placeholder="Enter Restock Level"
                          type="number"
                          className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <ErrorMessage
                          name="Restock_level"
                          component="div"
                          className="text-red-600 text-sm mt-1"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-1">Stock Amount</label>
                        <Field
                          name="Curent_stock"
                          placeholder="Enter Stock Amount"
                          type="number"
                          className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <ErrorMessage
                          name="Current_stock"
                          component="div"
                          className="text-red-600 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-1">Location</label>
                        <Field
                          name="Location"
                          placeholder="Enter Location"
                          type="text"
                          className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <ErrorMessage
                          name="Location"
                          component="div"
                          className="text-red-600 text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>
                    {/* ───────────────── Additional Product Details ───────────────── */}
                    {customColumns.length != 0 && (
                      <div className="col-span-3 mt-8">
                        <h4 className="text-md font-semibold mb-4">
                          Additional Product Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                          {customColumns
                          .filter((col) => col.fieldName !== "Category")
                          .map((col) => (
                            <div key={col.id}>
                              <label className="block text-sm mb-1">
                                {col.fieldName}
                              </label>

                              {/* options ➜ dropdown ▸ number ➜ numeric input ▸ string ➜ text input */}
                              {col.type === "options" ? (
                                <div className="relative">
                                  <Field
                                    as="select"
                                    name={col.fieldName}
                                    className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md appearance-none pr-10"
                                  >
                                    <option disabled value="">
                                      {col.options?.length
                                        ? `Select ${col.fieldName}`
                                        : "No options"}
                                    </option>
                                    {col.options?.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </Field>
                                  {/* dropdown icon */}
                                  <AiFillCaretDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                  <ErrorMessage
                                    name={col.fieldName}
                                    component="div"
                                    className="text-red-600 text-sm"
                                  />
                                </div>
                              ) : (
                                <>
                                  <Field
                                    name={col.fieldName}
                                    type={
                                      col.type === "number" ? "number" : "text"
                                    }
                                    placeholder={`Enter ${col.fieldName}`}
                                    className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md"
                                  />
                                  <ErrorMessage
                                    name="Name"
                                    component="div"
                                    className="text-red-600 text-sm"
                                  />
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Create Product Button */}
                    <div className="flex justify-center mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md"
                      >
                        Create Product
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
      </div>
    <ToastContainer/>
    </section>
  );
};

export { AddProduct };
export default withAuth(AddProduct);
