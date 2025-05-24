import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { toast, ToastContainer } from "react-toastify";
import { FaSearch, FaInfoCircle, FaUpload, FaTimes } from "react-icons/fa";
import Spinner from "../Components/Spinner";

const RecordSale = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const [sale, setSale] = useState(null);
  const [salesTotal, setSalesTotal] = useState(0);
  const [salesIdFromNames, setSalesIdFromNames] = useState("");
  const [SalesItems, setSalesItems] = useState("");
  const [salesQuantity, setSalesQuantity] = useState(0);
  const [salesQuantityList, setSalesQuantityList] = useState("");
  const [addedItems, setAddedItems] = useState([]);
  const [items, setItems] = useState([
    {
      itemName: "",
      quantity: 0,
      totalAmount: 0,
    },
  ]);
  const getSelectedIds = () => {
    if (!salesIdFromNames) return [];
    return salesIdFromNames.split(",").map((id) => id.trim());
  };
  const [formData, setFormData] = useState({
    Full_name: "",
    Contact: "",
    Payment_method: "",
    Transaction_id: "",
    Receipt: "",
    Sale_type: "Batch",
    EachQuantity: "",
  });

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get("http://localhost:5000/stock/all/store");
        setSale(response.data.data);
      } catch (error) {
        console.error("Error fetching stock:", error);
      }
    };

    fetchStock();

    // Restore data if it exists
    const stored = localStorage.getItem("batchSaleData");
    if (stored) {
      const {
        addedItems,
        salesTotal,
        salesQuantity,
        salesIdFromNames,
        SalesItems,
        salesQuantityList,
        formData
      } = JSON.parse(stored);

      setAddedItems(addedItems);
      setSalesTotal(salesTotal);
      setSalesQuantity(salesQuantity);
      setSalesIdFromNames(salesIdFromNames);
      setSalesItems(SalesItems);
      setSalesQuantityList(salesQuantityList);
      setFormData(formData);
    }
  }, []);

  useEffect(() => {
    if (addedItems.length > 0) {
      localStorage.setItem("batchSaleData", JSON.stringify({
        addedItems,
        salesTotal,
        salesQuantity,
        salesIdFromNames,
        SalesItems,
        salesQuantityList,
        formData
      }));
    }
  }, [addedItems, salesTotal, salesQuantity, salesIdFromNames, SalesItems, salesQuantityList, formData]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index][name] = value;

      // Calculate total amount for the specific item when itemName or quantity changes
      if (name === "itemName" || name === "quantity") {
        const selectedItem = sale.find(
          (sl) => sl.id === updatedItems[index].itemName
        );
        if (selectedItem && updatedItems[index].quantity) {
          const quantity = parseInt(updatedItems[index].quantity, 10) || 0;
          updatedItems[index].totalAmount = quantity * selectedItem.Price;
        } else {
          updatedItems[index].totalAmount = 0;
        }
      }

      return updatedItems;
    });
  };

  const addMoreItem = async () => {
    // Validate current item before adding
    const currentItem = items[items.length - 1];
    if (!currentItem.itemName || !currentItem.quantity) {
      Swal.fire({
        title: "Error!",
        text: "Item Name and Quantity are required for the current item.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
      return;
    }

    // Check for required fields
    const requiredFields = ["Full_name", "Contact"];

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

    // Calculate new quantity based on current stock
    const selectedItem = sale.find((sl) => sl.id === currentItem.itemName);

    if (!selectedItem) {
      Swal.fire({
        title: "Error!",
        text: "Selected item not found in stock.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
      return;
    }

    const newQuantity = selectedItem.Curent_stock - currentItem.quantity;

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
    if (currentItem.quantity < 1) {
      Swal.fire({
        title: "Error!",
        text: "Quantity can't be negative or zero.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
      return; // Exit the function to prevent further actions
    }

    // Prepare sale data for this specific item
    const saleData = {
      ...formData,
      Product_id: selectedItem.id,
      Quantity: currentItem.quantity,
      Total_amount: currentItem.totalAmount,
      EachQuantity: null,
    };

    try {
      // Send the POST request for the current item
      await axios.post("http://localhost:5000/sales/create", saleData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Update stock quantity
      const newQuantity = selectedItem.Curent_stock - currentItem.quantity;
      await axios.patch(`http://localhost:5000/stock/all/sale/${selectedItem.id}`, {
        Curent_stock: newQuantity,
        Name: selectedItem.Name,
      });

      if (newQuantity < selectedItem.Restock_level) {
        await axios.post("http://localhost:5000/notification/create", {
          message: `${selectedItem.Name} is running low on stock.`,
          priority: "High",
        });
      }

      // Update sales totals
      setSalesTotal((prevTotal) => prevTotal + currentItem.totalAmount);
      setSalesQuantity(
        (prevQuantity) => prevQuantity + parseInt(currentItem.quantity, 10)
      );
      setSalesQuantityList((prevList) =>
        prevList ? prevList + "," + currentItem.quantity : currentItem.quantity
      );
      setSalesIdFromNames((prevNames) =>
        prevNames
          ? `${prevNames}, ${currentItem.itemName}`
          : currentItem.itemName
      );
      setSalesItems((prevNames) =>
        prevNames ? `${prevNames}, ${selectedItem.Name}` : selectedItem.Name
      );

      // Add the current item to the addedItems array
      setAddedItems((prevItems) => [
        ...prevItems,
        {
          name: selectedItem.Name,
          quantity: currentItem.quantity,
          totalAmount: currentItem.totalAmount,
        },
      ]);

      setItems([
        ...items.slice(0, -1),
        {
          itemName: "",
          quantity: 0,
          totalAmount: 0,
        },
      ]); // Keep existing items and add a new empty one
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error("Error recording sale. Try again later.");
    }
  };

  const handleSave = async () => {
    const combinedData = {
      Full_name: formData.Full_name,
      Contact: formData.Contact,
      Payment_method: formData.Payment_method,
      Transaction_id: formData.Transaction_id,
      Receipt: formData.Receipt,
      Sale_type: "Batch Sale",
      Product_id: salesIdFromNames,
      Quantity: salesQuantity,
      Total_amount: salesTotal,
      EachQuantity: salesQuantityList, // list of quantities
      Item_List: SalesItems, // list of item names
    };

    const requiredFields = ["Payment_method"];

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

    try {
      const response = await axios.post(
        "http://localhost:5000/sales/create",
        combinedData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        localStorage.removeItem("batchSaleData");
        Swal.fire({
          title: "Success!",
          text: "Sale saved successfully.",
          icon: "success",
          confirmButtonColor: "#2563eb",
          confirmButtonText: "OK",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Error saving sales:", error);
      toast.error("Error saving sales. Please try again.");
    }
  };

  const handleCancel = () => {
     navigate("/");
  };

  if (!sale)
    return (
      <div>
        <Spinner />
      </div>
    );

  return (
    <section className="bg-[#edf0f0b9] h-full">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white  flex justify-between">
            <p className="text-lg sm:text-xl font-bold whitespace-nowrap">
              <span className="sm:hidden">Store</span>
              <span className="hidden sm:inline">Store Management System</span>
            </p>
            <div className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-lg w-32 mr-2">
              <p className="font-semibold">{name}</p>
              <p className="text-xs">{role}</p>
            </div>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
              <div className="flex items-center mb-6 pb-2 border-b">
                <FaInfoCircle className="text-blue-600 mr-2" />
                <h2 className="text-lg font-medium">Point of Sale (Batch) </h2>
              </div>

              {/* Buyer Information */}
              <h4 className="text-base font-bold mb-4">Buyer Information</h4>
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
                    type="text"
                    name="Contact"
                    placeholder="  Enter Phone Number"
                    value={formData.Contact || ""}
                    onChange={handleChange}
                    className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                  />
                </div>
              </div>
              <br />
              <hr />
              <br />
              {addedItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-bold mb-4">Added Items</h3>
                  {addedItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-bold text-gray-700">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700">
                          Total Amount
                        </label>
                        <input
                          type="number"
                          value={item.totalAmount}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Order Information */}
              <h4 className="text-base font-bold mb-4 mt-6">
                Order Information
              </h4>
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4"
                >
                  <div>
                    <label className="block text-sm mb-1">Item Name</label>
                    <select
                      name="itemName"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                    >
                      <option value="" disabled>
                        Select Item
                      </option>
                      {Array.isArray(sale) && sale.length > 0 ? (
                        sale.map((sl) => {
                          const isDisabled = getSelectedIds().includes(
                            sl.id.toString()
                          );
                          return (
                            <option
                              key={sl.id}
                              value={sl.id}
                              disabled={
                                isDisabled && item.itemName !== sl.id.toString()
                              }
                            >
                              {sl.Name} {isDisabled ? "(Already Selected)" : ""}
                            </option>
                          );
                        })
                      ) : (
                        <option disabled>No items available</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      placeholder="Enter quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Total Amount</label>
                    <input
                      type="number"
                      placeholder="Total Amount"
                      value={item.totalAmount}
                      readOnly
                      className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  onClick={addMoreItem}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Add To Sale
                </button>
              </div>

              {/* Payment Information */}
              <h4 className="text-base font-bold mb-4">Payment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  <label className="block text-sm mb-1">Payment Method</label>
                  <select
                    name="Payment_method"
                    value={formData.Payment_method}
                    onChange={handleChange}
                    className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                  >
                    <option value="" disabled>
                      Select Method
                    </option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Tele Birr">Tele Birr</option>
                    <option value="E Birr">E Birr</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
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
                      <span className="truncate">Upload</span> {/* Prevents text overflow */}
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
                <div></div>
                <div>
                  <label className="block text-sm mb-1">Total Sales</label>
                  <input
                    type="number"
                    value={salesTotal}
                    disabled
                    className="w-1/3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
             <div className="flex justify-end space-x-4">
               {addedItems.length==0 &&  <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-gray-400 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                }
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={salesTotal === 0}
                  className={`px-6 py-2 rounded-md text-white transition ${
                    salesTotal === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Save Sale
                </button>
              </div>

            </div>
          </form>
          <ToastContainer />
        </div>
      </div>
    </section>
  );
};

export default withAuth(RecordSale);
