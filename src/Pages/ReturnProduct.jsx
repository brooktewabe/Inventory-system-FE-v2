import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import { toast, ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import Spinner from "../Components/Spinner";
import icon from '../assets/user.png'


const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [user, setUser] = useState(null);
  const uid = localStorage.getItem("uid");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const validationSchema = Yup.object({
    returnAmt: Yup.number().required("Required").positive("Must be greater than zero"),
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
      formData.append("Price", values.Price);
      formData.append("Curent_stock", updatedStock);
      formData.append("Restock_level", values.Restock_level);

      try {
        if(formik.values.Return_reason!='faulty'){
          const response = await axios.patch(
            `http://localhost:5000/stock/all/${id}`,
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


        await axios.post("http://localhost:5000/sales/create", salesData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Create movement data
        const mvtData = new FormData();
        mvtData.append("User", `${name}`);
        mvtData.append("Name", values.Name);
        mvtData.append("Adjustment", returnAmount);
        mvtData.append("Type", "Return");

        // Post movement data
        await axios.post("http://localhost:5000/movement/create", mvtData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        // Create notification data
        if (values.Curent_stock < values.Restock_level) {
        const notifData = new FormData();
        notifData.append("message", `${stock.Name} is running low on stock.`);
        notifData.append("priority", "High");

        // Post notification data
        await axios.post("http://localhost:5000/notification/create", notifData, {
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
        const response = await axios.get(`http://localhost:5000/stock/all/${id}`);
        setStock(response.data);
        formik.setValues({
          Name: response.data.Name,
          Location: response.data.Location,
          Category: response.data.Category,
          Price: response.data.Price,
          storageLocation: response.data.storageLocation,
          Curent_stock: response.data.Curent_stock,
          Restock_level: response.data.Restock_level,
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
        const response = await axios.get(`http://localhost:5000/user/${uid}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchInfo();
  }, [uid]);

  if (!stock) return <div><Spinner/>...</div>;

  const handleCancel = () => {
    navigate("/");
  };
  return (
    <section className="bg-[#edf0f0b9] h-screen">
      <div className="container m-auto ">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white  flex justify-between">
            <p className="text-xl font-bold">Store Management System</p>
            <div className="flex items-center bg-blue-500 text-white rounded-lg w-48  mr-2">
              <img
                src={icon}
                className="w-8 h-8 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs">{role}</p>
              </div>
            </div>
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
                  <p>* Faulty ones aren&apos;t added back to stock</p>
                </div>
                <div className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Returned Stock Amount
                    </label>
                    <input
                      type="number"
                      name="returnAmt"
                      required
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
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md"
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
