import { useNavigate } from "react-router-dom";
import withAuth from "../withAuth";
import { FaInfoCircle } from "react-icons/fa";
import { BsListCheck } from "react-icons/bs";
import { RiFileExcel2Line } from "react-icons/ri";

const Choose = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const handleInput = () => {
    navigate("/add-store-product");
  };
  
  const handleUpload = () => {
    navigate("/import");
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Header with user info */}
          <div className="bg-white  flex justify-between">
            <p className="text-lg sm:text-xl font-bold whitespace-nowrap">
              <span className="sm:hidden">Inventory</span>
              <span className="hidden sm:inline">Inventory Management System</span>
            </p>
            <div className="flex items-center bg-blue-500 text-white rounded-lg w-48  mr-2">
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

          {/* Add Product Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm max-w-3xl mx-auto">
            {/* Header with info icon */}
            <div className="flex items-center mb-6 pb-2 border-b">
              <FaInfoCircle className="text-blue-600 mr-2" />
              <h2 className="font-medium">Add Product </h2>
            </div>
            
            <h3 className="text-lg font-medium mb-4">Choose option</h3>
            
            {/* Option Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fill Input Option */}
              <div 
                onClick={handleInput}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
              >
                <div className="text-blue-600 mb-2">
                  <BsListCheck size={24} />
                </div>
                <h4 className="font-medium mb-2">Fill Input</h4>
                <p className="text-sm text-gray-600">
                  Complete this form to submit product details, update inventory, and more. Ensure to check that all required fields are accurately filled to avoid errors in stock tracking, ordering, or reporting.
                </p>
              </div>
              
              {/* Import Excel Option */}
              <div 
                onClick={handleUpload}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
              >
                <div className="text-blue-600 mb-2">
                  <RiFileExcel2Line size={24} />
                </div>
                <h4 className="font-medium mb-2">Import Excel File</h4>
                <p className="text-sm text-gray-600">
                  Use this feature to bulk upload product or inventory data using a pre-defined Excel template. Please follows the required format, including columns like Product Name, Quantity, Unit Price, and Category.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Choose };
export default withAuth(Choose);