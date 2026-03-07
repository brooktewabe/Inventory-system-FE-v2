import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { toast, ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import icon from "../assets/user.png";
import * as Yup from "yup";
import { FaInfoCircle, FaUpload } from "react-icons/fa";
import { AiFillCaretDown } from "react-icons/ai";
import Spinner from "../Components/Spinner";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [ProductImage, setProductImage] = useState(null);
  const [customColumns, setCustomColumns] = useState([]);
  const uid = localStorage.getItem("uid");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const validationSchema = Yup.object({
    Name: Yup.string().required("Required"),
    Location: Yup.string().required("Required"),
    Price: Yup.number()
      .required("Required")
      .positive("Must be greater than zero"),
    Cost: Yup.number()
      .required("Required")
      .positive("Must be greater than zero"),
    Curent_stock: Yup.number()
      .required("Required")
      .positive("Must be greater than zero"),
    // .moreThan(Yup.ref('Restock_level'), "Stock must be greater than restock level"),
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both resources in parallel
        const [stockResponse, columnsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/stock/all/${id}`),
          axios.get("http://localhost:5000/custom-product-columns/all")
        ]);
        
        const productData = stockResponse.data;
        const columns = columnsResponse.data;
        
        setStock(productData);
        setCustomColumns(columns);
        
        // Now initialize the form with all data available
        const customFieldValues = columns.reduce((acc, col) => {
          acc[col.fieldName] = productData[col.fieldName] || "";
          return acc;
        }, {});
        
        formik.setValues({
          Name: productData.Name || "",
          Location: productData.Location || "",
          Price: productData.Price || "",
          Cost: productData.Cost || "",
          storageLocation: productData.storageLocation || "",
          Curent_stock: productData.Curent_stock || "",
          Restock_level: productData.Restock_level || "",
          Product_image: null,
          ...customFieldValues
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [id]); // Only depends on id now

  const formik = useFormik({
    initialValues: {
      Name: stock?.Name || "",
      Location: stock?.Location || "",
      Type: stock?.Type || "",
      Price: stock?.Price || "",
      Cost: stock?.Cost || "",
      Curent_stock: stock?.Curent_stock || "",
      storageLocation: stock?.storageLocation || "",
      Restock_level: stock?.Restock_level || "",
      Product_image: null,
      ...customColumns.reduce((acc, col) => {
        acc[col.fieldName] = stock?.[col.fieldName] || ""; 
        return acc;
      }, {}),  
    },  
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();

      formData.append("Name", values.Name);
      formData.append("Location", values.Location);
      formData.append("storageLocation", values.storageLocation);
      formData.append("Price", values.Price);
      formData.append("Cost", values.Cost);
      formData.append("Curent_stock", values.Curent_stock);
      formData.append("Restock_level", values.Restock_level);

      if (values.Product_image) {
        formData.append("file", values.Product_image);
      }  

      customColumns.forEach((col) => {
        const val = values[col.fieldName];
        if (val !== undefined && val !== null) {
          formData.append(col.fieldName, val);
        }  
      });  
      try {
        await axios.patch(`http://localhost:5000/stock/all/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });  

        if (values.Curent_stock < values.Restock_level) {
          await axios.post("http://localhost:5000/notification/create", {
            message: `${stock.Name} is running low on stock.`,
            priority: "High",
          });  
        }  

        Swal.fire({
          title: "Success!",
          text: "Updated successfully.",
          icon: "success",
          confirmButtonColor: "#2563eb",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/");
          toast.success("Updated Successfully");
        });  
      } catch (error) {
        console.error("Error updating stock:", error);
        toast.error("Error updating stock. Try again later.");
      }  
    },  
  });    

  const handleFileChange = (e) => {
    formik.setFieldValue("Product_image", e.currentTarget.files[0]);
    setProductImage(e.currentTarget.files[0])
  };

  if (!stock) return <div><Spinner/></div>;

  return (
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
        <div className="bg-white flex justify-between items-center mr-2 p-1">
          <p className="text-lg sm:text-xl font-bold whitespace-nowrap flex items-center ml-3 mt-[1px]">
              <span className="sm:hidden">Inventory</span>
              <span className="hidden sm:inline">Inventory Management System</span>
            </p>

          <div className="flex items-center bg-blue-600 text-white rounded-lg px-3 py-1 space-x-2 cursor-pointer">
            {/* Circle with initial */}
            <div className="bg-white text-blue-600 font-semibold w-6 h-6 flex items-center justify-center rounded-full text-sm">
              {name?.charAt(0)?.toUpperCase() || "?"}
            </div>

            {/* Name and role */}
            <div className="flex flex-col text-left leading-tight">
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-blue-100">{role}</p>
            </div>

            {/* Dropdown arrow */}
            <svg
              className="w-4 h-4 text-blue-100 ml-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

          <div className="bg-white p-6 rounded-lg shadow-md max-w-[70%] ml-20">
            <div className="flex items-center mb-6 pb-2 border-b">
              <FaInfoCircle className="text-blue-600 mr-2" />
              <h2 className="text-lg font-medium">Edit Product </h2>
            </div>
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>
            <form onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
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
                      Price
                    </label>
                    <input
                      type="number"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cost
                    </label>
                    <input
                      type="number"
                      name="Cost"
                      value={formik.values.Cost}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                    {formik.touched.Cost && formik.errors.Cost && (
                      <div className="text-red-600 text-sm">
                        {formik.errors.Cost}
                      </div>
                    )}
                  </div>

                  <div className="flex mt-2">
                    <input
                      type="file"
                      id="Product_image"
                      name="Product_image"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg, .jpeg, .png"
                    />
                    <label
                      htmlFor="Product_image"
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-1 rounded-md cursor-pointer"
                    >
                      <FaUpload size={16} />
                      Upload Image
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                {customColumns
                .filter((col) => col.fieldName === "Category" && col.type === "options")
                .map((col) => (
                  <div key={col.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {col.fieldName}
                    </label>
                    {col.type === "options" ? (
                      <div className="relative">
                        <select
                          name={col.fieldName}
                          value={formik.values[col.fieldName] || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md appearance-none pr-10"
                        >
                          <option disabled value="">
                            {col.options?.length ? `Select ${col.fieldName}` : "No options"}
                          </option>
                          {col.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <AiFillCaretDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    ) : (
                      <input
                        type={col.type === "number" ? "number" : "text"}
                        name={col.fieldName}
                        value={formik.values[col.fieldName] || ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md"
                      />
                    )}
                    {formik.touched[col.fieldName] && formik.errors[col.fieldName] && (
                      <div className="text-red-600 text-sm">{formik.errors[col.fieldName]}</div>
                    )}
                  </div>
                ))}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Restock Level
                      </label>
                      <input
                        type="text"
                        name="Restock_level"
                        value={formik.values.Restock_level}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                      />
                      {formik.touched.Restock_level &&
                        formik.errors.Restock_level && (
                          <div className="text-red-600 text-sm">
                            {formik.errors.Restock_level}
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                <div>
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
                  <div>
                    <label className="block text-sm mt-4 font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="Location"
                      value={formik.values.Location}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="block w-full border border-gray-300 rounded-lg p-2"
                    />
                    {formik.touched.Location && formik.errors.Location && (
                      <div className="text-red-600 text-sm">
                        {formik.errors.Location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* ➤ Custom Fields Section */}
              <div className="col-span-3 mt-8">
                <h3 className="text-md font-semibold mb-4">
                  Additional Product Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {customColumns
                  .filter((col) => col.fieldName !== "Category")
                  .map((col) => (
                    <div key={col.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {col.fieldName}
                      </label>
                      {col.type === "options" ? (
                        <div className="relative">
                          <select
                            name={col.fieldName}
                            value={formik.values[col.fieldName] || ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
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
                          </select>
                          <AiFillCaretDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      ) : (
                        <input
                          type={col.type === "number" ? "number" : "text"}
                          name={col.fieldName}
                          value={formik.values[col.fieldName] || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md"
                        />
                      )}
                      {formik.touched[col.fieldName] &&
                        formik.errors[col.fieldName] && (
                          <div className="text-red-600 text-sm">
                            {formik.errors[col.fieldName]}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md"
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
