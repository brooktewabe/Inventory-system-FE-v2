import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { toast, ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [user, setUser] = useState(null);
  const uid = localStorage.getItem("uid");

  const validationSchema = Yup.object({
    returnAmt: Yup.number().required("Required").positive("Must be greater than zero"),
    Category: Yup.string().required("Required"),
    Return_reason: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      Curent_stock: "",
      Return_reason:""
    },
    validationSchema,
    onSubmit: async (values) => {
      const returnAmount =values.returnAmt; 
      const updatedStock = values.Curent_stock + returnAmount; // Add return amount to current stock
      const formData = new FormData();
      formData.append("Name", values.Name);
      formData.append("Location", values.Location);
      formData.append("Category", values.Category);
      formData.append("Price", values.Price);
      formData.append("Curent_stock", updatedStock);
      formData.append("Reorder_level", values.Reorder_level);
      if (values.Product_image) formData.append("files", values.Product_image);

      try {
        if(formik.values.Return_reason!='faulty'){
          const response = await axios.patch(
            `https://api.akbsproduction.com/stock/all/${id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
        // Create sales data
        const salesData = new FormData();
        salesData.append("Product_id", id);
        salesData.append("Full_name", 'Returned');
        salesData.append("Contact", '0000');
        salesData.append("Quantity", returnAmount);
        salesData.append("Amount", -1*(stock.Price*returnAmount));
        salesData.append("Total_amount", -1*(stock.Price*returnAmount));
        salesData.append("Transaction_id",  'Returned');
        salesData.append("Payment_method",  'Returned');
        salesData.append("Return_reason",  formik.values.Return_reason);


        await axios.post("https://api.akbsproduction.com/sales/create", salesData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Create movement data
        const mvtData = new FormData();
        mvtData.append("User", `${user.fname} ${user.lname}`);
        mvtData.append("Name", values.Name);
        mvtData.append("Adjustment", returnAmount);
        mvtData.append("Type", "Return");

        // Post movement data
        await axios.post("https://api.akbsproduction.com/movement/create", mvtData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        // Create notification data
        if (values.Curent_stock < values.Reorder_level) {
        const notifData = new FormData();
        notifData.append("message", `${stock.Name} is running low on stock.`);
        notifData.append("priority", "High");

        // Post notification data
        await axios.post("https://api.akbsproduction.com/notification/create", notifData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
        Swal.fire({
          title: "Success!",
          text: "Returned successfully.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/");
          toast.success("Returned Successfully");
        });
      } catch (error) {
        console.error("Error returning stock:", error);
        toast.error("Error updating stock. Try again later." );
      }
    },
  });

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get(`https://api.akbsproduction.com/stock/all/${id}`);
        setStock(response.data);
        formik.setValues({
          Name: response.data.Name,
          Location: response.data.Location,
          Category: response.data.Category,
          Price: response.data.Price,
          Curent_stock: response.data.Curent_stock,
          Reorder_level: response.data.Reorder_level,
          Product_image: response.data.Product_image,
          Return_reason: response.data.Return_reason,
        });
      } catch (error) {
        console.error("Error fetching stock:", error);
      }
    };
    // Fetch stock data only if it hasn't been fetched yet
    if (!stock) {
      fetchStock();
    }
  }, [id, stock]); // Add stock as a dependency
  

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get(`https://api.akbsproduction.com/user/${uid}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchInfo();
  }, [uid]);

  if (!stock) return <div>Loading...</div>;

  const handleCancel = () => {
    navigate("/");
  };
  return (
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 ">
            <h3 className="text-xl font-bold">Return Product</h3>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md max-w-[70%] ml-20">
            <h3 className="text-xl font-bold mb-4">Return Product</h3>
            <form onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Title
                    </label>
                    <input
                      type="text"
                      name="Name"
                      disabled
                      value={formik.values.Name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                    {formik.touched.Name && formik.errors.Name && (
                      <div className="text-red-600 text-sm">{formik.errors.Name}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Return Reason
                    </label>

                  <select
                    name="Return_reason"
                    value={formik.values.Return_reason}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2" 
                    >
                    <option value="">Choose Reason</option>
                    <option value="normal">Normal Return</option>
                    <option value="faulty">Faulty Product</option>
                  </select>
                    {formik.touched.Return_reason && formik.errors.Return_reason && (
                      <div className="text-red-600 text-sm">{formik.errors.Return_reason}</div>
                    )}
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
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                    {formik.touched.Category && formik.errors.Category && (
                      <div className="text-red-600 text-sm">{formik.errors.Category}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Returned Stock Amount
                    </label>
                    <input
                      type="number"
                      name="returnAmt"
                      // value={formik.values.Curent_stock}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    />
                    {formik.touched.returnAmt && formik.errors.returnAmt && (
                      <div className="text-red-600 text-sm">{formik.errors.returnAmt}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-around space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-gray-400 text-gray-700 px-16 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#16033a] text-white px-16 py-2 rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export { EditProduct };
export default withAuth(EditProduct);
