import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams,useLocation  } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { GoImage } from "react-icons/go";
import { toast, ToastContainer } from "react-toastify";

const RecordSale = () => {
  // const location = useLocation();
  // const { id } = location.state || {}; // Extract id from state (props)
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [formData, setFormData] = useState({
    Product_id: id,
    Full_name: "",
    Contact: "",
    Quantity: "",
    Amount: "",
    Payment_method: "",
    Total_amount: "",
    Credit_due: "",
    Credit: "0",
    Receipt: "",
    Transaction_id: "",
  });

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get(`https://api.akbsproduction.com/stock/all/${id}`);
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
  
    // Update Total_amount based on Quantity and sale.Price
    if (name === "Quantity" && sale?.Price) {
      const quantity = value;
      const price = sale.Price;
      updatedFormData.Total_amount = quantity * price;
    }
  
    // Update Credit as Total_amount - Amount
    if (name === "Amount" || name === "Quantity") {
      const totalAmount = updatedFormData.Total_amount
      const amount = updatedFormData.Amount
      updatedFormData.Credit = totalAmount - amount;
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
      "Amount",
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
  
    // Check if Credit is provided and Credit_due is required
    if (formData.Credit &&  formData.Credit >1 && (formData.Credit_due === null || formData.Credit_due === "")) {
      Swal.fire({
        title: "Error!",
        text: "Credit Due is required when Credit is provided.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
      return; // Exit the function if validation fails
    }

      // Check if Credit_due is in the future
  if (formData.Credit_due) {
    const dueDate = new Date(formData.Credit_due);
    const today = new Date();

    // Set time of today to 00:00:00 for accurate comparison
    today.setHours(0, 0, 0, 0);

    if (dueDate <= today) {
      Swal.fire({
        title: "Error!",
        text: "Credit Due must be a future date.",
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
    const patchData = { Curent_stock: newQuantity };
  
    try {
      // First, record the sale
      await axios.post("https://api.akbsproduction.com/sales/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // Then, update the stock
      await axios.patch(`https://api.akbsproduction.com/stock/all/${id}`, patchData);
  
      // Check if new quantity is less than reorder level
      if (newQuantity < sale.Reorder_level) {
        const notifData = {
          message: `${sale.Name} is running low on stock.`,
          priority: "High",
        };
        // Send the notification
        await axios.post("https://api.akbsproduction.com/notification/create", notifData, {
          headers: { "Content-Type": "application/json" },
        });
      }
  
      // Show success alert
      Swal.fire({
        title: "Success!",
        text: "Recorded successfully.",
        icon: "success",
        confirmButtonColor: "#3085d6",
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
        Amount: "",
        Payment_method: "",
        Total_amount: "",
        Credit_due: "",
        Credit: "",
        Receipt: "",
        Transaction_id: "",
      });
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error("Error Recorded. Try again later. Make sure all fields are appropriately filled");
    }
  };
  
  
  const handleCancel = () => {
    navigate("/");
  };
  if (!sale) return <div>Loading...</div>;

  return (
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          {/* First small full-width grid */}
          <div className="bg-white p-4  ">
            <h3 className="text-xl font-bold">Record Sale</h3>
          </div>

          {/* Create Product Section */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-[70%] ml-20">
              <h3 className="text-xl font-bold mb-4">Record Sales</h3>
              <hr />
              <h3 className="text-md font-bold mb-4">Buyer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Right Side */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="Full_name"
                      value={formData.Full_name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                </div>
                {/* Left Side */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="number"
                      name="Contact"
                      value={formData.Contact}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>
              <br /> <hr />
              <br />
              <h3 className="text-md font-bold mb-4">Order Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Right Side */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="Quantity"
                      value={formData.Quantity}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Credit Given
                    </label>
                    <input
                    disabled
                      type="number"
                      name="Credit"
                      value={formData.Credit}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      name="Transaction_id"
                      value={formData.Transaction_id}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                </div>
                {/* 2nd Side */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Amount Paid
                    </label>
                    <input
                       required
                      type="number"
                      name="Amount"
                      value={formData.Amount}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                <label className="block text-sm font-bold text-gray-700">
                  Payment Method
                </label>
                <select
                  name="Payment_method"
                  value={formData.Payment_method}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="" disabled>Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Tele Birr">Tele Birr</option>
                  <option value="E Birr">E Birr</option>
                  <option value="Other">Other</option>
                </select>
              </div>
                  <div className="mb-4 w-1/2">
                    <label className="block text-sm font-bold text-gray-700">
                      Receipt
                    </label>

                    <input
                      type="file"
                      id="Receipt"
                      name="Receipt"
                      // value={formData.Receipt}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFormData({ ...formData, Receipt: file });
                      }}
                      className="hidden"
                      accept=".png, .jpg, .jpeg"
                    />

                    <div className="flex items-center">
                      <div className="bg-[#]">
                        <GoImage size={30} />
                      </div>
                      <label
                        htmlFor="Receipt"
                        className="text-white bg-[#16033a] py-2 px-6  mx-2 cursor-pointer border rounded-2xl"
                      >
                        Upload Image <br />
                        {/* <span className="text-[#98b4c7]">(Required)</span> */}
                      </label>
                    </div>
                  </div>
                </div>
                {/* 3rd Side */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Total Payment
                    </label>
                    <input
                    disabled
                      type="number"
                      name="Total_amount"
                      value={formData.Total_amount}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Credit due
                    </label>
                    <input
                      type="date"
                      name="Credit_due"
                      value={formData.Credit_due}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>
              {/* Buttons */}
              <div className="flex justify-around space-x-4 mt-6">
                <button
                  onClick={handleCancel}
                  className="border border-gray-400 text-gray-700 px-16 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-[#16033a]  text-white px-16 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export { RecordSale };
export default withAuth(RecordSale);
