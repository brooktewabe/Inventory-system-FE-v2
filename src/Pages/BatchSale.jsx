import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { toast, ToastContainer } from "react-toastify";
import { GoImage } from "react-icons/go";
import Spinner from "../Components/Spinner";

const RecordSale = () => {
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [salesTotal, setSalesTotal] = useState(0);
  const [salesNames, setSalesName] = useState("");
  const [SalesItems, setSalesItems] = useState("");
  const [salesQuantity, setSalesQuantity] = useState(0);
  const [salesCredit, setSalesCredit] = useState(0);
  const [salesQUan, setSalesQUan] = useState("");
  const [addedItems, setAddedItems] = useState([]);
  const [items, setItems] = useState([
    {
      itemName: "",
      quantity: 0,
      totalAmount: 0,
      amount: 0,
      credit: 0,
      credit_due: null,
    },
  ]);
  const getSelectedIds = () => {
    if (!salesNames) return [];
    return salesNames.split(',').map(id => id.trim());
  };
  const [formData, setFormData] = useState({
    Full_name: "",
    Contact: "",
    Payment_method: "",
    // Credit_due: "",
    Receipt: "",
    Transaction_id: "",
    Sale_type: "Batch",
    EachQuantity:""
  });

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get("https://api.akbsproduction.com/stock/all");
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
      // Calculate credit based on total amount and amount paid
      const amountPaid = parseFloat(updatedItems[index].amount) || 0;
      updatedItems[index].credit = updatedItems[index].totalAmount - amountPaid;
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
    const requiredFields = [
      "Full_name",
      "Contact",
      "Payment_method",
      "Transaction_id",
      // "Quantity",
      // "Amount",
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

    // Check if Amount Paid is provided and Credit Due is required
    if (currentItem.credit > 1 && !currentItem.credit_due) {
      Swal.fire({
        title: "Error!",
        text: "Credit Due is required when Credit is provided.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
      return; // Exit the function if validation fails
    }
    // Check if Credit is +ve
    if (currentItem.credit < 0) {
      Swal.fire({
        title: "Error!",
        text: "Credit shouldn't be Negative.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
      return; // Exit the function if validation fails
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
    // Check if Credit_due is in the future
    if (currentItem.credit_due) {
      const dueDate = new Date(currentItem.credit_due);
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
    // Prepare sale data for this specific item
    const saleData = {
      ...formData,
      Product_id: selectedItem.id,
      Quantity: currentItem.quantity,
      Total_amount: currentItem.totalAmount,
      Amount: currentItem.amount,
      Credit: currentItem.credit,
      Credit_due: currentItem.credit_due,
      EachQuantity: "Only for batch" 
      //beside each sales, on save it saves
      // one additional sale called batch sale which is displayed
      // on the sales history page and report but whats used for 
      // the total sales( Sale_type: "Batch") is the sum of each sales excluding the batch sale 
      // setSalesItems, setSalesQUan, setSalesName are used for just displaying batch
    };

    try {
      // Send the POST request for the current item
      await axios.post("https://api.akbsproduction.com/sales/create", saleData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Update stock quantity
      const newQuantity = selectedItem.Curent_stock - currentItem.quantity;
      await axios.patch(`https://api.akbsproduction.com/stock/all/${selectedItem.id}`, {
        Curent_stock: newQuantity,
      });

      if (newQuantity < selectedItem.Reorder_level) {
        await axios.post("https://api.akbsproduction.com/notification/create", {
          message: `${selectedItem.Name} is running low on stock.`,
          priority: "High",
        });
      }
      // // Calculate and update salesTotal and salesCredit
      setSalesTotal((prevTotal) => prevTotal + currentItem.totalAmount);
      setSalesQuantity(
        (prevTotal) => prevTotal + parseInt(currentItem.quantity, 10)
      );
      setSalesQUan((prevTotal) => prevTotal ? prevTotal + "," + currentItem.quantity : currentItem.quantity);
      setSalesName((prevNames) =>
        prevNames
          ? `${prevNames}, ${currentItem.itemName}`
          : currentItem.itemName
      );
      setSalesItems((prevNames) =>
        prevNames
          ? `${prevNames}, ${selectedItem.Name}`
          : selectedItem.Name
      );
      setSalesCredit((prevCredit) => {
        if (currentItem.credit > 1) {
          return prevCredit + currentItem.credit;
        }
        return prevCredit;
      });

      // Add the current item to the addedItems array
      setAddedItems((prevItems) => [
        ...prevItems,
        {
          name: selectedItem.Name,
          quantity: currentItem.quantity,
          totalAmount: currentItem.totalAmount,
          credit: currentItem.credit,
          amount: currentItem.amount,
          credit_due: currentItem.credit_due,
        },
      ]);

      setItems([
        ...items.slice(0, -1),
        {
          itemName: "",
          quantity: 0,
          totalAmount: 0,
          credit: 0,
          credit_due: null,
          amount: 0,
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
      Product_id: salesNames,
      Credit: salesCredit,
      Quantity: salesQuantity,
      Credit_due: null,
      Amount: salesTotal - salesCredit,
      Total_amount: salesTotal,
      EachQuantity: salesQUan,
      Item_name: SalesItems,
    };

    try {
      const response = await axios.post(
        "https://api.akbsproduction.com/sales/create",
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

  if (!sale) return <div><Spinner/></div>;

  return (
    <section className="bg-[#edf0f0b9] h-full">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold">Record Batch Sale</h3>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-[70%] ml-20">
              <h3 className="text-xl font-bold mb-4">Record Sales</h3>
              <hr />
              <h3 className="text-md font-bold mb-4">Buyer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div>
                        <label className="block text-sm font-bold text-gray-700">
                          Amount Paid
                        </label>
                        <input
                          type="number"
                          value={item.amount}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700">
                          Credit Given
                        </label>
                        <input
                          type="number"
                          value={item.credit}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700">
                          Credit Due
                        </label>
                        <input
                          type="date"
                          value={item.credit_due}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <h3 className="text-md font-bold mb-4">Order Information</h3>
              {items
              // ?.filter((item) => item.Type === "Finished Products" ||  item.Type === "Finished Product")
              .map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Item Name
                    </label>
                    <select
                      name="itemName"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, e)}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    >
                      <option value="" disabled>
                        Select Item
                      </option>
                      {Array.isArray(sale) && sale.length > 0 ? (
                        sale
                        .filter(sl => sl.Type !== "Raw Material")
                        .map((sl) => {
                          const isDisabled = getSelectedIds().includes(sl.id.toString());
                          return (
                            <option 
                              key={sl.id} 
                              value={sl.id}
                              disabled={isDisabled && item.itemName !== sl.id.toString()}
                            >
                              {sl.Name} {isDisabled ? '(Already Selected)' : ''}
                            </option>
                          );
                        })
                      ) : (
                        <option disabled>No items available</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
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
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, e)}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Credit Given
                    </label>
                    <input
                      type="number"
                      disabled
                      name="credit"
                      value={item.credit}
                      onChange={(e) => handleItemChange(index, e)}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Credit Due
                    </label>
                    <input
                      type="date"
                      name="credit_due"
                      value={item.credit_due}
                      onChange={(e) => handleItemChange(index, e)}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addMoreItem}
                  className="bg-[#16033a] text-white px-4 py-2 rounded-lg"
                >
                  Add To Sale
                </button>
              </div>

              <h3 className="text-md font-bold mb-4 mt-6">
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
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

                <div className="mb-4 w-1/2">
                  <label className="block text-sm font-bold text-gray-700">
                    Receipt
                  </label>

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

                  <div className="flex items-center">
                    <div className="bg-[#]">
                      <GoImage size={30} />
                    </div>
                    <label
                      htmlFor="Receipt"
                      className="text-white bg-[#16033a] py-2 px-6  mx-2 cursor-pointer border rounded-2xl"
                    >
                      Upload Image <br />
                    </label>
                  </div>
                </div>
                <div className="flex md:grid-cols-2 gap-6 mb-4 ">
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Total Sales
                    </label>
                    <input
                      type="number"
                      value={salesTotal}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Total Credit
                    </label>
                    <input
                      type="number"
                      value={salesCredit}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                    />
                  </div>
                </div>
                <div></div>
                <div className="mt-6 flex  space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="border border-gray-400 text-gray-700 px-8 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={salesTotal === 0}
                    title={salesTotal === 0 ? "Sales total must be greater than 0 to save." : ""}
                    className={`border border-gray-400 px-8 py-2 rounded-lg ${
                      salesTotal === 0
                        ? "bg-[#16033a] text-white cursor-not-allowed"
                        : "bg-[#16033a] text-white"
                    }`}
                  >
                    Save sale
                  </button>
                </div>
              </div>
              {salesTotal !== 0 && (
                <div>
                <p>* You have unsaved changes. Leaving now will make your sales history inconsistent.</p>
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
