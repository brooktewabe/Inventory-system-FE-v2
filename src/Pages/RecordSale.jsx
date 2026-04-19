import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { FaSearch, FaInfoCircle, FaUpload, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import Spinner from "../Components/Spinner";

const RecordSale = () => {
  const location = useLocation();
  const { id } = location.state || {}; // Extract id from state (props)
  // const { id } = useParams();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [formData, setFormData] = useState({
    Product_id: id,
    Full_name: "",
    Contact: "",
    Quantity: "",
    Payment_method: "",
    Total_amount: "",
    Sale_type: "Single",
    Receipt: "",
    Transaction_id: "",
    Item_List: "",
    Status: "Pending",
  });

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get(
          `https://apiv2.cnhtc4.com/stock/all/${id}`
        );
        setSale(response.data);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };
    fetchStock();
  }, [id]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (sale) {
      updatedFormData.Item_List = sale.Name;
    }

    // Get quantity and price from updated form data
    const quantity = name === "Quantity" ? value : updatedFormData.Quantity;
    const price = name === "Price" ? value : updatedFormData.Price || sale?.Price;

    // Calculate total if both quantity and price are present
    if (quantity && price) {
      updatedFormData.Total_amount = parseFloat(quantity) * parseFloat(price);
    }

    setFormData(updatedFormData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Calculate the new stock quantity
    const newQuantity = sale.Curent_stock - formData.Quantity;
    // Check for required fields
    const requiredFields = [
      "Full_name",
      "Contact",
      "Quantity",
      "Payment_method",
      "Total_amount",
      "Transaction_id",
    ];
    for (let field of requiredFields) {
      if (!formData[field]) {
        Swal.fire({
          title: "Error!",
          text: `${field.replace("_", " ")} is required.`,
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
        return; // Exit the function if validation fails
      }
    }

    // Check if the new quantity would be negative
    if (newQuantity < 0) {
      Swal.fire({
        title: "Error!",
        text: "Insufficient stock available.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
      return; // Exit the function to prevent further actions
    }

    // Prepare the PATCH request data
    const patchData = { Curent_stock: newQuantity,  Name: sale.Name, };

    try {
      // First, record the sale
      await axios.post("https://apiv2.cnhtc4.com/sales/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Then, update the stock
      await axios.patch(`https://apiv2.cnhtc4.com/stock/all/sale/${id}`, patchData);

      // Check if new quantity is less than reorder level
      if (newQuantity < sale.Restock_level) {
        const notifData = {
          message: `${sale.Name} is running low on stock.`,
          priority: "High",
        };
        // Send the notification
        await axios.post(
          "https://apiv2.cnhtc4.com/notification/create",
          notifData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Show success alert
      Swal.fire({
        title: "Success!",
        text: "Recorded successfully.",
        icon: "success",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/");
        toast.success("Recorded Successfully");
      });

      // Reset form after submission
      setFormData({
        Product_id: "",
        Full_name: "",
        Contact: "",
        Quantity: "",
        Sale_type: "Single",
        Payment_method: "",
        Total_amount: "",
        Receipt: "",
        Transaction_id: "",
        Item_List: "",
        Status: "Pending",
      });
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error(
        "Error Recorded. Try again later. Make sure all fields are appropriately filled"
      );
    }
  };

  if (!sale)
    return (
      <div>
        <Spinner />
      </div>
    );

  return (
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          {/* First small full-width grid */}
        <div className="bg-white flex justify-between items-center mr-2 p-1">
          <p className="text-lg sm:text-xl font-bold whitespace-nowrap flex items-center ml-3 mt-[1px]">
              <span className="sm:hidden">Store</span>
              <span className="hidden sm:inline">Store Management System</span>
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

          {/* Create Product Section */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white p-6 rounded-lg shadow-sm max-w-3xl mx-auto">
              {/* Header with info icon */}
              <div className="flex items-center mb-6 pb-2 border-b">
                <FaInfoCircle className="text-blue-600 mr-2" />
                <h2 className="text-lg font-medium">Point of Sale </h2>
              </div>

              {/* Buyer Information */}
              <div className="mb-6">
                <h3 className="text-base font-bold mb-4">Buyer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaSearch className="text-blue-600" />
                      </div>
                      <input
                        type="text"
                        name="Full_name"
                        placeholder="Enter name"
                        value={formData.Full_name || ""}
                        onChange={handleChange}
                        className="w-full pl-10 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Phone Number</label>
                    <input
                      type="number"
                      name="Contact"
                      placeholder="  Enter Phone Number"
                      value={formData.Contact || ""}
                      onChange={handleChange}
                      className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h3 className="text-base font-bold mb-4">Order Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-sm mb-1">Quantity</label>
                    <input
                      type="number"
                      name="Quantity"
                      placeholder=" Enter quantity"
                      value={formData.Quantity || ""}
                      onChange={handleChange}
                      className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Price</label>
                    <input
                      type="number"
                      name="Price"
                      placeholder=" Enter price"
                      value={formData.Price !== undefined ? formData.Price : sale.Price}
                      onChange={handleChange}
                      className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Total Payment</label>
                    <input
                      type="number"
                      name="Total_amount"
                      placeholder=" Enter total payment"
                      disabled
                      value={formData.Total_amount || ""}
                      onChange={handleChange}
                      className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Payment Method</label>
                    <div className="relative">
                      <select
                        name="Payment_method"
                        value={formData.Payment_method || ""}
                        onChange={handleChange}
                        className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none appearance-none pr-8"
                      >
                        <option value="" disabled>
                          Select Payment Method
                        </option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Telebirr">Telebirr</option>
                        <option value="E Birr">E Birr</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Transaction ID</label>
                    <input
                      type="text"
                      name="Transaction_id"
                      placeholder=" Enter transaction ID"
                      value={formData.Transaction_id || ""}
                      onChange={handleChange}
                      className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Receipt Image</label>
                    <div className="flex items-center gap-4">
                      {/* Upload Button (fixed size) */}
                      <div className="w-40"> {/* Fixed width container */}
                        <input
                          type="file"
                          id="Receipt"
                          name="Receipt"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const blobURL = URL.createObjectURL(file);
                              setFormData({
                                ...formData,
                                Receipt: file,
                                ReceiptPreview: blobURL,
                              });
                            }
                          }}
                          className="hidden"
                          accept=".png, .jpg, .jpeg"
                        />
                        <label
                          htmlFor="Receipt"
                          className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-blue-700 transition-colors w-full" /* w-full makes it fill container */
                        >
                          <FaUpload size={16} />
                          <span className="truncate">Upload Image</span> {/* Prevents text overflow */}
                        </label>
                      </div>
                      
                      {/* Image Preview */}
                      {formData.ReceiptPreview && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-20 h-20 border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
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
                            onClick={() => setFormData({...formData, ReceiptPreview: null})}
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
              </div>

              {/* Complete Sale Button */}
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  className="w-1/3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Complete Sale
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer/>
    </section>
  );
};

export { RecordSale };
export default withAuth(RecordSale);
