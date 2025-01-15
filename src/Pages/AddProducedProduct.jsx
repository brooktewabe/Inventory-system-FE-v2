import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AddProduct = () => {
  const [user, setUser] = useState(null);
  const [stockItems, setStockItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid");

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get(`https://api.akbsproduction.com/user/${uid}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to fetch user details");
      }
    };
    fetchInfo();
  }, [uid]);

  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const response = await axios.get("https://api.akbsproduction.com/stock/all");
        setStockItems(response.data.data || []);
      } catch (error) {
        console.error("Error fetching stock items:", error);
        toast.error("Failed to fetch stock items");
        setStockItems([]);
      }
    };
    fetchStockItems();
  }, []);

  const validationSchema = Yup.object({
    selectedItemId: Yup.string().required("Please select a product"),
    addedStock: Yup.number()
      .required("Required")
      .positive("Must be greater than zero")
      .integer("Must be a whole number"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      const item = stockItems.find((item) => item.id === values.selectedItemId);
      if (!item) {
        throw new Error("Selected item not found");
      }

      const updatedStock = item.Curent_stock + parseInt(values.addedStock, 10);

      // Patch request to update stock
      await axios.patch(
        `https://api.akbsproduction.com/stock/all/${values.selectedItemId}`,
        {
          Curent_stock: updatedStock,
        }
      );

      Swal.fire({
        title: "Success!",
        text: "Stock updated successfully.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      }).then(() => {
        resetForm();
        setSelectedItem(null);
        navigate("/");
        toast.success("Stock Updated Successfully");
      });
    } catch (error) {
      console.error("Error updating stock or creating movement:", error);
      toast.error("Error updating stock. Please try again.");
    }
    setSubmitting(false);
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <section className="bg-gray-100 min-h-screen">
      {/* First small full-width grid */}
      <div className="bg-white p-4  ">
        <h3 className="text-xl font-bold">Create Produced Product</h3>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md overflow-hidden ml-32">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Record Production</h3>
            <Formik
              initialValues={{
                selectedItemId: "",
                addedStock: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, setFieldValue }) => (
                <Form className="space-y-6">
                  <div>
                    <label
                      htmlFor="selectedItemId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Select Product
                    </label>
                    <Field
                      as="select"
                      id="selectedItemId"
                      name="selectedItemId"
                      className="mt-1 block w-full border border-gray-400 rounded-lg p-2"
                      onChange={(e) => {
                        setFieldValue("selectedItemId", e.target.value);
                        const item = stockItems.find(
                          (item) => item.id === e.target.value
                        );
                        setSelectedItem(item);
                      }}
                    >
                      <option value="">Select a product</option>
                      {Array.isArray(stockItems) &&
                        stockItems
                        .filter(sl => sl.Type === "Produced Product")
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.Name}
                          </option>
                        ))}
                    </Field>
                    <ErrorMessage
                      name="selectedItemId"
                      component="div"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  {/* {selectedItem && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Selected Product Details
                      </h3>
                      <p>
                        <strong>Name:</strong> {selectedItem.Name}
                      </p>
                      <p>
                        <strong>Category:</strong> {selectedItem.Category}
                      </p>
                      <p>
                        <strong>Current Stock:</strong>{" "}
                        {selectedItem.Curent_stock}
                      </p>
                      <p>
                        <strong>Price:</strong> {selectedItem.Price}
                      </p>
                    </div>
                  )} */}

                  <div>
                    <label
                      htmlFor="addedStock"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Stock Amount
                    </label>
                    <Field
                      type="number"
                      id="addedStock"
                      name="addedStock"
                      className="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <ErrorMessage
                      name="addedStock"
                      component="div"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="border border-gray-400 text-gray-700 px-16 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#16033a] text-white px-16 py-2 rounded-lg"
                    >
                      Add To Stock
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

export { AddProduct };
export default withAuth(AddProduct);
