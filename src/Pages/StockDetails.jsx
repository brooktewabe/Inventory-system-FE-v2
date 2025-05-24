import { useState, useEffect } from "react";
import {  useParams } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import {  ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import icon from "../assets/user.png";
import * as Yup from "yup";
import { FaInfoCircle } from "react-icons/fa";
import Spinner from "../Components/Spinner";

const ViewProduct = () => {
  const { id } = useParams();
  const [stock, setStock] = useState(null);
  const [customColumns, setCustomColumns] = useState([]);
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const validationSchema = Yup.object({
    Name: Yup.string().required("Required"),
    Location: Yup.string().required("Required"),
    Category: Yup.string().required("Required"),
    Price: Yup.number()
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
          Category: productData.Category || "",
          Price: productData.Price || "",
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
      Category: stock?.Category || "",
      Type: stock?.Type || "",
      Price: stock?.Price || "",
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
      formData.append("Category", values.Category);
      formData.append("storageLocation", values.storageLocation);
      formData.append("Price", values.Price);
      formData.append("Curent_stock", values.Curent_stock);
      formData.append("Restock_level", values.Restock_level);
    },  
  });    


  if (!stock) return <div><Spinner/></div>;

  return (
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
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

          <div className="bg-white p-6 rounded-lg shadow-md max-w-[70%] ml-20">
            <div className="flex items-center mb-6 pb-2 border-b">
              <FaInfoCircle className="text-blue-600 mr-2" />
              <h2 className="text-lg font-medium">View Product </h2>
            </div>
            <h3 className="text-xl font-bold mb-4">View Product</h3>
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
                      disabled
                      value={formik.values.Name}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      type="text"
                      name="Price"
                      disabled
                      value={formik.values.Price}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>

                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="text"
                      name="Category"
                      disabled
                      value={formik.values.Category}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Restock Level
                      </label>
                      <input
                        type="text"
                        name="Restock_level"
                        disabled
                        value={formik.values.Restock_level}
                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                      />
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
                      disabled
                      value={formik.values.Curent_stock}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mt-4 font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      disabled
                      name="Location"
                      value={formik.values.Location}
                      className="block w-full border border-gray-300 rounded-lg p-2"
                    />
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

                        <input
                          type="text"
                          name={col.fieldName}
                          disabled
                          value={formik.values[col.fieldName] || ""}
                          className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md"
                        />
                    </div>
                  ))}
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export { ViewProduct };
export default withAuth(ViewProduct);
