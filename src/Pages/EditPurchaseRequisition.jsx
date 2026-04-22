import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaInfoCircle, FaUpload, FaCalendarAlt, FaSearch, FaUser, FaFileInvoice, FaHashtag, FaMoneyBillWave, FaPercentage, FaTimes } from "react-icons/fa";
import { AiFillCaretDown } from "react-icons/ai";
import Spinner from "../Components/Spinner";

const EditPurchaseRequisition = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requisition, setRequisition] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ Receipt: null, ReceiptPreview: null });
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const validationSchema = Yup.object({
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch requisition and products (assume store by default, adjust if needed)
        const [reqResponse] = await Promise.all([
          axios.get(`https://apiv2.cnhtc4.com/purchase-requisition/${id}`),
        ]);
        
        setRequisition(reqResponse.data);
        
        // Prepopulate form
        formik.setValues({
          purchaseDate: reqResponse.data.purchaseDate?.split('T')[0] || '',
          stockId: reqResponse.data.stockId || reqResponse.data.stock?.id || '',
          supplierName: reqResponse.data.supplierName || '',
          supplierTinNumber: reqResponse.data.supplierTinNumber || '',
          receiptNumber: reqResponse.data.receiptNumber || '',
          stockQuantity: reqResponse.data.stockQuantity || '',
          purchaseCost: reqResponse.data.purchaseCost || '',
          paidTax: reqResponse.data.paidTax || 0,
          location: reqResponse.data.location || 'Store',
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load requisition data");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formik = useFormik({
    initialValues: {
      purchaseDate: '',
      stockId: '',
      supplierName: '',
      supplierTinNumber: '',
      receiptNumber: '',
      stockQuantity: '',
      purchaseCost: '',
      paidTax: '',
      location: 'Store',
    },
    validationSchema,
    onSubmit: async (values) => {
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(values).forEach(key => {
        submitData.append(key, values[key]);
      });

      // Append receipt if changed
      if (selectedReceipt) {
        submitData.append("Receipt", selectedReceipt);
      }

      try {
        await axios.patch(
          `https://apiv2.cnhtc4.com/purchase-requisition/${id}`,
          submitData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        Swal.fire({
          title: "Success!",
          text: "Purchase requisition updated successfully.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        }).then(() => {
          navigate("/purchase-requisition");
          toast.success("Updated Successfully");
        });
      } catch (error) {
        console.error("Error updating requisition:", error);
        toast.error(error.response?.data?.message || "Error updating requisition");
      }
    },
  });

  const handleReceiptChange = (e) => {
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
  };

  if (loading || !requisition) return <Spinner />;

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="bg-white flex justify-between items-center mr-2 p-1">
          <p className="text-lg sm:text-xl font-bold whitespace-nowrap flex items-center ml-3 mt-[1px]">
            <span className="sm:hidden">Edit</span>
            <span className="hidden sm:inline">Edit Purchase Requisition</span>
          </p>
          <div className="flex items-center bg-blue-600 text-white rounded-lg px-3 py-1 space-x-2 cursor-pointer">
            <div className="bg-white text-blue-600 font-semibold w-6 h-6 flex items-center justify-center rounded-full text-sm">
              {name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex flex-col text-left leading-tight">
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-blue-100">{role}</p>
            </div>
            <svg className="w-4 h-4 text-blue-100 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto w-full mt-6">
          <div className="flex items-center mb-6 pb-2 border-b">
            <FaInfoCircle className="text-blue-600 mr-2" />
            <h2 className="text-lg font-medium">Edit Requisition Details</h2>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <FaCalendarAlt className="text-gray-400 text-xs" /> Purchase Date
                  </label>
                  <input
                    name="purchaseDate"
                    type="date"
                    value={formik.values.purchaseDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  {formik.touched.purchaseDate && formik.errors.purchaseDate && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.purchaseDate}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <FaPercentage className="text-gray-400 text-xs" /> Paid Tax
                  </label>
                  <input
                    name="paidTax"
                    type="number"
                    value={formik.values.paidTax}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  {formik.touched.paidTax && formik.errors.paidTax && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.paidTax}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <FaFileInvoice className="text-gray-400 text-xs" /> Receipt Number
                  </label>
                  <input
                    name="receiptNumber"
                    placeholder="Receipt Number"
                    value={formik.values.receiptNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  {formik.touched.receiptNumber && formik.errors.receiptNumber && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.receiptNumber}</div>
                  )}
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <FaUser className="text-gray-400 text-xs" /> Supplier Name
                  </label>
                  <input
                    name="supplierName"
                    placeholder="Enter Supplier Name"
                    value={formik.values.supplierName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  {formik.touched.supplierName && formik.errors.supplierName && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.supplierName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <FaHashtag className="text-gray-400 text-xs" /> Supplier TIN
                  </label>
                  <input
                    name="supplierTinNumber"
                    placeholder="Supplier TIN Number"
                    value={formik.values.supplierTinNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  {formik.touched.supplierTinNumber && formik.errors.supplierTinNumber && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.supplierTinNumber}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <FaFileInvoice className="text-gray-400 text-xs" /> Receipt Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-44">
                      <input
                        type="file"
                        id="Receipt"
                        name="Receipt"
                        onChange={handleReceiptChange}
                        className="hidden"
                        accept="image/*"
                      />
                      <label
                        htmlFor="Receipt"
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-md cursor-pointer hover:bg-blue-700 transition-all w-full text-sm font-medium"
                      >
                        <FaUpload size={16} />
                        Update Image
                      </label>
                    </div>
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
                          onClick={() => {
                            setSelectedReceipt(null);
                            setFormData({ Receipt: null, ReceiptPreview: null });
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Remove image"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    )}
                    {requisition.receiptImage && !formData.ReceiptPreview && (
                      <img 
                        src={`https://apiv2.cnhtc4.com/uploads/${requisition.receiptImage}`} 
                        alt="Current receipt" 
                        className="w-20 h-20 object-cover rounded border"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <FaCalendarAlt className="text-gray-400 text-xs" /> Stock Quantity
                  </label>
                  <input
                    name="stockQuantity"
                    type="number"
                    placeholder="0"
                    value={formik.values.stockQuantity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  {formik.touched.stockQuantity && formik.errors.stockQuantity && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.stockQuantity}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <FaMoneyBillWave className="text-gray-400 text-xs" /> Purchase Cost (Total)
                  </label>
                  <input
                    name="purchaseCost"
                    type="number"
                    placeholder="0.00"
                    value={formik.values.purchaseCost}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  {formik.touched.purchaseCost && formik.errors.purchaseCost && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.purchaseCost}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="bg-blue-600 text-white px-12 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {formik.isSubmitting ? "Processing..." : "Update Requisition"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export { EditPurchaseRequisition };
export default withAuth(EditPurchaseRequisition);

