import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams  } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { toast } from "react-toastify";

const RecordSale = () => {
  // const location = useLocation();
  // const { id } = location.state || {}; // Extract id from state (props)
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [formData, setFormData] = useState({
    Product_id: id,
    Full_name: "",
    Contact: "0000",
    Quantity: "",
    Amount: 0,
    Sale_type: "Single Usage",
    Payment_method: "",
    Total_amount: "",
    Credit_due: null,
    Credit: 0,
    Receipt: "",
    Transaction_id: "",
    Item_name: "",
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
    if (sale) {
      updatedFormData.Item_name = sale.Name;
    }
    // Update Total_amount based on Quantity and sale.Price
    if (name === "Quantity" && sale?.Price) {
      const quantity = value;
      const price = sale.Price;
      updatedFormData.Total_amount = quantity * price;
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
      // "Amount",
      // "Payment_method",
      // "Total_amount", // commented for komche
      // "Transaction_id",
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
        Sale_type: "Single Usage",
        Item_name: "",
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
            <h3 className="text-xl font-bold">Record Usage</h3>
          </div>

          {/* Create Product Section */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-[70%] ml-20">
              <h3 className="text-xl font-bold mb-4">Record Usage</h3>
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
                <div className="space-y-4 hidden">
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

                </div>
         
                {/* 3rd Side */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Total 
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

                </div>
              </div>
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

