import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaInfoCircle, FaSearch, FaCalendarAlt, FaUser, FaFileInvoice, FaHashtag, FaMoneyBillWave, FaPercentage, FaTimes, FaUpload } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Spinner from "../Components/Spinner";

const AddPurchaseRequisition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ Receipt: null, ReceiptPreview: null });
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Pre-selected context: 'store' or 'warehouse'
  const contextType = location.state?.type || "store"; 
  const preSelectedId = location.state?.stockId || "";

  useEffect(() => {
    fetchProducts(contextType);
  }, [contextType]);

  const fetchProducts = async (type) => {
    try {
      const endpoint = `https://apiv2.cnhtc4.com/stock/all/${type}`;
      const response = await axios.get(endpoint);
      const data = response.data.data || response.data;
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setLoading(false);
    }
  };

  const initialValues = {
    purchaseDate: new Date().toISOString().split("T")[0],
    stockId: preSelectedId,
    supplierName: "",
    supplierTinNumber: "",
    receiptNumber: "",
    stockQuantity: "",
    purchaseCost: "",
    paidTax: "",
    location: contextType === "warehouse" ? "Warehouse" : "Store",
  };

  const validationSchema = Yup.object().shape({
    purchaseDate: Yup.date().required("Required"),
    stockId: Yup.string().required("Please select a product"),
    supplierName: Yup.string().required("Required"),
    supplierTinNumber: Yup.string().required("Required"),
    receiptNumber: Yup.string().required("Required"),
    stockQuantity: Yup.number().positive("Must be positive").required("Required"),
    purchaseCost: Yup.number().positive("Must be positive").required("Required"),
    paidTax: Yup.number().min(0, "Cannot be negative").required("Required"),
    location: Yup.string().required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const submitData = new FormData();

      // append all normal fields
      Object.keys(values).forEach(key => {
        submitData.append(key, values[key]);
      });

      // append file separately
      if (selectedReceipt) {
        submitData.append("Receipt", selectedReceipt);
      }

      await axios.post(
        "https://apiv2.cnhtc4.com/purchase-requisition/create",
        submitData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      Swal.fire({
        title: "Success!",
        text: "Purchase requisition recorded and stock updated.",
        icon: "success",
        confirmButtonColor: "#2563eb",
      }).then(() => {
        navigate("/purchase-requisition");
      });

    } catch (error) {
      console.error("Error creating requisition:", error);
      toast.error(error.response?.data?.message || "Error creating requisition");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
        <div className="bg-white flex justify-between items-center mr-2 p-1">
          <p className="text-lg sm:text-xl font-bold whitespace-nowrap flex items-center ml-3 mt-[1px]">
              <span className="sm:hidden">Store</span>
              <span className="hidden sm:inline">Acquisition Management System</span>
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

          {/* Form Section */}
          <div className="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto w-full">
            <div className="flex items-center mb-6 pb-2 border-b">
              <FaInfoCircle className="text-blue-600 mr-2" />
              <h2 className="text-lg font-medium">Requisition Details</h2>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400 text-xs" /> Purchase Date
                        </label>
                        <Field
                          name="purchaseDate"
                          type="date"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <ErrorMessage name="purchaseDate" component="div" className="text-red-500 text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                          <FaSearch className="text-gray-400 text-xs" /> Product
                        </label>
                        <Field
                          as="select"
                          name="stockId"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                        >
                          <option value="">Select Product...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.Name} ({p.Curent_stock} in stock)
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="stockId" component="div" className="text-red-500 text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                          <FaPercentage className="text-gray-400 text-xs" /> Paid Tax
                        </label>
                        <Field
                          name="paidTax"
                          type="number"
                          placeholder="0.00"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <ErrorMessage name="paidTax" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div className="hidden">
                        <label className="block text-sm font-medium mb-1">Storage Location</label>
                        <Field
                          as="select"
                          name="location"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md outline-none bg-white"
                        >
                          <option value="Store">Store</option>
                          <option value="Warehouse">Warehouse</option>
                        </Field>
                      </div>
                    </div>

                    {/* Middle Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                          <FaUser className="text-gray-400 text-xs" /> Supplier Name
                        </label>
                        <Field
                          name="supplierName"
                          placeholder="Enter Supplier Name"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <ErrorMessage name="supplierName" component="div" className="text-red-500 text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                          <FaHashtag className="text-gray-400 text-xs" /> Supplier TIN
                        </label>
                        <Field
                          name="supplierTinNumber"
                          placeholder="Supplier TIN Number"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <ErrorMessage name="supplierTinNumber" component="div" className="text-red-500 text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                          <FaFileInvoice className="text-gray-400 text-xs" /> Receipt Number
                        </label>
                        <Field
                          name="receiptNumber"
                          placeholder="Receipt Number"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <ErrorMessage name="receiptNumber" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400 text-xs" /> Stock Quantity
                        </label>
                        <Field
                          name="stockQuantity"
                          type="number"
                          placeholder="0.00"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <ErrorMessage name="stockQuantity" component="div" className="text-red-500 text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                          <FaMoneyBillWave className="text-gray-400 text-xs" /> Purchase Cost (Total)
                        </label>
                        <Field
                          name="purchaseCost"
                          type="number"
                          placeholder="0.00"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <ErrorMessage name="purchaseCost" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                          <FaFileInvoice className="text-gray-400 text-xs" /> Receipt Image <ErrorMessage name="Receipt" component="span" className="text-red-500 text-xs ml-1" />
                        </label>
                        <div className="flex items-center gap-4">
                          {/* Upload Button */}
                          <div className="w-44">
                            <input
                              type="file"
                              id="Receipt"
                              name="Receipt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSelectedReceipt(file);
                                  const blobURL = URL.createObjectURL(file);
                                  setFormData({
                                    ...formData,
                                    Receipt: file,
                                    ReceiptPreview: blobURL,
                                  });
                                }
                              }}
                              className="hidden"
                              accept="image/*"
                            />
                            <label
                              htmlFor="Receipt"
                              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-md cursor-pointer hover:bg-blue-700 transition-all w-full text-sm font-medium"
                            >
                              <FaUpload size={16} />
                              Choose Image
                            </label>
                          </div>
                          
                          {/* Image Preview */}
                          {formData.ReceiptPreview && (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                                onClick={() => window.open(formData.ReceiptPreview, '_blank')}
                                title="Click to view full size"
                              >
                                <img 
                                  src={formData.ReceiptPreview} 
                                  alt="Receipt preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button 
                                type="button"
                                  onClick={() => console.log("BUTTON CLICKED")}
                                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Remove image"
                              >
                                <FaTimes size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        <ErrorMessage name="Receipt" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-12 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      {isSubmitting ? "Processing..." : "Save Requisition"}
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

export default withAuth(AddPurchaseRequisition);