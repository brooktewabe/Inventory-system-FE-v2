import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { toast, ToastContainer } from "react-toastify";
import { FaSearch, FaInfoCircle, FaUpload } from "react-icons/fa";
import Spinner from "../Components/Spinner";

const RecordSale = () => {
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [salesTotal, setSalesTotal] = useState(0);
  const [salesIdFromNames, setSalesIdFromNames] = useState("");
  const [SalesItems, setSalesItems] = useState("");
  const [salesQuantity, setSalesQuantity] = useState(0);
  const [salesQuantityList, setSalesQuantityList] = useState("");
  const [addedItems, setAddedItems] = useState([]);
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
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
  }, []);

  const handleBeforeUnload = useCallback(
    (event) => {
      if (salesTotal !== 0) {
        event.preventDefault();
        event.returnValue = "";
      }
    },
    [salesTotal]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  const handleNavigation = useCallback(
    (path) => {
      if (salesTotal !== 0) {
        Swal.fire({
          title: "Unsaved Changes",
          text: "You have unsaved changes. Leaving now will make your sales history inconsistent. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, leave",
          cancelButtonText: "Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(path);
          }
        });
      } else {
        navigate(path);
      }
    },
    [navigate, salesTotal]
  );

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
      await axios.patch(`http://localhost:5000/stock/all/${selectedItem.id}`, {
        Curent_stock: newQuantity,
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
        Swal.fire({
          title: "Success!",
          text: "Sale saved successfully.",
          icon: "success",
          confirmButtonColor: "#3085d6",
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
    handleNavigation("/");
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
            <p className="text-xl font-bold">Store Management System</p>
            <div className="flex items-center bg-blue-500 text-white rounded-lg w-48 mr-2">
              <img
                src="src\assets\user.png"
                className="w-8 h-8 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs">{role}</p>
              </div>
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
                <div>
                  <label className="block text-sm mb-1">Receipt Image</label>
                  <input
                    type="file"
                    id="Receipt"
                    name="Receipt"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setFormData({ ...formData, Receipt: file });
                    }}
                    className="hidden"
                    accept=".png, .jpg, .jpeg"
                  />
                  <label
                    htmlFor="Receipt"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-md"
                  >
                    <FaUpload size={16} />
                    Upload Image
                  </label>
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
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-gray-400 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
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

              {/* Unsaved Changes Warning */}
              {salesTotal !== 0 && (
                <div className="mt-6 text-red-600">
                  <p>
                    * You have unsaved changes. Leaving now will make your sales
                    history inconsistent.
                  </p>
                  <p>* Don&apos;t forget to add your last item to sale.</p>
                </div>
              )}
            </div>
          </form>
          <ToastContainer />
        </div>
      </div>
    </section>
  );
};

export default withAuth(RecordSale);
